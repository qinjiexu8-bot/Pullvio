# Pullvio media backend and YouTube blocker handoff

**Prepared:** 2026-07-18  
**Repository:** `qinjiexu8-bot/Pullvio`  
**Status:** backend implemented and deployed; public media processing explicitly enabled on 2026-07-18
**Primary blocker:** YouTube rejects the current AWS data-center egress before media processing begins

## 1. Executive summary

Pullvio is a browser-based media tool. The frontend is hosted on Vercel, Clerk
provides authentication, Supabase stores account and job state, and AWS provides
the processing and delivery path.

The asynchronous backend is implemented:

- same-origin job submission, status, cancellation, and signed-download APIs;
- anonymous and signed-in quota controls;
- SQS queue and dead-letter queue;
- an EC2 Docker worker running yt-dlp and FFmpeg;
- private S3 artifacts and short-lived CloudFront signed URLs;
- localized frontend states for queued, processing, ready, failed, and canceled
  jobs;
- operational logging, alarms, cancellation, leases, retries, and a database
  kill switch.

TikTok public-link extraction works from the current EC2 network. YouTube does
not. YouTube returns `LOGIN_REQUIRED` / `Sign in to confirm you are not a bot`
for the existing AWS Elastic IP, a newly allocated Elastic IP, the recommended
`mweb + PO Token` configuration, and three alternative player clients.

The user explicitly enabled `media_runtime_config.accepting_jobs` after an
authorized Vimeo end-to-end test succeeded. The independent production switch
`media_platform_config.youtube.accepting_jobs` is now `false`, so YouTube is
rejected before a job or queue message is created while the other reviewed
platforms remain enabled. The recommended long-term design remains a separate
YouTube worker with an accepted ISP egress.

## 2. Current architecture

```text
Browser
  |
  | JSON only
  v
Next.js API on Vercel ---- Clerk + Supabase
  |
  | job ID only
  v
Amazon SQS + DLQ
  |
  v
EC2 media worker
  |-- yt-dlp
  |-- FFmpeg
  `-- BgUtils PO Token sidecar
  |
  v
Private S3 bucket
  |
  v
CloudFront OAC + signed URL
  |
  v
Browser download
```

EC2 has no public application API. The public API is same-origin on Vercel:

- `POST https://pullvio.com/api/media/jobs`
- `GET https://pullvio.com/api/media/jobs/{jobId}`
- `DELETE https://pullvio.com/api/media/jobs/{jobId}`

Completed files are delivered through `https://media.pullvio.com`. Media bytes
do not pass through Vercel.

## 3. AWS resources

| Resource | Current value |
| --- | --- |
| Region | `us-east-1` |
| EC2 instance | `i-0e0fe842a01633b73` |
| Instance type | `c7g.large` / ARM64 |
| Elastic IP | `3.212.192.122` |
| Security group | `sg-0f1cc5ccd45ab4c14` / `pullvio-worker-sg` |
| SQS queue | `pullvio-media-jobs` |
| SQS DLQ | `pullvio-media-jobs-dlq` |
| S3 bucket | `pullvio` |
| CloudFront distribution | `E3TZ7LPQNNJJDM` |
| Delivery hostname | `media.pullvio.com` |
| CloudWatch log group | `/pullvio/worker` |
| SNS topic | `pullvio-infrastructure-alerts` |
| Worker source | `/opt/pullvio/media-worker` |
| Worker systemd unit | `pullvio-media-worker` |

CloudFront remains on the Free plan. S3 Block Public Access is enabled. Direct
S3 requests and unsigned CloudFront requests have been verified to return
`403`; signed CloudFront delivery has been verified to return `200`.

## 4. Security and secret handling

No credential values belong in this document, the repository, shell history,
issue trackers, or chat transcripts.

- AWS credentials are obtained from the EC2 instance profile.
- The worker reads its Supabase backend credential from AWS Secrets Manager at
  `pullvio/supabase/worker`.
