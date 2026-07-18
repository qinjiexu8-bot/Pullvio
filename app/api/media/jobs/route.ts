import { NextRequest } from "next/server";
import { parseSubmitJobBody } from "@/lib/media/contracts";
import {
  assertSameOrigin,
  attachAnonymousCookie,
  jsonNoStore,
  mediaErrorResponse,
  readSmallJson,
  resolveMediaIdentity,
} from "@/lib/media/http";
import { dispatchMediaJob } from "@/lib/media/queue";
import {
  failUndispatchedMediaJob,
  markMediaJobDispatched,
  reserveMediaJob,
} from "@/lib/media/repository";

export const runtime = "nodejs";

const DECISION_STATUS: Record<string, number> = {
  SERVICE_DISABLED: 503,
  QUOTA_EXCEEDED: 429,
  ACTIVE_JOB_LIMIT: 429,
  RATE_LIMITED: 429,
  INVALID_OWNER: 400,
};

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const input = parseSubmitJobBody(await readSmallJson(request));
    const identity = await resolveMediaIdentity(request, { createAnonymous: true });
    if (!identity) throw new Error("Could not establish an anonymous browser identity.");

    const reservation = await reserveMediaJob(identity.owner, identity.networkSubject, input);
    if (reservation.resultCode !== "ACCEPTED" || !reservation.jobId) {
      const response = jsonNoStore(
        { error: { code: reservation.resultCode, message: decisionMessage(reservation.resultCode) } },
        { status: DECISION_STATUS[reservation.resultCode] ?? 400 },
      );
      return attachAnonymousCookie(response, identity.anonymousCookieValue);
    }

    if (!reservation.duplicate) {
      try {
        await dispatchMediaJob(reservation.jobId);
        await markMediaJobDispatched(reservation.jobId);
      } catch {
        await failUndispatchedMediaJob(reservation.jobId).catch(() => false);
        const response = jsonNoStore(
          { error: { code: "QUEUE_UNAVAILABLE", message: "The processing queue is temporarily unavailable." } },
          { status: 503 },
        );
        return attachAnonymousCookie(response, identity.anonymousCookieValue);
      }
    }

    const response = jsonNoStore(
      {
        job: {
          id: reservation.jobId,
          status: reservation.status,
          createdAt: reservation.createdAt,
        },
        quota: {
          authenticated: identity.owner.kind === "user",
          limit: reservation.quotaLimit,
          remaining: reservation.quotaRemaining,
        },
      },
      { status: 202 },
    );
    return attachAnonymousCookie(response, identity.anonymousCookieValue);
  } catch (error) {
    return mediaErrorResponse(error);
  }
}

function decisionMessage(code: string) {
  switch (code) {
    case "SERVICE_DISABLED":
      return "Media processing is not accepting new jobs yet.";
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
