create index if not exists download_jobs_user_created_id_idx
  on public.download_jobs (user_id, created_at desc, id desc)
  where user_id is not null;

comment on index public.download_jobs_user_created_id_idx is
  'Supports stable account download-history pagination by owner and newest job.';
