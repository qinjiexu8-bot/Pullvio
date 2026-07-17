# Pullvio SEO Keyword Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align Pullvio's existing English, Simplified Chinese, and Spanish pages with the free-account product model and improve transactional, platform, device, format, and trust keyword coverage without publishing unsupported platform pages.

**Architecture:** Keep the homepage focused on the generic online video downloader intent, and keep the YouTube and TikTok pages focused on their platform-specific transactional intent. Use guides and blog posts for informational long-tail queries, then connect those clusters with descriptive internal links. Product claims must match the planned free model: five downloads without an account and no fixed download cap for signed-in users, subject to fair use.

**Tech Stack:** Next.js App Router, React, TypeScript, localized content dictionaries, JSON-LD, static sitemap generation.

---

### Task 1: Establish the content and product baseline

**Files:**
- Inspect: `lib/i18n.ts`
- Inspect: `lib/platform-tools.ts`
- Inspect: `app/components/localized-home.tsx`
- Inspect: `app/components/account-page.tsx`
- Inspect: `lib/policy-pages.tsx`
- Inspect: `lib/localized-pages.tsx`

**Steps:**
1. Search rendered content for Pro, three-download, pricing, unsupported-platform, and stale launch claims.
2. Record the page-to-keyword mapping in this plan.
3. Run `npm run typecheck`, `npm run lint`, and `npm run check:links` to establish the baseline.

### Task 2: Align the homepage with free access

**Files:**
- Modify: `lib/i18n.ts`
- Modify: `app/components/localized-home.tsx`
- Modify: `app/components/site-header.tsx`
- Modify: `app/components/site-footer.tsx`

**Steps:**
1. Replace visible paid-plan language with guest versus free-account access.
2. State five guest downloads and no fixed signed-in cap, subject to fair use.
3. Replace the paid offer in WebApplication JSON-LD with a single free offer.
4. Show only platform pages that actually exist.
5. Preserve the generic homepage target: online video downloader, download video from link, MP4, MP3, HD, 4K, browser, iPhone, and Android.

### Task 3: Strengthen YouTube and TikTok transactional pages

**Files:**
- Modify: `lib/platform-tools.ts`
- Verify: `lib/platform-metadata.ts`
- Verify: `app/components/platform-downloader-page.tsx`

**Steps:**
1. Put the primary platform keyword first in each title, H1, description, and opening paragraph.
2. Add truthful format, quality, browser, mobile, and supported-link modifiers.
3. Replace all Pro and daily-limit FAQ answers with the free-account model.
4. Keep the TikTok watermark answer factual; do not claim watermark removal.
5. Preserve visible HowTo and FAQ content so JSON-LD matches the page.

### Task 4: Align account and policy content

**Files:**
- Modify: `app/components/account-page.tsx`
- Modify: `lib/policy-pages.tsx`
- Modify: `lib/localized-pages.tsx`

**Steps:**
1. Present signed-in access as a free account with fair-use protection.
2. Remove the obsolete billing and subscription promotion from the account page.
3. Remove paid-plan language from About, Privacy, and Terms in all three languages.
4. Keep rate-limiting, security, and abuse protections explicit.

### Task 5: Add high-intent informational coverage and editorial trust

**Files:**
- Modify: `lib/blog.tsx`
- Modify: `app/components/blog-pages.tsx`
- Modify: `app/components/content-page.tsx`
- Modify: `lib/policy-pages.tsx`
- Modify: `lib/localized-pages.tsx`

**Steps:**
1. Add original platform-adjacent articles only where they do not promise unsupported functionality.
2. Add an editorial byline, review method, and honest modified date to blog articles.
3. Add editorial standards to About and link the byline to them.
4. Use descriptive internal links from articles to the relevant platform tool and guide.

### Task 6: Verify the rendered SEO output

**Files:**
- Verify: `app/sitemap.ts`
- Verify: generated routes and metadata

**Steps:**
1. Run `npm run typecheck` and expect success.
2. Run `npm run lint` and expect success.
3. Run `npm run check:links` and expect no broken internal links.
4. Run `npm run build` and expect all localized routes to build.
5. Search source and built output for obsolete user-visible Pro and three-download claims.
6. Inspect desktop and mobile screenshots of the homepage, YouTube page, TikTok page, Blog article, and account page.
