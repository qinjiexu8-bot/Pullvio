import { describe, expect, it } from "vitest";
import { publicPlatforms } from "./public-platforms";

describe("public platform catalog", () => {
  it("publishes only production-enabled platforms", () => {
    expect(publicPlatforms.map(({ platform }) => platform)).toEqual([
      "YouTube",
      "Instagram",
      "Facebook",
      "TikTok",
      "Vimeo",
      "SoundCloud",
      "Pinterest",
      "Twitch Clips",
      "Dailymotion",
      "Streamable",
      "Snapchat",
      "OK.ru",
      "Imgur",
      "Loom",
      "Dropbox",
    ]);
  });

  it("exposes the production YouTube route", () => {
    expect(publicPlatforms.some(({ slug }) => slug === "youtube-video-downloader")).toBe(true);
  });
});
