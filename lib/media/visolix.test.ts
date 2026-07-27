import { afterEach, describe, expect, it, vi } from "vitest";
import type { SubmitJobInput } from "./contracts";
import { providerFormatFor, VisolixClient, VisolixError } from "./visolix";

vi.mock("server-only", () => ({}));

afterEach(() => {
  vi.unstubAllGlobals();
});

function input(overrides: Partial<SubmitJobInput> = {}): SubmitJobInput {
  return {
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    sourceHost: "www.youtube.com",
    sourcePlatform: "youtube",
    mediaKind: "video",
    format: "mp4",
    quality: "1080p",
    idempotencyKey: "c88949cc-930c-4cb3-a8d9-350fa1587b42",
    ...overrides,
  };
}

describe("providerFormatFor", () => {
  it("maps YouTube video quality and audio output", () => {
    expect(providerFormatFor(input({ quality: "2160p" }))).toBe("2160");
    expect(providerFormatFor(input({ mediaKind: "audio", format: "mp3" }))).toBe("mp3");
  });

  it("uses source output for supported social video platforms", () => {
    expect(providerFormatFor(input({
      sourceUrl: "https://www.tiktok.com/@scout2015/video/6718335390845095173",
      sourceHost: "www.tiktok.com",
      sourcePlatform: "tiktok",
    }))).toBe("source");
  });

  it("rejects audio output outside YouTube", () => {
    expect(() => providerFormatFor(input({
      sourceUrl: "https://www.instagram.com/reel/ABC123/",
      sourceHost: "www.instagram.com",
      sourcePlatform: "instagram",
      mediaKind: "audio",
      format: "mp3",
    }))).toThrowError(VisolixError);
  });
});

describe("VisolixClient", () => {
  it("normalizes a numeric provider download ID returned by the API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: "1",
      id: 123456789,
      info: { title: "Public test video" },
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })));

    const result = await new VisolixClient(
      "test-api-key",
      "https://developers.visolix.com/api",
    ).submit(input());

    expect(result.providerJobId).toBe("123456789");
    expect(result.downloadUrl).toBeNull();
  });

  it("accepts the synchronous social response returned by Visolix", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: "success",
      media: {
        sd: "https://cdn.example.com/public-video-sd.mp4",
        hd: "https://cdn.example.com/public-video.mp4",
        mp3: "https://cdn.example.com/public-audio.mp3",
      },
      thumb: "https://cdn.example.com/public-cover.jpg",
      title: "Public social video",
      service: "tiktok",
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })));

    const result = await new VisolixClient(
      "test-api-key",
      "https://developers.visolix.com/api",
    ).submit(input({
      sourceUrl: "https://www.tiktok.com/@scout2015/video/6718335390845095173",
      sourceHost: "www.tiktok.com",
      sourcePlatform: "tiktok",
    }));

    expect(result.providerJobId).toBeNull();
    expect(result.downloadUrl).toBe("https://cdn.example.com/public-video.mp4");
    expect(result.info).toMatchObject({
      title: "Public social video",
      thumbnail: "https://cdn.example.com/public-cover.jpg",
      platform: "tiktok",
    });
  });
});
