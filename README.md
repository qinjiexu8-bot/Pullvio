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

## Implementation note

This repository contains the frontend and SEO foundation. Production deployments should connect the interface to the media-processing, authentication, billing, and observability services used by the environment.

## Responsible use

Pullvio is intended for media you own, public-domain or openly licensed works, and content you otherwise have permission or a legal right to save. It is not intended to bypass DRM, paywalls, private accounts, or access controls.
