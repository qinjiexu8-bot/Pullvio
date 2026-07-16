# Platform Downloader Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add indexable YouTube and TikTok downloader landing pages in English, Simplified Chinese, and Spanish without competing with the existing informational guides.

**Architecture:** Reuse the existing Pullvio header, footer, download studio, waitlist behavior, and visual system. Store platform-specific copy in one typed content module, render it through one shared server component, and expose explicit localized routes with unique metadata, canonical URLs, hreflang, visible FAQs, and matching structured data.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS, Clerk-aware shared navigation, JSON-LD.

---

### Task 1: Reuse the media studio

- Extract the existing download studio and waitlist dialog into a shared client component.
- Reconnect the homepage to the extracted component without changing its behavior.

### Task 2: Build unique platform content and UI

- Add distinct English, Chinese, and Spanish copy for YouTube and TikTok.
- Render a shared responsive platform page with platform-specific introductions, steps, formats, limitations, responsible-use guidance, guide links, related tools, and FAQs.

### Task 3: Add indexable routes and metadata

- Add English and localized routes for both platform pages.
- Add unique title, description, canonical, hreflang, Open Graph data, WebApplication schema, FAQ schema, and breadcrumbs.

### Task 4: Strengthen discovery

- Link the homepage platform strip and footer resources to the new pages.
- Preserve the current page when switching languages.
- Add all six URLs to the sitemap and automated internal-link checker.

### Task 5: Verify

- Run targeted linting, TypeScript checks, production build, and the internal-link checker.
- Inspect desktop and mobile layouts and correct any responsive regressions.
