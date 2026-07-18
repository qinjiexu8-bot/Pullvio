export type SourcePlatform = "youtube" | "tiktok";

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

  parsed.hostname = host;
  parsed.hash = "";

  return { url: parsed.toString(), host, platform };
}
