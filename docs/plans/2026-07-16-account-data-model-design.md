# Pullvio account data model

## Status

Accepted for the first production account backend.

## Requirements

- Create one profile for every Supabase Auth user.
- Show a user's own download history, current plan, billing state, and daily usage.
- Support Free and Pro retention, priority, and batch behavior without duplicating account data.
- Keep storage object paths and file checksums inaccessible to browser clients.
- Allow users to edit only personal preferences and remove only completed history entries.
- Make all structural changes reproducible through Supabase migrations.

## Data model

```text
auth.users
   │
   ├── 1:1 profiles
   ├── 1:N subscriptions
   ├── 1:N download_jobs ── 1:1 download_artifacts (backend only)
   └── 1:N usage_daily
```

- `profiles` contains display preferences, not a duplicate email address.
- `download_jobs` contains fields safe to render in the account UI. Anonymous downloads remain ephemeral and do not create history rows.
- `download_artifacts` contains the private storage location and checksum. A server endpoint must create short-lived signed download URLs.
- `subscriptions` records payment-provider subscription state. No client role can change it.
- `usage_daily` records quota counters. No client role can change it.

## Security decisions

- Every user-facing table has RLS enabled and forced.
- Owner checks use `(select auth.uid()) = user_id` and indexed ownership columns.
- `anon` receives no privileges on account tables.
- `authenticated` can read only its own rows, update only profile preference columns, and delete only finished download history.
- Billing, job state, quota counters, and artifact data are written by trusted backend services only.
- Account deletion cascades from `auth.users` through all account data.

## Performance and retention

- History uses `(user_id, created_at desc)` for the personal-center query.
- Queue workers use a partial index containing only queued and processing jobs.
- Batch jobs and expiring history use partial indexes to avoid indexing irrelevant rows.
- Free/Pro history retention is represented by `plan_code` and `history_expires_at`; deletion is performed later by a scheduled backend job.

## Alternatives considered

1. **One account table:** simpler initially, but mixes mutable preferences, billing state, high-volume job history, and usage counters. Rejected.
2. **Four user-facing tables with internal fields hidden by column privileges:** workable, but `select *` becomes fragile and internal storage paths remain in a client-facing table. Rejected.
3. **Four user-facing tables plus a private artifact table:** selected. It keeps the account API simple while isolating storage internals.

## Failure modes

- Profile creation metadata is normalized and length-limited so malformed OAuth metadata cannot violate profile constraints.
- Payment webhooks are idempotent through a unique provider subscription identifier.
- Worker retries update one existing job instead of creating duplicate history records.
- Quota increments must be implemented as an atomic database operation when the processing backend is added.

## References

- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase Postgres triggers](https://supabase.com/docs/guides/database/postgres/triggers)
