# Visolix YouTube provider integration design

## Status

Validated and accepted on 2026-07-18. This document describes the production
design. It does not authorize enabling YouTube before the implementation,
secret provisioning, migrations, and smoke tests are complete.

## Decisions

- Route YouTube jobs to Visolix while existing verified platforms continue to
  use the local yt-dlp/FFmpeg path.
- Launch the integration for all eligible users after a production smoke test;
  do not restrict general availability to test accounts.
- Default YouTube video output to 1080p and offer 720p, 1440p, and 2160p.
- Do not automatically submit a second paid request when a requested quality is
  unavailable.
- Derive MP3 and a cover from a completed video whenever possible.
- Keep a dedicated YouTube runtime switch, but do not enforce a daily provider
  spend cap.
- Require Cloudflare Turnstile when a device or network repeatedly submits
  YouTube jobs.
- Disable YouTube and notify the operations Feishu group when Visolix returns
  HTTP 402.
- Reuse matching unexpired artifacts globally before calling Visolix.

## Requirements

### Functional

- Accept a single public YouTube video, Short, or supported share URL.
- Canonicalize all supported URL forms to one YouTube video identity.
- Reuse an existing artifact across users without exposing its original owner.
- Submit cache misses to Visolix and persist the external task identifier.
- Poll Visolix asynchronously without occupying the media worker while the
  external job is still processing.
- Copy completed output into the private Pullvio S3 bucket.
- Produce video, audio, and cover artifacts where the source permits it.
- Expose short-lived CloudFront URLs on the result view and account history.
- Retain artifacts for 24 hours and show the actual expiry to the requester.
- Enforce guest quota, active-job limits, burst limits, and adaptive human
  verification before a paid provider request is made.
- Turn off only YouTube on provider balance exhaustion; other platforms must
  continue operating.

### Non-functional

- Provider submission must be at-most-once per Pullvio provider run wherever
  the external API contract permits.
- A worker restart must resume polling an existing Visolix task instead of
  submitting and charging for a replacement task.
- The Visolix API key, Turnstile secret, and Feishu webhook must never enter
  source control, SQS messages, browser responses, or ordinary database fields.
- Provider failures must produce localized, non-sensitive user errors.
- Cache hits must not call Visolix and must continue to count toward applicable
  Pullvio quotas.
- Provider polling and alert delivery must be observable and independently
  retryable.

## Architecture

```text
Browser / account history
        |
        v
Next.js media API on Vercel
  - Clerk identity
  - signed device cookie
  - hashed network signal
  - Turnstile enforcement
  - quota and job reservation
        |
        +---- global cache hit ----> CloudFront signed artifact URLs
        |
        v
Amazon SQS
        |
        v
EC2 media worker
  - YouTube -> Visolix provider adapter
  - other platforms -> yt-dlp adapter
        |
        +---- provider poll messages ----> SQS
        |
        v
validated temporary download
  -> ffprobe
  -> FFmpeg MP3 derivative
  -> cover normalization
        |
        v
private S3 -> CloudFront -> browser
```

Vercel handles only control-plane JSON. The Visolix API key and downloaded media
remain on the EC2 worker. Completed media never passes through a Vercel function.

## Provider routing and job lifecycle

Introduce a provider boundary in the Python worker. The YouTube adapter exposes
submit, inspect-progress, and fetch-result operations. The current yt-dlp path
remains the adapter for locally supported sources.

The lifecycle is:

1. The API validates and canonicalizes the source URL.
2. Postgres reserves quota, evaluates human-verification requirements, and
   creates an owner-scoped `download_jobs` row.
3. The API tries global artifact reuse before dispatching SQS.
4. The worker creates a durable provider-run row and submits one Visolix request.
5. It stores the returned provider task ID immediately, schedules a delayed
   progress message, and releases the worker.
6. Progress messages poll the same task ID. In-progress responses schedule the
   next check; terminal responses enter artifact processing or failure handling.
7. The worker validates and downloads the provider URL, generates optional
   derivatives, uploads artifacts, and commits the Pullvio job.

