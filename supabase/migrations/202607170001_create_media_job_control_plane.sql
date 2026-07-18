begin;

alter table public.download_jobs
  alter column user_id drop not null,
  add column if not exists anonymous_subject text,
  add column if not exists network_subject text,
  add column if not exists source_platform text not null default 'youtube',
  add column if not exists idempotency_key uuid,
  add column if not exists queue_message_sent_at timestamptz,
  add column if not exists cancellation_requested_at timestamptz,
  add column if not exists attempt_count smallint not null default 0,
  add column if not exists max_attempts smallint not null default 3,
  add column if not exists lease_expires_at timestamptz,
  add column if not exists worker_id text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'download_jobs_exactly_one_owner_check'
      and conrelid = 'public.download_jobs'::regclass
  ) then
    alter table public.download_jobs
      add constraint download_jobs_exactly_one_owner_check check (
        (user_id is not null and anonymous_subject is null)
        or (user_id is null and anonymous_subject is not null)
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'download_jobs_anonymous_subject_check'
      and conrelid = 'public.download_jobs'::regclass
  ) then
    alter table public.download_jobs
      add constraint download_jobs_anonymous_subject_check check (
        anonymous_subject is null or anonymous_subject ~ '^[0-9a-f]{64}$'
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'download_jobs_network_subject_check'
      and conrelid = 'public.download_jobs'::regclass
  ) then
    alter table public.download_jobs
      add constraint download_jobs_network_subject_check check (
        network_subject is null or network_subject ~ '^[0-9a-f]{64}$'
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'download_jobs_source_platform_check'
      and conrelid = 'public.download_jobs'::regclass
  ) then
    alter table public.download_jobs
      add constraint download_jobs_source_platform_check check (
        source_platform in ('youtube', 'tiktok')
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'download_jobs_attempt_count_check'
      and conrelid = 'public.download_jobs'::regclass
  ) then
    alter table public.download_jobs
      add constraint download_jobs_attempt_count_check check (
        attempt_count >= 0 and max_attempts between 1 and 10
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'download_jobs_worker_id_check'
      and conrelid = 'public.download_jobs'::regclass
  ) then
    alter table public.download_jobs
      add constraint download_jobs_worker_id_check check (
        worker_id is null or char_length(worker_id) between 1 and 200
      );
  end if;
end
$$;

create unique index if not exists download_jobs_user_idempotency_unique
  on public.download_jobs (user_id, idempotency_key)
  where user_id is not null and idempotency_key is not null;

create unique index if not exists download_jobs_anonymous_idempotency_unique
  on public.download_jobs (anonymous_subject, idempotency_key)
  where anonymous_subject is not null and idempotency_key is not null;

create index if not exists download_jobs_anonymous_created_idx
  on public.download_jobs (anonymous_subject, created_at desc)
  where anonymous_subject is not null;

create index if not exists download_jobs_user_active_idx
  on public.download_jobs (user_id, created_at desc)
  where user_id is not null and status in ('queued', 'processing');

create index if not exists download_jobs_anonymous_active_idx
  on public.download_jobs (anonymous_subject, created_at desc)
  where anonymous_subject is not null and status in ('queued', 'processing');

create index if not exists download_jobs_network_burst_idx
  on public.download_jobs (network_subject, created_at desc)
  where network_subject is not null;

create index if not exists download_jobs_undispatched_idx
  on public.download_jobs (created_at)
  where status = 'queued' and queue_message_sent_at is null;

create index if not exists download_jobs_expired_leases_idx
  on public.download_jobs (lease_expires_at)
  where status = 'processing' and lease_expires_at is not null;

create table if not exists public.media_runtime_config (
  id boolean primary key default true,
  accepting_jobs boolean not null default false,
  anonymous_success_limit integer not null default 5,
  anonymous_active_limit integer not null default 1,
  authenticated_active_limit integer not null default 2,
  anonymous_burst_limit integer not null default 3,
  authenticated_burst_limit integer not null default 10,
  network_burst_limit integer not null default 20,
  updated_at timestamptz not null default now(),
  constraint media_runtime_config_singleton_check check (id),
  constraint media_runtime_config_limits_check check (
    anonymous_success_limit between 0 and 100
    and anonymous_active_limit between 0 and 10
    and authenticated_active_limit between 0 and 20
    and anonymous_burst_limit between 0 and 100
    and authenticated_burst_limit between 0 and 200
    and network_burst_limit between 0 and 1000
  )
);

