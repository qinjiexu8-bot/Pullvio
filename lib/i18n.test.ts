import { describe, expect, it } from "vitest";
import { languageSwitchPath } from "./i18n";

describe("languageSwitchPath", () => {
  it("keeps the YouTube downloader route when switching languages", () => {
    expect(languageSwitchPath("zh-cn", "/youtube-video-downloader")).toBe(
      "/zh-cn/youtube-video-downloader",
    );
    expect(languageSwitchPath("es", "/youtube-video-downloader")).toBe(
      "/es/youtube-video-downloader",
    );
  });

  it("falls back to the selected locale home for unknown routes", () => {
    expect(languageSwitchPath("zh-cn", "/not-a-real-page")).toBe("/zh-cn");
  });
});