- Vercel sends SQS messages by assuming a narrowly scoped AWS role through OIDC.
- The SSH private key is distributed separately and must remain outside the
  repository.
- SSH password authentication and root login are disabled.
- Port 22 is restricted to an administrator `/32`; do not open it to
  `0.0.0.0/0`.
- EC2 exposes no HTTP application port.
- The PO Token provider publishes no host port and has no AWS, Clerk, Supabase,
  source-account, or browser-cookie credential.
- An iptables `DOCKER-USER` rule blocks the provider from
  `169.254.0.0/16`, including EC2 instance metadata.
- Worker and provider containers are non-root/read-only, drop Linux
  capabilities, and use `no-new-privileges`.

Access needed by a new maintainer should be granted separately and minimally:

1. GitHub repository access;
2. AWS console/IAM access appropriate to EC2, SQS, S3, CloudFront, CloudWatch,
   Secrets Manager, and networking;
3. the SSH private key through a secure secret-sharing channel;
4. Vercel project access;
5. Supabase project access or a scoped CLI token;
6. Clerk project access only if authentication changes are required.

## 5. Implemented application behavior

### Capability versus product support

An extractor being present in yt-dlp does not mean the platform is supported by
Pullvio. The current distinction is:

| Platform | Extractor in deployed yt-dlp | Pullvio allowlist/integration | EC2 result | Public UI |
| --- | --- | --- | --- | --- |
| TikTok | yes | yes | public example parsed successfully | enabled; monitor success rate |
| YouTube | yes | yes | rejected by YouTube on AWS egress | disabled |
| Bilibili / BiliIntl | yes | no | HTTP 412 from US AWS egress | disabled |
| Douyin | yes | no | requires fresh cookies; rejected by current security model | disabled |
| Vimeo | yes | yes | CC BY single video completed end to end | enabled |
| Instagram | yes; some sub-extractors currently broken | no | not tested | disabled |
| Facebook | yes | no | not tested | disabled |
| X / Twitter | yes | no | official samples failed at platform endpoints | disabled |
| SoundCloud | yes | yes, audio only | CC BY single track parsed successfully | enabled, audio only |
| Reddit | yes | no | requires account cookies | disabled |

Strict product status: YouTube, TikTok, Vimeo, and SoundCloud are integrated in
backend code. Vimeo has passed an authorized end-to-end download; TikTok and
SoundCloud have passed EC2 metadata probes. The global gate is open, but the
independent YouTube platform gate is closed because AWS egress remains blocked.
Bilibili, Douyin, Reddit, and X/Twitter remain disabled.

### Bilibili and Douyin probe results

On 2026-07-18, with the global production gate still disabled, one metadata-only
probe was run for each platform. No Pullvio job was created, no media was
downloaded, and nothing was written to S3.

- Bilibili: yt-dlp selected its `BiliBili` extractor, but the public test page
  returned `HTTP Error 412: Precondition Failed` from the current US AWS egress.
- Douyin: yt-dlp selected its `Douyin` extractor, but required fresh cookies.
  Pullvio does not accept user browser cookies, authenticated source-site
  cookies, or third-party account credentials.

Neither platform was added to the API or worker allowlist. They must not be
advertised as supported until they pass metadata and authorized end-to-end tests
under the current security model.

### Supported hosts in the current application allowlist

The application and worker both enforce the same explicit allowlist:

- YouTube: `youtube.com`, `www.youtube.com`, `m.youtube.com`,
  `music.youtube.com`, `youtu.be`;
- TikTok: `tiktok.com`, `www.tiktok.com`, `m.tiktok.com`, `vm.tiktok.com`,
  `vt.tiktok.com`;
- Vimeo single videos: `vimeo.com`, `www.vimeo.com`, `player.vimeo.com`;
- SoundCloud single tracks, audio only: `soundcloud.com`,
  `www.soundcloud.com`, `m.soundcloud.com`, `on.soundcloud.com`.

