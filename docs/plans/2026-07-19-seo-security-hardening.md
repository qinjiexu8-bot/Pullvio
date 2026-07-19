# SEO and Security Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the highest-impact SEO, localization, waitlist, and browser-security issues found in the 2026-07-19 production audit without changing Pullvio's download entitlement rules.

**Architecture:** Keep the existing App Router and same-origin API architecture. Apply small, testable corrections first, move waitlist writes behind the server-only Supabase client, and improve crawl/security signals without restructuring the entire locale tree in this release. Treat full static rendering as a separate architectural migration because the root locale and authenticated header currently depend on request state.

**Tech Stack:** Next.js App Router, TypeScript, Clerk, Supabase/Postgres, Vitest, Vercel headers.

---

### Task 1: Route localization regressions

**Files:**
- Modify: `lib/i18n.ts`
- Modify: `app/components/media-studio.tsx`
- Create: `lib/i18n.test.ts`

**Step 1:** Add failing tests proving that the YouTube tool remains on the same route when switching to Chinese or Spanish.

**Step 2:** Run `npm test -- lib/i18n.test.ts` and confirm the YouTube assertions fail.

**Step 3:** Add `/youtube-video-downloader` to the localized route registry and replace the obsolete `/auth/sign-in` quota link with `/login`.

**Step 4:** Run the focused test and typecheck.

### Task 2: Waitlist server boundary

**Files:**
- Modify: `app/api/waitlist/route.ts`
- Create: `supabase/migrations/202607190001_secure_waitlist_writes.sql`

**Step 1:** Reuse the bounded JSON parser and same-origin enforcement used by the media API.

**Step 2:** Replace the public Supabase client with `createAdminClient()` so the secret remains server-only.

**Step 3:** Add a migration that revokes direct table writes from `anon` and `authenticated` and removes the permissive insert policy.

**Step 4:** Preserve duplicate-email idempotency and the existing honeypot behavior.

### Task 3: Crawl directives and security headers

**Files:**
- Modify: `app/robots.ts`
- Modify: `next.config.ts`

**Step 1:** Allow authentication pages to be crawled so their page-level `noindex` directive can be observed; continue blocking account and API routes.

**Step 2:** Add global `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and frame protection headers.

**Step 3:** Add a report-safe CSP compatible with Clerk, Supabase, Cloudflare Turnstile, Vercel, and Pullvio media delivery. Verify sign-in and media forms continue to render in production build output.

### Task 4: Sitemap truthfulness

**Files:**
- Modify: `app/sitemap.ts`
- Create: `lib/sitemap.test.ts`

**Step 1:** Extract sitemap construction into a testable function.

**Step 2:** Assert that every public platform exists in all three locales, canonical alternates are complete, blog posts use their own content dates, and undated pages do not receive a fabricated global modification date.

**Step 3:** Remove unsupported `priority` and `changeFrequency` hints and retain only URL, accurate `lastModified` where known, and alternates.

### Task 5: Rendering boundary assessment

**Files:**
- Review: `app/layout.tsx`
- Review: `app/components/site-header.tsx`
- Review: localized route layouts

**Step 1:** Verify whether `headers()` can be removed without returning the wrong server-rendered `<html lang>` or breaking Clerk localization.

**Step 2:** If the change is not safe as an isolated patch, document the required route-group migration instead of shipping incorrect language markup. Reduce avoidable global schema noise independently if safe.

### Task 6: Verification

**Step 1:** Run `npm test`.

**Step 2:** Run `npm run typecheck` and `npm run lint`.

**Step 3:** Run `npm run build` and inspect route rendering classifications and CSP/header output.

**Step 4:** Start the production build locally and run `npm run check:links` against it.

**Step 5:** Review `git diff`, confirm no credentials or unrelated user changes are included, and summarize any architectural item intentionally deferred.
