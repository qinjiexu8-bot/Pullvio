# ADR-0004: Use Visolix as the YouTube media provider

## Status

Superseded by [ADR-0005](0005-expand-visolix-social-platforms.md)

## Context

Pullvio's AWS worker cannot reliably retrieve public YouTube media from its
current cloud-network egress. The product already has a durable job API, SQS
queue, private S3 artifacts, CloudFront delivery, multi-asset account history,
and global artifact reuse. Replacing the whole pipeline with a third-party
download link would weaken privacy, cache control, retention guarantees, and
failure recovery.

Visolix exposes an asynchronous submit-and-progress API and pay-per-success
pricing. It can supply the missing YouTube source retrieval while Pullvio keeps
control of job ownership, human verification, derivatives, private storage, and
delivery.

## Decision

Use Visolix only as the YouTube source provider. Keep existing locally verified
platforms on yt-dlp. A durable provider-run record stores the external task ID
and enables asynchronous polling without resubmission after a worker restart.

On a cache miss, Pullvio requests one selected output from Visolix, validates and
copies it into private S3, and uses local FFmpeg to derive MP3 from video where
available. Video defaults to 1080p, with 720p, 1440p, and 2160p as explicit
options. Pullvio does not automatically submit a paid fallback request when a
quality is unavailable.

Repeated YouTube submissions require Cloudflare Turnstile. Visolix HTTP 402
atomically disables only the YouTube source and creates a deduplicated Feishu
operations alert. No daily provider spend cap is imposed.

## Consequences

### Positive

- Restores YouTube capability without proxying user downloads through Vercel.
- Preserves private storage, 24-hour retention, signed delivery, and account
  history.
- Global cache hits avoid provider calls and repeated billing.
- Durable provider IDs prevent most duplicate paid submissions on retries.
- The YouTube switch isolates provider incidents from other platforms.

### Negative

- Pullvio depends on a third-party API for YouTube availability and pricing.
- External submission and local persistence cannot form one atomic transaction;
  a narrow ambiguous-result failure remains.
- High-quality provider files increase worker scratch-space and processing needs.
- Policy, copyright, and advertising risks remain even when the technical path
  works.

### Neutral

- The browser continues to use the existing Pullvio job API and account history.
- Visolix credentials and operational task IDs remain server-side.
- Provider polling adds short SQS messages and database state transitions.

## Alternatives considered

**Continue direct yt-dlp from AWS**

- Rejected because the current AWS egress is not reliable for YouTube.

**Use residential proxies with yt-dlp**

- Rejected for the initial production path because proxy reputation, bandwidth
  pricing, session stability, and platform-control risk are harder to operate.

**Return the Visolix download URL directly to the browser**

- Rejected because Pullvio would lose its retention contract, private delivery,
  artifact validation, global caching, and consistent account experience.

**Request separate paid video and audio outputs for every job**

- Rejected because a valid video audio stream can be converted locally, reducing
  paid calls and improving cache reuse.

## References

- [Validated design](../plans/2026-07-18-visolix-youtube-provider-design.md)
- [Visolix REST API](https://developers.visolix.com/rest-api)
- [Cloudflare Turnstile validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
