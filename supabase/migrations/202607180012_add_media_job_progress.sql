begin;

alter table public.download_jobs
  add column if not exists processing_stage text not null default 'queued',
  add column if not exists progress_percent smallint not null default 0;

alter table public.download_jobs
  drop constraint if exists download_jobs_processing_stage_check;
alter table public.download_jobs
  add constraint download_jobs_processing_stage_check check (
    processing_stage in (
      'queued', 'fetching', 'processing_audio', 'processing_cover', 'uploading',
      'completed', 'failed', 'canceled', 'expired'
    )
  );
alter table public.download_jobs
  drop constraint if exists download_jobs_progress_percent_check;
alter table public.download_jobs
  add constraint download_jobs_progress_percent_check check (
    progress_percent between 0 and 100
  );

update public.download_jobs
set processing_stage = case status
      when 'ready' then 'completed'
      when 'failed' then 'failed'
      when 'canceled' then 'canceled'
      when 'expired' then 'expired'
      when 'processing' then 'fetching'
      else 'queued'
    end,
    progress_percent = case
      when status = 'ready' then 100
      when status = 'processing' then greatest(progress_percent, 5)
      else progress_percent
    end;

create or replace function public.sync_download_job_progress()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'queued' and (tg_op = 'INSERT' or old.status is distinct from 'queued') then
    new.processing_stage := 'queued';
    new.progress_percent := 0;
  elsif new.status = 'processing' and (tg_op = 'INSERT' or old.status is distinct from 'processing') then
    new.processing_stage := 'fetching';
    new.progress_percent := greatest(new.progress_percent, 5);
  elsif new.status = 'ready' then
    new.processing_stage := 'completed';
    new.progress_percent := 100;
  elsif new.status = 'failed' then
    new.processing_stage := 'failed';
  elsif new.status = 'canceled' then
    new.processing_stage := 'canceled';
  elsif new.status = 'expired' then
    new.processing_stage := 'expired';
  end if;
  return new;
end;
$$;

drop trigger if exists download_jobs_sync_progress on public.download_jobs;
create trigger download_jobs_sync_progress
  before insert or update of status on public.download_jobs
  for each row execute function public.sync_download_job_progress();

create or replace function public.update_media_job_progress(
  p_job_id uuid,
  p_worker_id text,
  p_processing_stage text,
  p_progress_percent integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_processing_stage not in ('fetching', 'processing_audio', 'processing_cover', 'uploading')
    or p_progress_percent not between 1 and 99 then
    return false;
  end if;

  update public.download_jobs
  set processing_stage = p_processing_stage,
      progress_percent = greatest(progress_percent, p_progress_percent)
  where id = p_job_id
    and status = 'processing'
    and worker_id = p_worker_id
    and p_progress_percent >= progress_percent;
  return found;
end;
$$;

revoke all on function public.update_media_job_progress(uuid, text, text, integer)
  from public, anon, authenticated;
grant execute on function public.update_media_job_progress(uuid, text, text, integer)
  to service_role;

comment on column public.download_jobs.processing_stage is
  'Public-safe durable processing stage written by the database lifecycle and active Worker.';
comment on column public.download_jobs.progress_percent is
  'Monotonic whole-task progress from 0 to 100; Visolix progress occupies the fetching segment.';

commit;