All other hosts are rejected before queueing. Vimeo collections and SoundCloud
profiles/playlists are also rejected. HTTPS is required. Embedded credentials,
custom ports, private/reserved targets, and untrusted redirect targets are
rejected.

### Vimeo, SoundCloud, Reddit, and X/Twitter probes

On 2026-07-18, metadata-only probes produced these results without creating jobs
or writing to S3:

- Vimeo: a CC BY single video parsed at 1080p and was added as a single-video source;
- SoundCloud: a CC BY single track parsed and was added as an audio-only source;
- Reddit: public post extraction required account cookies, so it remains disabled;
- X/Twitter: official public samples failed at platform endpoints, so it remains disabled.

The database platform constraint, Vercel API, and EC2 Worker image
`pullvio/media-worker:2026-07-18` are deployed. The production job gate is open.
The first Vimeo end-to-end test exposed and fixed a subprocess pipe deadlock:
the Worker now drains large stdout/stderr streams while retaining heartbeat,
cancellation, and timeout checks. The successful 720p result was 16,249,144
bytes, CloudFront returned `200 video/mp4`, and direct S3 access returned `403`.

### Quotas and concurrency

- anonymous users: five successful downloads per rolling 24 hours;
- signed-in users: normal unlimited interactive use under fair-use and abuse
  controls;
- anonymous active jobs: one;
- signed-in active jobs: two;
- idempotency keys prevent duplicate job creation;
- submission bursts and repeated failures are rate limited.

### Kill switch

The production database setting `media_runtime_config.accepting_jobs` is
currently enabled by explicit user decision. Set it to `false` for an emergency
stop; valid submissions will then return:

```json
{
  "error": {
    "code": "SERVICE_DISABLED",
    "message": "Media processing is not accepting new jobs yet."
  }
}
```

Expected HTTP status: `503`. Do not change this setting merely to test the UI;
use an isolated test path and an authorized source instead.

## 6. What has been verified

### General backend

- Vercel submission reaches SQS when the gate is deliberately opened for an
  isolated test.
- The worker claims, heartbeats, completes, retries, cancels, and safely
  finalizes jobs.
- A generated test artifact completed through FFmpeg, S3, Supabase, Vercel
  signing, CloudFront, and browser delivery.
- Test objects and rows were removed after validation.
- SQS visible and in-flight counts returned to zero.
- Worker and provider containers are healthy.
- Provider discovery appears in verbose yt-dlp output as
  `bgutil:http-1.3.1 (external)`.
- Python worker tests, frontend tests, TypeScript, ESLint, and the Next.js
  production build pass.

### TikTok

On 2026-07-18, the current EC2 worker successfully parsed TikTok's public
developer-documentation example URL:

```text
https://www.tiktok.com/@scout2015/video/6718335390845095173
```

yt-dlp returned valid MP4 formats with audio, including 720x1280 media. The
worker's production format selector also completed a simulation successfully.
This confirms that the present EC2 network can reach and parse at least a
standard public TikTok video. It does not replace a final authorized
browser-to-S3-to-CloudFront TikTok test before public activation.

### YouTube failure matrix

The authorized public test URL used for metadata probes was Blender's Big Buck
Bunny video:

```text
https://www.youtube.com/watch?v=aqz-KE-bpKQ
```

| Test | Result |
| --- | --- |
| Original EC2 Elastic IP `3.212.192.122` | `LOGIN_REQUIRED` |
| Fresh Elastic IP `54.167.31.14` | same immediate `LOGIN_REQUIRED` |
| yt-dlp + Deno + current EJS | `LOGIN_REQUIRED` |
| `mweb` + BgUtils GVS PO Token provider | `LOGIN_REQUIRED` |
| `web_safari` client | `LOGIN_REQUIRED` |
| `web_embedded` client | `LOGIN_REQUIRED` |
| `android_vr` client | `LOGIN_REQUIRED` |

The fresh Elastic IP was used for one low-frequency metadata probe, rolled back,
and released. Do not repeat Elastic IP rotation. The evidence points to YouTube
rejecting the AWS data-center network class/ASN, not a single stale IP or one
broken player client.

