import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { fileTroubleshootingCandidates } from "./blog-posts-file-troubleshooting";
import { editorialStandardVersion } from "./blog-editorial";
import type { Locale } from "./i18n";

const locales: Locale[] = ["en", "zh-cn", "es"];
const bannedPhrases = [
  "in today's digital",
  "whether you are",
  "unlock the power",
  "在当今数字化时代",
  "无论你是",
  "轻松解决所有",
  "en la era digital",
  "tanto si eres",
  "solución definitiva",
];

describe("downloaded-file troubleshooting editorial batch", () => {
  it("contains two unique, fully reviewed single-problem articles", () => {
    const slugs = fileTroubleshootingCandidates.map(({ post }) => post.slug);

    expect(slugs).toEqual([
      "downloaded-video-is-blurry",
      "downloaded-mp4-wont-play",
    ]);
    expect(new Set(slugs).size).toBe(2);
    for (const { review } of fileTroubleshootingCandidates) {
      expect(review).toMatchObject({
        status: "approved",
        standardVersion: editorialStandardVersion,
        reviewedAt: "2026-07-30",
        reviewer: "Pullvio Editorial",
      });
      expect((review.notes ?? "").length).toBeGreaterThan(100);
    }
  });

  it("gives every localization substantive evidence without decorative screenshots", () => {
    for (const { post } of fileTroubleshootingCandidates) {
      for (const locale of locales) {
        const copy = post.copy[locale];
        const html = renderToStaticMarkup(copy.body);
        const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        const internalLinks = html.match(/href="\/[^"]+"/g) ?? [];
        const externalLinks = html.match(/href="https:\/\/[^"]+"/g) ?? [];
        const headingCount = (html.match(/<h2>/g) ?? []).length;

        expect(copy.title).toMatch(/[?？]$/);
        expect(copy.description.length).toBeGreaterThan(locale === "zh-cn" ? 45 : 95);
        expect(
          plain.length,
          `${post.slug}/${locale} should contain substantive problem-solving detail`,
        ).toBeGreaterThan(locale === "en" ? 4700 : 2200);
        expect(headingCount).toBeGreaterThanOrEqual(6);
        expect(plain).toContain("Pullvio");
        expect(html).not.toContain("<figure");
        expect(html).toContain("<pre>");
        expect(externalLinks.length).toBeGreaterThanOrEqual(3);
        expect(internalLinks.length).toBeGreaterThanOrEqual(3);
        expect(internalLinks.length).toBeLessThanOrEqual(5);
        for (const phrase of bannedPhrases) {
          expect(plain.toLowerCase()).not.toContain(phrase.toLowerCase());
        }
      }
    }
  });
});
