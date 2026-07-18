# YouTube / Visolix operations runbook

## Runtime ownership

- Vercel accepts jobs, evaluates repeated-request risk, and verifies Cloudflare Turnstile.
- Supabase stores the durable job, provider-run state, platform switch, and deduplicated alert outbox.
- The EC2 worker submits and polls Visolix, downloads the result, derives MP3 and cover files with FFmpeg, then uploads only to the private S3 bucket.
- Browsers receive Pullvio CloudFront artifact URLs. A Visolix result URL must never be returned to a browser or written to application logs.

## Required secrets and variables

Store these values outside Git:

### AWS Secrets Manager

- `pullvio/visolix`: JSON object with an `apiKey` property.
- `pullvio/feishu-media-alerts`: JSON object with a `webhookUrl` property.

The EC2 instance role needs `secretsmanager:GetSecretValue` only for those two secrets and the existing Supabase/CloudFront secrets. The worker environment receives only the secret ARNs:

```dotenv
PULLVIO_VISOLIX_SECRET_ARN=arn:aws:secretsmanager:REGION:ACCOUNT:secret:pullvio/visolix-...
PULLVIO_FEISHU_SECRET_ARN=arn:aws:secretsmanager:REGION:ACCOUNT:secret:pullvio/feishu-media-alerts-...
```

### Vercel encrypted environment variables

```dotenv
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
TURNSTILE_EXPECTED_HOSTNAME=pullvio.com
```

The Turnstile widget must allow `pullvio.com`. Preview deployments need a separate test widget or an explicitly configured preview hostname; do not weaken the production hostname check.

## Safe deployment order

1. Create the two AWS secrets and grant the EC2 role read access.
2. Add the Turnstile widget and Vercel environment variables.
3. Deploy the database migration. It creates the provider-run state, risk check, and alert outbox. It intentionally leaves YouTube disabled.
4. Deploy and restart the EC2 worker. Confirm it loads both secret ARNs without printing their values.
5. Deploy the Vercel application.
6. Enable YouTube only after the worker is healthy and all secrets are readable.
7. Submit one authorized short YouTube video at 720p and verify video, audio, and cover artifacts.
8. Verify the provider URL never appears in the browser API response, Vercel logs, worker logs, or S3 metadata.

## Balance-exhausted incident (HTTP 402)

The worker handles a Visolix 402 in one database transaction:

1. fail the current job with `PROVIDER_BALANCE_EXHAUSTED`;
2. close the YouTube platform switch;
3. create one deduplicated Feishu alert event.

The client displays a localized temporary-unavailability message. Other platforms remain available.

After replenishing the provider balance:

1. test the Visolix account directly with one authorized short video;
2. verify the EC2 worker has the correct secret version;
3. call the service-role-only RPC `resolve_youtube_provider_balance_incident`;
4. submit one Pullvio canary job and check all three artifacts.

Do not reopen the switch by updating the table directly. The recovery RPC resolves the deduplication key so a future 402 can generate a new Feishu alert.

## Repeated-request verification

- The fourth YouTube request by the same account/device within ten minutes requires Turnstile.
- Eight YouTube requests from the same privacy-coarsened network within ten minutes also require Turnstile.
- A successful check creates an owner-bound, HttpOnly, signed ten-minute pass cookie.
- Turnstile applies only to YouTube. It does not change the existing guest quota or general rate limits.

## Rollback

Disable only YouTube first:

```sql
update public.media_platform_config
set accepting_jobs = false
where platform = 'youtube';
```

Keep the worker and schema in place while active jobs finish. Remove the public YouTube pages only if the outage is expected to be long; a short incident should return a friendly temporary-unavailability response instead of creating SEO churn.
