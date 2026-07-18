# Media job progress design

## Goal

Show durable, localized job progress on the download form and in account history
without presenting animation as measured progress.

## Source of truth

`download_jobs` stores a public-safe processing stage and a monotonic percentage.
The Visolix `progress` value is measured from 0–1000 and maps to 5%–70% of the
Pullvio workflow. The EC2 Worker owns later milestones: audio processing, cover
generation, upload, and completion. A database trigger keeps terminal job status,
stage, and percentage consistent, including cache hits and expiration.

## Stages

- `queued`: accepted and waiting for a Worker
- `fetching`: provider/source retrieval and video normalization
- `processing_audio`: local MP3 extraction
- `processing_cover`: local preview generation
- `uploading`: private S3 upload and final commit
- `completed`, `failed`, `canceled`, `expired`: terminal states

The public API returns camel-cased `processingStage`, `progressPercent`, and an
optional `estimatedSecondsRemaining`. ETA uses elapsed time only after enough
measured progress exists and is capped to avoid implausible values.

## UI

A reusable progress component displays the localized stage, percentage, progress
bar, and optional approximate time. The homepage continues polling the owned job.
Account history polls only active rows and refreshes server data once a row becomes
terminal so signed artifact links remain server-generated.

## Safety and verification

Progress updates require the service role, a matching Worker lease, an allowed
stage, and a monotonic percentage. Tests cover provider mapping, ETA bounds, API
serialization, Worker stage calls, translations, responsive styles, terminal
trigger behavior, and production build output.
