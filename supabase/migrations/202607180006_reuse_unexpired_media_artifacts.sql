create index if not exists download_jobs_ready_cache_lookup_idx
  on public.download_jobs (
    md5(source_url),
    completed_at desc
  )
  where status = 'ready';

create or replace function public.reuse_cached_media_job(p_job_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job public.download_jobs%rowtype;
  v_source public.download_jobs%rowtype;
  v_minimum_expiry timestamptz := now() + interval '1 minute';
  v_primary_size bigint;
begin
  select * into v_job
  from public.download_jobs
  where id = p_job_id
    and status = 'queued'
    and queue_message_sent_at is null
  for update;

  if not found then return false; end if;

  perform pg_advisory_xact_lock(hashtextextended(
    v_job.source_url || E'\n' || v_job.media_kind || E'\n'
      || v_job.requested_format || E'\n' || v_job.requested_quality,
    7218
  ));

  select candidate.* into v_source
  from public.download_jobs as candidate
  where candidate.id <> v_job.id
    and candidate.status = 'ready'
    and md5(candidate.source_url) = md5(v_job.source_url)
    and candidate.source_url = v_job.source_url
    and (
      v_job.media_kind = 'audio'
      or candidate.requested_quality = v_job.requested_quality
    )
    and exists (
      select 1
      from public.download_artifacts as primary_artifact
      where primary_artifact.job_id = candidate.id
        and primary_artifact.artifact_kind = v_job.media_kind
        and primary_artifact.expires_at > v_minimum_expiry
    )
  order by candidate.completed_at desc nulls last
  limit 1
  for key share;

  if not found then return false; end if;

  insert into public.download_artifacts (
    job_id,
    artifact_kind,
    storage_bucket,
    storage_path,
    content_type,
    content_disposition,
    checksum_sha256,
    file_size_bytes,
    expires_at
  )
  select
    v_job.id,
    artifact.artifact_kind,
    artifact.storage_bucket,
    artifact.storage_path,
    artifact.content_type,
    case artifact.artifact_kind
      when 'video' then 'attachment; filename="pullvio-' || v_job.id::text || '-video.mp4"'
      when 'audio' then 'attachment; filename="pullvio-' || v_job.id::text || '-audio.mp3"'
      else 'attachment; filename="pullvio-' || v_job.id::text || '-cover.jpg"'
    end,
    artifact.checksum_sha256,
    artifact.file_size_bytes,
    artifact.expires_at
  from public.download_artifacts as artifact
  where artifact.job_id = v_source.id
    and artifact.expires_at > v_minimum_expiry;

  select artifact.file_size_bytes into v_primary_size
  from public.download_artifacts as artifact
  where artifact.job_id = v_job.id
    and artifact.artifact_kind = v_job.media_kind;

  if v_primary_size is null then
    delete from public.download_artifacts where job_id = v_job.id;
    return false;
  end if;

  update public.download_jobs
  set status = 'ready',
      title = v_source.title,
      thumbnail_url = v_source.thumbnail_url,
      original_duration_seconds = v_source.original_duration_seconds,
      file_size_bytes = v_primary_size,
      failure_code = null,
      started_at = now(),
      completed_at = now(),
      lease_expires_at = null,
      worker_id = null
  where id = v_job.id;

  if v_job.user_id is not null then
    insert into public.usage_daily (
      user_id, usage_date, plan_code, quota_limit, jobs_succeeded
    ) values (
      v_job.user_id, current_date, 'free', null, 1
    ) on conflict (user_id, usage_date) do update
      set jobs_succeeded = public.usage_daily.jobs_succeeded + 1,
          updated_at = now();
  end if;

  return true;
end;
$$;

revoke all on function public.reuse_cached_media_job(uuid)
  from public, anon, authenticated;
grant execute on function public.reuse_cached_media_job(uuid)
  to service_role;

comment on function public.reuse_cached_media_job(uuid) is
  'Completes a newly reserved job from an exact, unexpired private artifact set without queueing media processing.';
