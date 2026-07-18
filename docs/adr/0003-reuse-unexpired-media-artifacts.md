# ADR 0003: Reuse unexpired media artifacts

- Status: Accepted
- Date: 2026-07-18

## Context

Repeated requests for the same public source and output capability were
being sent through SQS and processed by yt-dlp/FFmpeg again even when the resulting
private S3 objects were still available. This wastes source bandwidth, CPU time,
queue capacity, and increases the chance of upstream rate limiting.

## Decision

After normal validation, ownership, rate-limit, and quota reservation, the API asks
Postgres to reuse a matching ready job whose required primary artifact remains valid
for at least one minute. Video reuse requires the same requested quality. An audio
request may reuse the audio derivative of a prior video job because both are MP3.
The database atomically copies only artifact metadata into
the newly owned job; the private S3 objects themselves are shared until their
original 24-hour expiry. A cache hit marks the new job ready and bypasses SQS.

The cache lookup is global across authenticated and anonymous owners; it contains no
owner filter. Every requester still receives a distinct, owner-scoped job row.
Artifact delivery continues
through the owner-authorized API and short-lived signed CloudFront URLs. The lookup
does not expose the source job or its owner, and cache hits continue to count toward
guest quotas and account activity.

## Consequences

- Exact repeat requests avoid yt-dlp, FFmpeg, SQS, and duplicate S3 uploads.
- Cache hits inherit the original artifact expiry; they do not extend retention.
- Removing either history row does not delete the shared S3 object prematurely.
- Different video qualities or normalized source URLs remain separate processing
  inputs unless the candidate already contains the exact required artifact.
- S3 lifecycle expiry is still the final deletion mechanism.
