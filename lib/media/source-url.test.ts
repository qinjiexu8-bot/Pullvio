import { describe, expect, it } from "vitest";
import { MediaInputError, normalizeSourceUrl } from "./source-url";

describe("normalizeSourceUrl", () => {
  it.each([
    ["https://www.youtube.com/watch?v=abc", "youtube", "www.youtube.com"],
    ["https://youtu.be/abc?t=4", "youtube", "youtu.be"],
    ["https://m.youtube.com/shorts/abc", "youtube", "m.youtube.com"],
    ["https://www.tiktok.com/@owner/video/123", "tiktok", "www.tiktok.com"],
    ["https://vm.tiktok.com/ZM123/", "tiktok", "vm.tiktok.com"],
    ["https://vimeo.com/777912896", "vimeo", "vimeo.com"],
    ["https://player.vimeo.com/video/777912896", "vimeo", "player.vimeo.com"],
    ["https://soundcloud.com/scottbuckley/simplicity-cc-by", "soundcloud", "soundcloud.com"],
    ["https://on.soundcloud.com/AbCdEf", "soundcloud", "on.soundcloud.com"],
  ])("accepts an allowed public source", (sourceUrl, platform, host) => {
    expect(normalizeSourceUrl(sourceUrl)).toMatchObject({ platform, host });
  });

  it.each([
    "http://www.youtube.com/watch?v=abc",
    "https://user:password@www.youtube.com/watch?v=abc",
    "https://www.youtube.com:8443/watch?v=abc",
    "https://youtube.com.evil.example/watch?v=abc",
    "https://127.0.0.1/video",
    "https://example.com/video",
    "https://vimeo.com/channels/creativecommons",
    "https://player.vimeo.com/777912896",
    "https://soundcloud.com/scottbuckley/sets/creative-commons",
    "https://soundcloud.com/scottbuckley",
  ])("rejects an unsafe or unsupported source: %s", (sourceUrl) => {
    expect(() => normalizeSourceUrl(sourceUrl)).toThrow(MediaInputError);
  });

  it("removes fragments before persistence and queueing", () => {
    expect(normalizeSourceUrl("https://youtu.be/abc#comments").url).toBe(
      "https://youtu.be/abc",
    );
  });
});
