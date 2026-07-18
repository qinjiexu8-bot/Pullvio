# ADR 0002: Store multiple private artifacts per media job

- Status: Accepted
- Date: 2026-07-18

## Context

The original schema used `download_artifacts.job_id` as its primary key, limiting a
job to one output. Pullvio now needs to offer the requested media, extracted audio,
and a cover image without repeating source downloads.

## Decision

Give artifacts their own identity and enforce one artifact of each kind per job with
`unique (job_id, artifact_kind)`. The worker uploads all outputs first and commits
their metadata atomically with a versioned database function. The database assigns
the common 24-hour expiry. Owner-authorized APIs generate short-lived CloudFront
URLs bounded by that expiry.

The primary requested output remains mandatory. Optional derivative failures do not
invalidate a usable primary file.

## Consequences

- A job can expose MP4, MP3, and JPG downloads without additional source requests.
- Storage and output accounting include all committed artifacts.
- API clients must support an artifact collection; `downloadUrl` remains temporarily
  available for compatibility.
- Application access stops at 24 hours even if asynchronous S3 lifecycle deletion
  occurs later.
