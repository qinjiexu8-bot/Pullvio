# Vimeo and SoundCloud source integration

## Decision

Add Vimeo and SoundCloud to the backend source allowlist. Keep Reddit and X/Twitter disabled because the current EC2 probes did not work without source-account cookies or platform-side failures.

## Scope

- Vimeo accepts only a public single-video URL on `vimeo.com`, `www.vimeo.com`, or `player.vimeo.com`.
- SoundCloud accepts only a public single-track URL on the reviewed SoundCloud hosts.
- SoundCloud is audio-only and produces MP3 output.
- Playlists, profiles, channels, search pages, arbitrary hosts, HTTP URLs, embedded credentials, and custom ports remain rejected.
- The global production kill switch remains unchanged.

## Data flow and controls

The browser submits the existing media job contract. The API normalizes the URL, identifies the platform, rejects unsupported media modes, and reserves a job. The Worker repeats the hostname and single-item path checks before invoking yt-dlp. The database platform constraint is expanded through a forward-only migration.

Both new platforms use the existing quota, concurrency, duration, file-size, SQS, S3, CloudFront, cancellation, and retry controls. YouTube-only PO-token and proxy arguments are not passed to either source.

## Verification

- Unit tests cover accepted hosts, rejected collection URLs, SoundCloud audio-only enforcement, and the Worker duplicate allowlist.
- TypeScript, Python Worker tests, production build, and migration lint checks must pass.
- EC2 metadata probes must succeed without cookies before deployment.
- An authorized Vimeo end-to-end test completed successfully before the global production gate was enabled.

## Runtime pipe handling

The first authorized Vimeo end-to-end test exposed a subprocess pipe deadlock: yt-dlp produced a metadata JSON document larger than the operating-system pipe buffer, while the Worker waited for process exit before reading stdout and stderr. The Worker now calls `communicate()` with short timeouts so both pipes are continuously drained while the existing heartbeat, cancellation, lease, and command-timeout checks continue to run. A regression test writes 200 KB to stdout and must complete within five seconds.
