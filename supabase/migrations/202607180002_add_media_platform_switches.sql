begin;

create table if not exists public.media_platform_config (
  platform text primary key,
  accepting_jobs boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint media_platform_config_platform_check check (
    platform in ('youtube', 'tiktok', 'vimeo', 'soundcloud')
  )
);

insert into public.media_platform_config (platform, accepting_jobs)
values
  ('youtube', false),
  ('tiktok', true),
  ('vimeo', true),
  ('soundcloud', true)
on conflict (platform) do nothing;

drop trigger if exists media_platform_config_set_updated_at on public.media_platform_config;
create trigger media_platform_config_set_updated_at
  before update on public.media_platform_config
  for each row execute function public.set_pullvio_updated_at();

alter table public.media_platform_config enable row level security;
alter table public.media_platform_config force row level security;
revoke all on table public.media_platform_config from public, anon, authenticated;

alter function public.reserve_media_job(
  text, text, text, text, text, text, text, text, text, uuid
) rename to reserve_media_job_unchecked;

revoke all on function public.reserve_media_job_unchecked(
  text, text, text, text, text, text, text, text, text, uuid
) from public, anon, authenticated, service_role;

create function public.reserve_media_job(
  p_user_id text,
  p_anonymous_subject text,
  p_network_subject text,
  p_source_url text,
  p_source_host text,
  p_source_platform text,
  p_media_kind text,
  p_requested_format text,
  p_requested_quality text,
  p_idempotency_key uuid
)
returns table (
  result_code text,
  job_id uuid,
  job_status text,
  job_created_at timestamptz,
  quota_limit integer,
  quota_remaining integer,
  is_duplicate boolean
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not coalesce((
    select config.accepting_jobs
    from public.media_platform_config as config
    where config.platform = p_source_platform
  ), false) then
    return query select 'SOURCE_DISABLED', null::uuid, null::text, null::timestamptz,
      null::integer, null::integer, false;
    return;
  end if;

  return query
  select * from public.reserve_media_job_unchecked(
    p_user_id,
    p_anonymous_subject,
    p_network_subject,
    p_source_url,
    p_source_host,
    p_source_platform,
    p_media_kind,
    p_requested_format,
    p_requested_quality,
    p_idempotency_key
  );
end;
$$;

revoke all on function public.reserve_media_job(
  text, text, text, text, text, text, text, text, text, uuid
) from public, anon, authenticated;
grant execute on function public.reserve_media_job(
  text, text, text, text, text, text, text, text, text, uuid
) to service_role;

comment on table public.media_platform_config is
  'Backend-only per-platform media job switches. The global media_runtime_config switch still takes precedence.';

commit;
