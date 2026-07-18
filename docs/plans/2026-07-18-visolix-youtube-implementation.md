# Visolix YouTube Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Route public YouTube jobs through Visolix with durable asynchronous polling, private Pullvio artifacts, adaptive Turnstile verification, and automatic 402 shutdown plus Feishu and client notifications.

**Architecture:** Keep the existing Vercel control API, Supabase job model, SQS queue, EC2 worker, private S3, and CloudFront delivery. Add a durable provider-run state machine so YouTube work can be submitted once and polled through delayed SQS messages, while other platforms retain the yt-dlp path. Validate Turnstile in Vercel before reservation and deliver provider alerts from the AWS worker through an outbox.

**Tech Stack:** Next.js 15, TypeScript, Vitest, Supabase Postgres/RPC, Python 3.12, unittest, requests, boto3, Amazon SQS/S3/Secrets Manager, Cloudflare Turnstile, Visolix REST API, Feishu custom bot.

---

### Task 1: Provider state, verification decisions, and alert outbox

**Files:**
- Create: `supabase/migrations/202607180009_add_visolix_provider_control.sql`
- Modify: `lib/database.types.ts`
- Modify: `.env.example`
- Test: migration invariants with local SQL review and TypeScript typecheck

**Steps:**

1. Write the migration with `media_provider_runs`, `media_alert_outbox`, and the required indexes, checks, grants, and RLS.
2. Extend runtime/platform configuration with YouTube human-verification thresholds and provider incident state without adding a daily spend cap.
3. Add RPCs to create/claim/update provider runs, evaluate verification requirements, disable YouTube on 402, enqueue one deduplicated incident, and mark alerts delivered or retryable.
4. Add `PROVIDER_BALANCE_EXHAUSTED` as a durable job failure code and preserve user quota compensation behavior.
5. Update generated database types manually to match the migration surface used by application code.
6. Run `npm run typecheck` and inspect the migration with `git diff --check`.
7. Commit the schema batch.

### Task 2: Queue schema v2 and provider polling messages

**Files:**
- Modify: `lib/media/queue-message.ts`
- Modify: `lib/media/queue-message.test.ts`
- Modify: `lib/media/queue.ts`
- Modify: `services/media-worker/pullvio_worker/domain.py`
- Modify: `services/media-worker/tests/test_domain.py`

**Steps:**

1. Write failing TypeScript and Python tests for `process` and `provider_poll` messages with schema version 2 while retaining safe version-1 compatibility.
2. Implement validated queue message actions and optional provider-run identifiers.
3. Add delayed SQS dispatch for provider polling with bounded delay values.
4. Run the focused Vitest and Python unittest suites.
5. Commit the queue-contract batch.

### Task 3: Visolix client and untrusted result download boundary

**Files:**
- Create: `services/media-worker/pullvio_worker/visolix.py`
- Create: `services/media-worker/tests/test_visolix.py`
- Modify: `services/media-worker/requirements.txt`
- Modify: `services/media-worker/.env.example`

**Steps:**

1. Write failing tests for format mapping, submit responses, progress responses, 401/402/429/5xx classification, timeouts, and secret redaction.
2. Implement a requests-based Visolix client with separate connect/read timeouts and no credential-bearing logs.
3. Write failing tests for result URL HTTPS enforcement, DNS/IP rejection, redirect revalidation, byte caps, content-type checks, and safe streaming to disk.
4. Implement the bounded downloader without shell interpolation or browser-visible provider identifiers.
5. Load the Visolix API key from an exact AWS Secrets Manager ARN supplied through configuration.
6. Run `python -m unittest discover -s services/media-worker/tests -v`.
7. Commit the provider-client batch.

### Task 4: Durable YouTube provider lifecycle in the media worker

**Files:**
- Modify: `services/media-worker/pullvio_worker/clients.py`
- Modify: `services/media-worker/pullvio_worker/worker.py`
- Modify: `services/media-worker/pullvio_worker/domain.py`
- Modify: `services/media-worker/tests/test_worker.py`
- Modify: `services/media-worker/compose.yaml`
- Modify: `services/media-worker/pullvio-media-worker.service`

**Steps:**

1. Write failing worker tests for a YouTube cache miss, persisted provider ID, delayed poll, restart resume, completion, partial derivative success, and terminal errors.
2. Route only YouTube through Visolix; retain yt-dlp for other platforms.
3. Submit once, persist the provider ID, delete the submission message, and enqueue a delayed poll.
4. Poll without occupying the worker; requeue in-progress runs and process completed URLs into the existing artifact pipeline.
5. Use ffprobe before FFmpeg MP3 extraction and retain a valid primary video if optional audio or cover generation fails.
6. On 402, invoke the atomic database shutdown RPC and create the deduplicated alert before deleting the SQS message.
7. Run worker tests and build the worker container.
8. Commit the lifecycle batch.

