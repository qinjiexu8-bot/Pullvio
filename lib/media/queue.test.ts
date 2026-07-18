import { describe, expect, it } from "vitest";
import { buildMediaQueueMessage } from "./queue-message";

describe("buildMediaQueueMessage", () => {
  it("sends an identifier-only versioned message", () => {
    expect(buildMediaQueueMessage("7a3fc784-77f1-48f3-a601-718a0357bf49")).toEqual({
      schemaVersion: 1,
      jobId: "7a3fc784-77f1-48f3-a601-718a0357bf49",
    });
  });
});
