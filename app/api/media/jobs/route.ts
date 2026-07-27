import { NextRequest } from "next/server";
import { parseSubmitJobBody } from "@/lib/media/contracts";
import {
  assertSameOrigin,
  attachAnonymousCookie,
  attachYoutubeChallengeCookie,
  jsonNoStore,
  mediaErrorResponse,
  readSmallJson,
  resolveMediaIdentity,
} from "@/lib/media/http";
import {
  reserveMediaJob,
  mediaProviderChallengeRequired,
} from "@/lib/media/repository";
import { startDirectProviderJob } from "@/lib/media/direct-provider";
import { verifyTurnstileToken } from "@/lib/media/turnstile";
import {
  createYoutubeChallengeCookieValue,
  readYoutubeChallengeCookieValue,
  YOUTUBE_CHALLENGE_COOKIE_NAME,
} from "@/lib/media/identity";

export const runtime = "nodejs";

const DECISION_STATUS: Record<string, number> = {
  SERVICE_DISABLED: 503,
  SOURCE_DISABLED: 503,
  QUOTA_EXCEEDED: 429,
  ACTIVE_JOB_LIMIT: 429,
  RATE_LIMITED: 429,
  INVALID_OWNER: 400,
};

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const rawBody = await readSmallJson(request);
    const input = parseSubmitJobBody(rawBody);
    const identity = await resolveMediaIdentity(request, { createAnonymous: true });
    if (!identity) throw new Error("Could not establish an anonymous browser identity.");
    let challengeCookieValue: string | null = null;

    if (
      new Set(["youtube", "instagram", "facebook", "tiktok", "snapchat", "okru"]).has(input.sourcePlatform)
      && await mediaProviderChallengeRequired(identity.owner, identity.networkSubject)
    ) {
      const anonymousSecret = process.env.PULLVIO_ANONYMOUS_SECRET;
      if (!anonymousSecret) throw new Error("PULLVIO_ANONYMOUS_SECRET is not configured.");
      const ownerKey = identity.owner.kind === "user"
        ? identity.owner.userId
        : identity.owner.anonymousSubject;
      const hasChallengePass = readYoutubeChallengeCookieValue(
        anonymousSecret,
        ownerKey,
        request.cookies.get(YOUTUBE_CHALLENGE_COOKIE_NAME)?.value,
      );
      const token = rawBody && typeof rawBody === "object" && !Array.isArray(rawBody)
        ? (rawBody as Record<string, unknown>).turnstileToken
        : null;
      const remoteIp = (request.headers.get("x-vercel-forwarded-for")
        ?? request.headers.get("x-forwarded-for"))?.split(",", 1)[0]?.trim() ?? null;
      if (!hasChallengePass && !await verifyTurnstileToken(token, remoteIp)) {
        const response = jsonNoStore(
          {
            error: {
              code: "CHALLENGE_REQUIRED",
              message: "Complete the security check before submitting another media link.",
            },
            challengeRequired: true,
          },
          { status: 403 },
        );
        return attachAnonymousCookie(response, identity.anonymousCookieValue);
      }
      if (!hasChallengePass) {
        challengeCookieValue = createYoutubeChallengeCookieValue(anonymousSecret, ownerKey);
      }
    }

    const reservation = await reserveMediaJob(identity.owner, identity.networkSubject, input);
    if (reservation.resultCode !== "ACCEPTED" || !reservation.jobId) {
      const response = jsonNoStore(
        { error: { code: reservation.resultCode, message: decisionMessage(reservation.resultCode) } },
        { status: DECISION_STATUS[reservation.resultCode] ?? 400 },
      );
      return attachYoutubeChallengeCookie(
        attachAnonymousCookie(response, identity.anonymousCookieValue),
        challengeCookieValue,
      );
    }

    let cacheHit = false;
    let jobStatus = reservation.status;
    if (!reservation.duplicate && reservation.status !== "ready") {
      const started = await startDirectProviderJob(reservation.jobId, input);
      cacheHit = started.cacheHit;
      jobStatus = started.status;
    }

    const response = jsonNoStore(
      {
        job: {
          id: reservation.jobId,
          status: cacheHit ? "ready" : jobStatus,
          createdAt: reservation.createdAt,
          cacheHit,
        },
        quota: {
          authenticated: identity.owner.kind === "user",
          limit: reservation.quotaLimit,
          remaining: reservation.quotaRemaining,
        },
      },
      { status: 202 },
    );
    return attachYoutubeChallengeCookie(
      attachAnonymousCookie(response, identity.anonymousCookieValue),
      challengeCookieValue,
    );
  } catch (error) {
    return mediaErrorResponse(error);
  }
}

function decisionMessage(code: string) {
  switch (code) {
    case "SERVICE_DISABLED":
      return "Media processing is not accepting new jobs yet.";
    case "SOURCE_DISABLED":
      return "This media source is temporarily unavailable while its connection is being prepared.";
    case "QUOTA_EXCEEDED":
      return "You have used your five guest downloads in the last 24 hours. Sign in for normal unlimited use.";
    case "ACTIVE_JOB_LIMIT":
      return "Wait for your current media job to finish before starting another.";
    case "RATE_LIMITED":
      return "Too many requests were submitted. Wait a moment and try again.";
    default:
      return "The media job could not be accepted.";
  }
}
