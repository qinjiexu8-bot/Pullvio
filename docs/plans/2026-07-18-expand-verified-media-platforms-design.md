# Expand verified media platforms

## Status

Approved for implementation on 2026-07-18.

## Requirements

- Add the eight sources that passed metadata and format selection from the production AWS worker: Pinterest video pins, Twitch clips, Dailymotion videos, Streamable videos, Snapchat Spotlight, Imgur video/GIFV, public Loom shares, and public Dropbox video shares.
- Accept only one direct, public media item per request. Do not support profiles, feeds, boards, playlists, live streams, private shares, passwords, DRM, or login-only content.
- Preserve the current quota, SQS, yt-dlp/FFmpeg, S3, CloudFront, 24-hour retention, multi-asset, history, and global artifact reuse paths.
- Give every source an independent database kill switch.
- Publish English, Simplified Chinese, and Spanish landing pages only after the same production release includes working backend support.

## Architecture

The existing monolithic media worker remains the shared processing pipeline. Source-specific behavior stays in a small adapter layer: exact hostname allowlists, path validation, and narrow option constraints. The API performs the first validation and the worker repeats it after claiming the job. PostgreSQL rejects unknown platform values and checks the per-platform switch before quota reservation or SQS dispatch.

No new queue or worker is created because all eight candidates currently use the existing AWS egress successfully. A source can be isolated later if its failure rate, egress requirements, or workload profile becomes materially different.

## Non-functional requirements

- Security: HTTPS only; no credentials, custom ports, arbitrary redirects, user-selected proxy, profile, playlist, or generic extractor input.
- Reliability: platform failure must not disable other sources; every platform defaults off until its end-to-end test passes.
- Cost: keep global 24-hour artifact reuse and the 2 GB/30 minute worker limits.
- SEO: one canonical page and hreflang set per platform; visible FAQ/HowTo content must match structured data; all pages must be linked from the home and footer and included in the sitemap.
- Mobile: reuse the existing responsive platform page and media studio.

## Platform boundaries

| Platform | Accepted first-release links | Explicit exclusions |
| --- | --- | --- |
| Pinterest | `/pin/{numeric-id}` video pins | boards, profiles, image-only pins |
| Twitch | `clips.twitch.tv/{slug}` and `/{channel}/clip/{slug}` | live channels, VODs, subscriber-only media |
| Dailymotion | `/video/{id}` and `dai.ly/{id}` | playlists and channels |
| Streamable | one public video ID | user pages and deleted/private media |
| Snapchat | `/spotlight/{id}` | stories, profiles, chat media |
| Imgur | one video/GIFV ID or direct MP4/GIFV | albums and galleries |
| Loom | `/share/{uuid}` | private, password, workspace and edit links |
| Dropbox | `/s/...` or `/scl/fi/...` public video share | folders, private shares and arbitrary hosts |

## Alternatives considered

- Separate worker per platform: rejected for now because it multiplies queues, deployments and idle compute without a distinct egress or scaling requirement.
- Generic yt-dlp URL acceptance: rejected because it expands SSRF, playlist, private-content and operational risk beyond reviewed sources.
- Publish pages before enabling processing: rejected because it creates misleading SEO pages and poor user signals.

## Failure and rollback

Unsupported paths fail before quota is consumed. Private/deleted/geo-restricted media returns a source-specific public error without retries. A regression is rolled back by setting only that platform's `accepting_jobs` value to false; its landing page must be removed from the public catalog in the next frontend deployment if the outage is expected to persist.
