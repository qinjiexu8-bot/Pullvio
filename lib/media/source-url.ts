export type SourcePlatform = "youtube" | "tiktok" | "vimeo" | "soundcloud";

export class MediaInputError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "MediaInputError";
    this.code = code;
  }
}

const SOURCE_HOSTS: Readonly<Record<string, SourcePlatform>> = {
  "youtube.com": "youtube",
  "www.youtube.com": "youtube",
  "m.youtube.com": "youtube",
  "music.youtube.com": "youtube",
  "youtu.be": "youtube",
  "tiktok.com": "tiktok",
  "www.tiktok.com": "tiktok",
  "m.tiktok.com": "tiktok",
  "vm.tiktok.com": "tiktok",
  "vt.tiktok.com": "tiktok",
  "vimeo.com": "vimeo",
  "www.vimeo.com": "vimeo",
  "player.vimeo.com": "vimeo",
  "soundcloud.com": "soundcloud",
  "www.soundcloud.com": "soundcloud",
  "m.soundcloud.com": "soundcloud",
  "on.soundcloud.com": "soundcloud",
};

export type NormalizedSourceUrl = {
  url: string;
  host: string;
  platform: SourcePlatform;
};

export function normalizeSourceUrl(input: string): NormalizedSourceUrl {
  if (typeof input !== "string" || input.length < 8 || input.length > 4096) {
    throw new MediaInputError("INVALID_URL", "Enter a valid media URL.");
  }

  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    throw new MediaInputError("INVALID_URL", "Enter a valid media URL.");
  }

  if (parsed.protocol !== "https:") {
    throw new MediaInputError("INVALID_URL", "Only HTTPS media URLs are supported.");
  }
  if (parsed.username || parsed.password || parsed.port) {
    throw new MediaInputError("INVALID_URL", "The media URL contains unsupported credentials or a port.");
  }

  const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
  const platform = SOURCE_HOSTS[host];
  if (!platform) {
    throw new MediaInputError("UNSUPPORTED_SOURCE", "This media source is not supported yet.");
  }

  if (parsed.pathname.length > 2048 || parsed.search.length > 2048) {
    throw new MediaInputError("INVALID_URL", "The media URL is too long.");
  }

  assertSingleMediaPath(parsed, platform);

  parsed.hostname = host;
  parsed.hash = "";

  return { url: parsed.toString(), host, platform };
}

function assertSingleMediaPath(parsed: URL, platform: SourcePlatform) {
  const segments = parsed.pathname.split("/").filter(Boolean);
  if (platform === "vimeo") {
    const isPublicVideo = parsed.hostname === "player.vimeo.com"
      ? segments.length === 2 && segments[0] === "video" && /^\d+$/.test(segments[1])
      : segments.length === 1 && /^\d+$/.test(segments[0]);
    if (!isPublicVideo) {
      throw new MediaInputError("INVALID_URL", "Enter a public Vimeo video URL.");
    }
  }

  if (platform === "soundcloud") {
    const isShortLink = parsed.hostname === "on.soundcloud.com" && segments.length === 1;
    const isPublicTrack = segments.length === 2 && !new Set([
      "discover",
      "popular",
      "search",
      "sets",
      "stream",
      "you",
    ]).has(segments[0]);
    if (!isShortLink && !isPublicTrack) {
      throw new MediaInputError("INVALID_URL", "Enter a public SoundCloud track URL.");
    }
  }
}
