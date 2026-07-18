# ADR-0001: Use AWS for media processing and delivery

## Status

Accepted. Implementation pending.

## Context

Pullvio is moving from a planned paid Pro subscription to a free, ad-supported
product. Anonymous visitors will receive five successful downloads per rolling
24 hours; signed-in users will receive unlimited normal use under fair-use and
abuse controls.

Media processing requires long-running binaries, temporary disk, controlled
network access, durable job state, private object storage, and inexpensive large
file delivery. Vercel remains appropriate for the Next.js frontend but must not
proxy or process media. The first capacity target is no more than 50 TB and 10
million delivery requests per month.

AWS offers a cohesive data path: ECS workers on EC2 can process jobs, upload to
S3 without public exposure, and deliver through a CloudFront Pro flat-rate
distribution. A global AWS Paid account may be personal or business; a foreign
entity is not required.

## Decision

Use the following first-production media stack:

- Vercel for the Next.js frontend and lightweight JSON control API.
- Clerk for identity and Supabase for application data and RLS.
- Amazon SQS with a dead-letter queue for job dispatch.
- Amazon ECS on EC2 for versioned `yt-dlp` and FFmpeg workers.
- Private S3 Standard storage for short-lived output artifacts.
- CloudFront Pro flat-rate distribution with Origin Access Control, WAF, and
  signed URLs for browser delivery.
- `us-east-1` for the initial worker and bucket, subject to lawful source
  reachability and throughput testing.

The service will not support arbitrary proxying, browser-cookie import, private
media, paywalls, DRM, or technical-control bypass. Media output is temporary and
must be removable through both expiry automation and takedown operations.

## Consequences

### Positive

- Processing, storage, and delivery use one provider and avoid cross-cloud
  transfer for the primary path.
- CloudFront Pro provides a predictable initial delivery baseline.
- S3 remains private and users receive only short-lived CloudFront URLs.
- SQS and container workers isolate long-running jobs from the web request path.
- ECS permits later horizontal scaling without introducing Kubernetes.
- Vercel remains focused on the frontend instead of expensive binary traffic.

### Negative

- EC2/ECS, S3, logs, and some security features remain separate AWS costs.
- CloudFront Pro's 50 TB and 10 million request figures are operating baselines,
  not a permanent unlimited entitlement.
- A sustained workload above the baseline may require a higher AWS plan or a
  delivery migration.
- Source platforms can change behavior or block cloud IP ranges, interrupting a
  supported workflow.
- AWS and other providers can act on abuse and copyright complaints, so rapid
  takedown and source blocking are operational requirements.
- Operating FFmpeg safely requires container hardening, resource limits, and
  continuous patching.

### Neutral

- Existing subscription tables remain dormant for the free launch.
- Cloudflare R2 and Bunny CDN remain documented fallback candidates rather than
  active dependencies.
- A later move of the JSON control API from Vercel to API Gateway does not change
  the media data path.

## Alternatives considered

### Cloudflare R2 with external processing

R2 has no egress charge and is attractive above the CloudFront baseline.
Rejected for the first production path because Pullvio still needs an external
`yt-dlp`/FFmpeg processor, and that processor's upload egress can erase the R2
savings. Keep as the first option to benchmark when delivery exceeds 50 TB.

### Bunny Storage and Volume CDN

Predictable and inexpensive at high bandwidth. Rejected as the primary initial
path because it does not solve processing compute and would add another provider
to the control and data planes. Keep as a delivery fallback.

### S3 direct public delivery

Rejected because normal S3 internet data-transfer pricing is unsuitable for a
free large-file tool, and a public bucket weakens access control.

### Vercel media processing or proxying

Rejected because long-running FFmpeg/yt-dlp jobs and large binary responses do
not belong in the frontend serverless runtime. It also couples site availability
and cost to media transfer.

### Kubernetes

Rejected for the initial scale because its operational overhead is not justified.
ECS on EC2 provides the required container scheduling and autoscaling with fewer
moving parts.

## Review triggers

Review this decision when any of the following remains true for two consecutive
months:

- CloudFront transfer exceeds 40 TB or requests exceed 8 million.
- Delivery and storage cost exceeds 35% of advertising and partner revenue.
- Queue age or processing availability misses the documented target.
- AWS source reachability prevents a meaningful share of lawful jobs.
- Abuse or copyright operations cannot meet response targets.

## References

- [Production design](../plans/2026-07-17-aws-media-processing-production-design.md)
- [CloudFront flat-rate pricing plans](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/flat-rate-pricing-plan.html)
- [Amazon S3 pricing](https://aws.amazon.com/s3/pricing/)
- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- [Bunny CDN pricing](https://bunny.net/pricing/)

