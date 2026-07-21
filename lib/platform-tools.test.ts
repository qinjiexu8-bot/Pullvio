import { describe, expect, it } from "vitest";
import { getPlatformTool } from "./platform-tools";

describe("SoundCloud platform content cluster", () => {
  it.each(["en", "zh-cn", "es"] as const)(
    "links the %s downloader page to the localized MP3 quality guide",
    (locale) => {
      const tool = getPlatformTool("soundcloud-downloader", locale);

      expect(tool.resource?.slug).toBe("soundcloud-mp3-quality-and-bitrate");
      expect(tool.resource?.copy[locale].title.length).toBeGreaterThan(0);
      expect(tool.resource?.copy[locale].cta.length).toBeGreaterThan(0);
    },
  );
});
