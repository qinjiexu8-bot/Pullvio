begin;

alter table public.media_provider_runs
  add column if not exists result_expires_at timestamptz;

alter table public.media_provider_runs
  drop constraint if exists media_provider_runs_provider_platform_check;
alter table public.media_provider_runs
  add constraint media_provider_runs_provider_platform_check check (
    provider_platform in ('youtube', 'instagram', 'facebook', 'tiktok', 'snapchat', 'okru')
  );

alter table public.media_provider_runs
  drop constraint if exists media_provider_runs_format_check;
alter table public.media_provider_runs
  add constraint media_provider_runs_format_check check (
    provider_format in ('source', 'mp3', '360', '480', '720', '1080', '1440', '2160')
  );

alter table public.media_provider_runs
  drop constraint if exists media_provider_runs_result_expiry_check;
alter table public.media_provider_runs
  add constraint media_provider_runs_result_expiry_check check (
    result_expires_at is null or result_expires_at >= created_at
  );

insert into public.media_platform_config (platform, accepting_jobs)
values
  ('youtube', true),
  ('instagram', true),
  ('facebook', true),
  ('tiktok', true),
  ('snapchat', true),
  ('okru', true)
on conflict (platform) do update set accepting_jobs = excluded.accepting_jobs;

update public.media_platform_config
set accepting_jobs = false
where platform not in ('youtube', 'instagram', 'facebook', 'tiktok', 'snapchat', 'okru');

create or replace function public.media_provider_challenge_required(
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
          and source_platform in ('youtube', 'instagram', 'facebook', 'tiktok', 'snapchat', 'okru')
          and created_at >= now() - interval '10 minutes'
      )
      when p_anonymous_subject is not null then (
        select count(*) >= 3 from public.download_jobs
        where anonymous_subject = p_anonymous_subject
          and source_platform in ('youtube', 'instagram', 'facebook', 'tiktok', 'snapchat', 'okru')
          and created_at >= now() - interval '10 minutes'
      )
      else false
    end
    or (
      p_network_subject is not null and (
        select count(*) >= 8 from public.download_jobs
        where network_subject = p_network_subject
          and source_platform in ('youtube', 'instagram', 'facebook', 'tiktok', 'snapchat', 'okru')
          and created_at >= now() - interval '10 minutes'
      )
    );
$$;

create or replace function public.resolve_media_provider_balance_incident()
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
  where platform in ('youtube', 'instagram', 'facebook', 'tiktok', 'snapchat', 'okru');
  return v_resolved = 1;
end;
$$;

