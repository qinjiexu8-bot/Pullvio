# Pullvio Long-Tail Content Publishing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task.

**Goal:** Publish a first batch of six problem-led, evidence-backed articles that support Pullvio's live platform tools without creating thin or duplicative SEO pages.

**Architecture:** Article candidates live in a separate module with an explicit editorial review state. Only candidates marked `approved` enter the public `blogPosts` collection, which automatically feeds the blog index, localized routes, structured data, homepage journal, and sitemap. Real Pullvio screenshots live under `public/images/blog/` and are rendered as informative figures with localized alt text and captions.

**Tech Stack:** Next.js App Router, React/TypeScript article data, static metadata, Vitest, live-browser screenshot capture.

---

### Task 1: Establish the editorial gate

**Files:**
- Create: `docs/editorial/content-quality-standard.md`
- Create: `lib/blog-editorial.ts`
- Test: `lib/blog-editorial.test.ts`

**Steps:**
1. Define the problem-first article brief and the mandatory evidence, screenshot, originality, SEO, localization, and safety checks.
2. Define `draft`, `in_review`, `approved`, and `rejected` states.
3. Add a publication filter that exposes only reviewed and approved candidates.
4. Test that drafts and incomplete reviews cannot enter the public article list.

### Task 2: Capture first-party screenshots

**Files:**
- Create: `public/images/blog/youtube-downloader-interface.webp`
- Create: `public/images/blog/instagram-downloader-interface.webp`
- Create: `public/images/blog/facebook-downloader-interface.webp`
- Create: `public/images/blog/snapchat-downloader-interface.webp`
- Create: `public/images/blog/okru-downloader-interface.webp`

**Steps:**
1. Open each current production platform page at a consistent desktop viewport.
2. Capture the visible Pullvio interface after the page finishes loading.
3. Inspect each image for stale copy, personal data, clipped controls, or visual defects.
4. Optimize images to WebP while preserving readable interface text.

### Task 3: Write six single-problem articles

**Files:**
- Create: `lib/blog-posts-platform-help.tsx`
- Modify: `lib/blog.tsx`

**Articles:**
1. `youtube-video-download-not-working`
2. `youtube-shorts-link-and-quality`
3. `instagram-reel-link-not-working`
4. `facebook-private-video-download`
5. `copy-snapchat-spotlight-link`
6. `okru-video-download-failed`

**Steps per article:**
1. Record one primary long-tail query and one user problem.
2. Put the direct answer in the opening paragraph.
3. Add first-party Pullvio observations without invented anecdotes or test results.
4. Add a relevant screenshot with localized alt text and a useful caption.
5. Explain supported link types, failure boundaries, and actionable next steps.
6. Link to the matching platform tool and no more than four relevant internal resources.
7. Provide English, Simplified Chinese, and Spanish copy written for each language rather than mechanically translated.
8. Keep the article in `draft` until review is complete.

### Task 4: Run editorial quality control

**Files:**
- Create: `docs/editorial/reviews/2026-07-29-platform-help-batch.md`
- Modify: `lib/blog-posts-platform-help.tsx`

**Steps:**
1. Check single-intent alignment, direct answer, factual accuracy, product behavior, and permission language.
2. Check for generic AI phrasing, repeated structures, filler, unsupported superlatives, and fabricated experience.
3. Check title, description, H1, headings, internal links, image alt text, captions, and keyword cannibalization.
4. Check all three localized versions for natural language and equivalent meaning.
5. Record pass/fail evidence per article.
6. Mark only passing articles `approved`.

### Task 5: Verify and publish

**Files:**
- Modify as needed from failed checks only.

**Commands:**
- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run check:links`

**Verification:**
1. Confirm all six articles render in all three languages.
2. Confirm screenshots are legible on desktop and mobile.
3. Confirm canonical and hreflang links are correct.
4. Confirm the sitemap adds exactly 18 localized article URLs.
5. Confirm no unsupported platform page or draft article is published.
6. Commit and push only after every quality and technical check passes.
