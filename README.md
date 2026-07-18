# Pullvio

Pullvio is a responsive, multilingual frontend for a browser-based video and audio downloader with Free and Pro plans.

## Current scope

- English, Simplified Chinese, and Spanish homepages
- Light and dark themes
- Mobile-first responsive interface
- Download workflow, product benefits, Free/Pro comparison, and FAQs
- SEO-ready metadata, canonicals, `hreflang`, sitemap, and structured data
- About, contact, privacy, terms, copyright, and acceptable-use pages
- Original guides covering MP4 vs MP3, video resolution, and responsible media use
- Clerk authentication with a Supabase-backed account shell
- Same-origin media job API with anonymous and signed-in quota controls
- SQS-backed yt-dlp/FFmpeg worker and private signed-file delivery

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Clerk authentication and Supabase PostgreSQL with RLS
- AWS SQS, EC2, S3, CloudFront, Secrets Manager, and Vercel OIDC
- Lucide icons

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Clerk and Supabase are optional for viewing the public frontend. To enable the
real authentication and account-data flow, configure:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=https://pullvio.com
```

Set `NEXT_PUBLIC_SITE_URL` to `https://pullvio.com` in Vercel production. Never
expose `CLERK_SECRET_KEY` or any AWS credential through a `NEXT_PUBLIC_` variable.

## Database migrations

The Supabase CLI is pinned as a development dependency. On a new machine, authenticate and link the hosted project once:

```bash
npx supabase login
npx supabase link --project-ref jmofmwtdsyllvpjrvwav
```

Keep schema changes in `supabase/migrations` and review them before applying:

```bash
npm run db:migrations
npm run db:push:dry
npm run db:push
npm run db:types
```

Never commit a Supabase access token, database password, or secret API key.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

## Implementation note

The media control plane and worker are implemented and deployed. Browser traffic
uses the same-origin endpoint `https://pullvio.com/api/media/jobs`; EC2 has no
public API listener. Completed files are delivered from `media.pullvio.com`
through short-lived CloudFront signed URLs, while direct S3 and unsigned
CloudFront access remain blocked.

Public media processing is deliberately disabled by the database kill switch.
The AWS worker has passed queue, lifecycle, FFmpeg, private S3, signed URL, and
CloudFront delivery tests. YouTube currently presents `LOGIN_REQUIRED` bot
challenges to the AWS public IP even with Deno and yt-dlp EJS installed, so a
policy-reviewed dedicated egress solution is required before activation. Do not
put personal browser cookies on the worker. CloudFront remains on the Free plan
until real usage justifies an upgrade.

## Architecture documents

- [AWS media processing and delivery plan](docs/plans/2026-07-17-aws-media-processing-production-design.md)
- [EC2 worker maintenance runbook](docs/runbooks/ec2-worker-maintenance.md)
- [Architecture decision records](docs/adr/README.md)

## Responsible use

Pullvio is intended for media you own, public-domain or openly licensed works, and content you otherwise have permission or a legal right to save. It is not intended to bypass DRM, paywalls, private accounts, or access controls.
