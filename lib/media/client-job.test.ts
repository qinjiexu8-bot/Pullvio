import { describe, expect, it } from "vitest";
import { needsDownloadDetails } from "./client-job";

describe("needsDownloadDetails", () => {
  it("hydrates a cache-hit response that only contains ready status", () => {
    expect(needsDownloadDetails({ status: "ready" })).toBe(true);
  });

  it("does not hydrate a ready job that already has artifact links", () => {
    expect(needsDownloadDetails({
      status: "ready",
      artifacts: [{ downloadUrl: "https://media.pullvio.com/output.mp4" }],
    })).toBe(false);
  });

  it("leaves queued and processing jobs to normal polling", () => {
    expect(needsDownloadDetails({ status: "queued" })).toBe(false);
    expect(needsDownloadDetails({ status: "processing" })).toBe(false);
  });
});
