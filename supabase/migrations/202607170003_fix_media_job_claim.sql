begin;

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

  update public.download_jobs as jobs
  set status = 'processing',
      attempt_count = jobs.attempt_count + 1,
      worker_id = p_worker_id,
      lease_expires_at = now() + make_interval(secs => p_lease_seconds),
      started_at = coalesce(jobs.started_at, now()),
      failure_code = null
  where jobs.id = v_job.id
  returning jobs.* into v_job;

  return query select 'CLAIMED', v_job.id, v_job.source_url, v_job.source_host,
    v_job.source_platform, v_job.media_kind, v_job.requested_format,
    v_job.requested_quality, v_job.attempt_count, v_job.max_attempts;
end;
$$;

revoke all on function public.claim_media_job(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.claim_media_job(uuid, text, integer) to service_role;

commit;