insert into public.media_runtime_config (id, accepting_jobs)
values (true, false)
on conflict (id) do nothing;

drop trigger if exists media_runtime_config_set_updated_at on public.media_runtime_config;
create trigger media_runtime_config_set_updated_at
  before update on public.media_runtime_config
  for each row execute function public.set_pullvio_updated_at();

alter table public.media_runtime_config enable row level security;
alter table public.media_runtime_config force row level security;
revoke all on table public.media_runtime_config from public, anon, authenticated;

create or replace function public.reserve_media_job(
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
declare
  v_config public.media_runtime_config%rowtype;
  v_existing public.download_jobs%rowtype;
  v_inserted public.download_jobs%rowtype;
  v_subject text;
  v_active_count integer;
  v_burst_count integer;
  v_network_burst_count integer;
  v_success_count integer := 0;
  v_active_limit integer;
  v_burst_limit integer;
begin
  if (p_user_id is null) = (p_anonymous_subject is null) then
    return query select 'INVALID_OWNER', null::uuid, null::text, null::timestamptz,
      null::integer, null::integer, false;
    return;
  end if;

  if p_anonymous_subject is not null and p_anonymous_subject !~ '^[0-9a-f]{64}$' then
    return query select 'INVALID_OWNER', null::uuid, null::text, null::timestamptz,
      null::integer, null::integer, false;
    return;
  end if;

  v_subject := case
    when p_user_id is not null then 'user:' || p_user_id
    else 'anonymous:' || p_anonymous_subject
  end;
  perform pg_advisory_xact_lock(hashtextextended(v_subject, 0));

  select * into v_config
  from public.media_runtime_config
  where id = true;

  if not found or not v_config.accepting_jobs then
    return query select 'SERVICE_DISABLED', null::uuid, null::text, null::timestamptz,
      case when p_user_id is null then coalesce(v_config.anonymous_success_limit, 5) else null end,
      null::integer, false;
    return;
  end if;

  if p_user_id is not null then
    select * into v_existing
    from public.download_jobs
    where user_id = p_user_id and idempotency_key = p_idempotency_key;
  else
    select * into v_existing
    from public.download_jobs
    where anonymous_subject = p_anonymous_subject and idempotency_key = p_idempotency_key;
  end if;

  if found then
    if p_user_id is null then
      select count(*)::integer into v_success_count
      from public.download_jobs
      where anonymous_subject = p_anonymous_subject
        and status = 'ready'
        and completed_at >= now() - interval '24 hours';
    end if;

    return query select 'ACCEPTED', v_existing.id, v_existing.status, v_existing.created_at,
      case when p_user_id is null then v_config.anonymous_success_limit else null end,
      case when p_user_id is null then greatest(v_config.anonymous_success_limit - v_success_count, 0) else null end,
      true;
    return;
  end if;

  if p_user_id is not null then
    v_active_limit := v_config.authenticated_active_limit;
    v_burst_limit := v_config.authenticated_burst_limit;

    select count(*)::integer into v_active_count
    from public.download_jobs
    where user_id = p_user_id and status in ('queued', 'processing');

    select count(*)::integer into v_burst_count
    from public.download_jobs
    where user_id = p_user_id and created_at >= now() - interval '10 minutes';
  else
    v_active_limit := v_config.anonymous_active_limit;
    v_burst_limit := v_config.anonymous_burst_limit;

    select count(*)::integer into v_active_count
    from public.download_jobs
    where anonymous_subject = p_anonymous_subject and status in ('queued', 'processing');

    select count(*)::integer into v_burst_count
    from public.download_jobs
    where anonymous_subject = p_anonymous_subject and created_at >= now() - interval '10 minutes';

    select count(*)::integer into v_success_count
    from public.download_jobs
    where anonymous_subject = p_anonymous_subject
      and status = 'ready'
      and completed_at >= now() - interval '24 hours';

    if v_success_count >= v_config.anonymous_success_limit then
      return query select 'QUOTA_EXCEEDED', null::uuid, null::text, null::timestamptz,
        v_config.anonymous_success_limit, 0, false;
      return;
    end if;
  end if;

  if v_active_count >= v_active_limit then
    return query select 'ACTIVE_JOB_LIMIT', null::uuid, null::text, null::timestamptz,
      case when p_user_id is null then v_config.anonymous_success_limit else null end,
      case when p_user_id is null then greatest(v_config.anonymous_success_limit - v_success_count, 0) else null end,
      false;
    return;
  end if;

  if v_burst_count >= v_burst_limit then
    return query select 'RATE_LIMITED', null::uuid, null::text, null::timestamptz,
      case when p_user_id is null then v_config.anonymous_success_limit else null end,
      case when p_user_id is null then greatest(v_config.anonymous_success_limit - v_success_count, 0) else null end,
      false;
    return;
  end if;

  if p_network_subject is not null then
    select count(*)::integer into v_network_burst_count
    from public.download_jobs
    where network_subject = p_network_subject
      and created_at >= now() - interval '10 minutes';

    if v_network_burst_count >= v_config.network_burst_limit then
      return query select 'RATE_LIMITED', null::uuid, null::text, null::timestamptz,
        case when p_user_id is null then v_config.anonymous_success_limit else null end,
        case when p_user_id is null then greatest(v_config.anonymous_success_limit - v_success_count, 0) else null end,
        false;
      return;
    end if;
  end if;

  insert into public.download_jobs (
    user_id,
    anonymous_subject,
    network_subject,
    source_url,
    source_host,
    source_platform,
    media_kind,
    requested_format,
    requested_quality,
    idempotency_key,
    status,
    plan_code,
    history_expires_at
  ) values (
    p_user_id,
    p_anonymous_subject,
    p_network_subject,
    p_source_url,
    p_source_host,
    p_source_platform,
    p_media_kind,
    p_requested_format,
    p_requested_quality,
    p_idempotency_key,
    'queued',
    'free',
    case when p_user_id is null then now() + interval '25 hours' else now() + interval '90 days' end
  ) returning * into v_inserted;

  if p_user_id is not null then
    insert into public.usage_daily (user_id, usage_date, plan_code, quota_limit, jobs_started)
    values (p_user_id, current_date, 'free', null, 1)
    on conflict (user_id, usage_date) do update
      set jobs_started = public.usage_daily.jobs_started + 1,
          updated_at = now();
  end if;

  return query select 'ACCEPTED', v_inserted.id, v_inserted.status, v_inserted.created_at,
    case when p_user_id is null then v_config.anonymous_success_limit else null end,
    case when p_user_id is null then greatest(v_config.anonymous_success_limit - v_success_count, 0) else null end,
    false;
end;
$$;

revoke all on function public.reserve_media_job(
  text, text, text, text, text, text, text, text, text, uuid
) from public, anon, authenticated;
grant execute on function public.reserve_media_job(
  text, text, text, text, text, text, text, text, text, uuid
) to service_role;

create or replace function public.mark_media_job_dispatched(p_job_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated integer;
begin
  update public.download_jobs
  set queue_message_sent_at = coalesce(queue_message_sent_at, now())
  where id = p_job_id and status = 'queued';
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

revoke all on function public.mark_media_job_dispatched(uuid) from public, anon, authenticated;
grant execute on function public.mark_media_job_dispatched(uuid) to service_role;

create or replace function public.fail_undispatched_media_job(p_job_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated integer;
begin
  update public.download_jobs
  set status = 'failed',
      failure_code = 'QUEUE_UNAVAILABLE',
      completed_at = now()
  where id = p_job_id
    and status = 'queued'
    and queue_message_sent_at is null;
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

revoke all on function public.fail_undispatched_media_job(uuid) from public, anon, authenticated;
grant execute on function public.fail_undispatched_media_job(uuid) to service_role;

comment on table public.media_runtime_config is
  'Backend-only singleton kill switch and launch quota controls for media jobs.';
comment on column public.download_jobs.anonymous_subject is
  'HMAC-derived anonymous browser subject. Raw cookie and IP values are never stored.';
comment on column public.download_jobs.network_subject is
  'HMAC-derived abuse-control network subject. Raw IP values are never stored.';

commit;
