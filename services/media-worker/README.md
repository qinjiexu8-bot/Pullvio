# Pullvio media worker

Private SQS consumer for authorized public media jobs. It claims each job through
Supabase, runs pinned yt-dlp/FFmpeg tools without a shell, uploads the artifact to
the private `pullvio` S3 bucket, and commits a terminal state before deleting the
SQS message.

The image also includes pinned Deno, yt-dlp's matching EJS package, and the
BgUtils PO Token plugin. Compose runs the matching token provider as an isolated
sidecar on the application network. Port 4416 is never published on the EC2
host, and a host firewall rule prevents that sidecar from reaching EC2 instance
metadata.

The worker has no HTTP listener and EC2 does not need ports 80 or 443 open.

## Required runtime configuration

- `AWS_REGION=us-east-1`
- `PULLVIO_SQS_QUEUE_URL`
- `PULLVIO_S3_BUCKET=pullvio`
- `PULLVIO_SUPABASE_SECRET_ARN` containing JSON with `url` and `secretKey`
- optional limits documented in `.env.example`

The launch profile is intentionally conservative: one worker process, at least
10 seconds between source jobs, a one-second pause between extractor requests,
and an 8–15 second randomized download delay. Bot challenges and HTTP 429
responses are terminal for that attempt and are not immediately retried.

AWS credentials come from the EC2 instance profile. Do not place static AWS keys
or the Supabase secret in an image, compose file, shell history, or systemd unit.

## Source-site egress

YouTube can challenge or block public cloud IP ranges with `LOGIN_REQUIRED` even
when the requested media is public. Do not solve this by copying a maintainer's
personal browser cookies onto the worker. Production YouTube support requires a
dedicated, policy-reviewed egress strategy and isolated service credentials where
the source site's terms permit them. Keep `media_runtime_config.accepting_jobs`
disabled until that path has passed an end-to-end test.

Do not add cookie files, browser profiles, proxy URLs, or account credentials to
the image or API contract. The PO Token provider improves request attestation;
it does not guarantee that an already-blocked network will be accepted.

On 2026-07-17, an isolated test with one fresh AWS Elastic IP produced the same
immediate YouTube `LOGIN_REQUIRED` response as the original address. The test
IP was released and the worker was rolled back. Do not rotate more AWS
addresses; keep production disabled until an approved egress path succeeds.

## Local verification

```bash
python -m unittest discover -s tests -v
docker build -t pullvio-media-worker .
docker compose config --quiet
```
