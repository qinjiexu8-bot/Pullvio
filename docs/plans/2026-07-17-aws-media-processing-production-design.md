# Pullvio AWS media processing and delivery plan

## Status

Accepted architecture. The AWS infrastructure baseline is provisioned; the
application control API, processing worker, and production rollout are pending.

Current operational details are maintained in the
[EC2 worker maintenance runbook](../runbooks/ec2-worker-maintenance.md).

### Implementation snapshot — 2026-07-17

Provisioned and verified:

- encrypted `c7g.large` EC2 host with Docker, FFmpeg, yt-dlp, SSM, and restricted
  direct SSH;
- SQS job queue and dead-letter queue;
- private S3 bucket with lifecycle cleanup and CloudFront Origin Access Control;
- signed-URL CloudFront distribution, TLS, and `media.pullvio.com`;
- worker IAM role, CloudWatch log group and alarms, and confirmed email alerts.

Not implemented:

- job-submission or job-status API;
- SQS producer and media-processing worker service;
- yt-dlp/FFmpeg job orchestration and S3 artifact upload;
- quota reservation, retries, cancellation, signed-URL issuance, or real-time UI
  states.

CloudFront currently remains on the Free plan. A flat-rate Pro upgrade is
deferred until measured traffic and cost justify it.

This document is the source of truth for the first production media backend. It
replaces the earlier assumption that Pullvio would launch with a paid Pro tier.
The initial product is free and ad-supported:

- Anonymous visitors receive five successful downloads per rolling 24 hours.
- Signed-in users receive unlimited normal use under a documented fair-use
  policy and technical abuse controls.
- Pullvio does not sell access to restricted, private, paywalled, or DRM-protected
  media.
- Advertising and partner placements must remain clearly separated from media
  and download controls.

The existing frontend still contains legacy Free/Pro copy and subscription data
structures. Those are transitional and must be retired or hidden before the
media backend is made publicly available.

## Requirements

### Functional

- Accept a supported public media URL and a requested output format.
- Validate eligibility, quota, source policy, duration, and size before a job is
  accepted.
- Queue jobs and process them asynchronously with `yt-dlp` and FFmpeg.
- Store completed output in a private S3 bucket.
- Return a short-lived CloudFront signed URL instead of proxying file bytes
  through Vercel.
- Record job status and usage in the existing Supabase account model.
- Keep anonymous usage without creating permanent account history.
- Remove temporary media automatically and support immediate takedown.
- Preserve localized job and error states in the web application.

### Non-functional

- **Control API latency:** under 500 ms at p95, excluding queued processing.
- **Initial availability target:** 99.5% for job submission and status lookup.
- **Initial delivery envelope:** up to 50 TB/month and 10 million CloudFront
  requests/month, matching the CloudFront Pro flat-rate baseline.
- **Initial file limits:** configurable; launch defaults are 2 hours of source
  duration, 2 GB of output, and two active jobs per signed-in user.
- **Recovery:** no accepted job should disappear silently; failed leases return
  to the queue or move to a dead-letter queue.
- **RTO:** four hours for the processing service.
- **Privacy:** source URLs, IP-derived abuse identifiers, and job metadata are
  retained only for operational, account-history, and legal needs.
- **Cost safety:** AWS budgets and anomaly alerts must be active before a public
  download is processed.

### Constraints

- Frontend remains on Vercel.
- Clerk remains the identity provider.
- Supabase remains the application database and RLS authorization boundary.
- AWS must be a global AWS account on the Paid account plan. A personal account
  is sufficient; a foreign legal entity is not required.
- Media processing must never run in Vercel Functions.
- No browser cookies, authenticated source sessions, DRM keys, paywall bypass,
  private media access, or arbitrary proxy behavior may be added.
- The service must be able to stop all new work immediately through a feature
  flag without requiring a frontend deployment.

## High-level architecture

```text
┌──────────────────────────────┐
│ Browser                      │
│ Next.js UI on Vercel         │
└──────────────┬───────────────┘
               │ metadata only
               ▼
┌──────────────────────────────┐       ┌───────────────────────────┐
│ Download control API         │◀─────▶│ Clerk + Supabase          │
│ validation, quota, job state │       │ identity, RLS, job records│
└──────────────┬───────────────┘       └───────────────────────────┘
               │ accepted job
               ▼
┌──────────────────────────────┐
│ Amazon SQS + dead-letter queue│
└──────────────┬───────────────┘
               │ worker lease
               ▼
┌──────────────────────────────┐
│ ECS service on EC2           │
│ yt-dlp + FFmpeg containers   │
└──────────────┬───────────────┘
               │ private upload
               ▼
┌──────────────────────────────┐
│ Private S3 Standard bucket   │
│ temporary immutable artifacts│
└──────────────┬───────────────┘
               │ Origin Access Control
               ▼
┌──────────────────────────────┐
│ CloudFront Pro distribution  │
│ WAF + signed URLs            │
└──────────────┬───────────────┘
               │ media bytes
               ▼
┌──────────────────────────────┐
│ Browser download             │
└──────────────────────────────┘
```

