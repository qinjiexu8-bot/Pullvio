# Pullvio

Pullvio is a responsive, multilingual browser-based video and audio downloader.

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
- Direct Visolix processing with asynchronous progress and temporary result links

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Clerk authentication and Supabase PostgreSQL with RLS
- Vercel server functions and Supabase Cron
- Visolix media-provider API
- Cloudflare Turnstile
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
expose `CLERK_SECRET_KEY`, `SUPABASE_SECRET_KEY`, `VISOLIX_API_KEY`, or webhook
secrets through a `NEXT_PUBLIC_` variable.

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

Browser traffic uses the same-origin endpoint
`https://pullvio.com/api/media/jobs`. Vercel calls Visolix from server-side
functions, Supabase stores account and job state, and Supabase Cron advances
asynchronous jobs after a user leaves the page. Completed jobs expose temporary
provider URLs; users should save results promptly.

The former EC2/SQS/S3/CloudFront worker path was retired on 2026-07-30. It is
not part of the production request path and the application no longer requires
AWS runtime credentials or SDKs.

## Architecture documents

- [Current production runtime](docs/runbooks/production-runtime.md)
- [Visolix provider operations](docs/runbooks/visolix-media-provider.md)
- [Archived EC2 worker runbook](docs/runbooks/ec2-worker-maintenance.md)
- [Architecture decision records](docs/adr/README.md)

## Responsible use

Pullvio is intended for media you own, public-domain or openly licensed works, and content you otherwise have permission or a legal right to save. It is not intended to bypass DRM, paywalls, private accounts, or access controls.
