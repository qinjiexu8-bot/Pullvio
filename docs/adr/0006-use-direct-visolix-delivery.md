# ADR-0006: Use direct Visolix delivery for the low-cost launch

## Status

Accepted

## Context

Pullvio's first media backend used SQS, an EC2 worker, FFmpeg, private S3, and
CloudFront around Visolix source retrieval. That design provides private
delivery, local derivatives, and controlled 24-hour retention, but creates
fixed infrastructure cost before search traffic and advertising revenue are
established.

Visolix documents asynchronous download and progress endpoints for YouTube,
Instagram, TikTok, Facebook, Snapchat, and OK.ru. In production, social-source
requests can also return an immediate media map (`hd`, `sd`, and `mp3`) instead
of a polling ID. Pullvio supports both response forms and delivers the selected
provider-hosted URL directly. This removes the initial EC2, SQS, S3, and
CloudFront media path.

## Decision

For the low-cost launch, Vercel owns the JSON control plane and calls Visolix
from server-side functions. Supabase remains the durable task, quota, provider
state, and account-history store. Supabase Cron (`pg_cron` + `pg_net`) calls a
protected Vercel endpoint once per minute to advance tasks after a user leaves
the page.

Publish only these six source pages:

- YouTube
- Instagram
- Facebook
- TikTok
- Snapchat
- OK.ru

YouTube supports one selected video quality or MP3 audio per provider request.
The other five platforms return only their available source video. Pullvio does
not create local cover or audio derivatives for those platforms.

The Visolix API key and Feishu webhook remain server-only. Repeated paid-source
requests use the existing Turnstile challenge. HTTP 402 fails the current task,
closes all six platform switches, emits one deduplicated Feishu notification,
and presents a localized temporary-unavailability message.

An identical request may reuse an unexpired provider result globally. Each user
still receives an owner-scoped Pullvio task record and consumes the normal
quota. Reuse never extends the provider URL lifetime.

## Consequences

### Positive

- No continuously running media worker, queue, object-storage, or CDN is needed
  for new tasks.
- Provider charges occur only for cache misses.
- The account center and asynchronous progress survive browser navigation.
- Platform scope matches the provider's documented six-platform API.

### Negative

- The browser receives a Visolix-hosted URL, so Pullvio no longer controls
  download-domain branding, private signed delivery, exact retention, or
  provider egress.
- Social sources do not provide separate MP3 or cover downloads.
- Provider availability, URL lifetime, performance, pricing, and policy become
  direct product dependencies.
- Background polling depends on Supabase Cron and the protected Vercel endpoint.
- Pullvio cannot guarantee same-day global reuse after a provider URL expires.

## Rollout

1. Apply the Supabase migrations.
2. Configure server-only Visolix, Feishu, and cron secrets in Vercel.
3. Deploy the application and verify direct provider delivery.
4. Test all six platforms, browser polling, cron polling, account history,
   Turnstile, cache reuse, expiry, and the 402 circuit breaker.
5. Close the old queue and confirm no legacy job remains active.
6. Remove the expired S3/CloudFront compatibility path from application code.
7. Stop EC2 and review remaining AWS resources separately before deletion.

## Supersedes

- [ADR-0001](0001-use-aws-media-processing-and-delivery.md) for new launch jobs
- [ADR-0002](0002-use-multi-asset-media-jobs.md) for new Visolix jobs
- [ADR-0003](0003-reuse-unexpired-media-artifacts.md) for the new result cache
- [ADR-0004](0004-use-visolix-for-youtube.md)
- [ADR-0005](0005-expand-visolix-social-platforms.md)

The migration completed on 2026-07-30: EC2 was shut down and AWS runtime
dependencies were removed from the web application. Legacy AWS records remain
valid documentation for historical artifacts and a possible future return to
private delivery.

## References

- [Visolix REST API](https://developers.visolix.com/rest-api)
- [Visolix operations runbook](../runbooks/visolix-media-provider.md)