## 7. Open-source and competitor findings

### yt-dlp

The current yt-dlp recommendation is `mweb` with a PO Token Provider for GVS
requests. Pullvio already implements that recommendation. PO Tokens improve
attestation but do not restore an IP already rejected by YouTube.

Reference: <https://github.com/yt-dlp/yt-dlp/wiki/PO-Token-Guide>

### BgUtils provider

The pinned BgUtils plugin/provider is correctly discovered and generates
tokens. Its maintainers explicitly do not promise that it will bypass an IP
block. It did not change the result from either tested AWS Elastic IP.

Reference: <https://github.com/Brainicism/bgutil-ytdlp-pot-provider>

### WPC provider

`yt-dlp-getpot-wpc` is the one remaining code-only experiment worth evaluating.
It launches Chromium and uses YouTube's WebPoClient to mint both GVS and Player
PO Tokens. It is experimental and still uses the same network egress, so it may
fail on an ASN-level block. It must be tested in an isolated image before any
production integration.

Reference: <https://github.com/coletdjnz/yt-dlp-getpot-wpc>

### Cobalt

Cobalt uses YouTube.js, an optional session generator, cookies, standard
HTTP/HTTPS proxy variables, and an optional IPv6 `FREEBIND_CIDR` pool. These
features confirm that its reliability also depends on valid sessions and
accepted egress, not a secret parsing algorithm. At the time of this handoff,
the official Cobalt API service list did not advertise YouTube even though the
repository contains YouTube support.

References:

- <https://github.com/imputnet/cobalt/blob/main/docs/api-env-variables.md>
- <https://api.cobalt.tools/>

Do not call the public Cobalt API from Pullvio without explicit permission; the
Cobalt documentation says hosted instances are not intended as third-party
application backends.

### Invidious and Piped

Both projects report the same data-center/VPN IP rejection. Invidious recommends
running its Companion through a different accepted proxy when the host is
blocked. Piped operators have reported temporary recovery after changing IP or
using an IPv6 range. These are network workarounds, not durable parser fixes.

References:

- <https://docs.invidious.io/youtube-errors-explained/>
- <https://github.com/TeamPiped/Piped/issues/3060>

### TubePull and closed competitors

TubePull publicly states that it reads YouTube formats, downloads from the
YouTube CDN, merges high-quality video/audio on its servers, and funds monitoring
that responds to YouTube player/CDN changes. It does not disclose its egress or
session infrastructure. It is reasonable to infer that reliable operations
require more than one default cloud IP, but it is not possible to verify whether
TubePull uses ISP nodes, proxies, special hosting, or another private method.

Reference: <https://tubepull.com/youtube/>

Y2Mate, SaveFrom, and similar closed competitors do not publish enough backend
detail to treat their behavior as an implementable architecture.

## 8. Options considered

| Option | Expected value | Main problem | Recommendation |
| --- | --- | --- | --- |
| WPC + Chromium on current EC2 | low-cost final code experiment | same blocked AWS egress; experimental browser dependency | test once in isolation |
| More AWS EIP rotation | very low | fresh address already failed; unstable/evasive | do not repeat |
| Switch yt-dlp to Cobalt/Invidious/Piped | low | parser changes do not repair egress reputation | do not rewrite for this reason |
| YouTube account cookie pool | short-lived access to restricted cases | account bans, credential risk, operational and policy risk | prohibited for this project |
| IPv6 range rotation | may work temporarily | churn, blocking, operational instability | not a production foundation |
| Random residential proxy per request | unreliable | YouTube URLs/tokens can be IP/session-bound | do not use random rotation |
| Sticky ISP/residential egress | high technical probability | provider AUP, bandwidth cost, policy review | suitable for a controlled pilot |
| Dedicated ISP-edge worker | strongest long-term architecture | requires an accepted ISP-connected node and operations | recommended target |
| Third-party download API | fast integration | dependency, SLA, commercial rights, privacy, cost | only with explicit contract |
| Official YouTube Data API | none for file delivery | does not provide downloads; policy restrictions | not a solution |

