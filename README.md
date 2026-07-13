# Pullvio

Pullvio is a responsive, multilingual frontend for a cleaner online media workflow. The project is currently a **private beta content site**: media processing and paid subscriptions are intentionally not enabled yet.

## Current scope

- English, Simplified Chinese, and Spanish homepages
- Light and dark themes
- Mobile-first responsive interface
- Private beta roadmap and product principles
- SEO-ready metadata, canonicals, `hreflang`, sitemap, and structured data
- About, contact, privacy, terms, copyright, and acceptable-use pages
- Original guides covering MP4 vs MP3, video resolution, and responsible media use
- Supabase-ready authentication screens and account shell

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Supabase Auth integration scaffold
- Lucide icons

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Supabase is optional for viewing the frontend. To enable authentication, configure:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

## Beta notice

This repository currently contains the frontend and SEO foundation. It does not yet provide media downloading, conversion, subscription billing, or guaranteed platform support. Those capabilities will be published only after a real end-to-end workflow is available.

## Responsible use

Pullvio is intended for media you own, public-domain or openly licensed works, and content you otherwise have permission or a legal right to save. It is not intended to bypass DRM, paywalls, private accounts, or access controls.
