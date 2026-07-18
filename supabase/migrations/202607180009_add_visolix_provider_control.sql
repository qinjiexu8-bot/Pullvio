begin;

create table public.media_provider_runs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references public.download_jobs(id) on delete cascade,
  provider text not null default 'visolix',
  status text not null default 'submitting',
  provider_job_id text unique,
  provider_format text not null,
  provider_progress integer not null default 0,
  result_url text,
  provider_info jsonb not null default '{}'::jsonb,
  submit_count smallint not null default 0,
  poll_count integer not null default 0,
  estimated_cost_microusd integer not null default 800,
  last_http_status integer,
  last_error_code text,
  next_poll_at timestamptz,
  submitted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_provider_runs_provider_check check (provider = 'visolix'),
  constraint media_provider_runs_status_check check (
    status in ('submitting', 'submitted', 'processing', 'completed', 'failed', 'ambiguous')
  ),
  constraint media_provider_runs_format_check check (
    provider_format in ('360', '480', '720', '1080', '1440', '2160')
  ),
  constraint media_provider_runs_progress_check check (
    provider_progress between 0 and 1000
  ),
  constraint media_provider_runs_result_url_check check (
    result_url is null or (
      result_url ~ '^https://[^[:space:]]+$'
      and char_length(result_url) <= 4096
    )
  ),
  constraint media_provider_runs_counts_check check (
    submit_count between 0 and 10 and poll_count between 0 and 10000
  )
);

create index media_provider_runs_poll_idx
  on public.media_provider_runs (next_poll_at)
  where status in ('submitted', 'processing');

drop trigger if exists media_provider_runs_set_updated_at on public.media_provider_runs;
create trigger media_provider_runs_set_updated_at
  before update on public.media_provider_runs
  for each row execute function public.set_pullvio_updated_at();

alter table public.media_provider_runs enable row level security;
alter table public.media_provider_runs force row level security;
revoke all on table public.media_provider_runs from public, anon, authenticated;

create table public.media_alert_outbox (
  id bigint generated always as identity primary key,
  incident_key text not null unique,
  alert_type text not null,
  status text not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  attempt_count smallint not null default 0,
  max_attempts smallint not null default 8,
  next_attempt_at timestamptz not null default now(),
  last_error text,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_alert_outbox_type_check check (
    alert_type in ('provider_balance_exhausted', 'provider_balance_recovered')
  ),
  constraint media_alert_outbox_status_check check (
    status in ('pending', 'delivering', 'delivered', 'failed')
  ),
  constraint media_alert_outbox_attempts_check check (
    attempt_count between 0 and max_attempts and max_attempts between 1 and 20
  )
);

create index media_alert_outbox_delivery_idx
  on public.media_alert_outbox (next_attempt_at, id)
  where status in ('pending', 'delivering');

drop trigger if exists media_alert_outbox_set_updated_at on public.media_alert_outbox;
create trigger media_alert_outbox_set_updated_at
  before update on public.media_alert_outbox
  for each row execute function public.set_pullvio_updated_at();

alter table public.media_alert_outbox enable row level security;
alter table public.media_alert_outbox force row level security;
revoke all on table public.media_alert_outbox from public, anon, authenticated;

