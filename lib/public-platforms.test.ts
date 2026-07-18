import { describe, expect, it } from "vitest";
import { publicPlatforms } from "./public-platforms";

describe("public platform catalog", () => {
  it("publishes only production-enabled platforms", () => {
    expect(publicPlatforms.map(({ platform }) => platform)).toEqual([
      "TikTok",
      "Vimeo",
      "SoundCloud",
    ]);
  });

  it("does not expose the disabled YouTube route", () => {
    expect(publicPlatforms.some(({ slug }) => slug.includes("youtube"))).toBe(false);
  });
});
