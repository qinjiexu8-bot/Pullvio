import "server-only";

type TurnstileResponse = {
  success?: boolean;
  hostname?: string;
  action?: string;
  [key: string]: unknown;
};

export async function verifyTurnstileToken(token: unknown, remoteIp: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new Error("TURNSTILE_SECRET_KEY is not configured.");
  if (typeof token !== "string" || token.length < 10 || token.length > 2048) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return false;
  const result = (await response.json()) as TurnstileResponse;
  const expectedHostname = process.env.TURNSTILE_EXPECTED_HOSTNAME ?? "pullvio.com";
  return result.success === true
    && result.hostname === expectedHostname
    && (result.action === undefined || result.action === "youtube-download");
}
