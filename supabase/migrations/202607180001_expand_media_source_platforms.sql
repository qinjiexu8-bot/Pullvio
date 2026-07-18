begin;

alter table public.download_jobs
  drop constraint if exists download_jobs_source_platform_check;

alter table public.download_jobs
  add constraint download_jobs_source_platform_check check (
    source_platform in ('youtube', 'tiktok', 'vimeo', 'soundcloud')
  );

commit;
