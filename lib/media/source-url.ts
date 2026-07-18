export type SourcePlatform =
  | "youtube"
  | "tiktok"
  | "vimeo"
  | "soundcloud"
  | "bilibili"
  | "pinterest"
  | "twitch"
  | "dailymotion"
  | "streamable"
  | "snapchat"
  | "imgur"
  | "loom"
  | "dropbox";

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
  "bilibili.com": "bilibili",
  "www.bilibili.com": "bilibili",
  "pinterest.com": "pinterest",
  "www.pinterest.com": "pinterest",
  "clips.twitch.tv": "twitch",
  "twitch.tv": "twitch",
  "www.twitch.tv": "twitch",
  "dailymotion.com": "dailymotion",
  "www.dailymotion.com": "dailymotion",
  "dai.ly": "dailymotion",
  "streamable.com": "streamable",
  "www.streamable.com": "streamable",
  "snapchat.com": "snapchat",
  "www.snapchat.com": "snapchat",
  "imgur.com": "imgur",
  "www.imgur.com": "imgur",
  "i.imgur.com": "imgur",
  "loom.com": "loom",
  "www.loom.com": "loom",
  "dropbox.com": "dropbox",
  "www.dropbox.com": "dropbox",
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

  if (platform === "bilibili") {
    const videoId = segments[1] ?? "";
    const isSinglePublicVideo = segments.length === 2
      && segments[0] === "video"
      && (/^BV[0-9A-Za-z]{10}$/.test(videoId) || /^av\d+$/i.test(videoId));
    if (!isSinglePublicVideo) {
      throw new MediaInputError("INVALID_URL", "Enter a public Bilibili video URL.");
    }
  }

  if (platform === "pinterest") {
    if (segments.length !== 2 || segments[0] !== "pin" || !/^\d+$/.test(segments[1])) {
      throw new MediaInputError("INVALID_URL", "Enter a public Pinterest video Pin URL.");
    }
  }

  if (platform === "twitch") {
    const isClipHost = parsed.hostname === "clips.twitch.tv"
      && segments.length === 1
      && /^[\w-]+$/.test(segments[0]);
    const isChannelClip = segments.length === 3
      && segments[1] === "clip"
      && /^[\w-]+$/.test(segments[0])
      && /^[\w-]+$/.test(segments[2]);
    if (!isClipHost && !isChannelClip) {
      throw new MediaInputError("INVALID_URL", "Enter a public Twitch Clip URL.");
    }
  }

  if (platform === "dailymotion") {
    const isShortLink = parsed.hostname === "dai.ly"
      && segments.length === 1
      && /^[\w-]+$/.test(segments[0]);
    const isVideoPage = segments.length === 2
      && segments[0] === "video"
      && /^[\w-]+$/.test(segments[1]);
    if (!isShortLink && !isVideoPage) {
      throw new MediaInputError("INVALID_URL", "Enter a public Dailymotion video URL.");
    }
  }

  if (platform === "streamable") {
    if (segments.length !== 1 || !/^[A-Za-z0-9]+$/.test(segments[0])) {
      throw new MediaInputError("INVALID_URL", "Enter a public Streamable video URL.");
    }
  }

  if (platform === "snapchat") {
    if (segments.length !== 2 || segments[0] !== "spotlight" || !/^[\w-]+$/.test(segments[1])) {
      throw new MediaInputError("INVALID_URL", "Enter a public Snapchat Spotlight URL.");
    }
  }

  if (platform === "imgur") {
    const isDirectVideo = segments.length === 1
      && /^[A-Za-z0-9]{5,12}(?:\.(?:mp4|gifv))?$/.test(segments[0]);
    if (!isDirectVideo) {
      throw new MediaInputError("INVALID_URL", "Enter a single public Imgur video or GIFV URL.");
    }
  }

  if (platform === "loom") {
    if (segments.length !== 2 || segments[0] !== "share" || !/^[a-f0-9]{32}$/i.test(segments[1])) {
      throw new MediaInputError("INVALID_URL", "Enter a public Loom share URL.");
    }
  }

  if (platform === "dropbox") {
    const isLegacyShare = segments.length >= 2 && segments[0] === "s" && /^[\w-]+$/.test(segments[1]);
    const isFileShare = segments.length >= 3
      && segments[0] === "scl"
      && segments[1] === "fi"
      && /^[\w-]+$/.test(segments[2]);
    if (!isLegacyShare && !isFileShare) {
      throw new MediaInputError("INVALID_URL", "Enter a public Dropbox video share URL.");
    }
  }
}
