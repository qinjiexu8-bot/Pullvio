import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertSecret(secret: string) {
  if (secret.length < 32) {
    throw new Error("PULLVIO_ANONYMOUS_SECRET must contain at least 32 characters.");
  }
}

function sign(secret: string, value: string) {
  assertSecret(secret);
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createAnonymousCookieValue(secret: string, id = randomUUID()) {
  if (!UUID_PATTERN.test(id)) throw new Error("Anonymous browser ID must be a UUID.");
  const payload = `v1.${id.toLowerCase()}`;
  return `${payload}.${sign(secret, payload)}`;
}

export function readAnonymousCookieValue(secret: string, value: string | undefined | null) {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3 || parts[0] !== "v1" || !UUID_PATTERN.test(parts[1])) return null;

  const payload = `${parts[0]}.${parts[1].toLowerCase()}`;
  const expected = Buffer.from(sign(secret, payload));
  const received = Buffer.from(parts[2]);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  return parts[1].toLowerCase();
}

export function deriveAnonymousSubject(secret: string, browserId: string) {
  if (!UUID_PATTERN.test(browserId)) throw new Error("Anonymous browser ID must be a UUID.");
  assertSecret(secret);
  return createHmac("sha256", secret)
    .update(`pullvio:anonymous-subject:v1:${browserId.toLowerCase()}`)
    .digest("hex");
}

export function deriveNetworkSubject(secret: string, forwardedIp: string | undefined) {
  const ip = forwardedIp?.split(",", 1)[0]?.trim();
  const version = ip ? isIP(ip) : 0;
  if (!ip || version === 0) return null;

  let coarseIp: string;
  if (version === 4) {
    const octets = ip.split(".");
    coarseIp = `${octets[0]}.${octets[1]}.${octets[2]}.0/24`;
  } else {
    // Vercel provides a normalized client address. Four leading groups give a
    // privacy-preserving /64-style network key without retaining the address.
    const groups = ip.toLowerCase().split(":");
    coarseIp = `${groups.slice(0, 4).join(":")}::/64`;
  }

  assertSecret(secret);
  return createHmac("sha256", secret)
    .update(`pullvio:network-subject:v1:${coarseIp}`)
    .digest("hex");
}

export const ANONYMOUS_COOKIE_NAME = "pullvio_anon";
