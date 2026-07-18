import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  ANONYMOUS_COOKIE_NAME,
  createAnonymousCookieValue,
  deriveAnonymousSubject,
  deriveNetworkSubject,
  readAnonymousCookieValue,
} from "./identity";
import type { MediaOwner } from "./repository";

const MAX_REQUEST_BYTES = 8192;

export class MediaHttpError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "MediaHttpError";
  }
}

export function jsonNoStore(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}

export function assertSameOrigin(request: NextRequest) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    throw new MediaHttpError("INVALID_ORIGIN", 403, "Cross-site media requests are not allowed.");
  }
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    throw new MediaHttpError("INVALID_ORIGIN", 403, "Cross-site media requests are not allowed.");
  }
}

export async function readSmallJson(request: NextRequest) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim();
  if (contentType !== "application/json") {
    throw new MediaHttpError("UNSUPPORTED_MEDIA_TYPE", 415, "Use application/json.");
  }
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    throw new MediaHttpError("REQUEST_TOO_LARGE", 413, "The request is too large.");
  }
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > MAX_REQUEST_BYTES) {
    throw new MediaHttpError("REQUEST_TOO_LARGE", 413, "The request is too large.");
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new MediaHttpError("INVALID_JSON", 400, "The request body is not valid JSON.");
  }
}

type RequestIdentity = {
  owner: MediaOwner;
  networkSubject: string | null;
  anonymousCookieValue: string | null;
};

export async function resolveMediaIdentity(
  request: NextRequest,
  options: { createAnonymous: boolean },
): Promise<RequestIdentity | null> {
  const { userId } = await auth();
  const secret = process.env.PULLVIO_ANONYMOUS_SECRET;
  if (!secret) throw new Error("PULLVIO_ANONYMOUS_SECRET is not configured.");

  const networkSubject = deriveNetworkSubject(
    secret,
    request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for") ?? undefined,
  );
  if (userId) return { owner: { kind: "user", userId }, networkSubject, anonymousCookieValue: null };

  let browserId = readAnonymousCookieValue(secret, request.cookies.get(ANONYMOUS_COOKIE_NAME)?.value);
  let anonymousCookieValue: string | null = null;
  if (!browserId && options.createAnonymous) {
    anonymousCookieValue = createAnonymousCookieValue(secret);
    browserId = readAnonymousCookieValue(secret, anonymousCookieValue);
  }
  if (!browserId) return null;

  return {
    owner: { kind: "anonymous", anonymousSubject: deriveAnonymousSubject(secret, browserId) },
    networkSubject,
    anonymousCookieValue,
  };
}

export function attachAnonymousCookie(response: NextResponse, value: string | null) {
  if (!value) return response;
  response.cookies.set(ANONYMOUS_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export function mediaErrorResponse(error: unknown) {
  if (error instanceof MediaHttpError) {
    return jsonNoStore({ error: { code: error.code, message: error.message } }, { status: error.status });
  }
  if (error && typeof error === "object" && "code" in error && "message" in error) {
    const candidate = error as { code: unknown; message: unknown };
    if (typeof candidate.code === "string" && typeof candidate.message === "string") {
      return jsonNoStore({ error: { code: candidate.code, message: candidate.message } }, { status: 400 });
    }
  }
  console.error("Media API request failed", error instanceof Error ? error.message : "Unknown error");
  return jsonNoStore(
    { error: { code: "INTERNAL_ERROR", message: "The media service is temporarily unavailable." } },
    { status: 500 },
  );
}
