# Pullvio production runtime

Last updated: 2026-07-30.

## Active request path

```text
Browser
  -> Vercel /api/media/jobs
  -> Supabase job, quota, cache, and provider-run state
  -> Visolix media API
  -> temporary provider download URL
```

Clerk supplies account authentication. Cloudflare Turnstile protects repeated
provider-backed requests. Supabase Cron calls
`/api/cron/media-provider` once per minute so asynchronous jobs can continue
after the browser closes.

New media jobs do not use EC2, ECS, SQS, S3, CloudFront, Secrets Manager, yt-dlp,
or a self-hosted FFmpeg worker. The EC2 worker was shut down on 2026-07-30.

## Platform scope

Production accepts the six Visolix-backed sources documented by the provider:

- YouTube
- Instagram
- Facebook
- TikTok
- Snapchat
- OK.ru

YouTube accepts one selected video quality or MP3 per request. The other
platforms expose the source video returned by the provider. Availability still
depends on whether the source is public, accessible, and supported at request
time.

## Required services and secrets

### Vercel

- `NEXT_PUBLIC_SITE_URL`
- Clerk publishable and secret keys
- Supabase URL, publishable key, and server-only secret key
- `PULLVIO_ANONYMOUS_SECRET`
- `VISOLIX_API_KEY`
- `VISOLIX_API_BASE_URL`
- `PULLVIO_PROVIDER_URL_TTL_SECONDS`
- `PULLVIO_FEISHU_WEBHOOK_URL`
- `CRON_SECRET`
- Turnstile site and secret keys

Only browser-safe publishable values may use the `NEXT_PUBLIC_` prefix.

### Supabase

Supabase is the durable source of truth for profiles, quotas, download jobs,
provider runs, result reuse, platform switches, and provider incidents. The
`pullvio-media-provider-poll` scheduled job must call the protected Vercel cron
endpoint with the same `CRON_SECRET`.

### Visolix

Visolix performs media retrieval and returns either an immediate result or an
asynchronous job identifier. Pullvio stores a conservative result deadline and
does not promise that a provider URL will remain valid for a fixed period.

## Routine deployment

1. Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.
2. Review pending Supabase migrations with `npm run db:push:dry`.
3. Apply required migrations before code that depends on them.
4. deploy Vercel from the reviewed Git commit.
5. Verify the homepage and all six platform routes.
6. Verify a read-only account page and cron health without submitting a paid
   media request.
7. Use an authorized, low-cost source only when an actual provider transaction
   must be tested.

## Incident checks

For stalled tasks, inspect `media_provider_runs`, Supabase Cron execution,
Vercel function logs, and Visolix status. Do not blindly resubmit an ambiguous
request because the provider does not document an idempotency key.

For HTTP 402, Pullvio closes all provider-backed platform switches, creates one
deduplicated incident, sends a Feishu alert, and returns a localized
temporary-unavailability message. Follow
[the Visolix provider runbook](visolix-media-provider.md) to recover.

## Retired AWS stack

The web application has no runtime imports or environment requirements for the
former AWS worker stack. Historical schemas and design records may remain for
audit and possible future architecture work.

Stopping EC2 does not automatically remove charges from Elastic IPs, EBS
volumes, snapshots, NAT gateways, CloudFront, S3, CloudWatch, SQS, SNS, or Route
53. Inventory and remove those resources in a separate AWS cleanup only after
confirming they contain no data or configuration that must be retained.

The archived [EC2 worker runbook](ec2-worker-maintenance.md) must not be used as
current operating guidance.
