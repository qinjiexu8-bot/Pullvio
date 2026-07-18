# Visolix media-provider operations

## Platform ownership

Visolix handles source retrieval for YouTube, Instagram, Facebook, Snapchat,
and OK.ru. The EC2 worker downloads one provider result, derives available MP3
and cover artifacts locally, uploads the artifacts to private S3, and serves
them through Pullvio's signed CloudFront delivery path.

Provider URLs, API credentials, and provider task identifiers must never be
returned to a browser or written to public logs.

## Safe deployment order

1. Deploy and restart the EC2 worker with support for all five platforms.
2. Apply the schema migration that expands platform constraints and provider
   state while leaving the new platform switches closed.
3. Deploy the Vercel application and SEO routes.
4. Apply the enable migration for Instagram, Facebook, Snapchat, and OK.ru.
5. Verify each page, normalized source URL, API response, and worker health.
6. Run paid end-to-end tests only with public media the tester owns or is
   authorized to save.

## Balance-exhausted incident

On a Visolix HTTP 402 the worker atomically:

1. fails the current job with `PROVIDER_BALANCE_EXHAUSTED`;
2. closes YouTube, Instagram, Facebook, Snapchat, and OK.ru;
3. creates one deduplicated Feishu alert.

After replenishing the provider balance, verify the active secret and call the
service-role-only RPC `resolve_media_provider_balance_incident`. Do not reopen
individual switches directly, because the recovery RPC also resolves the alert
deduplication key.

## Repeated-request verification

The fourth paid-provider request by the same account or anonymous device within
ten minutes requires Turnstile. Eight such requests from the same privacy-
coarsened network within ten minutes also require Turnstile. A successful check
creates an owner-bound, HttpOnly, signed ten-minute pass cookie.

## Rollback

Close only the Visolix-backed platforms and let active jobs finish:

```sql
update public.media_platform_config
set accepting_jobs = false
where platform in ('youtube', 'instagram', 'facebook', 'snapchat', 'okru');
```

Do not remove the schema during an incident. Keep SEO pages published for short
outages and show the localized temporary-unavailability response.
