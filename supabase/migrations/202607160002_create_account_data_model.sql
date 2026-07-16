create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  locale text not null default 'en',
  theme text not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_check check (
    display_name is null or char_length(btrim(display_name)) between 1 and 120
  ),
  constraint profiles_avatar_url_check check (
    avatar_url is null or (
      char_length(avatar_url) <= 2048 and avatar_url ~* '^https?://'
    )
  ),
  constraint profiles_locale_check check (locale in ('en', 'zh-cn', 'es')),
  constraint profiles_theme_check check (theme in ('system', 'light', 'dark'))
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text,
  provider_price_id text,
  plan_code text not null default 'pro',
  status text not null default 'incomplete',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_provider_check check (provider in ('stripe', 'manual')),
  constraint subscriptions_provider_customer_check check (
    provider_customer_id is null or char_length(provider_customer_id) between 1 and 255
  ),
  constraint subscriptions_provider_subscription_check check (
    provider_subscription_id is null or char_length(provider_subscription_id) between 1 and 255
  ),
  constraint subscriptions_provider_price_check check (
    provider_price_id is null or char_length(provider_price_id) between 1 and 255
  ),
  constraint subscriptions_plan_check check (plan_code in ('free', 'pro')),
  constraint subscriptions_status_check check (
    status in (
      'trialing', 'active', 'past_due', 'canceled', 'unpaid',
      'incomplete', 'incomplete_expired', 'paused'
    )
  ),
  constraint subscriptions_period_check check (
    current_period_end is null
    or current_period_start is null
    or current_period_end >= current_period_start
  )
);

create table if not exists public.download_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_url text not null,
  source_host text not null,
  title text,
  thumbnail_url text,
  media_kind text not null default 'video',
  requested_format text not null default 'mp4',
  requested_quality text not null default 'best',
  status text not null default 'queued',
  plan_code text not null default 'free',
  priority smallint not null default 0,
  batch_id uuid,
  batch_position smallint,
  original_duration_seconds integer,
  file_size_bytes bigint,
  failure_code text,
  history_expires_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint download_jobs_source_url_check check (
    char_length(source_url) between 8 and 4096 and source_url ~* '^https?://'
  ),
  constraint download_jobs_source_host_check check (
    char_length(source_host) between 1 and 255 and source_host = lower(btrim(source_host))
  ),
  constraint download_jobs_title_check check (
    title is null or char_length(title) between 1 and 500
  ),
  constraint download_jobs_thumbnail_url_check check (
    thumbnail_url is null or (
      char_length(thumbnail_url) <= 2048 and thumbnail_url ~* '^https?://'
    )
  ),
  constraint download_jobs_media_kind_check check (media_kind in ('video', 'audio')),
  constraint download_jobs_format_check check (requested_format in ('mp4', 'mp3')),
  constraint download_jobs_quality_check check (char_length(requested_quality) between 1 and 32),
  constraint download_jobs_status_check check (
    status in ('queued', 'processing', 'ready', 'failed', 'canceled', 'expired')
  ),
  constraint download_jobs_plan_check check (plan_code in ('free', 'pro')),
  constraint download_jobs_priority_check check (priority between 0 and 100),
  constraint download_jobs_batch_check check (
    (batch_id is null and batch_position is null)
    or (batch_id is not null and batch_position is not null and batch_position >= 0)
  ),
  constraint download_jobs_duration_check check (
    original_duration_seconds is null or original_duration_seconds >= 0
  ),
  constraint download_jobs_file_size_check check (file_size_bytes is null or file_size_bytes >= 0),
  constraint download_jobs_failure_code_check check (
    failure_code is null or char_length(failure_code) between 1 and 100
  ),
  constraint download_jobs_history_expiry_check check (
    history_expires_at is null or history_expires_at >= created_at
  ),
  constraint download_jobs_started_at_check check (started_at is null or started_at >= created_at),
  constraint download_jobs_completed_at_check check (completed_at is null or completed_at >= created_at)
);

create table if not exists public.download_artifacts (
  job_id uuid primary key references public.download_jobs (id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  content_type text not null,
  checksum_sha256 text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz,
  constraint download_artifacts_bucket_check check (
    char_length(storage_bucket) between 1 and 100
  ),
  constraint download_artifacts_path_check check (
    char_length(storage_path) between 1 and 1024
  ),
  constraint download_artifacts_content_type_check check (
    char_length(content_type) between 3 and 255
  ),
  constraint download_artifacts_checksum_check check (
    checksum_sha256 is null or checksum_sha256 ~ '^[0-9a-f]{64}$'
  ),
  constraint download_artifacts_expiry_check check (
    expires_at is null or expires_at >= created_at
  )
);

create table if not exists public.usage_daily (
  user_id uuid not null references auth.users (id) on delete cascade,
  usage_date date not null default current_date,
  plan_code text not null default 'free',
  quota_limit integer,
  jobs_started integer not null default 0,
  jobs_succeeded integer not null default 0,
  jobs_failed integer not null default 0,
  bytes_output bigint not null default 0,
  processing_seconds bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date),
  constraint usage_daily_plan_check check (plan_code in ('free', 'pro')),
  constraint usage_daily_quota_check check (quota_limit is null or quota_limit >= 0),
  constraint usage_daily_jobs_started_check check (jobs_started >= 0),
  constraint usage_daily_jobs_succeeded_check check (jobs_succeeded >= 0),
  constraint usage_daily_jobs_failed_check check (jobs_failed >= 0),
  constraint usage_daily_bytes_check check (bytes_output >= 0),
  constraint usage_daily_processing_check check (processing_seconds >= 0)
);

create index if not exists subscriptions_user_status_idx
  on public.subscriptions (user_id, status, current_period_end desc);