Vercel handles HTML, localization, authentication UI, job submission, and job
status. It never receives a completed media body. Media bytes travel from the
processor to S3 and from CloudFront to the user.

## Component design

### Global AWS account

- Use the global AWS service, not the separately operated Beijing or Ningxia
  regions.
- Select or upgrade to the AWS Paid account plan.
- A personal account has the same service functionality as a business account.
- Keep a valid payment method and complete identity and phone verification.
- Enable MFA on the root user, create administrative IAM access, and do not use
  root credentials for deployment.
- Do not create long-lived AWS access keys for humans when IAM Identity Center or
  short-lived credentials are available.

### Download control API

The first implementation may live in a Next.js Route Handler because the
operation is short and carries only JSON. Its responsibilities are limited to:

1. Verify the Clerk session when present.
2. Normalize and validate the submitted URL.
3. Enforce the supported-domain allowlist and block private or reserved network
   targets to prevent SSRF.
4. Atomically reserve anonymous or account usage in Supabase.
5. Create one `download_jobs` row.
6. Send a small job message to SQS.
7. Return a job identifier.

If Vercel function cost or latency becomes material, move this exact control
plane behind API Gateway and Lambda. That change must not alter the browser API
contract.

### Usage and abuse controls

Anonymous eligibility is based on a signed, HttpOnly browser identifier plus an
HMAC of coarse IP data. Raw IP addresses must not be used as permanent identity.
The reservation and completion counters must be atomic so concurrent requests
cannot exceed the allowance.

Launch defaults:

| Control | Anonymous | Signed in |
| --- | --- | --- |
| Successful downloads | 5 / rolling 24h | No displayed daily quota |
| Active jobs | 1 | 2 |
| Submission burst | 3 / 10 minutes | 10 / 10 minutes |
| CAPTCHA | On anomaly or limit boundary | On anomaly |
| History | None | Account history |
| Automation | Blocked | Blocked |

"Unlimited" means normal interactive use, not unmetered automation. Backend
guardrails can temporarily slow or block accounts exhibiting scripted behavior,
credential sharing, excessive output volume, or repeated failures. Changes to
these controls are configuration changes and must not require a release.

### SQS queue

- Use a standard queue with a separate dead-letter queue.
- Set the visibility timeout longer than the maximum expected job duration.
- Workers must extend visibility while actively processing.
- Messages contain identifiers and normalized options, never secrets or source
  account cookies.
- Job execution is idempotent: a retry updates the same job and artifact record.
- A job moves to the DLQ after a small, configurable retry count.

### ECS workers on EC2

Use ECS with the EC2 launch type for the first production version. This keeps
FFmpeg/yt-dlp in replaceable containers while retaining control over compute,
ephemeral disk, and network cost.

- One small On-Demand instance is the baseline worker.
- Add Spot instances only for queue bursts after interruption handling is tested.
- Auto Scaling follows queue age and queue depth, not CPU alone.
- Run containers as a non-root user with a read-only root filesystem.
- Provide a bounded scratch volume and delete work files after every terminal
  state.
- Pass process arguments as arrays; never interpolate user input into a shell
  command.
- Pin container and binary versions, scan images, and roll out updates gradually.
- Deny access to instance metadata from job containers except where strictly
  required.
- Restrict outbound destinations to supported sources and required AWS services
  where practical.

The initial region is `us-east-1`, keeping the worker and S3 bucket together and
placing the CloudFront ACM certificate in the required region. Source
reachability and throughput must be tested before final production activation;
the system must not attempt to bypass a source platform's technical controls.

### S3 artifacts

- Use S3 Standard because output is short-lived and frequently retrieved.
- Block all public access.
- Permit reads only through CloudFront Origin Access Control and trusted backend
  roles.
