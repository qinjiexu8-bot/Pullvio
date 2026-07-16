create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  locale text not null default 'en',
  source text not null default 'get-media',
  created_at timestamptz not null default now(),
  constraint waitlist_signups_email_length check (char_length(email) between 3 and 320),
  constraint waitlist_signups_email_normalized check (email = lower(btrim(email))),
  constraint waitlist_signups_email_format check (email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  constraint waitlist_signups_locale_check check (locale in ('en', 'zh-cn', 'es')),
  constraint waitlist_signups_source_check check (source = 'get-media')
);

create unique index if not exists waitlist_signups_email_unique
  on public.waitlist_signups (lower(email));

alter table public.waitlist_signups enable row level security;
alter table public.waitlist_signups force row level security;

revoke all on table public.waitlist_signups from anon, authenticated;
grant insert (email, locale, source) on table public.waitlist_signups to anon, authenticated;

drop policy if exists waitlist_signups_public_insert on public.waitlist_signups;
create policy waitlist_signups_public_insert
  on public.waitlist_signups
  for insert
  to anon, authenticated
  with check (true);

comment on table public.waitlist_signups is
  'Email addresses submitted from the Pullvio Get media early-access modal.';
