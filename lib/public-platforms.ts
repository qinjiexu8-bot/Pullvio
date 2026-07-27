export const publicPlatforms = [
  { platform: "YouTube", slug: "youtube-video-downloader", media: "video" },
  { platform: "Instagram", slug: "instagram-video-downloader", media: "video" },
  { platform: "Facebook", slug: "facebook-video-downloader", media: "video" },
  { platform: "TikTok", slug: "tiktok-video-downloader", media: "video" },
  { platform: "Snapchat", slug: "snapchat-video-downloader", media: "video" },
  { platform: "OK.ru", slug: "okru-video-downloader", media: "video" },
] as const;

export type PublicPlatform = (typeof publicPlatforms)[number];
