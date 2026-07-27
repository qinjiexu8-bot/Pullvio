import "server-only";
import type { Json } from "@/lib/database.types";
import type { SubmitJobInput } from "./contracts";

const DEFAULT_API_BASE = "https://developers.visolix.com/api";
const PROVIDER_TIMEOUT_MS = 30_000;
const YOUTUBE_VIDEO_FORMATS = new Set(["360", "480", "720", "1080", "1440", "2160"]);
const VISOLIX_PLATFORMS = new Set([
  "youtube",
  "instagram",
  "facebook",
  "tiktok",
  "snapchat",
  "okru",
]);

export class VisolixError extends Error {
  readonly code: string;
  readonly httpStatus: number | null;
  readonly outcomeKnown: boolean;
  readonly diagnostics: Json;

  constructor(
    code: string,
    message: string,
    options: {
      httpStatus?: number | null;
      outcomeKnown?: boolean;
      diagnostics?: Json;
    } = {},
  ) {
    super(message);
    this.name = "VisolixError";
    this.code = code;
    this.httpStatus = options.httpStatus ?? null;
    this.outcomeKnown = options.outcomeKnown ?? true;
    this.diagnostics = options.diagnostics ?? {};
  }
}

export type VisolixSubmission = {
  providerJobId: string | null;
  downloadUrl: string | null;
  info: Json;
};

export type VisolixProgress = {
  progress: number;
  downloadUrl: string | null;
  text: string | null;
  info: Json;
};

export function providerFormatFor(input: SubmitJobInput) {
  if (!VISOLIX_PLATFORMS.has(input.sourcePlatform)) {
    throw new VisolixError("UNSUPPORTED_SOURCE", "This media source is not supported.");
  }
  if (input.sourcePlatform !== "youtube") {
    if (input.mediaKind !== "video") {
      throw new VisolixError(
        "AUDIO_UNAVAILABLE",
        "Audio output is currently available for YouTube links only.",
      );
    }
    return "source";
  }
  if (input.mediaKind === "audio") return "mp3";
  const format = input.quality === "best" ? "1080" : input.quality.replace(/p$/, "");
  if (!YOUTUBE_VIDEO_FORMATS.has(format)) {
    throw new VisolixError("INVALID_OPTIONS", "This YouTube quality is not supported.");
  }
  return format;
}

export class VisolixClient {
  private readonly apiKey: string;
  private readonly apiBase: string;

  constructor(apiKey = process.env.VISOLIX_API_KEY, apiBase = process.env.VISOLIX_API_BASE_URL) {
    if (!apiKey || apiKey.length > 500) {
      throw new VisolixError("PROVIDER_NOT_CONFIGURED", "The media provider is not configured.");
    }
    this.apiKey = apiKey;
    this.apiBase = validateApiBase(apiBase || DEFAULT_API_BASE);
  }

  async submit(input: SubmitJobInput): Promise<VisolixSubmission> {
    const providerFormat = providerFormatFor(input);
    const headers: Record<string, string> = {
      "X-API-KEY": this.apiKey,
      "X-PLATFORM": input.sourcePlatform,
      URL: input.sourceUrl,
      "User-Agent": "pullvio-vercel/1",
    };
    if (input.sourcePlatform === "youtube") headers["X-FORMAT"] = providerFormat;

    const response = await this.request(`${this.apiBase}/download`, { headers }, true);
    const payload = await jsonObject(response);
    const success = payload.success;
    const providerJobId = normalizeProviderJobId(payload.id);
    const preferredMediaKeys = input.sourcePlatform === "youtube"
      ? input.mediaKind === "audio"
        ? ["mp3"]
        : [providerFormat, `${providerFormat}p`, "hd", "sd"]
      : ["hd", "sd"];
    const synchronousUrl = extractSynchronousUrl(payload.media, preferredMediaKeys);
    if (synchronousUrl) {
      return {
        providerJobId: null,
        downloadUrl: synchronousUrl,
        info: safeInfo(payload),
      };
    }
    if (success === false || success === 0 || success === "0" || success === "false") {
      throw new VisolixError("PROVIDER_REJECTED", "The provider rejected this media.", {
        httpStatus: response.status,
      });
    }
    if (
      !isSuccessfulFlag(success)
      || !providerJobId
    ) {
      throw new VisolixError("PROVIDER_RESPONSE_INVALID", "The provider returned an invalid response.", {
        httpStatus: response.status,
        outcomeKnown: false,
        diagnostics: responseShape(payload),
      });
    }
    return {
      providerJobId,
      downloadUrl: null,
      info: safeInfo(payload.info),
    };
  }

