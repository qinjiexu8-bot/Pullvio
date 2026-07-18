import { describe, expect, it } from "vitest";
import { clampProgress, estimateSecondsRemaining } from "./job-progress";

describe("media job progress", () => {
  it("clamps public percentages", () => {
    expect(clampProgress(-20)).toBe(0);
    expect(clampProgress(43.6)).toBe(44);
    expect(clampProgress(150)).toBe(100);
    expect(clampProgress("50")).toBe(0);
  });

  it("estimates provider time only after measurable progress", () => {
    const now = Date.parse("2026-07-18T12:01:00Z");
    expect(estimateSecondsRemaining({ status: "processing", stage: "fetching", progressPercent: 8, startedAt: "2026-07-18T12:00:00Z", now })).toBeNull();
    expect(estimateSecondsRemaining({ status: "processing", stage: "fetching", progressPercent: 37, startedAt: "2026-07-18T12:00:00Z", now })).toBe(97);
  });

  it("uses conservative estimates for local stages", () => {
    expect(estimateSecondsRemaining({ status: "processing", stage: "processing_audio", progressPercent: 78, startedAt: null })).toBe(45);
    expect(estimateSecondsRemaining({ status: "processing", stage: "uploading", progressPercent: 90, startedAt: null })).toBe(20);
    expect(estimateSecondsRemaining({ status: "ready", stage: "completed", progressPercent: 100, startedAt: null })).toBeNull();
  });
});
