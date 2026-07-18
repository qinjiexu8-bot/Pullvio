import {
  MediaInputError,
  normalizeSourceUrl,
  type SourcePlatform,
} from "./source-url";

export { MediaInputError } from "./source-url";

export type MediaKind = "video" | "audio";
export type MediaFormat = "mp4" | "mp3";

export type SubmitJobInput = {
  sourceUrl: string;
  sourceHost: string;
  sourcePlatform: SourcePlatform;
  mediaKind: MediaKind;
  format: MediaFormat;
  quality: string;
  idempotencyKey: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const QUALITIES = new Set(["best", "2160p", "1440p", "1080p", "720p", "480p"]);

export function parseSubmitJobBody(value: unknown): SubmitJobInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new MediaInputError("INVALID_REQUEST", "The request body is invalid.");
  }

  const body = value as Record<string, unknown>;
  const mediaKind = body.mediaKind ?? "video";
  if (mediaKind !== "video" && mediaKind !== "audio") {
    throw new MediaInputError("INVALID_REQUEST", "Choose video or audio.");
  }

  const format = body.format ?? (mediaKind === "audio" ? "mp3" : "mp4");
  if (format !== "mp4" && format !== "mp3") {
    throw new MediaInputError("INVALID_REQUEST", "Choose MP4 or MP3.");
  }
  if ((mediaKind === "video" && format !== "mp4") || (mediaKind === "audio" && format !== "mp3")) {
    throw new MediaInputError("INVALID_REQUEST", "The requested media format does not match the selected media type.");
  }

  const quality = body.quality ?? "best";
  if (typeof quality !== "string" || !QUALITIES.has(quality)) {
    throw new MediaInputError("INVALID_REQUEST", "The requested quality is not supported.");
  }

  if (typeof body.idempotencyKey !== "string" || !UUID_PATTERN.test(body.idempotencyKey)) {
    throw new MediaInputError("INVALID_REQUEST", "A valid idempotency key is required.");
  }

  const source = normalizeSourceUrl(typeof body.sourceUrl === "string" ? body.sourceUrl : "");
  if (source.platform === "soundcloud" && mediaKind !== "audio") {
    throw new MediaInputError(
      "AUDIO_ONLY_SOURCE",
      "SoundCloud links are supported in Audio mode only.",
    );
  }
  return {
    sourceUrl: source.url,
    sourceHost: source.host,
    sourcePlatform: source.platform,
    mediaKind,
    format,
    quality,
    idempotencyKey: body.idempotencyKey.toLowerCase(),
  };
}