  async progress(providerJobId: string): Promise<VisolixProgress> {
    if (!providerJobId || providerJobId.length > 500) {
      throw new VisolixError("PROVIDER_STATE_INVALID", "The provider job ID is invalid.");
    }
    const endpoint = new URL(`${this.apiBase}/progress`);
    endpoint.searchParams.set("id", providerJobId);
    const response = await this.request(endpoint.toString(), {
      headers: {
        "X-API-KEY": this.apiKey,
        "User-Agent": "pullvio-vercel/1",
      },
    });
    const payload = await jsonObject(response);
    const progress = payload.progress ?? 0;
    const success = payload.success;
    if (!Number.isInteger(progress) || Number(progress) < 0 || Number(progress) > 1000) {
      throw new VisolixError("PROVIDER_RESPONSE_INVALID", "The provider returned invalid progress.");
    }
    if (![0, 1, false, true].includes(success as boolean | number)) {
      throw new VisolixError("PROVIDER_RESPONSE_INVALID", "The provider returned an invalid status.");
    }

    const rawUrl = payload.download_url === "" ? null : payload.download_url;
    if (rawUrl !== null && rawUrl !== undefined && typeof rawUrl !== "string") {
      throw new VisolixError("PROVIDER_RESPONSE_INVALID", "The provider returned an invalid download URL.");
    }
    const downloadUrl = rawUrl ? validateResultUrl(rawUrl) : null;
    if ((success === 1 || success === true) && !downloadUrl) {
      throw new VisolixError("PROVIDER_RESPONSE_INVALID", "The completed provider job has no result URL.");
    }
    return {
      progress: Number(progress),
      downloadUrl,
      text: typeof payload.text === "string" ? payload.text.slice(0, 300) : null,
      info: safeInfo(payload.info),
    };
  }

  private async request(url: string, init: RequestInit, submission = false) {
    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        cache: "no-store",
        signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      });
    } catch {
      throw new VisolixError(
        submission ? "PROVIDER_SUBMISSION_AMBIGUOUS" : "PROVIDER_UNAVAILABLE",
        submission
          ? "The provider submission outcome is unknown."
          : "The provider is temporarily unavailable.",
        { outcomeKnown: !submission },
      );
    }

    if (response.ok) return response;
    if (response.status === 402) {
      throw new VisolixError(
        "PROVIDER_BALANCE_EXHAUSTED",
        "Media downloads are temporarily unavailable.",
        { httpStatus: 402 },
      );
    }
    if (response.status === 400) {
      throw new VisolixError("PROVIDER_REJECTED", "The provider rejected this media.", {
        httpStatus: 400,
      });
    }
    if (response.status === 401 || response.status === 403) {
      throw new VisolixError("PROVIDER_AUTH_FAILED", "The provider authentication failed.", {
        httpStatus: response.status,
      });
    }
    throw new VisolixError("PROVIDER_UNAVAILABLE", "The provider is temporarily unavailable.", {
      httpStatus: response.status,
      outcomeKnown: !submission,
    });
  }
}

function isSuccessfulFlag(value: unknown) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function normalizeProviderJobId(value: unknown) {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length >= 1 && normalized.length <= 500 ? normalized : null;
  }
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) {
    return String(value);
  }
  return null;
}

