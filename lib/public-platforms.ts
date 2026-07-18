export const publicPlatforms = [
  { platform: "TikTok", slug: "tiktok-video-downloader", media: "video" },
  { platform: "Vimeo", slug: "vimeo-video-downloader", media: "video" },
  { platform: "SoundCloud", slug: "soundcloud-downloader", media: "audio" },
] as const;

export type PublicPlatform = (typeof publicPlatforms)[number];