## 9. Recommended next architecture

Keep the existing AWS path for TikTok and other sources that work. Split YouTube
processing into a source-specific edge worker with an accepted ISP/business
broadband egress:

```text
Vercel API
    |
    v
AWS SQS
    |
    +---- TikTok/default worker on EC2
    |
    `---- YouTube edge worker on ISP egress
               |
               | same IP for page, token, and media segments
               v
             S3 multipart upload
               |
               v
           CloudFront signed URL
```

The YouTube job must keep one sticky egress identity for all related requests:

1. fetch the page/player configuration;
2. establish Visitor Data/session context;
3. mint required PO Tokens;
4. obtain `googlevideo.com` URLs;
5. download all audio/video fragments;
6. merge and upload the result to S3.

Do not generate a URL through one IP and fetch media through another. YouTube
and other sources may bind media URLs to the IP, cookies, visitor context, or
request headers that generated them.

## 10. Proposed execution plan

### Phase A: final no-cost experiment

Build a disposable ARM64-compatible test image containing:

- current pinned yt-dlp;
- Chromium;
- `yt-dlp-getpot-wpc`;
- no browser cookies or account session;
- no AWS or Supabase secret beyond what is strictly required for the isolated
  metadata probe.

Run a small authorized matrix against the same Big Buck Bunny URL. Capture
provider discovery, token context, player client, normalized failure code,
memory usage, and elapsed time. Do not turn on the production queue.

Decision rule:

- if metadata and media URL access succeed repeatedly, perform one bounded
  authorized end-to-end test before considering integration;
- if the same bot challenge appears, stop all client/token experiments on the
  AWS egress and move to Phase B.

### Phase B: sticky egress pilot

Evaluate either an ISP-connected edge node or a contracted sticky ISP egress
whose acceptable-use policy explicitly permits the intended authorized media
workflow. Route only YouTube-related traffic through it; AWS, Supabase, S3, and
CloudFront traffic should remain direct.

Pilot acceptance criteria:

- 20-50 authorized public test videos across normal videos and Shorts;
- at least 95% first-attempt metadata success;
- at least 95% successful bounded file completion;
- extraction and media download remain on the same sticky egress;
- no account cookies;
- no private, paid, members-only, live, or DRM content;
- measured bandwidth and cost per completed GB;
- automatic circuit breaker after repeated source blocks or HTTP 429 responses;
- provider terms and legal/product policy reviewed before public exposure.

### Phase C: production split

- publish separate SQS routing attributes or queues for YouTube and default
  sources;
- keep the YouTube edge worker independently scalable and disableable;
- retain the existing database state machine and public API contract;
- add source-specific health, success-rate, queue-age, cost, and block alarms;
- deploy gradually to staff, then a small allowlist, before general users.

## 11. Operations and verification commands

The SSH source-IP rule may need to be updated before connecting. See the full
runbook rather than opening port 22 globally.

```bash
ssh -i ~/.ssh/pullvio-01.pem ubuntu@3.212.192.122

sudo systemctl status pullvio-media-worker --no-pager
sudo docker ps --filter name=pullvio
sudo docker logs --tail 200 pullvio-media-worker
sudo docker logs --tail 100 pullvio-pot-provider

sudo sh -c 'cd /opt/pullvio/media-worker && docker compose config --quiet'
```

Local regression suite:

```bash
npm test
npm run typecheck
npm run lint
npm run build

PYTHONPATH=services/media-worker \
  python3 -m unittest discover -s services/media-worker/tests -v
python3 -m compileall -q \
  services/media-worker/pullvio_worker \
  services/media-worker/tests