The provider ID is never exposed through the Pullvio browser API. If a worker
loses the response after an external submission but before persisting the ID,
the run enters an ambiguous terminal state instead of automatically resubmitting
and risking a duplicate charge.

## Data model

Add `media_provider_runs` with at least:

- `id`, `job_id`, `provider`, and `operation`;
- `provider_job_id` stored as restricted operational data;
- requested platform, media kind, and provider format;
- `created`, `submitting`, `processing`, `completed`, `failed`, and `ambiguous`
  states;
- submit count, poll count, last poll time, next poll time, and terminal time;
- normalized provider error code and HTTP status;
- estimated billable cost and whether it was counted;
- timestamps and a version for optimistic state transitions.

Only the service role and worker may read this table. Client-facing queries use
the existing owner-scoped `download_jobs` and `download_artifacts` records.

Add provider alert state or an outbox table so balance notifications are durable
and deduplicated. Alert delivery must not be part of the transaction that marks
a media job failed.

## YouTube canonical identity and caching

Extract and validate the video ID from supported `watch`, `youtu.be`, and
`shorts` URLs. Remove tracking and playlist parameters. Reject playlists,
channels, searches, private URLs, credentials, non-HTTPS input, and unknown
hosts.

Use the logical cache identity:

```text
youtube:{video_id}:{media_kind}:{quality}
```

A video job may satisfy a later audio request when its MP3 derivative is still
available. Cache reuse remains global while every requester receives a distinct
owner-scoped job row and fresh signed delivery URLs.

Do not promise a new 24-hour period from an artifact that is close to expiry.
Reuse directly when at least 30 minutes remain. For a valid artifact with less
than 30 minutes remaining, use an S3 server-side copy with a new immutable key
and expiry rather than calling Visolix again.

## Output policy

Map Pullvio quality to Visolix format as follows:

| Pullvio | Visolix |
| --- | --- |
| 720p | `720` |
| 1080p, default | `1080` |
| 1440p | `1440` |
| 2160p | `2160` |

Do not send the current internal `best` value to Visolix. A missing requested
quality returns a user-facing availability error and does not trigger another
paid request automatically.

For video jobs, inspect the completed MP4 with ffprobe. When an audio stream is
present, derive an MP3 with FFmpeg. Normalize a provider thumbnail when supplied;
otherwise use a validated YouTube thumbnail source. Optional derivative failure
must not discard a valid primary video.

For an audio-only request, first reuse any existing audio derivative. On a cache
miss, request MP3 directly from Visolix rather than downloading a full video only
to discard its video stream.

## Adaptive Turnstile enforcement

Keep the current signed anonymous device cookie and add a daily rotating HMAC of
the exact client IP for short-lived abuse evaluation. Never store the raw IP or
use invasive browser fingerprinting.

Initial challenge thresholds:

- the third YouTube submission from one device within 10 minutes;
- eight YouTube submissions from one IP within 10 minutes;
- an anomalous number of new device cookies behind one IP;
- existing account, device, or network abuse signals.

When a challenge is required, the job API returns
`HUMAN_VERIFICATION_REQUIRED` without reserving quota or dispatching work. The UI
renders Turnstile and resubmits with its token. The server validates the token
with Siteverify, including the expected hostname and action. A successful check
grants a signed 30-minute verification state; quotas and hard burst limits still
apply.

Turnstile tokens are single-use and expire after five minutes. Development and
production use separate widgets and secrets.

## HTTP 402 and operations alerts

On a Visolix HTTP 402 response:

1. Atomically set the YouTube source switch to disabled.
2. Mark the affected job with `PROVIDER_BALANCE_EXHAUSTED`.
3. Stop dispatching new YouTube jobs while leaving other platforms enabled.
4. Insert one deduplicated balance-exhaustion alert into the outbox.
5. Deliver the alert to the configured Feishu custom-bot webhook.

The message contains environment, provider, time, HTTP status, switch state,
and an internal trace ID. It excludes media URLs, account emails, API keys,
webhook credentials, and raw provider responses. Repeated 402 responses do not
send repeated incident alerts.

