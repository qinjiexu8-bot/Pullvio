import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { editorialStandardVersion } from "./blog-editorial";
import { playbackDiagnosticCandidates } from "./blog-posts-playback-diagnostics";
import type { Locale } from "./i18n";

const locales: Locale[] = ["en", "zh-cn", "es"];
const bannedPhrases = [
  "in today's digital",
  "whether you are",
  "unlock the power",
  "ultimate solution",
  "在当今数字化时代",
  "无论你是",
  "轻松解决所有",
  "终极解决方案",
  "en la era digital",
  "tanto si eres",
  "solución definitiva",
];

describe("post-download playback diagnostic editorial batch", () => {
  it("contains two unique, fully reviewed single-problem articles", () => {
    const slugs = playbackDiagnosticCandidates.map(({ post }) => post.slug);

    expect(slugs).toEqual([
      "subtitles-missing-from-downloaded-video",
      "downloaded-video-ends-early",
    ]);
    expect(new Set(slugs).size).toBe(2);
    for (const { review } of playbackDiagnosticCandidates) {
      expect(review).toMatchObject({
        status: "approved",
        standardVersion: editorialStandardVersion,
        reviewedAt: "2026-08-01",
        reviewer: "Pullvio Editorial",
      });
      expect((review.notes ?? "").length).toBeGreaterThan(100);
    }
  });

  it("gives every localization substantive evidence without decorative screenshots", () => {
    for (const { post } of playbackDiagnosticCandidates) {
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
        expect(html).toContain("content-callout");
        expect(html).toContain("<pre>");
        expect(html).not.toContain("<figure");
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
