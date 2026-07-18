# Media platform switches

## Decision

Keep the global media job switch enabled while independently controlling each reviewed source platform. YouTube starts disabled because the current AWS egress is rejected. TikTok, Vimeo, and SoundCloud remain enabled.

## Enforcement

The private `media_platform_config` table stores one Boolean state per allowed platform. Row-level security is forced and browser roles receive no table permissions. The existing `reserve_media_job` function is renamed to an internal unchecked implementation and wrapped with a function of the same public signature.

The wrapper reads the platform state before calling the existing quota and reservation logic. A disabled or unknown platform returns `SOURCE_DISABLED` without creating a database row or sending an SQS message. Only the Supabase service role can execute the wrapper; it cannot call the unchecked function directly.

## Product behavior

The submission API maps `SOURCE_DISABLED` to HTTP 503. English, Simplified Chinese, and Spanish interfaces explain that the source connection is being prepared. URL normalization still recognizes YouTube, so a future proxy pilot can re-enable it by updating one database row without another application deployment.

## Operations

- Global emergency stop: set `media_runtime_config.accepting_jobs` to `false`.
- Platform stop: set the relevant `media_platform_config.accepting_jobs` to `false`.
- YouTube may be enabled only after an authorized proxy pilot completes metadata and full-download tests using one sticky egress.
