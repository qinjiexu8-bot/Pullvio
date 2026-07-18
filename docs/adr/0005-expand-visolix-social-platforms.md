# ADR-0005: Expand Visolix to supported social platforms

## Status

Accepted

## Context

Pullvio already uses Visolix for YouTube source retrieval while retaining its
own durable jobs, global 24-hour artifact cache, private S3 storage, local audio
and cover derivatives, and CloudFront delivery. Visolix also supports public
Instagram, Facebook, Snapchat, and OK.ru media. Running those platforms through
the same provider path gives them the same retry, retention, cache, security,
and account-history behavior.

## Decision

Route YouTube, Instagram, Facebook, Snapchat, and OK.ru through the durable
Visolix provider-run workflow. YouTube continues to send an explicit resolution;
the four social platforms request the source rendition and do not send the
YouTube-only format header.

Use one paid provider submission per cache miss. Derive MP3 and cover files
locally, so those artifacts do not create additional provider requests. Reuse
unexpired artifacts globally for identical normalized links. Apply Turnstile to
repeated requests across all five paid-provider platforms.

A Visolix HTTP 402 fails the current job, closes all five Visolix-backed source
switches, creates one deduplicated Feishu alert, and returns localized client
copy. Locally processed platforms remain available.

## Consequences

- The four social platforms inherit private storage, signed delivery, account
  history, and 24-hour retention.
- Global cache reuse limits repeated provider charges for the same source.
- A provider balance or availability incident affects all Visolix-backed
  platforms, but not platforms processed locally.
- Public, direct-link validation remains intentionally conservative; profiles,
  feeds, private media, DRM, and login-only content are rejected.
- Provider pricing and behavior remain an external dependency.

## References

- [ADR-0004](0004-use-visolix-for-youtube.md)
- [Validated implementation design](../plans/2026-07-18-visolix-social-platforms-design.md)
- [Visolix REST API](https://developers.visolix.com/rest-api)
- [Visolix provider operations](../runbooks/visolix-media-provider.md)
