import { describe, expect, it } from "vitest";
import {
  approvedEditorialPosts,
  editorialStandardVersion,
  type ReviewedCandidate,
} from "./blog-editorial";

type TestPost = { slug: string };

function candidate(
  slug: string,
  review: ReviewedCandidate<TestPost>["review"],
): ReviewedCandidate<TestPost> {
  return { post: { slug }, review };
}

describe("approvedEditorialPosts", () => {
  it("publishes only fully reviewed articles approved against the current standard", () => {
    const candidates = [
      candidate("draft", { status: "draft", standardVersion: editorialStandardVersion }),
      candidate("review", { status: "in_review", standardVersion: editorialStandardVersion }),
      candidate("old-standard", {
        status: "approved",
        standardVersion: "0.9",
        reviewedAt: "2026-07-29",
        reviewer: "Pullvio Editorial",
        notes: "Passed",
      }),
      candidate("missing-evidence", {
        status: "approved",
        standardVersion: editorialStandardVersion,
        reviewedAt: "2026-07-29",
        reviewer: "Pullvio Editorial",
      }),
      candidate("approved", {
        status: "approved",
        standardVersion: editorialStandardVersion,
        reviewedAt: "2026-07-29",
        reviewer: "Pullvio Editorial",
        notes: "Passed content, evidence, localization, SEO, and safety review.",
      }),
    ];

    expect(approvedEditorialPosts(candidates)).toEqual([{ slug: "approved" }]);
  });
});
