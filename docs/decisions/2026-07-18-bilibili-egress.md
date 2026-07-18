# Bilibili egress decision

## Status

Accepted for staged implementation. The production platform switch remains off.

## Context

The official yt-dlp Bilibili extractor recognizes public Bilibili video URLs, but a metadata-only probe from the current AWS `us-east-1` worker receives HTTP 412. Retrying through the same data-center egress does not address the network rejection.

## Decision

- Accept only direct, single-video `bilibili.com/video/BV...` or `bilibili.com/video/av...` URLs. Do not accept live, bangumi, user-space, playlist, or short-link URLs in the first release.
- Store the authenticated proxy URL in a dedicated AWS Secrets Manager secret with a `proxyUrl` JSON field.
- Grant the worker role access only to that exact secret ARN. Pass only the secret ARN to Docker; never store proxy credentials in Git, Vercel, compose files, or logs.
- Apply the proxy only to Bilibili yt-dlp commands. Existing platforms continue to use their current network paths.
- Keep `media_platform_config.bilibili.accepting_jobs = false` until metadata, video, audio, cover, cache reuse, expiry, quota, and failure-path tests pass on production infrastructure.
- Begin with the existing worker to minimize moving parts during validation. Split Bilibili into a dedicated queue and worker when traffic or provider limits justify fault and cost isolation.

## Alternatives considered

- Another AWS region without a proxy: rejected because it still uses cloud data-center egress and is unlikely to resolve the 412 response reliably.
- User cookies: rejected for the first release because public-video support should not require account credentials and cookies create account-security and lifecycle risks.
- A proxy URL in an environment variable: rejected because it is too easy to expose through host inspection, support bundles, or configuration copies.

## Failure handling and rollback

HTTP 412 is classified as `SOURCE_BLOCKED` and is not retried immediately. Provider failure is isolated to Bilibili requests. Rollback is one database update that sets the Bilibili platform switch to false; no frontend or SEO page is published before the switch is proven stable.

## Capacity and cost note

The full source video travels through the proxy, so proxy transfer is a material variable cost. The provider must explicitly permit media downloads and sustained connections. Initial testing should use a capped account and CloudWatch cost/traffic alarms.
