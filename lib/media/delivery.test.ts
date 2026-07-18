import { describe, expect, it } from "vitest";
import { buildArtifactUrl } from "./delivery-url";

describe("buildArtifactUrl", () => {
  it("builds an HTTPS media URL and encodes each key segment", () => {
    expect(buildArtifactUrl("media.pullvio.com", "outputs/job id/file name.mp4")).toBe(
      "https://media.pullvio.com/outputs/job%20id/file%20name.mp4",
    );
  });
});