### Task 5: Canonical YouTube identity, quality selection, and friendly errors

**Files:**
- Modify: `lib/media/source-url.ts`
- Modify: `lib/media/source-url.test.ts`
- Modify: `lib/media/contracts.ts`
- Modify: `lib/media/contracts.test.ts`
- Modify: `app/components/media-studio.tsx`
- Modify: `app/globals.css`
- Modify: `app/api/media/jobs/route.ts`
- Modify: `lib/i18n.ts`

**Steps:**

1. Write failing tests that canonicalize watch, youtu.be, and Shorts URLs to one video identity and reject playlists or malformed IDs.
2. Replace `best` for YouTube with explicit 720p, 1080p, 1440p, and 2160p values; keep 1080p as default.
3. Add a responsive quality selector that is shown only for video-capable sources.
4. Add localized `HUMAN_VERIFICATION_REQUIRED`, `PROVIDER_BALANCE_EXHAUSTED`, provider unavailable, quality unavailable, and provider timeout messages.
5. Ensure the 402 client copy says YouTube is temporarily unavailable and asks the user to retry later without naming Visolix or exposing account balance.
6. Run Vitest, typecheck, lint, and a production build.
7. Commit the client-contract batch.

### Task 6: Adaptive Turnstile enforcement

**Files:**
- Create: `lib/media/turnstile.ts`
- Create: `lib/media/turnstile.test.ts`
- Modify: `lib/media/identity.ts`
- Modify: `lib/media/identity.test.ts`
- Modify: `lib/media/repository.ts`
- Modify: `lib/media/http.ts`
- Modify: `app/api/media/jobs/route.ts`
- Modify: `app/components/media-studio.tsx`
- Modify: `.env.example`
- Modify: `next.config.ts`

**Steps:**

1. Write failing tests for exact-IP daily HMAC identities, token length limits, Siteverify responses, hostname/action matching, and fail-closed behavior.
2. Add a risk-decision RPC call before quota reservation for YouTube submissions.
3. Return `HUMAN_VERIFICATION_REQUIRED` before creating a paid job when thresholds are crossed.
4. Render Turnstile only after the server requests it, validate the single-use token server-side, and grant a signed 30-minute verification cookie.
5. Add the minimum required CSP origins for the Turnstile widget and Siteverify call.
6. Run focused tests, lint, typecheck, and build.
7. Commit the Turnstile batch.

### Task 7: Feishu alert delivery and operational configuration

**Files:**
- Create: `services/media-worker/pullvio_worker/alerts.py`
- Create: `services/media-worker/tests/test_alerts.py`
- Modify: `services/media-worker/pullvio_worker/worker.py`
- Modify: `services/media-worker/pullvio_worker/clients.py`
- Modify: `services/media-worker/.env.example`
- Modify: `docs/runbooks/ec2-worker-maintenance.md`
- Create: `docs/runbooks/visolix-youtube-operations.md`

**Steps:**

1. Write failing tests for safe Feishu payloads, 402 deduplication, retry backoff, and recovery messages.
2. Load the webhook from an exact Secrets Manager ARN and send only redacted operational fields.
3. Drain alert outbox items independently from media completion so notification failure cannot corrupt a job.
4. Document secret names, least-privilege IAM, 402 shutdown, top-up, health check, re-enable, and recovery notification steps.
5. Run Python tests and inspect logs for secret leakage.
6. Commit the alert and runbook batch.

### Task 8: Public YouTube pages and full verification

**Files:**
- Modify: `lib/public-platforms.ts`
- Modify: `lib/public-platforms.test.ts`
- Modify: `lib/guides.tsx`
- Modify: `lib/localized-pages.tsx`
- Create/restore: YouTube downloader routes for default and localized pages
- Modify: `app/sitemap.ts`
- Modify: `services/media-worker/README.md`

**Steps:**

1. Keep public YouTube pages excluded until the backend smoke test passes.
2. Run all frontend tests, worker tests, lint, typecheck, production build, link checker, and container build.
3. Provision production secrets and Turnstile variables without printing their values.
4. Apply the Supabase migration and deploy the worker with the YouTube switch still disabled.
5. Execute authorized smoke tests for each quality, audio-only, cache reuse, restart resume, Turnstile, simulated 402, Feishu delivery, and client error copy.
6. Restore YouTube pages and sitemap only after the backend passes.
7. Enable the YouTube switch for all eligible users and verify production metrics.
8. Commit the release batch and prepare merge/deployment handoff.
