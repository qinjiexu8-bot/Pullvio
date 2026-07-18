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
    ["https://www.bilibili.com/video/BV1Fb4111732/", "bilibili", "www.bilibili.com"],
    ["https://bilibili.com/video/av170001", "bilibili", "bilibili.com"],
    ["https://www.pinterest.com/pin/664281013778109217/", "pinterest", "www.pinterest.com"],
    ["https://clips.twitch.tv/FaintLightGullWholeWheat", "twitch", "clips.twitch.tv"],
    ["https://www.twitch.tv/xqc/clip/CulturedAmazingKudu-Test_1", "twitch", "www.twitch.tv"],
    ["https://www.dailymotion.com/video/x5kesuj", "dailymotion", "www.dailymotion.com"],
    ["https://dai.ly/x5kesuj", "dailymotion", "dai.ly"],
    ["https://streamable.com/dnd1", "streamable", "streamable.com"],
    ["https://www.snapchat.com/spotlight/W7_EDlXWTBiXAEEniNoMPwAAYYWtidGhudGZpAX1TKn0JAX1TKnXJAAAAAA", "snapchat", "www.snapchat.com"],
    ["https://imgur.com/A61SaA1", "imgur", "imgur.com"],
    ["https://i.imgur.com/crGpqCV.mp4", "imgur", "i.imgur.com"],
    ["https://www.loom.com/share/43d05f362f734614a2e81b4694a3a523", "loom", "www.loom.com"],
    ["https://www.dropbox.com/scl/fi/r2kd2skcy5ylbbta5y1pz/DJI_0003.MP4?rlkey=abc&dl=0", "dropbox", "www.dropbox.com"],
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
    "https://www.bilibili.com/bangumi/play/ep123",
    "https://www.bilibili.com/video/not-a-video-id",
    "https://www.pinterest.com/user/board/",
    "https://www.twitch.tv/videos/6528877",
    "https://www.twitch.tv/xqc",
    "https://www.dailymotion.com/playlist/x123",
    "https://streamable.com/e/dnd1",
    "https://www.snapchat.com/add/example",
    "https://imgur.com/a/A61SaA1",
    "https://www.loom.com/edit/43d05f362f734614a2e81b4694a3a523",
    "https://www.dropbox.com/sh/folder/share",
  ])("rejects an unsafe or unsupported source: %s", (sourceUrl) => {
    expect(() => normalizeSourceUrl(sourceUrl)).toThrow(MediaInputError);
  });

  it("removes fragments before persistence and queueing", () => {
    expect(normalizeSourceUrl("https://youtu.be/abc#comments").url).toBe(
      "https://youtu.be/abc",
    );
  });
});
