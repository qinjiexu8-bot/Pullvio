begin;

alter table public.download_artifacts
  add column if not exists content_disposition text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'download_artifacts_content_disposition_check'
      and conrelid = 'public.download_artifacts'::regclass
  ) then
    alter table public.download_artifacts
      add constraint download_artifacts_content_disposition_check check (
        content_disposition is null or char_length(content_disposition) between 1 and 500
      );
  end if;
end
$$;

create or replace function public.claim_media_job(
  p_job_id uuid,
  p_worker_id text,
  p_lease_seconds integer default 120
)
returns table (
  result_code text,
  job_id uuid,
  source_url text,
  source_host text,
  source_platform text,
  media_kind text,
  requested_format text,
  requested_quality text,
  attempt_count smallint,
  max_attempts smallint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job public.download_jobs%rowtype;
begin
  if char_length(coalesce(p_worker_id, '')) not between 1 and 200
    or p_lease_seconds not between 30 and 900 then
    return query select 'INVALID_WORKER', null::uuid, null::text, null::text,
      null::text, null::text, null::text, null::text, null::smallint, null::smallint;
    return;
  end if;

  select * into v_job
  from public.download_jobs
  where id = p_job_id
  for update;

  if not found then
    return query select 'NOT_FOUND', null::uuid, null::text, null::text,
      null::text, null::text, null::text, null::text, null::smallint, null::smallint;
    return;
  end if;

  if v_job.status in ('ready', 'failed', 'canceled', 'expired') then
    return query select 'TERMINAL', v_job.id, null::text, null::text,
      null::text, null::text, null::text, null::text, v_job.attempt_count, v_job.max_attempts;
    return;
  end if;

  if v_job.cancellation_requested_at is not null then
    update public.download_jobs
    set status = 'canceled', completed_at = now(), worker_id = null, lease_expires_at = null
    where id = v_job.id;
    return query select 'CANCELED', v_job.id, null::text, null::text,
      null::text, null::text, null::text, null::text, v_job.attempt_count, v_job.max_attempts;
    return;
  end if;

  if v_job.status = 'processing' and v_job.lease_expires_at > now() then
    return query select 'BUSY', v_job.id, null::text, null::text,
      null::text, null::text, null::text, null::text, v_job.attempt_count, v_job.max_attempts;
    return;
  end if;

  if v_job.attempt_count >= v_job.max_attempts then
    update public.download_jobs
    set status = 'failed', failure_code = 'RETRY_EXHAUSTED', completed_at = now(),
        worker_id = null, lease_expires_at = null
    where id = v_job.id;
    return query select 'TERMINAL', v_job.id, null::text, null::text,
      null::text, null::text, null::text, null::text, v_job.attempt_count, v_job.max_attempts;
    return;
  end if;

  update public.download_jobs
  set status = 'processing',
      attempt_count = attempt_count + 1,
      worker_id = p_worker_id,
      lease_expires_at = now() + make_interval(secs => p_lease_seconds),
      started_at = coalesce(started_at, now()),
      failure_code = null
  where id = v_job.id
  returning * into v_job;

  return query select 'CLAIMED', v_job.id, v_job.source_url, v_job.source_host,
    v_job.source_platform, v_job.media_kind, v_job.requested_format,
    v_job.requested_quality, v_job.attempt_count, v_job.max_attempts;
end;
$$;

revoke all on function public.claim_media_job(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.claim_media_job(uuid, text, integer) to service_role;

create or replace function public.heartbeat_media_job(
  p_job_id uuid,
  p_worker_id text,
  p_lease_seconds integer default 120
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated integer;
begin
  if p_lease_seconds not between 30 and 900 then return false; end if;
  update public.download_jobs
  set lease_expires_at = now() + make_interval(secs => p_lease_seconds)
  where id = p_job_id and status = 'processing' and worker_id = p_worker_id;
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

revoke all on function public.heartbeat_media_job(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.heartbeat_media_job(uuid, text, integer) to service_role;

create or replace function public.media_job_should_cancel(
  p_job_id uuid,
  p_worker_id text
)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select coalesce((
    select cancellation_requested_at is not null or status = 'canceled'
    from public.download_jobs
    where id = p_job_id and worker_id = p_worker_id
  ), true);
$$;

revoke all on function public.media_job_should_cancel(uuid, text) from public, anon, authenticated;
grant execute on function public.media_job_should_cancel(uuid, text) to service_role;

create or replace function public.complete_media_job(
  p_job_id uuid,
  p_worker_id text,
  p_storage_bucket text,
  p_storage_path text,
  p_content_type text,
  p_content_disposition text,
  p_checksum_sha256 text,
  p_title text,
  p_thumbnail_url text,
  p_duration_seconds integer,
  p_file_size_bytes bigint,
  p_processing_seconds bigint,
  p_artifact_expires_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job public.download_jobs%rowtype;
begin
  select * into v_job
  from public.download_jobs
  where id = p_job_id and status = 'processing' and worker_id = p_worker_id
  for update;
  if not found or v_job.cancellation_requested_at is not null then return false; end if;

  insert into public.download_artifacts (
    job_id, storage_bucket, storage_path, content_type, content_disposition,
    checksum_sha256, expires_at
  ) values (
    p_job_id, p_storage_bucket, p_storage_path, p_content_type, p_content_disposition,
    p_checksum_sha256, p_artifact_expires_at
  ) on conflict (job_id) do update
    set storage_bucket = excluded.storage_bucket,
        storage_path = excluded.storage_path,
        content_type = excluded.content_type,
        content_disposition = excluded.content_disposition,
        checksum_sha256 = excluded.checksum_sha256,
        expires_at = excluded.expires_at,
        updated_at = now();

  update public.download_jobs
  set status = 'ready',
      title = left(nullif(btrim(p_title), ''), 500),
      thumbnail_url = case
        when p_thumbnail_url ~* '^https?://' then left(p_thumbnail_url, 2048)
        else null
      end,
      original_duration_seconds = p_duration_seconds,
      file_size_bytes = p_file_size_bytes,
      failure_code = null,
      completed_at = now(),
      lease_expires_at = null,
      worker_id = null
  where id = p_job_id;

  if v_job.user_id is not null then
    insert into public.usage_daily (
      user_id, usage_date, plan_code, quota_limit, jobs_succeeded,
      bytes_output, processing_seconds
    ) values (
      v_job.user_id, current_date, 'free', null, 1,
      greatest(p_file_size_bytes, 0), greatest(p_processing_seconds, 0)
    ) on conflict (user_id, usage_date) do update
      set jobs_succeeded = public.usage_daily.jobs_succeeded + 1,
          bytes_output = public.usage_daily.bytes_output + greatest(p_file_size_bytes, 0),
          processing_seconds = public.usage_daily.processing_seconds + greatest(p_processing_seconds, 0),
          updated_at = now();
  end if;

  return true;
end;
$$;

revoke all on function public.complete_media_job(
  uuid, text, text, text, text, text, text, text, text, integer, bigint, bigint, timestamptz
) from public, anon, authenticated;
grant execute on function public.complete_media_job(
  uuid, text, text, text, text, text, text, text, text, integer, bigint, bigint, timestamptz
) to service_role;

create or replace function public.fail_media_job(
  p_job_id uuid,
  p_worker_id text,
  p_failure_code text,
  p_retryable boolean,
  p_processing_seconds bigint default 0
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job public.download_jobs%rowtype;
  v_result text;
begin
  select * into v_job
  from public.download_jobs
  where id = p_job_id and status = 'processing' and worker_id = p_worker_id
  for update;
  if not found then return 'NOT_OWNED'; end if;

  if v_job.cancellation_requested_at is not null then
    update public.download_jobs
    set status = 'canceled', completed_at = now(), worker_id = null, lease_expires_at = null
    where id = p_job_id;
    return 'CANCELED';
  end if;

  if p_retryable and v_job.attempt_count < v_job.max_attempts then
    update public.download_jobs
    set status = 'queued', failure_code = left(p_failure_code, 100),
        worker_id = null, lease_expires_at = null
    where id = p_job_id;
    return 'RETRY';
  end if;

  update public.download_jobs
  set status = 'failed', failure_code = left(p_failure_code, 100), completed_at = now(),
      worker_id = null, lease_expires_at = null
  where id = p_job_id;
  v_result := 'FAILED';

  if v_job.user_id is not null then
    insert into public.usage_daily (
      user_id, usage_date, plan_code, quota_limit, jobs_failed, processing_seconds
    ) values (
      v_job.user_id, current_date, 'free', null, 1, greatest(p_processing_seconds, 0)
    ) on conflict (user_id, usage_date) do update
      set jobs_failed = public.usage_daily.jobs_failed + 1,
          processing_seconds = public.usage_daily.processing_seconds + greatest(p_processing_seconds, 0),
          updated_at = now();
  end if;

  return v_result;
end;
$$;

revoke all on function public.fail_media_job(uuid, text, text, boolean, bigint)
  from public, anon, authenticated;
grant execute on function public.fail_media_job(uuid, text, text, boolean, bigint)
  to service_role;

commit;
