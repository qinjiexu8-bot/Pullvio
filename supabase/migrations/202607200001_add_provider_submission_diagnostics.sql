begin;

alter table public.media_provider_runs
  add column if not exists last_error_info jsonb not null default '{}'::jsonb;

alter table public.media_provider_runs
  drop constraint if exists media_provider_runs_last_error_info_check;
alter table public.media_provider_runs
  add constraint media_provider_runs_last_error_info_check check (
    jsonb_typeof(last_error_info) = 'object'
    and octet_length(last_error_info::text) <= 4096
  );

create function public.record_media_provider_submission_failure(
  p_run_id uuid,
  p_worker_id text,
  p_error_code text,
  p_http_status integer,
  p_error_info jsonb,
  p_outcome_known boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if char_length(coalesce(p_error_code, '')) not between 1 and 100
    or p_error_code !~ '^[A-Z0-9_]+$'
    or (p_http_status is not null and p_http_status not between 100 and 599)
    or jsonb_typeof(coalesce(p_error_info, '{}'::jsonb)) <> 'object'
    or octet_length(coalesce(p_error_info, '{}'::jsonb)::text) > 4096 then
    return false;
  end if;

  update public.media_provider_runs as runs
  set status = case when p_outcome_known then 'failed' else 'ambiguous' end,
      last_http_status = p_http_status,
      last_error_code = p_error_code,
      last_error_info = coalesce(p_error_info, '{}'::jsonb),
      completed_at = case when p_outcome_known then now() else null end,
      next_poll_at = null
  from public.download_jobs as jobs
  where runs.id = p_run_id
    and jobs.id = runs.job_id
    and jobs.status = 'processing'
    and jobs.worker_id = p_worker_id
    and runs.status = 'ambiguous'
    and runs.provider_job_id is null
    and runs.submit_count = 1;
  return found;
end;
$$;

revoke all on function public.record_media_provider_submission_failure(
  uuid, text, text, integer, jsonb, boolean
) from public, anon, authenticated;
grant execute on function public.record_media_provider_submission_failure(
  uuid, text, text, integer, jsonb, boolean
) to service_role;

comment on column public.media_provider_runs.last_error_info is
  'Bounded, redacted provider failure diagnostics. Must not contain credentials, source URLs, result URLs, or full provider responses.';

commit;
