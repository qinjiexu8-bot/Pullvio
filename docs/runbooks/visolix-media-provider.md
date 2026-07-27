# Direct Visolix media-provider operations

## Active architecture

New jobs use this path:

`Browser -> Vercel API -> Visolix -> temporary provider URL`

Supabase stores ownership, quota, status, progress, provider identifiers, and
the conservative Pullvio result deadline. Browser polling advances an active
task while the page is open. Supabase hosted Cron (`pg_cron` + `pg_net`) calls
`/api/cron/media-provider` every minute so an account task can finish after the
user leaves. This avoids the Vercel Hobby plan's daily-only cron restriction.

Supported sources are YouTube, Instagram, Facebook, TikTok, Snapchat, and
OK.ru. YouTube provides the selected video quality or MP3. The other five
provide source video only.

The adapter accepts both Visolix response modes observed in production:

- an asynchronous provider ID followed through `/api/progress`;
- an immediate social media map, preferring `hd` and then `sd`.

Do not remove either branch merely because the public provider documentation
shows only the asynchronous form.

## Required Vercel configuration

Configure these as encrypted server-side environment variables in Production,
Preview where needed, and Development only for authorized testing:

- `VISOLIX_API_KEY`
- `VISOLIX_API_BASE_URL=https://developers.visolix.com/api`
- `PULLVIO_PROVIDER_URL_TTL_SECONDS=3600`
- `PULLVIO_FEISHU_WEBHOOK_URL`
- `CRON_SECRET` with at least 32 random characters
- existing Supabase service-role and Turnstile variables

Never prefix these variables with `NEXT_PUBLIC_`. Never print the API key,
webhook, full provider response, source URL, or result URL in logs.

The current API key and webhook were shared during implementation. Rotate both
before treating the launch configuration as final.

## Safe deployment order

1. Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.
2. Run `npm run db:push:dry` and review every pending migration.
3. Apply migrations before deploying code that calls the new RPC functions.
4. Add or rotate the required Vercel environment variables.
5. Deploy and test the six source pages.
6. Verify the `pullvio-media-provider-poll` Supabase cron job and browser
   polling, then leave one task to finish through cron.
7. Confirm account history exposes the temporary result to the correct owner.
8. Confirm a repeated identical request reuses the unexpired result without a
   second provider submission.
9. Keep the AWS worker available until active legacy jobs and artifacts drain.

## Provider result lifetime

Visolix does not document a fixed result-URL lifetime. Pullvio therefore stores
a conservative deadline, currently one hour. The UI tells users to save the
file promptly. A cache hit inherits the existing deadline and never extends it.

If operational evidence supports a different value, change
`PULLVIO_PROVIDER_URL_TTL_SECONDS` within the database-enforced 5-minute to
24-hour range. Do not promise that value publicly as a provider guarantee.

## Balance-exhausted incident

On Visolix HTTP 402 Pullvio:

1. fails the current task with `PROVIDER_BALANCE_EXHAUSTED`;
2. closes all six Visolix-backed platform switches;
3. creates one open incident and sends one Feishu notification;
4. shows a localized temporary-unavailability message.

After replenishing the balance, verify the server-side key and call the
service-role-only RPC:

```sql
select public.resolve_media_provider_balance_incident();
```

This resolves the deduplication key and reopens all six switches. Do not reopen
individual rows manually.

## Stalled jobs

Check due provider runs:

```sql
select job_id, provider_platform, status, provider_progress, next_poll_at,
       last_http_status, last_error_code
from public.media_provider_runs
where status in ('submitted', 'processing')
order by next_poll_at nulls first;
```

Then verify:

- the Supabase `pullvio-media-provider-poll` job and matching `CRON_SECRET`;
- the latest `cron.job_run_details` and `net._http_response` status;
- Visolix availability;
- `next_poll_at` is advancing;
- no 401, 402, or invalid-response failure is present.

Do not blindly resubmit an ambiguous task. Visolix has no documented
idempotency key, so a replay can create a duplicate paid request.

## Rollback

Close all provider-backed sources:

```sql
update public.media_platform_config
set accepting_jobs = false
where platform in ('youtube', 'instagram', 'facebook', 'tiktok', 'snapchat', 'okru');
```

Keep task and provider-run records for diagnosis. If private AWS delivery must
be restored, deploy the previously versioned worker and control-plane code as a
coordinated rollback; do not point the direct schema at the old worker.

## AWS decommission checklist

Only after production verification:

- stop new SQS dispatch;
- wait for visible and in-flight messages to reach zero;
- retain the dead-letter queue during the observation window;
- allow existing signed S3/CloudFront artifacts to expire;
- stop EC2/ECS;
- remove unused SQS, S3, CloudFront, log, alarm, and networking resources only
  after confirming billing and rollback requirements.
