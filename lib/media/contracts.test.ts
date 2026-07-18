import { describe, expect, it } from "vitest";
import { MediaInputError, parseSubmitJobBody } from "./contracts";

describe("parseSubmitJobBody", () => {
  it("normalizes a valid request", () => {
    expect(
      parseSubmitJobBody({
        sourceUrl: "https://youtu.be/abc",
        mediaKind: "video",
        format: "mp4",
        quality: "best",
        idempotencyKey: "7a3fc784-77f1-48f3-a601-718a0357bf49",
      }),
    ).toEqual({
      sourceUrl: "https://youtu.be/abc",
      sourceHost: "youtu.be",
      sourcePlatform: "youtube",
      mediaKind: "video",
      format: "mp4",
      quality: "best",
      idempotencyKey: "7a3fc784-77f1-48f3-a601-718a0357bf49",
    });
  });

  it.each([
    null,
    [],
    {},
    { sourceUrl: "https://youtu.be/abc", mediaKind: "binary" },
    { sourceUrl: "https://youtu.be/abc", mediaKind: "audio", format: "mp4" },
    { sourceUrl: "https://youtu.be/abc", idempotencyKey: "not-a-uuid" },
  ])("rejects malformed input", (input) => {
    expect(() => parseSubmitJobBody(input)).toThrow(MediaInputError);
  });

  it("accepts SoundCloud in audio mode", () => {
    expect(
      parseSubmitJobBody({
        sourceUrl: "https://soundcloud.com/scottbuckley/simplicity-cc-by",
        mediaKind: "audio",
        format: "mp3",
        quality: "best",
        idempotencyKey: "7a3fc784-77f1-48f3-a601-718a0357bf49",
      }),
    ).toMatchObject({ sourcePlatform: "soundcloud", mediaKind: "audio" });
  });

  it("rejects SoundCloud in video mode", () => {
    expect(() =>
      parseSubmitJobBody({
        sourceUrl: "https://soundcloud.com/scottbuckley/simplicity-cc-by",
        mediaKind: "video",
        format: "mp4",
        quality: "best",
        idempotencyKey: "7a3fc784-77f1-48f3-a601-718a0357bf49",
      }),
    ).toThrowError(expect.objectContaining({ code: "AUDIO_ONLY_SOURCE" }));
  });
});