```

Useful health expectations:

- `pullvio-media-worker` is running;
- `pullvio-pot-provider` is running and only shows `4416/tcp`, never a host
  mapping such as `0.0.0.0:4416`;
- SQS visible and in-flight counts return to zero while the service is idle;
- valid Vimeo requests enter the queue; after an emergency stop the API returns `503 SERVICE_DISABLED`;
- the provider cannot reach `169.254.169.254`;
- the EC2 egress IP remains `3.212.192.122`.

## 12. Key repository paths

| Purpose | Path |
| --- | --- |
| Public submit API | `app/api/media/jobs/route.ts` |
| Job status/cancel API | `app/api/media/jobs/[jobId]/route.ts` |
| Frontend job state machine | `app/components/media-studio.tsx` |
| URL/source allowlist | `lib/media/source-url.ts` |
| API contract parsing | `lib/media/contracts.ts` |
| SQS producer | `lib/media/queue.ts` |
| Supabase job repository | `lib/media/repository.ts` |
| Worker implementation | `services/media-worker/pullvio_worker/worker.py` |
| Worker command policy | `services/media-worker/pullvio_worker/domain.py` |
| Worker Compose | `services/media-worker/compose.yaml` |
| Worker systemd unit | `services/media-worker/pullvio-media-worker.service` |
| Worker tests | `services/media-worker/tests/` |
| Database migrations | `supabase/migrations/202607170001_create_media_job_control_plane.sql` |
| Worker lifecycle migration | `supabase/migrations/202607170002_create_media_worker_lifecycle.sql` |
| Claim correction migration | `supabase/migrations/202607170003_fix_media_job_claim.sql` |
| AWS design | `docs/plans/2026-07-17-aws-media-processing-production-design.md` |
| Implementation record | `docs/plans/2026-07-17-media-backend-control-plane-implementation.md` |
| EC2 operations | `docs/runbooks/ec2-worker-maintenance.md` |

## 13. Release gate checklist

Before anyone enables public processing, all of the following should be true:

- [ ] chosen source egress is permitted by its provider's acceptable-use terms;
- [ ] legal/product review covers YouTube's terms and the intended authorized
      content workflow;
- [ ] no user-supplied or maintainer browser cookies are stored;
- [ ] one authorized YouTube job completes end to end;
- [ ] the multi-video pilot meets the success-rate threshold;
- [ ] metadata and media segments use the same sticky egress;
- [x] S3 remains private and CloudFront signed delivery passes;
- [ ] cost and bandwidth alarms are configured;
- [ ] source-block and rate-limit circuit breakers are active;
- [ ] concurrency and output-size limits are reviewed;
- [ ] worker scratch cleanup and S3 lifecycle rules are verified;
- [ ] tests, typecheck, lint, and production build pass;
- [ ] rollout starts with staff or an explicit allowlist;
- [x] `accepting_jobs` was enabled by explicit user decision; YouTube remains a separate unresolved release risk.

## 14. Legal and product boundary

YouTube's official API does not provide a general video-download API. Its
developer policies prohibit downloading, caching, or storing YouTube
audiovisual content through YouTube API Services without prior written
approval. The technical ability to resolve a public media URL does not establish
permission to save or redistribute it.

Pullvio should continue to restrict its intended use to content the user owns,
public-domain or appropriately licensed content, or content for which the user
has permission or another valid legal basis. It should not support private,
members-only, paid, DRM-protected, or account-restricted media, and it should
retain clear copyright complaint and takedown procedures.

Reference: <https://developers.google.com/youtube/terms/developer-policies>

## 15. Immediate handoff decision

The receiving engineer should first review this document and the implementation
record, then choose one of two explicit paths:

1. run the isolated WPC/Chromium experiment and stop if AWS receives the same
   challenge; or
2. skip the low-probability experiment and proceed directly to a policy-reviewed
   ISP-edge pilot.

The recommended choice is to run the bounded WPC experiment once because it is
cheap and is the only remaining featured yt-dlp token provider not yet tested.
It should not delay the ISP-edge design if it fails. Repeating AWS IP rotation,
adding account-cookie pools, or replacing yt-dlp with another extractor on the
same AWS egress should not be treated as viable next steps.