No daily spend cap is imposed. Maintain an estimated successful-call ledger and
send informational alerts at 80% and 95% of the known funded amount without
automatically disabling service. After a top-up, an operator re-enables YouTube,
runs one health check, and sends a recovery notification on success.

## Security

Store production secrets separately in AWS Secrets Manager:

- Visolix API key;
- Turnstile server secret;
- Feishu bot webhook.

The browser receives only the Turnstile site key. Limit the EC2 instance role to
`secretsmanager:GetSecretValue` on the exact required ARNs. Redact provider
headers, credentials, source query strings, and provider IDs from logs.

Treat the provider download URL as untrusted input. Require HTTPS, resolve DNS,
reject private, loopback, link-local, metadata, and reserved addresses, repeat
the checks on every redirect, set connection and total timeouts, cap bytes, and
validate content type plus file signatures before FFmpeg or S3 upload. Narrow to
observed provider CDN hostnames after the smoke test where practical.

Continue to reject private, paid, DRM-protected, age-gated, authenticated, live,
and playlist content. The acceptable-use, copyright, takedown, and repeat-abuse
processes remain mandatory.

## Failure handling

| Failure | Handling |
| --- | --- |
| Visolix 402 | Disable YouTube, fail job, deduplicated Feishu incident |
| Visolix 401 | Disable provider integration and alert; never expose credential details |
| Provider 429 | Respect retry timing, keep the same provider run, apply backoff |
| Provider 5xx/timeout | Retry polling or submission only when it cannot duplicate a charge |
| Worker restart | Resume the persisted provider run |
| Download URL invalid or unsafe | Fail securely before fetching media |
| Requested quality unavailable | Fail without automatic paid fallback |
| MP3 or cover generation fails | Preserve valid primary video and record partial artifacts |
| S3 upload fails | Retry the same provider result while its URL remains valid |
| Feishu delivery fails | Retry the alert outbox independently |

Consecutive provider failures should open a short cooldown circuit breaker to
avoid a queue storm. This operational breaker is separate from the persistent
YouTube source switch and the rejected daily spend cap.

## Observability

Record structured metrics without sensitive URLs:

- cache hit and miss count;
- provider submissions, completions, failures, and estimated cost;
- submit-to-ready p50, p95, and p99;
- progress poll count and age;
- result download, FFmpeg, S3 upload, and signing duration;
- Turnstile challenges, passes, failures, and bypass attempts;
- 401, 402, 429, and 5xx counts;
- YouTube switch state and Feishu alert delivery state.

## Rollout and validation

Before enabling the public switch, use authorized public test media to verify:

- every supported URL form and canonical cache identity;
- 720p, 1080p, 1440p, 2160p, and audio-only behavior;
- absence of automatic second billing on an unavailable format;
- video audio-stream presence, MP3 extraction, and cover fallback;
- provider task resumption after a worker restart;
- provider result URL lifetime, redirects, CDN hosts, and file limits;
- global cache reuse across distinct users;
- Turnstile challenge, token replay rejection, and direct API bypass rejection;
- simulated 402 switch shutdown, deduplicated alert, and recovery workflow;
- personal-center delivery and exact 24-hour expiry copy.

After smoke tests pass, enable the YouTube switch for all eligible production
users. Keep the independent switch as the immediate rollback path.

## External policy risk

The provider integration does not grant rights to download source content.
Pullvio must continue to state that users may process only content they own or
are authorized to use. Ads must not resemble download controls, and the team
must review Google Publisher and YouTube policy implications before placing ads
on YouTube download-result surfaces.

## References

- [Visolix REST API](https://developers.visolix.com/rest-api)
- [Cloudflare Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [YouTube Terms of Service](https://au.youtube.com/t/terms)
- [Google AdSense policy violations](https://support.google.com/adsense/answer/2660562?hl=en)
- [ADR-0001](../adr/0001-use-aws-media-processing-and-delivery.md)
- [ADR-0002](../adr/0002-use-multi-asset-media-jobs.md)
- [ADR-0003](../adr/0003-reuse-unexpired-media-artifacts.md)
