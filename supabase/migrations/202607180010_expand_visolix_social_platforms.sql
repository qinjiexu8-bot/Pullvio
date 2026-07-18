begin;

alter table public.download_jobs
  drop constraint if exists download_jobs_source_platform_check;
alter table public.download_jobs
  add constraint download_jobs_source_platform_check check (
    source_platform in (
      'youtube', 'instagram', 'facebook', 'tiktok', 'vimeo', 'soundcloud',
      'bilibili', 'pinterest', 'twitch', 'dailymotion', 'streamable',
      'snapchat', 'okru', 'imgur', 'loom', 'dropbox'
    )
  );

alter table public.media_platform_config
  drop constraint if exists media_platform_config_platform_check;
alter table public.media_platform_config
  add constraint media_platform_config_platform_check check (
    platform in (
      'youtube', 'instagram', 'facebook', 'tiktok', 'vimeo', 'soundcloud',
      'bilibili', 'pinterest', 'twitch', 'dailymotion', 'streamable',
      'snapchat', 'okru', 'imgur', 'loom', 'dropbox'
    )
  );

insert into public.media_platform_config (platform, accepting_jobs)
values ('instagram', false), ('facebook', false), ('okru', false)
on conflict (platform) do nothing;

alter table public.media_provider_runs
  add column if not exists provider_platform text not null default 'youtube';
alter table public.media_provider_runs
  drop constraint if exists media_provider_runs_provider_platform_check;
alter table public.media_provider_runs
  add constraint media_provider_runs_provider_platform_check check (
    provider_platform in ('youtube', 'instagram', 'facebook', 'snapchat', 'okru')
  );
alter table public.media_provider_runs
  drop constraint if exists media_provider_runs_format_check;
alter table public.media_provider_runs
  add constraint media_provider_runs_format_check check (
    provider_format in ('source', '360', '480', '720', '1080', '1440', '2160')
  );

create or replace function public.begin_media_provider_run(
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
  v_cost integer;
begin
  select * into v_job
  from public.download_jobs
  where id = p_job_id
  for update;

  if not found or v_job.status <> 'processing' or v_job.worker_id <> p_worker_id
    or v_job.source_platform not in ('youtube', 'instagram', 'facebook', 'snapchat', 'okru') then
    return query select 'INVALID_JOB', null::uuid, null::text, null::text, null::integer, null::text;
    return;
  end if;

  if (v_job.source_platform = 'youtube' and p_provider_format not in ('360', '480', '720', '1080', '1440', '2160'))
    or (v_job.source_platform <> 'youtube' and p_provider_format <> 'source') then
    return query select 'INVALID_FORMAT', null::uuid, null::text, null::text, null::integer, null::text;
    return;
  end if;

  v_cost := case when v_job.source_platform = 'youtube' then 800 else 600 end;
  insert into public.media_provider_runs (
    job_id, provider_platform, provider_format, estimated_cost_microusd
  ) values (
    p_job_id, v_job.source_platform, p_provider_format, v_cost
  ) on conflict (job_id) do nothing;

  select * into v_run
  from public.media_provider_runs
  where job_id = p_job_id
  for update;

  if v_run.provider_platform <> v_job.source_platform then
    return query select 'INVALID_JOB', null::uuid, null::text, null::text, null::integer, null::text;
    return;
  end if;

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

create or replace function public.record_media_provider_submission(
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
      submitted_at = coalesce(runs.submitted_at, now()),
      next_poll_at = now(),
      last_error_code = null
  from public.download_jobs as jobs
  where runs.id = p_run_id
    and jobs.id = runs.job_id
    and jobs.status = 'processing'
    and jobs.worker_id = p_worker_id
    and runs.status = 'ambiguous'
    and runs.submit_count = 1;
  return found;
exception when unique_violation then
  return false;
end;
$$;

create function public.fail_media_provider_balance(
  p_job_id uuid,
  p_worker_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_platform text;
begin
  update public.download_jobs
  set status = 'failed',
      failure_code = 'PROVIDER_BALANCE_EXHAUSTED',
      completed_at = now(),
      worker_id = null,
      lease_expires_at = null
  where id = p_job_id
    and status = 'processing'
    and worker_id = p_worker_id
  returning source_platform into v_platform;
  if v_platform is null then return false; end if;

  update public.media_platform_config
  set accepting_jobs = false
  where platform in ('youtube', 'instagram', 'facebook', 'snapchat', 'okru');

  update public.media_provider_runs
  set status = 'failed',
      last_http_status = 402,
      last_error_code = 'PROVIDER_BALANCE_EXHAUSTED',
      completed_at = now(),
      next_poll_at = null
  where job_id = p_job_id;

  insert into public.media_alert_outbox (incident_key, alert_type, payload)
  values (
    'visolix:provider_balance_exhausted:open',
    'provider_balance_exhausted',
    jsonb_build_object(
      'provider', 'visolix',
      'platform', v_platform,
      'failureCode', 'PROVIDER_BALANCE_EXHAUSTED',
      'detectedAt', now()
    )
  ) on conflict (incident_key) do nothing;
  return true;
end;
$$;

create function public.media_provider_challenge_required(
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
        select count(*) >= 3 from public.download_jobs
        where user_id = p_user_id
          and source_platform in ('youtube', 'instagram', 'facebook', 'snapchat', 'okru')
          and created_at >= now() - interval '10 minutes'
      )
      when p_anonymous_subject is not null then (
        select count(*) >= 3 from public.download_jobs
        where anonymous_subject = p_anonymous_subject
          and source_platform in ('youtube', 'instagram', 'facebook', 'snapchat', 'okru')
          and created_at >= now() - interval '10 minutes'
      )
      else false
    end
    or (
      p_network_subject is not null and (
        select count(*) >= 8 from public.download_jobs
        where network_subject = p_network_subject
          and source_platform in ('youtube', 'instagram', 'facebook', 'snapchat', 'okru')
          and created_at >= now() - interval '10 minutes'
      )
    );
$$;

create function public.resolve_media_provider_balance_incident()
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
  where platform in ('youtube', 'instagram', 'facebook', 'snapchat', 'okru');
  return v_resolved = 1;
end;
$$;

revoke all on function public.fail_media_provider_balance(uuid, text)
  from public, anon, authenticated;
revoke all on function public.media_provider_challenge_required(text, text, text)
  from public, anon, authenticated;
revoke all on function public.resolve_media_provider_balance_incident()
  from public, anon, authenticated;
grant execute on function public.fail_media_provider_balance(uuid, text) to service_role;
grant execute on function public.media_provider_challenge_required(text, text, text) to service_role;
grant execute on function public.resolve_media_provider_balance_incident() to service_role;

comment on column public.media_provider_runs.provider_platform is
  'Visolix platform identifier. Non-YouTube sources use provider_format=source.';

commit;
