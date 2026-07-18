import { describe, expect, it } from "vitest";
import {
  createAnonymousCookieValue,
  deriveAnonymousSubject,
  deriveNetworkSubject,
  readAnonymousCookieValue,
  createYoutubeChallengeCookieValue,
  readYoutubeChallengeCookieValue,
} from "./identity";

const secret = "a-development-secret-that-is-at-least-32-bytes-long";

describe("anonymous identity", () => {
  it("round-trips a signed browser identifier", () => {
    const id = "82bd8abe-2382-438c-84b1-0ca9f3e332b8";
    const value = createAnonymousCookieValue(secret, id);
    expect(readAnonymousCookieValue(secret, value)).toBe(id);
  });

  it("rejects a modified cookie", () => {
    const value = createAnonymousCookieValue(
      secret,
      "82bd8abe-2382-438c-84b1-0ca9f3e332b8",
    );
    expect(readAnonymousCookieValue(secret, `${value}x`)).toBeNull();
  });

  it("derives a stable, non-reversible database subject", () => {
    const id = "82bd8abe-2382-438c-84b1-0ca9f3e332b8";
    const subject = deriveAnonymousSubject(secret, id);
    expect(subject).toMatch(/^[0-9a-f]{64}$/);
    expect(subject).toBe(deriveAnonymousSubject(secret, id));
    expect(subject).not.toContain(id);
  });

  it("coarsens IPv4 networks before deriving an abuse-control subject", () => {
    expect(deriveNetworkSubject(secret, "203.0.113.8")).toBe(
      deriveNetworkSubject(secret, "203.0.113.240"),
    );
    expect(deriveNetworkSubject(secret, "203.0.114.8")).not.toBe(
      deriveNetworkSubject(secret, "203.0.113.8"),
    );
  });

  it("returns null when no valid client IP is available", () => {
    expect(deriveNetworkSubject(secret, undefined)).toBeNull();
    expect(deriveNetworkSubject(secret, "not-an-ip")).toBeNull();
  });
});

describe("YouTube challenge cookie", () => {
  it("is bound to the owner and expires after ten minutes", () => {
    const now = 1_800_000_000_000;
    const value = createYoutubeChallengeCookieValue(secret, "owner-a", now);
    expect(readYoutubeChallengeCookieValue(secret, "owner-a", value, now + 599_000)).toBe(true);
    expect(readYoutubeChallengeCookieValue(secret, "owner-b", value, now)).toBe(false);
    expect(readYoutubeChallengeCookieValue(secret, "owner-a", value, now + 601_000)).toBe(false);
  });
});
