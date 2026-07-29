import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { platformHelpCandidates } from "./blog-posts-platform-help";
import { editorialStandardVersion } from "./blog-editorial";
import type { Locale } from "./i18n";

const locales: Locale[] = ["en", "zh-cn", "es"];
const bannedPhrases = [
  "in today's digital",
  "whether you are a content creator",
  "在当今数字化时代",
  "无论您是内容创作者",
  "en la era digital actual",
  "tanto si eres creador",
];
const expectedScreenshots: Record<string, string> = {
  "youtube-video-download-not-working": "youtube-downloader-interface.webp",
  "youtube-shorts-link-and-quality": "youtube-downloader-interface.webp",
  "instagram-reel-link-not-working": "instagram-downloader-interface.webp",
  "facebook-private-video-download": "facebook-downloader-interface.webp",
  "copy-snapchat-spotlight-link": "snapchat-downloader-interface.webp",
  "okru-video-download-failed": "okru-downloader-interface.webp",
};

describe("platform help editorial batch", () => {
  it("contains six unique, fully approved single-problem articles", () => {
    const slugs = platformHelpCandidates.map(({ post }) => post.slug);

    expect(slugs).toHaveLength(6);
    expect(new Set(slugs).size).toBe(6);
    for (const { review } of platformHelpCandidates) {
      expect(review).toMatchObject({
        status: "approved",
        standardVersion: editorialStandardVersion,
        reviewedAt: "2026-07-29",
        reviewer: "Pullvio Editorial",
      });
      expect((review.notes ?? "").length).toBeGreaterThan(40);
    }
  });

  it("gives every localization a direct answer, useful screenshot, and constrained link set", () => {
    for (const { post } of platformHelpCandidates) {
      for (const locale of locales) {
        const copy = post.copy[locale];
        const html = renderToStaticMarkup(copy.body);
        const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        const figure = html.match(/<figure class="article-figure">([\s\S]*?)<\/figure>/);
        const internalLinks = html.match(/href="\/[^"]+"/g) ?? [];
        const headingCount = (html.match(/<h2>/g) ?? []).length;

        expect(copy.title).toMatch(/[?？]$/);
        expect(copy.description.length).toBeGreaterThan(locale === "zh-cn" ? 35 : 80);
        expect(
          plain.length,
          `${post.slug}/${locale} should contain substantive problem-solving detail`,
        ).toBeGreaterThan(locale === "en" ? 2200 : 900);
        expect(headingCount).toBeGreaterThanOrEqual(4);
        expect(figure).not.toBeNull();
        expect(figure?.[1]).toContain("alt=");
        expect(figure?.[1]).toContain("<figcaption>");
        expect(html).toContain(expectedScreenshots[post.slug]);
        expect(fs.existsSync(path.join(
          process.cwd(),
          "public/images/blog",
          expectedScreenshots[post.slug],
        ))).toBe(true);
        expect(internalLinks.length).toBeGreaterThanOrEqual(1);
        expect(internalLinks.length).toBeLessThanOrEqual(5);
        for (const phrase of bannedPhrases) {
          expect(plain.toLowerCase()).not.toContain(phrase.toLowerCase());
        }
      }
    }
  });
});
