# Multi-asset downloads and 24-hour retention

## Outcome

Each completed media job may expose several private downloadable artifacts:

- video requests: MP4, MP3 audio, and a JPG cover when the source provides one;
- audio requests: MP3 and a JPG cover when the source provides one.

Every artifact expires exactly 24 hours after the job is committed. The API never
issues a CloudFront URL beyond that expiry, and both the completion card and the
account history warn the user to download the files promptly.

## Data flow

1. The worker downloads the requested primary output and asks yt-dlp to write a
   converted JPG thumbnail.
2. For video requests, FFmpeg derives the MP3 from the already-downloaded MP4. A
   missing audio stream or missing source thumbnail does not discard a valid MP4.
3. Each validated artifact is uploaded to a private S3 object under the job prefix.
4. A single database RPC atomically records all artifacts, marks the job ready, and
   assigns a server-controlled `now() + interval '24 hours'` expiry.
5. The owner-only job API signs each unexpired artifact through CloudFront. S3
   remains private and is never used as a public download origin.
6. S3 lifecycle cleanup removes expired output objects after the application-level
   access window has closed.

## Failure semantics

- The requested primary artifact is mandatory.
- Cover extraction is best effort because not every source publishes a thumbnail.
- MP3 derivation for a video is best effort when the source contains no usable
  audio stream; the MP4 remains downloadable.
- A database commit conflict deletes every object uploaded by that attempt.
- Artifact paths, kinds, content types, sizes, and checksums are validated in the
  security-definer function before insertion.

## UI contract

The job API returns `artifacts[]` with `kind`, `contentType`, `fileSizeBytes`,
`expiresAt`, and a short-lived `downloadUrl`. The existing top-level `downloadUrl`
is retained as a compatibility alias for the requested primary artifact.

The UI uses localized labels and the explicit message: files are kept for 24 hours
and are then automatically deleted.