create unique index if not exists subscriptions_provider_subscription_unique
  on public.subscriptions (provider, provider_subscription_id)
  where provider_subscription_id is not null;

create unique index if not exists subscriptions_one_current_per_user
  on public.subscriptions (user_id)
  where status in ('trialing', 'active', 'past_due');

create index if not exists subscriptions_provider_customer_idx
  on public.subscriptions (provider, provider_customer_id)
  where provider_customer_id is not null;

create index if not exists download_jobs_user_created_idx
  on public.download_jobs (user_id, created_at desc);

create index if not exists download_jobs_queue_idx
  on public.download_jobs (status, priority desc, created_at)
  where status in ('queued', 'processing');

create index if not exists download_jobs_batch_idx
  on public.download_jobs (user_id, batch_id, batch_position)
  where batch_id is not null;

create index if not exists download_jobs_history_expiry_idx
  on public.download_jobs (history_expires_at)
  where history_expires_at is not null;

create index if not exists download_artifacts_expiry_idx
  on public.download_artifacts (expires_at)
  where expires_at is not null;

create index if not exists usage_daily_date_idx
  on public.usage_daily (usage_date);

create or replace function public.set_pullvio_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_pullvio_updated_at() from public, anon, authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_pullvio_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_pullvio_updated_at();

drop trigger if exists download_jobs_set_updated_at on public.download_jobs;
create trigger download_jobs_set_updated_at
  before update on public.download_jobs
  for each row execute function public.set_pullvio_updated_at();

drop trigger if exists download_artifacts_set_updated_at on public.download_artifacts;
create trigger download_artifacts_set_updated_at
  before update on public.download_artifacts
  for each row execute function public.set_pullvio_updated_at();

drop trigger if exists usage_daily_set_updated_at on public.usage_daily;
create trigger usage_daily_set_updated_at
  before update on public.usage_daily
  for each row execute function public.set_pullvio_updated_at();

create or replace function public.handle_pullvio_user_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  user_display_name text;
  user_avatar_url text;
  user_locale text;
begin
  user_display_name := nullif(
    left(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')), 120),
    ''
  );

  user_avatar_url := case
    when btrim(coalesce(new.raw_user_meta_data ->> 'avatar_url', '')) ~* '^https?://'
      then left(btrim(new.raw_user_meta_data ->> 'avatar_url'), 2048)
    else null
  end;

  user_locale := case
    when new.raw_user_meta_data ->> 'locale' in ('en', 'zh-cn', 'es')
      then new.raw_user_meta_data ->> 'locale'
    else 'en'
  end;

  insert into public.profiles (id, display_name, avatar_url, locale)
  values (new.id, user_display_name, user_avatar_url, user_locale)
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_pullvio_user_created() from public, anon, authenticated;

drop trigger if exists pullvio_auth_user_created on auth.users;
create trigger pullvio_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_pullvio_user_created();

insert into public.profiles (id, display_name, avatar_url, locale, created_at, updated_at)
select
  users.id,
  nullif(
    left(btrim(coalesce(users.raw_user_meta_data ->> 'full_name', users.raw_user_meta_data ->> 'name', '')), 120),
    ''
  ),
  case
    when btrim(coalesce(users.raw_user_meta_data ->> 'avatar_url', '')) ~* '^https?://'
      then left(btrim(users.raw_user_meta_data ->> 'avatar_url'), 2048)
    else null
  end,
  case
    when users.raw_user_meta_data ->> 'locale' in ('en', 'zh-cn', 'es')
      then users.raw_user_meta_data ->> 'locale'
    else 'en'
  end,
  coalesce(users.created_at, now()),
  coalesce(users.updated_at, users.created_at, now())
from auth.users as users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.subscriptions enable row level security;
alter table public.subscriptions force row level security;
alter table public.download_jobs enable row level security;
alter table public.download_jobs force row level security;
alter table public.download_artifacts enable row level security;
alter table public.download_artifacts force row level security;
alter table public.usage_daily enable row level security;
alter table public.usage_daily force row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.subscriptions from anon, authenticated;
revoke all on table public.download_jobs from anon, authenticated;
revoke all on table public.download_artifacts from anon, authenticated;
revoke all on table public.usage_daily from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, avatar_url, locale, theme) on table public.profiles to authenticated;
grant select on table public.subscriptions to authenticated;
grant select, delete on table public.download_jobs to authenticated;
grant select on table public.usage_daily to authenticated;

drop policy if exists profiles_owner_select on public.profiles;
create policy profiles_owner_select
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists profiles_owner_update on public.profiles;
create policy profiles_owner_update
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists subscriptions_owner_select on public.subscriptions;
create policy subscriptions_owner_select
  on public.subscriptions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists download_jobs_owner_select on public.download_jobs;
create policy download_jobs_owner_select
  on public.download_jobs
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists download_jobs_owner_delete on public.download_jobs;
create policy download_jobs_owner_delete
  on public.download_jobs
  for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    and status in ('ready', 'failed', 'canceled', 'expired')
  );

drop policy if exists usage_daily_owner_select on public.usage_daily;
create policy usage_daily_owner_select
  on public.usage_daily
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

comment on table public.profiles is
  'User-owned account preferences linked one-to-one with Supabase Auth.';
comment on table public.subscriptions is
  'Backend-managed Free and Pro subscription state for the Pullvio account center.';
comment on table public.download_jobs is
  'Authenticated-user media jobs and account download history.';
comment on table public.download_artifacts is
  'Backend-only storage locations and checksums for completed media jobs.';
comment on table public.usage_daily is
  'Backend-maintained daily quota and processing counters per user.';