- Use unique, unguessable, immutable object keys.
- Enable default server-side encryption.
- Store a sanitized filename and safe `Content-Disposition` metadata.
- Delete artifacts shortly after completion or download; use a scheduled sweeper
  for the 2–6 hour target and an S3 lifecycle rule as the one-day safety net.
- Never retain source credentials, cookies, or DRM material with an artifact.

The private `download_artifacts` table stores only the internal object key,
expiry, size, checksum, and job relationship. Browsers never receive an S3 key
or AWS credential.

### CloudFront delivery

- Subscribe one dedicated media distribution to the CloudFront Pro flat-rate
  plan.
- Use `media.pullvio.com` as the delivery hostname.
- Use Origin Access Control with the private S3 bucket.
- Require signed URLs. The default validity is 30 minutes; an authenticated user
  may request a fresh URL while the artifact still exists.
- Enable byte-range downloads and verify resume behavior around URL expiry.
- Attach the plan-provided WAF and block known bots, abusive geographies when
  legally necessary, and requests without a valid signature.
- Keep transfer and request alerts at 50%, 80%, and 100% of the plan baseline.

The Pro baseline is 50 TB and 10 million requests per month. It is not a license
for sustained unlimited traffic. If usage remains above the baseline for several
months, compare a higher CloudFront plan with Cloudflare R2 and Bunny Volume CDN
before upgrading.

### Clerk and Supabase

- Clerk remains responsible for email/password, OAuth, verification, and session
  lifecycle.
- Supabase trusts Clerk tokens and applies RLS using the Clerk subject.
- Existing `profiles`, `download_jobs`, `download_artifacts`, and `usage_daily`
  tables remain the starting model.
- Subscription records are not required for the free launch. Keep them dormant
  until a later monetization decision, rather than allowing them to influence
  quota.
- Worker writes require a backend-only authorization path. No service-role key is
  exposed to the browser.

Before implementation, add or confirm database support for:

- atomic anonymous and authenticated usage reservation;
- worker leases and retry counts;
- artifact expiry and takedown state;
- idempotency keys;
- source-policy rejection reasons;
- aggregate bytes and processing seconds for unit-cost reporting.

## Security and legal controls

### Source eligibility

- Process only explicitly supported public sources.
- Do not accept arbitrary URLs as a generic proxy.
- Do not import cookies from users or browsers.
- Do not access private accounts, paid content, paywalls, DRM, geo-block bypass,
  or authentication-protected media.
- Re-resolve hostnames safely and reject loopback, link-local, private, metadata,
  and reserved IP ranges.
- Enforce maximum redirects, response size, duration, and processing time.

### Copyright and abuse response

- Keep Copyright, Acceptable Use, Contact, Privacy, and Terms pages public and
  linked from every locale.
- Provide a monitored takedown address and record response timestamps.
- Make it possible to block a URL, content identifier, source account, or domain
  without a deploy.
- Delete affected S3 objects immediately when a valid takedown is accepted.
- Preserve only the minimum evidence necessary to process a dispute.
- Treat disclaimers as communication, not as a substitute for technical controls.

### Advertising

- Do not place ads inside the media form, next to format selectors, beside the
  real download button, or on empty status/error pages.
- Monetize content-rich homepage, guide, blog, and FAQ areas.
- Mark direct sponsors and affiliate recommendations clearly.
- Obtain required consent through a Google-certified CMP for applicable EEA, UK,
  and Swiss traffic before personalized advertising.

## Observability and cost controls

Minimum dashboards and alerts:

- accepted, started, succeeded, failed, rejected, and timed-out jobs;
- queue depth, oldest message age, DLQ size, and retry count;
- processing duration, output bytes, scratch-disk pressure, and worker capacity;
- S3 object count, stored bytes, expiry lag, and delete failures;
- CloudFront requests, transfer, cache behavior, 4xx/5xx, and signature failures;
- unit cost per accepted and successful download;
- usage by source, output format, account state, and country at an aggregated
  privacy-safe level.

Create AWS Budget notifications at $20, $50, and $100 for the development phase.
Before opening public access, replace those values with separate monthly budgets
for compute, storage, delivery, and logging. Enable AWS Cost Anomaly Detection.

CloudFront's $15 fee does not include all EC2/ECS compute, all S3 storage, every
log query, or unrelated AWS resources. Cost reviews must use the complete AWS
bill, not only the CloudFront line item.

## Failure modes