function extractSynchronousUrl(value: unknown, preferredKeys: string[] = []): string | null {
  if (typeof value === "string" && value) return validateResultUrl(value);
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 20)) {
      const candidate = extractSynchronousUrl(item, preferredKeys);
      if (candidate) return candidate;
    }
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const object = value as Record<string, unknown>;
  for (const key of [
    ...preferredKeys,
    "url",
    "download_url",
    "downloadUrl",
    "video_url",
    "videoUrl",
    "file",
    "link",
    "media",
  ]) {
    const candidate = object[key];
    const resolved = extractSynchronousUrl(candidate);
    if (resolved) return resolved;
  }
  return null;
}

function responseShape(payload: Record<string, unknown>): Json {
  const shape: Record<string, Json> = {
    keys: Object.keys(payload).slice(0, 20),
    successType: typeof payload.success,
    idType: Array.isArray(payload.id) ? "array" : typeof payload.id,
    statusType: typeof payload.status,
    statusValue: ["string", "number", "boolean"].includes(typeof payload.status)
      ? String(payload.status).slice(0, 50)
      : null,
  };
  for (const key of ["data", "result", "media"]) {
    const value = payload[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      shape[`${key}Keys`] = Object.keys(value as Record<string, unknown>).slice(0, 20);
    } else if (Array.isArray(value)) {
      shape[`${key}Type`] = "array";
      const first = value[0];
      if (first && typeof first === "object" && !Array.isArray(first)) {
        shape[`${key}ItemKeys`] = Object.keys(first as Record<string, unknown>).slice(0, 20);
      } else {
        shape[`${key}ItemType`] = typeof first;
      }
    } else {
      shape[`${key}Type`] = Array.isArray(value) ? "array" : typeof value;
    }
  }
  return shape;
}

function validateApiBase(value: string) {
  const parsed = new URL(value);
  if (
    parsed.protocol !== "https:"
    || parsed.hostname !== "developers.visolix.com"
    || parsed.username
    || parsed.password
  ) {
    throw new VisolixError("PROVIDER_NOT_CONFIGURED", "The provider API base URL is invalid.");
  }
  return parsed.toString().replace(/\/$/, "");
}

function validateResultUrl(value: string) {
  if (value.length > 4096) {
    throw new VisolixError("PROVIDER_RESPONSE_INVALID", "The provider result URL is too long.");
  }
  const parsed = new URL(value);
  if (parsed.protocol !== "https:" || !parsed.hostname || isPrivateHostname(parsed.hostname)) {
    throw new VisolixError("PROVIDER_RESPONSE_INVALID", "The provider result URL is not public HTTPS.");
  }
  return parsed.toString();
}

function isPrivateHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/\.$/, "");
  if (
    normalized === "localhost"
    || normalized === "::1"
    || normalized === "[::1]"
    || normalized.endsWith(".local")
  ) return true;
  if (
    /^0\./.test(normalized)
    || /^127\./.test(normalized)
    || /^10\./.test(normalized)
    || /^169\.254\./.test(normalized)
    || /^192\.168\./.test(normalized)
  ) return true;
  const match = normalized.match(/^172\.(\d{1,3})\./);
  return Boolean(match && Number(match[1]) >= 16 && Number(match[1]) <= 31);
}

async function jsonObject(response: Response): Promise<Record<string, unknown>> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new VisolixError("PROVIDER_RESPONSE_INVALID", "The provider returned invalid JSON.", {
      httpStatus: response.status,
      outcomeKnown: false,
    });
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new VisolixError("PROVIDER_RESPONSE_INVALID", "The provider returned invalid JSON.", {
      httpStatus: response.status,
      outcomeKnown: false,
    });
  }
  return payload as Record<string, unknown>;
}

function safeInfo(value: unknown): Json {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const input = value as Record<string, unknown>;
  const output: Record<string, Json> = {};
  for (const key of ["title", "thumbnail", "duration", "author", "platform"]) {
    const item = input[key];
    if (typeof item === "string") output[key] = item.slice(0, key === "thumbnail" ? 2048 : 500);
    else if (typeof item === "number" && Number.isFinite(item)) output[key] = item;
  }
  if (!output.thumbnail && typeof input.thumb === "string") {
    output.thumbnail = input.thumb.slice(0, 2048);
  }
  if (!output.platform && typeof input.service === "string") {
    output.platform = input.service.slice(0, 500);
  }
  return output;
}
