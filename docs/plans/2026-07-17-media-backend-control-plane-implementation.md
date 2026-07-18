# Pullvio media backend control-plane implementation plan

> Status: implementation started on 2026-07-17. This plan covers the first
> production slice: submission, quota reservation, SQS dispatch, job status,
> cancellation, and the browser state machine. The EC2 worker is the following
> slice and keeps the same API contract.

## Architecture decision

The public control API is same-origin on Vercel:

- `POST https://pullvio.com/api/media/jobs`
- `GET https://pullvio.com/api/media/jobs/{jobId}`
- `DELETE https://pullvio.com/api/media/jobs/{jobId}`

No `api.pullvio.com` DNS record is required. `media.pullvio.com` remains the
CloudFront hostname for completed file delivery. EC2 consumes SQS privately and
does not expose an HTTP service. If Vercel control-plane cost later becomes
material, the same JSON contract can move to API Gateway without changing the
browser.

Vercel will obtain short-lived AWS credentials through OIDC. Long-lived AWS
access keys must not be stored in Vercel. The producer IAM role can only call
`sqs:SendMessage` on `pullvio-media-jobs`.

## API contract

### Submit

`POST /api/media/jobs`

Request:

```json
{
  "sourceUrl": "https://www.youtube.com/watch?v=...",
  "mediaKind": "video",
  "format": "mp4",
  "quality": "best",
  "idempotencyKey": "browser-generated UUID"
}
```

Accepted response (`202`):

```json
{
  "job": {
    "id": "uuid",
    "status": "queued",
    "createdAt": "ISO-8601"
  },
  "quota": {
    "authenticated": false,
    "limit": 5,
    "remaining": 4
  }
}
```

Expected errors include `INVALID_URL`, `UNSUPPORTED_SOURCE`, `QUOTA_EXCEEDED`,
`ACTIVE_JOB_LIMIT`, `RATE_LIMITED`, `SERVICE_DISABLED`, and
`QUEUE_UNAVAILABLE`. Responses never expose internal database, SQS, S3, or
source errors.

### Status and cancellation

`GET /api/media/jobs/{jobId}` returns only a job owned by the current Clerk user
or anonymous browser identity. Terminal ready responses include a short-lived
download URL generated server-side. `DELETE` marks a queued or processing job
as cancellation requested; workers check that state before expensive work and
between processing stages.

## Data and concurrency

Extend `download_jobs` for both signed-in and anonymous ownership. Store only an
HMAC-derived anonymous subject, never a raw IP address. A signed HttpOnly cookie
contains a random browser identifier and the server derives the database key
with a backend-only secret.

An atomic `reserve_download_job` database function performs, in one short
transaction:

1. acquire a transaction advisory lock for the subject;
2. reject excessive burst or active-job count;
3. enforce five successful anonymous downloads in the rolling 24-hour window;
4. return an existing row for a repeated idempotency key;
5. insert the queued job and usage reservation.

Sending to SQS happens after the database transaction. If dispatch fails, the
API conditionally changes the row to `failed` with `QUEUE_UNAVAILABLE`. A
periodic reconciler will later redispatch old `queued` rows whose
`queue_message_sent_at` is null, closing the remaining process-crash window.

RLS continues to protect account reads through Clerk `sub`. Anonymous rows are
not readable through the Supabase public API; all anonymous access passes
through the same-origin Route Handlers. Backend-only worker functions are
revoked from `public`, `anon`, and `authenticated`.

## Security boundaries

- Accept HTTPS URLs only, with no embedded credentials or non-default port.
- Launch allowlist: YouTube and TikTok public page hosts only.
- Reject loopback, private, link-local, multicast, reserved, and AWS metadata
  addresses. The worker repeats validation after redirects.
- Never accept cookies, request headers, proxy targets, filenames, or shell
  fragments from the browser.
- Pass yt-dlp and FFmpeg arguments as arrays; run as a non-root user with strict
  duration, output-size, scratch-space, and wall-clock limits.
- Keep source URLs out of application logs. Log job IDs and normalized failure
  codes instead.
- Use `Cache-Control: no-store` on every job API response.

## Implementation tasks