create function public.begin_media_provider_run(
  p_job_id uuid,
  p_worker_id text,
  p_provider_format text
)
returns table (
  result_code text,
  provider_run_id uuid,
  provider_job_id text,
  provider_status text,
  provider_progress integer,
  result_url text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job public.download_jobs%rowtype;
  v_run public.media_provider_runs%rowtype;
begin
  if p_provider_format not in ('360', '480', '720', '1080', '1440', '2160') then
    return query select 'INVALID_FORMAT', null::uuid, null::text, null::text, null::integer, null::text;
    return;
  end if;

  select * into v_job
  from public.download_jobs
  where id = p_job_id
  for update;

  if not found or v_job.status <> 'processing' or v_job.worker_id <> p_worker_id
    or v_job.source_platform <> 'youtube' then
    return query select 'INVALID_JOB', null::uuid, null::text, null::text, null::integer, null::text;
    return;
  end if;

  insert into public.media_provider_runs (job_id, provider_format)
  values (p_job_id, p_provider_format)
  on conflict (job_id) do nothing;

  select * into v_run
  from public.media_provider_runs
  where job_id = p_job_id
  for update;

  return query select
    case
      when v_run.status = 'submitting' and v_run.provider_job_id is null then 'SUBMIT'
      when v_run.status in ('submitted', 'processing', 'completed') then 'RESUME'
      when v_run.status = 'ambiguous' then 'AMBIGUOUS'
      else 'TERMINAL'
    end,
    v_run.id,
    v_run.provider_job_id,
    v_run.status,
    v_run.provider_progress,
    v_run.result_url;
end;
$$;

create function public.record_media_provider_submission(
  p_run_id uuid,
  p_worker_id text,
  p_provider_job_id text,
  p_provider_info jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if char_length(coalesce(p_provider_job_id, '')) not between 1 and 500
    or jsonb_typeof(coalesce(p_provider_info, '{}'::jsonb)) <> 'object' then
    return false;
  end if;

  update public.media_provider_runs as runs
  set provider_job_id = p_provider_job_id,
      status = 'submitted',
      provider_info = coalesce(p_provider_info, '{}'::jsonb),
      submit_count = runs.submit_count + 1,
      submitted_at = coalesce(runs.submitted_at, now()),
      next_poll_at = now()
  from public.download_jobs as jobs
  where runs.id = p_run_id
    and jobs.id = runs.job_id
    and jobs.status = 'processing'
    and jobs.worker_id = p_worker_id
    and runs.status = 'ambiguous';
  return found;
exception when unique_violation then
  return false;
end;
$$;

create function public.mark_media_provider_submission_started(
  p_run_id uuid,
  p_worker_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.media_provider_runs as runs
  set status = 'ambiguous',
      submit_count = runs.submit_count + 1,
      last_error_code = 'SUBMISSION_IN_FLIGHT'
  from public.download_jobs as jobs
  where runs.id = p_run_id
    and jobs.id = runs.job_id
    and jobs.status = 'processing'
    and jobs.worker_id = p_worker_id
    and runs.status = 'submitting'
    and runs.provider_job_id is null
    and runs.submit_count = 0;
  return found;
end;
$$;

create function public.record_media_provider_progress(
  p_run_id uuid,
  p_worker_id text,
  p_progress integer,
  p_result_url text,
  p_provider_info jsonb,
  p_next_poll_seconds integer default 5
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_progress not between 0 and 1000
    or p_next_poll_seconds not between 1 and 900
    or jsonb_typeof(coalesce(p_provider_info, '{}'::jsonb)) <> 'object'
    or (p_result_url is not null and (
      p_result_url !~ '^https://[^[:space:]]+$' or char_length(p_result_url) > 4096
    )) then
    return false;
  end if;

  update public.media_provider_runs as runs
  set provider_progress = greatest(runs.provider_progress, p_progress),
      result_url = coalesce(p_result_url, runs.result_url),
      provider_info = coalesce(p_provider_info, '{}'::jsonb),
      poll_count = runs.poll_count + 1,
      status = case when p_result_url is not null then 'completed' else 'processing' end,
      completed_at = case when p_result_url is not null then now() else null end,
      next_poll_at = case when p_result_url is null
        then now() + make_interval(secs => p_next_poll_seconds)
        else null
      end
  from public.download_jobs as jobs
  where runs.id = p_run_id
    and jobs.id = runs.job_id
    and jobs.status = 'processing'
    and jobs.worker_id = p_worker_id
    and runs.status in ('submitted', 'processing', 'completed');
  return found;
end;
$$;

create function public.fail_youtube_provider_balance(
  p_job_id uuid,
  p_worker_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated integer;
begin
  update public.download_jobs
  set status = 'failed',
      failure_code = 'PROVIDER_BALANCE_EXHAUSTED',
      completed_at = now(),
      worker_id = null,
      lease_expires_at = null
  where id = p_job_id
    and status = 'processing'
    and worker_id = p_worker_id;
  get diagnostics v_updated = row_count;
  if v_updated <> 1 then return false; end if;

  update public.media_platform_config
  set accepting_jobs = false
  where platform = 'youtube';

  update public.media_provider_runs
  set status = 'failed',
      last_http_status = 402,
      last_error_code = 'PROVIDER_BALANCE_EXHAUSTED',
      completed_at = now(),
      next_poll_at = null
  where job_id = p_job_id;

  insert into public.media_alert_outbox (
    incident_key,
    alert_type,
    payload
  ) values (
    'visolix:provider_balance_exhausted:open',
    'provider_balance_exhausted',
    jsonb_build_object(
      'provider', 'visolix',
      'platform', 'youtube',
      'failureCode', 'PROVIDER_BALANCE_EXHAUSTED',
      'detectedAt', now()
    )
  ) on conflict (incident_key) do nothing;

  return true;
end;
$$;

create function public.youtube_challenge_required(
  p_user_id text,
  p_anonymous_subject text,
  p_network_subject text
)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select
    case
      when p_user_id is not null then (
        select count(*) >= 3
        from public.download_jobs
        where user_id = p_user_id
          and source_platform = 'youtube'
          and created_at >= now() - interval '10 minutes'
      )
      when p_anonymous_subject is not null then (
        select count(*) >= 3
        from public.download_jobs
        where anonymous_subject = p_anonymous_subject
          and source_platform = 'youtube'
          and created_at >= now() - interval '10 minutes'
      )
      else false
    end
    or (
      p_network_subject is not null and (
        select count(*) >= 8
        from public.download_jobs
        where network_subject = p_network_subject
          and source_platform = 'youtube'
          and created_at >= now() - interval '10 minutes'
      )
    );
$$;

create function public.claim_media_alert()
returns table (
  alert_id bigint,
  alert_type text,
  payload jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_alert public.media_alert_outbox%rowtype;
begin
  select * into v_alert
  from public.media_alert_outbox
  where status in ('pending', 'delivering')
    and next_attempt_at <= now()
    and attempt_count < max_attempts
  order by next_attempt_at, id
  for update skip locked
  limit 1;
  if not found then return; end if;

  update public.media_alert_outbox
  set status = 'delivering',
      attempt_count = attempt_count + 1,
      next_attempt_at = now() + interval '5 minutes'
  where id = v_alert.id;

  return query select v_alert.id, v_alert.alert_type, v_alert.payload;
end;
$$;

create function public.complete_media_alert(
  p_alert_id bigint,
  p_success boolean,
  p_error text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.media_alert_outbox
  set status = case
        when p_success then 'delivered'
        when attempt_count >= max_attempts then 'failed'
        else 'pending'
      end,
      delivered_at = case when p_success then now() else null end,
      last_error = case when p_success then null else left(coalesce(p_error, 'delivery failed'), 500) end,
      next_attempt_at = case
        when p_success then next_attempt_at
        else now() + make_interval(secs => least(1800, 30 * (2 ^ least(attempt_count, 6))::integer))
      end
  where id = p_alert_id and status = 'delivering';
  return found;
end;
$$;

create function public.resolve_youtube_provider_balance_incident()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_resolved integer;
begin
  update public.media_alert_outbox
  set incident_key = incident_key || ':resolved:' || id::text
  where incident_key = 'visolix:provider_balance_exhausted:open';
  get diagnostics v_resolved = row_count;

  update public.media_platform_config
  set accepting_jobs = true
  where platform = 'youtube';
  return v_resolved = 1;
end;
$$;

revoke all on function public.begin_media_provider_run(uuid, text, text)
  from public, anon, authenticated;
revoke all on function public.record_media_provider_submission(uuid, text, text, jsonb)
  from public, anon, authenticated;
revoke all on function public.mark_media_provider_submission_started(uuid, text)
  from public, anon, authenticated;
revoke all on function public.record_media_provider_progress(uuid, text, integer, text, jsonb, integer)
  from public, anon, authenticated;
revoke all on function public.fail_youtube_provider_balance(uuid, text)
  from public, anon, authenticated;
revoke all on function public.youtube_challenge_required(text, text, text)
  from public, anon, authenticated;
revoke all on function public.claim_media_alert() from public, anon, authenticated;
revoke all on function public.complete_media_alert(bigint, boolean, text)
  from public, anon, authenticated;
revoke all on function public.resolve_youtube_provider_balance_incident()
  from public, anon, authenticated;

grant execute on function public.begin_media_provider_run(uuid, text, text) to service_role;
grant execute on function public.record_media_provider_submission(uuid, text, text, jsonb) to service_role;
grant execute on function public.mark_media_provider_submission_started(uuid, text) to service_role;
grant execute on function public.record_media_provider_progress(uuid, text, integer, text, jsonb, integer) to service_role;
grant execute on function public.fail_youtube_provider_balance(uuid, text) to service_role;
grant execute on function public.youtube_challenge_required(text, text, text) to service_role;
grant execute on function public.claim_media_alert() to service_role;
grant execute on function public.complete_media_alert(bigint, boolean, text) to service_role;
grant execute on function public.resolve_youtube_provider_balance_incident() to service_role;

comment on table public.media_provider_runs is
  'Backend-only state for idempotent third-party media provider submissions and polling.';
comment on column public.media_provider_runs.result_url is
  'Temporary provider URL. Never exposed directly to browser clients.';
comment on table public.media_alert_outbox is
  'Deduplicated backend notifications. Payloads must never contain credentials or source URLs.';

commit;
