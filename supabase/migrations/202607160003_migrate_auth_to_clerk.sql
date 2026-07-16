begin;

drop trigger if exists pullvio_auth_user_created on auth.users;
drop function if exists public.handle_pullvio_user_created();

drop policy if exists profiles_owner_select on public.profiles;
drop policy if exists profiles_owner_insert on public.profiles;
drop policy if exists profiles_owner_update on public.profiles;
drop policy if exists subscriptions_owner_select on public.subscriptions;
drop policy if exists download_jobs_owner_select on public.download_jobs;
drop policy if exists download_jobs_owner_delete on public.download_jobs;
drop policy if exists usage_daily_owner_select on public.usage_daily;

alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.subscriptions drop constraint if exists subscriptions_user_id_fkey;
alter table public.download_jobs drop constraint if exists download_jobs_user_id_fkey;
alter table public.usage_daily drop constraint if exists usage_daily_user_id_fkey;

alter table public.profiles alter column id type text using id::text;
alter table public.subscriptions alter column user_id type text using user_id::text;
alter table public.download_jobs alter column user_id type text using user_id::text;
alter table public.usage_daily alter column user_id type text using user_id::text;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (id, display_name, avatar_url, locale, theme) on table public.profiles to authenticated;
grant update (display_name, avatar_url, locale, theme) on table public.profiles to authenticated;

create policy profiles_owner_select
  on public.profiles
  for select
  to authenticated
  using ((select auth.jwt() ->> 'sub') = id);

create policy profiles_owner_insert
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.jwt() ->> 'sub') = id);

create policy profiles_owner_update
  on public.profiles
  for update
  to authenticated
  using ((select auth.jwt() ->> 'sub') = id)
  with check ((select auth.jwt() ->> 'sub') = id);

create policy subscriptions_owner_select
  on public.subscriptions
  for select
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

create policy download_jobs_owner_select
  on public.download_jobs
  for select
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

create policy download_jobs_owner_delete
  on public.download_jobs
  for delete
  to authenticated
  using (
    (select auth.jwt() ->> 'sub') = user_id
    and status in ('ready', 'failed', 'canceled', 'expired')
  );

create policy usage_daily_owner_select
  on public.usage_daily
  for select
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

comment on table public.profiles is
  'User-owned account preferences keyed by the Clerk user ID from the JWT sub claim.';

commit;