### Task 1: Control-plane test harness

Files:

- Modify `package.json`
- Add `vitest.config.ts`
- Add `lib/media/*.test.ts`

Steps:

1. Add Vitest and the AWS SQS/OIDC packages.
2. Write failing tests for URL normalization, API body validation, anonymous
   identity signing, and safe public job serialization.
3. Run `npm test` and confirm the expected failures before implementation.

### Task 2: Database lifecycle and atomic quota

Files:

- Add `supabase/migrations/202607170001_create_media_job_control_plane.sql`
- Regenerate `lib/database.types.ts`

Steps:

1. Add anonymous ownership, idempotency, queue dispatch, retry, cancellation,
   lease, and safe artifact-delivery columns.
2. Add subject/status/time and idempotency indexes.
3. Create restricted atomic reservation and completion functions.
4. Add/adjust Clerk RLS policies and verify anonymous rows remain inaccessible.
5. Run `supabase db push --dry-run`, apply the migration, and regenerate types.

### Task 3: Server domain layer and SQS producer

Files:

- Add `lib/media/config.ts`
- Add `lib/media/source-url.ts`
- Add `lib/media/identity.ts`
- Add `lib/media/contracts.ts`
- Add `lib/media/repository.ts`
- Add `lib/media/queue.ts`

Steps:

1. Implement strict input parsing without accepting unknown operational fields.
2. Derive signed-in identity from Clerk or a signed anonymous cookie.
3. Call the atomic database function through a backend Supabase client.
4. Send only job ID and schema version to SQS with OIDC-derived credentials.
5. Implement conditional failure compensation and safe response mapping.

### Task 4: Route Handlers

Files:

- Add `app/api/media/jobs/route.ts`
- Add `app/api/media/jobs/[jobId]/route.ts`

Steps:

1. Implement `POST` submission and anonymous cookie issuance.
2. Implement owner-scoped `GET` status lookup.
3. Implement idempotent `DELETE` cancellation.
4. Add request-size, content-type, origin, and no-store controls.
5. Test unauthenticated, authenticated, invalid, duplicate, limited, queue-failure,
   and ownership-mismatch paths.

### Task 5: Vercel-to-AWS production trust

Infrastructure:

- Create a Vercel OIDC provider/trust relationship in AWS.
- Create `PullvioVercelSqsProducerRole` with only `sqs:SendMessage` for the job
  queue.
- Configure `AWS_ROLE_ARN`, `AWS_REGION`, and `PULLVIO_SQS_QUEUE_URL` in Vercel.
- Configure `PULLVIO_ANONYMOUS_SECRET`, backend Supabase credentials, and the
  media kill switch as encrypted Vercel environment variables.

Verification:

1. Deploy Preview and confirm its trust policy cannot assume the Production
   role unless explicitly allowed.
2. Submit one synthetic job and verify exactly one SQS message.
3. Confirm no static AWS key exists in Vercel or the repository.

### Task 6: EC2 worker

Files:

- Add `services/media-worker/` with a pinned Docker image, Python worker,
  tests, health command, and systemd/ECS deployment artifacts.

Steps:

1. Long-poll SQS, claim the database row idempotently, and extend visibility.
2. Validate source again, run metadata probing, then yt-dlp/FFmpeg with limits.
3. Upload to private S3 and upsert the artifact record.
4. Mark success/failure, update counters, clean scratch files, and delete the
   SQS message only after a durable terminal state.
5. Implement bounded retry, DLQ observability, cancellation checks, and graceful
   shutdown.

### Task 7: Browser state machine

Files:

- Modify `app/components/media-studio.tsx`
- Modify the relevant global stylesheet and localized copy.

Steps:

1. Replace the waitlist modal with `idle`, `submitting`, `queued`, `processing`,
   `ready`, `failed`, and `canceled` states.
2. Poll with capped exponential backoff and stop in hidden tabs.
3. Preserve localized errors and accessible live-region announcements.
4. Provide cancel, retry, sign-in, and real CloudFront download actions.
5. Verify desktop/mobile layout and keyboard behavior.

## Release gates