| Failure | User impact | Mitigation |
| --- | --- | --- |
| Clerk unavailable | New login unavailable | Preserve anonymous allowance; do not weaken authentication |
| Supabase unavailable | Jobs cannot be reserved safely | Reject new work; never process without a durable job record |
| SQS delay | Longer wait | Show queued state; scale by oldest-message age |
| Worker crash | Job stalls temporarily | Visibility timeout, heartbeat, retry, DLQ |
| Source change/block | One source fails | Disable that source and show an honest localized error |
| S3 upload failure | No artifact | Retry bounded upload, clean scratch disk, fail job |
| CloudFront issue | Download unavailable | Allow signed origin fallback only as an explicit incident action |
| Cost anomaly/attack | Unexpected spend | WAF, rate limits, budgets, kill switch, queue drain |
| Copyright complaint | Legal and platform risk | Block, remove, audit, respond through takedown process |
| Deployment regression | Processing errors | Versioned images, canary worker, rapid rollback |

## Rollout plan

### Phase 0 — account and guardrails

- Create or upgrade a global AWS personal or business account to Paid plan.
- Enable root MFA, IAM administrative access, billing alerts, and cost anomaly
  detection.
- Confirm CloudFront Pro eligibility in the console before building around its
  pricing.
- Register `media.pullvio.com` but do not expose it publicly.

### Phase 1 — private end-to-end path

- Build SQS, DLQ, ECS-on-EC2 worker, private S3 bucket, and CloudFront OAC.
- Process a fixed set of test assets with known rights.
- Verify signed URL expiry, range requests, cleanup, retries, and DLQ behavior.
- Measure real compute seconds, temporary storage, and bytes per successful job.

### Phase 2 — application integration

- Add the control API and atomic quota reservation.
- Connect account history and usage to real job states.
- Remove legacy Pro promises from navigation, pricing, account, FAQ, and metadata.
- Replace the development modal with queued/processing/completed states.

### Phase 3 — limited production

- Enable the backend for staff and a small allowlist.
- Expand by feature flag while watching source failures, takedowns, spend, and
  queue age.
- Do not enable anonymous public jobs until the kill switch, CAPTCHA, and WAF
  paths have been exercised.

### Phase 4 — public free launch

- Enable five anonymous successful downloads per rolling day.
- Enable signed-in fair-use access and account history.
- Submit the content-rich site for advertising review only after real product
  behavior, legal pages, consent, and ad-placement rules are complete.

## Rollback and kill switch

The control API must read a server-side `MEDIA_PROCESSING_ENABLED` flag before
reserving usage. Turning it off must:

1. Reject new jobs with a localized maintenance response.
2. Allow active jobs to finish or be cancelled deliberately.
3. Stop worker scaling and drain the queue.
4. Leave account and audit records intact.
5. Continue serving the informational frontend.

Workers and infrastructure are rolled back by selecting the previous container
image and infrastructure revision. S3 objects remain private throughout rollback
and are removed by the normal expiry process.

## Production readiness checklist

- [ ] Global AWS account shows Paid account plan.
- [ ] Root MFA, IAM access, billing contacts, budgets, and anomaly alerts exist.
- [ ] CloudFront Pro plan can be selected for the intended distribution.
- [ ] Private S3 bucket, OAC, signed URLs, WAF, TLS, and custom domain are tested.
- [ ] SQS retry, heartbeat, cancellation, and DLQ recovery are tested.
- [ ] Workers run non-root with bounded disk, time, memory, and network access.
- [ ] URL allowlist, SSRF protection, command safety, and filename sanitization
      pass security tests.
- [ ] Anonymous quota is atomic and cannot be bypassed by concurrent requests.
- [ ] Signed-in normal use and abuse controls behave as documented.
- [ ] Copyright and takedown operations can remove and block content quickly.
- [ ] All legacy paid/Pro promises have been removed from public product copy.
- [ ] No ad resembles or crowds the real media or download controls.
- [ ] Logs contain no raw credentials, source cookies, or unnecessary personal
      data.
- [ ] Unit cost is measured from real test downloads before public rollout.
- [ ] Kill switch and rollback have been rehearsed.

## References

- [AWS Free and Paid account plans](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html)
- [AWS personal and business account types](https://docs.aws.amazon.com/hands-on/latest/setup-environment/module-one.html)
- [CloudFront flat-rate pricing plans](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/flat-rate-pricing-plan.html)
- [Amazon S3 pricing](https://aws.amazon.com/s3/pricing/)
- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- [Bunny CDN pricing](https://bunny.net/pricing/)
- [Google AdSense program policies](https://support.google.com/adsense/answer/48182)