create or replace function public.reuse_direct_provider_result(p_job_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job public.download_jobs%rowtype;
  v_source_job public.download_jobs%rowtype;
  v_source_run public.media_provider_runs%rowtype;
  v_source_job_id uuid;
begin
  select * into v_job
  from public.download_jobs
  where id = p_job_id
  for update;

  if not found or v_job.status <> 'queued'
    or v_job.source_platform not in ('youtube', 'instagram', 'facebook', 'tiktok', 'snapchat', 'okru') then
    return false;
  end if;

  select jobs.id into v_source_job_id
  from public.download_jobs as jobs
  join public.media_provider_runs as runs on runs.job_id = jobs.id
  where jobs.id <> v_job.id
    and jobs.status = 'ready'
    and jobs.source_url = v_job.source_url
    and jobs.source_platform = v_job.source_platform
    and jobs.media_kind = v_job.media_kind
    and jobs.requested_format = v_job.requested_format
    and jobs.requested_quality = v_job.requested_quality
    and runs.status = 'completed'
    and runs.result_url is not null
    and runs.result_expires_at > now() + interval '5 minutes'
  order by runs.completed_at desc
  limit 1;

  if v_source_job_id is null then return false; end if;

  select * into v_source_job
  from public.download_jobs
  where id = v_source_job_id;

  select * into v_source_run
  from public.media_provider_runs
  where job_id = v_source_job_id;

  insert into public.media_provider_runs (
    job_id, provider, status, provider_job_id, provider_format,
    provider_platform, provider_progress, result_url, result_expires_at,
    provider_info, submit_count, poll_count, estimated_cost_microusd,
    submitted_at, completed_at, next_poll_at
  ) values (
    v_job.id, v_source_run.provider, 'completed', null,
    v_source_run.provider_format, v_source_run.provider_platform, 1000,
    v_source_run.result_url, v_source_run.result_expires_at,
    v_source_run.provider_info || jsonb_build_object('reusedFromJobId', v_source_job.id),
    0, 0, 0,
    now(), now(), null
  ) on conflict (job_id) do nothing;

  update public.download_jobs
  set status = 'ready',
      title = v_source_job.title,
      thumbnail_url = v_source_job.thumbnail_url,
      original_duration_seconds = v_source_job.original_duration_seconds,
      file_size_bytes = v_source_job.file_size_bytes,
      failure_code = null,
      started_at = coalesce(started_at, now()),
      completed_at = now(),
      worker_id = null,
      lease_expires_at = null
  where id = v_job.id and status = 'queued';

  return found;
end;
$$;

create or replace function public.begin_direct_provider_run(
  p_job_id uuid,
  p_provider_format text
)
returns table (
  result_code text,
  provider_run_id uuid,
  provider_job_id text,
  provider_status text,
  provider_progress integer,
  result_url text,
  result_expires_at timestamptz
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

  if not found
    or v_job.status not in ('queued', 'processing')
    or v_job.source_platform not in ('youtube', 'instagram', 'facebook', 'tiktok', 'snapchat', 'okru') then
    return query select 'INVALID_JOB', null::uuid, null::text, null::text,
      null::integer, null::text, null::timestamptz;
    return;
  end if;

  if v_job.cancellation_requested_at is not null then
    update public.download_jobs
    set status = 'canceled', completed_at = now()
    where id = p_job_id;
    return query select 'CANCELED', null::uuid, null::text, null::text,
      null::integer, null::text, null::timestamptz;
    return;
  end if;

  if (
    v_job.source_platform = 'youtube'
    and (
      (v_job.media_kind = 'audio' and p_provider_format <> 'mp3')
      or (v_job.media_kind = 'video' and p_provider_format not in ('360', '480', '720', '1080', '1440', '2160'))
    )
  ) or (
    v_job.source_platform <> 'youtube'
    and (v_job.media_kind <> 'video' or p_provider_format <> 'source')
  ) then
    return query select 'INVALID_FORMAT', null::uuid, null::text, null::text,
      null::integer, null::text, null::timestamptz;
    return;
  end if;

  if v_job.status = 'queued' then
    update public.download_jobs
    set status = 'processing',
        started_at = coalesce(started_at, now()),
        processing_stage = 'fetching',
        progress_percent = greatest(progress_percent, 5),
        queue_message_sent_at = null,
        worker_id = null,
        lease_expires_at = null
    where id = p_job_id;
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

  return query select
    case
      when v_run.status = 'submitting' and v_run.provider_job_id is null then 'SUBMIT'
      when v_run.status in ('submitted', 'processing') then 'RESUME'
      when v_run.status = 'completed' and v_run.result_expires_at > now() then 'COMPLETED'
      when v_run.status = 'ambiguous' then 'AMBIGUOUS'
      else 'TERMINAL'
    end,
    v_run.id,
    v_run.provider_job_id,
    v_run.status,
    v_run.provider_progress,
    v_run.result_url,
    v_run.result_expires_at;
end;
$$;

create or replace function public.mark_direct_provider_submission_started(p_job_id uuid)
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
  where runs.job_id = p_job_id
    and jobs.id = runs.job_id
    and jobs.status = 'processing'
    and runs.status = 'submitting'
    and runs.provider_job_id is null
    and runs.submit_count = 0;
  return found;
end;
$$;

create or replace function public.record_direct_provider_submission(
  p_job_id uuid,
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
      submitted_at = coalesce(submitted_at, now()),
      next_poll_at = now(),
      last_error_code = null,
      last_error_info = '{}'::jsonb
  from public.download_jobs as jobs
  where runs.job_id = p_job_id
    and jobs.id = runs.job_id
    and jobs.status = 'processing'
    and runs.status = 'ambiguous'
    and runs.submit_count = 1;
  return found;
exception when unique_violation then
  return false;
end;
$$;

create or replace function public.record_direct_provider_progress(
  p_job_id uuid,
  p_progress integer,
  p_result_url text,
  p_provider_info jsonb,
  p_status_text text,
  p_result_ttl_seconds integer default 3600
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job public.download_jobs%rowtype;
  v_info jsonb;
  v_completed boolean;
  v_whole_progress integer;
begin
  if p_progress not between 0 and 1000
    or p_result_ttl_seconds not between 300 and 86400
    or jsonb_typeof(coalesce(p_provider_info, '{}'::jsonb)) <> 'object'
    or (p_result_url is not null and (
      p_result_url !~ '^https://[^[:space:]]+$'
      or char_length(p_result_url) > 4096
    )) then
    return false;
  end if;

  select * into v_job
  from public.download_jobs
  where id = p_job_id
  for update;
  if not found or v_job.status <> 'processing' then return false; end if;

  v_completed := p_result_url is not null;
  v_info := coalesce(p_provider_info, '{}'::jsonb)
    || jsonb_build_object('statusText', left(coalesce(p_status_text, ''), 300));
  v_whole_progress := case
    when v_completed then 100
    else least(95, 5 + round(p_progress::numeric * 90 / 1000)::integer)
  end;

  update public.media_provider_runs
  set provider_progress = greatest(provider_progress, p_progress),
      result_url = coalesce(p_result_url, result_url),
      result_expires_at = case
        when v_completed then now() + make_interval(secs => p_result_ttl_seconds)
        else result_expires_at
      end,
      provider_info = provider_info || v_info,
      poll_count = poll_count + 1,
      status = case when v_completed then 'completed' else 'processing' end,
      completed_at = case when v_completed then now() else completed_at end,
      next_poll_at = case when v_completed then null else now() + interval '5 seconds' end,
      last_error_code = null
  where job_id = p_job_id
    and status in ('submitted', 'processing', 'completed');

  update public.download_jobs
  set status = case when v_completed then 'ready' else status end,
      processing_stage = case when v_completed then 'completed' else 'fetching' end,
      progress_percent = greatest(progress_percent, v_whole_progress),
      title = coalesce(
        left(nullif(btrim(v_info->>'title'), ''), 500),
        title,
        source_host
      ),
      thumbnail_url = case
        when v_info->>'thumbnail' ~ '^https://[^[:space:]]+$'
          then left(v_info->>'thumbnail', 2048)
        else thumbnail_url
      end,
      original_duration_seconds = case
        when (v_info->>'duration') ~ '^[0-9]+$' then (v_info->>'duration')::integer
        else original_duration_seconds
      end,
      failure_code = null,
      completed_at = case when v_completed then now() else completed_at end,
      worker_id = null,
      lease_expires_at = null
  where id = p_job_id and status = 'processing';

  if v_completed and v_job.user_id is not null then
    insert into public.usage_daily (
      user_id, usage_date, plan_code, quota_limit, jobs_succeeded,
      bytes_output, processing_seconds
    ) values (
      v_job.user_id, current_date, 'free', null, 1, 0,
      greatest(extract(epoch from (now() - coalesce(v_job.started_at, v_job.created_at)))::bigint, 0)
    ) on conflict (user_id, usage_date) do update
      set jobs_succeeded = public.usage_daily.jobs_succeeded + 1,
          processing_seconds = public.usage_daily.processing_seconds
            + greatest(extract(epoch from (now() - coalesce(v_job.started_at, v_job.created_at)))::bigint, 0),
          updated_at = now();
  end if;
  return true;
end;
$$;

create or replace function public.fail_direct_provider_job(
  p_job_id uuid,
  p_failure_code text,
  p_http_status integer,
  p_error_info jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if char_length(coalesce(p_failure_code, '')) not between 1 and 100
    or jsonb_typeof(coalesce(p_error_info, '{}'::jsonb)) <> 'object' then
    return false;
  end if;

  update public.download_jobs
  set status = 'failed',
      failure_code = p_failure_code,
      completed_at = now(),
      worker_id = null,
      lease_expires_at = null
  where id = p_job_id and status in ('queued', 'processing');
  if not found then return false; end if;

  update public.media_provider_runs
  set status = 'failed',
      last_http_status = p_http_status,
      last_error_code = p_failure_code,
      last_error_info = coalesce(p_error_info, '{}'::jsonb),
      completed_at = now(),
      next_poll_at = null
  where job_id = p_job_id;
  return true;
end;
$$;

create or replace function public.fail_direct_provider_balance(p_job_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_platform text;
  v_failed boolean;
  v_alert_count integer;
begin
  select source_platform into v_platform
  from public.download_jobs
  where id = p_job_id;
  if v_platform is null then return false; end if;

  select public.fail_direct_provider_job(
    p_job_id,
    'PROVIDER_BALANCE_EXHAUSTED',
    402,
    jsonb_build_object('provider', 'visolix', 'platform', v_platform)
  ) into v_failed;
  if not v_failed then return false; end if;

  update public.media_platform_config
  set accepting_jobs = false
  where platform in ('youtube', 'instagram', 'facebook', 'tiktok', 'snapchat', 'okru');

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
  get diagnostics v_alert_count = row_count;
  return v_alert_count = 1;
end;
$$;

create or replace function public.expire_direct_provider_results()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  update public.download_jobs as jobs
  set status = 'expired',
      completed_at = coalesce(jobs.completed_at, now())
  from public.media_provider_runs as runs
  where runs.job_id = jobs.id
    and jobs.status = 'ready'
    and runs.status = 'completed'
    and runs.result_expires_at <= now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.cancel_direct_provider_job(p_job_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.download_jobs
  set status = 'canceled',
      processing_stage = 'canceled',
      completed_at = now(),
      worker_id = null,
      lease_expires_at = null
  where id = p_job_id
    and status = 'processing'
    and cancellation_requested_at is not null;
  if not found then return false; end if;

  update public.media_provider_runs
  set status = 'failed',
      last_error_code = 'CANCELED',
      last_error_info = jsonb_build_object('provider', 'visolix'),
      completed_at = now(),
      next_poll_at = null
  where job_id = p_job_id
    and status in ('submitting', 'submitted', 'processing', 'ambiguous');
  return true;
end;
$$;

revoke all on function public.reuse_direct_provider_result(uuid)
  from public, anon, authenticated;
revoke all on function public.begin_direct_provider_run(uuid, text)
  from public, anon, authenticated;
revoke all on function public.mark_direct_provider_submission_started(uuid)
  from public, anon, authenticated;
revoke all on function public.record_direct_provider_submission(uuid, text, jsonb)
  from public, anon, authenticated;
revoke all on function public.record_direct_provider_progress(uuid, integer, text, jsonb, text, integer)
  from public, anon, authenticated;
revoke all on function public.fail_direct_provider_job(uuid, text, integer, jsonb)
  from public, anon, authenticated;
revoke all on function public.fail_direct_provider_balance(uuid)
  from public, anon, authenticated;
revoke all on function public.expire_direct_provider_results()
  from public, anon, authenticated;
revoke all on function public.cancel_direct_provider_job(uuid)
  from public, anon, authenticated;

grant execute on function public.reuse_direct_provider_result(uuid) to service_role;
grant execute on function public.begin_direct_provider_run(uuid, text) to service_role;
grant execute on function public.mark_direct_provider_submission_started(uuid) to service_role;
grant execute on function public.record_direct_provider_submission(uuid, text, jsonb) to service_role;
grant execute on function public.record_direct_provider_progress(uuid, integer, text, jsonb, text, integer) to service_role;
grant execute on function public.fail_direct_provider_job(uuid, text, integer, jsonb) to service_role;
grant execute on function public.fail_direct_provider_balance(uuid) to service_role;
grant execute on function public.expire_direct_provider_results() to service_role;
grant execute on function public.cancel_direct_provider_job(uuid) to service_role;

comment on column public.media_provider_runs.result_expires_at is
  'Conservative Pullvio access deadline for a temporary provider-hosted result URL.';

commit;