- Unit, type, lint, build, and link checks pass.
- Supabase migration dry-run and production application succeed.
- IAM Access Analyzer shows no unintended producer or worker privileges.
- Unsigned CloudFront requests remain `403`; signed test download remains `200`.
- EC2 security groups expose only the documented restricted SSH rule, not HTTP.
- Kill switch rejects new work without affecting status/download access.
- One end-to-end authorized test completes from browser to CloudFront and all
  temporary files are deleted on schedule.

## Implementation status — 2026-07-17

Implemented and deployed:

- same-origin Vercel job submit, status, cancel, and signed-download APIs;
- anonymous five-success rolling quota and authenticated normal-unlimited use
  with active-job, burst, network, and idempotency controls;
- Supabase reservation and worker lifecycle RPCs;
- SQS producer, queue, DLQ, EC2 consumer, retries, cancellation, leases, and
  heartbeats;
- yt-dlp, FFmpeg, Deno, and matching EJS support in a non-root read-only worker;
- private AES-256 S3 upload and short-lived CloudFront signed URLs;
- localized frontend queue, processing, ready, failed, cancel, and retry states.

Verified in production:

- kill switch returns `503 SERVICE_DISABLED` and does not enqueue work;
- job submission reaches SQS and transitions through queued/processing states;
- generated authorized test media completed through FFmpeg, private S3,
  Supabase, the Vercel signer, and CloudFront;
- signed delivery returned `200` with an exact byte count, while unsigned
  CloudFront and direct S3 requests returned `403`;
- test job and object were deleted, SQS is empty, and the worker is healthy.

Remaining activation gate:

- YouTube challenges the AWS public IP with `LOGIN_REQUIRED` even after Deno and
  EJS installation. Select a policy-compliant dedicated egress strategy and run
  an authorized yt-dlp source test before enabling `accepting_jobs`.

## Source egress validation phase — 2026-07-17

Production processing remains disabled throughout this phase.

### Task 8: PO Token provider and conservative pacing — complete

- Pin the BgUtils provider plugin and its isolated sidecar version.
- Use the yt-dlp-recommended `mweb` client for YouTube requests.
- Add per-request sleeps and a minimum gap between source jobs.
- Classify bot challenges and HTTP 429 responses as non-immediate-retry
  failures so the worker does not amplify a block.
- Keep the provider on the private Compose network with no published port.

Verification: unit tests cover argument construction, source isolation,
failure classification, and the worker pacing gate; verbose yt-dlp output must
show the external BgUtils provider.

Result: the pinned `bgutil-ytdlp-pot-provider` plugin and Deno sidecar are live.
Verbose yt-dlp output reports `bgutil:http-1.3.1 (external)`. The provider has
no host-published port, runs read-only without Linux capabilities, and is
blocked from the EC2 instance metadata range.

### Task 9: Worker deployment and isolated verification — complete

- Deploy the pinned worker and provider sidecar to the existing EC2 host.
- Verify container hardening, provider discovery, health, logs, and an empty
  queue while the production kill switch remains off.
- Run only a small authorized test workload; do not add browser cookies or
  account credentials.

Result: both containers are healthy on the existing EC2 host, the queue is
empty, the production kill switch remains off, and the authorized metadata
probe exercised the provider without storing cookies or source credentials.

### Task 10: Clean egress experiment — complete; activation gate still closed

- Associate one fresh Elastic IP only after the new worker is ready.
- Retain the previous EIP temporarily for rollback, then release whichever
  address is no longer needed after verification.
- Stop the experiment if the clean address is immediately challenged; do not
  rotate through additional addresses.
- Open public processing only after an explicit release decision based on the
  recorded success rate and source-policy review.

Result: one fresh Elastic IP (`54.167.31.14`) was associated with the existing
worker and used for exactly one authorized YouTube metadata probe. The fresh
address immediately received the same `LOGIN_REQUIRED` response. This points
to rejection of the AWS data-center network class rather than a single stale
address. No further addresses were rotated. The instance was rolled back to
its original Elastic IP (`3.212.192.122`), the test address was released, and
SSH, both containers, the private provider network, and metadata blocking were
re-verified. Public processing remains disabled until a policy-compliant
source egress path passes an end-to-end test.
