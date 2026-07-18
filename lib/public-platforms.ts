export const publicPlatforms = [
  { platform: "TikTok", slug: "tiktok-video-downloader", media: "video" },
  { platform: "Vimeo", slug: "vimeo-video-downloader", media: "video" },
  { platform: "SoundCloud", slug: "soundcloud-downloader", media: "audio" },
  { platform: "Pinterest", slug: "pinterest-video-downloader", media: "video" },
  { platform: "Twitch Clips", slug: "twitch-clip-downloader", media: "video" },
  { platform: "Dailymotion", slug: "dailymotion-video-downloader", media: "video" },
  { platform: "Streamable", slug: "streamable-video-downloader", media: "video" },
  { platform: "Snapchat", slug: "snapchat-video-downloader", media: "video" },
  { platform: "Imgur", slug: "imgur-video-downloader", media: "video" },
  { platform: "Loom", slug: "loom-video-downloader", media: "video" },
  { platform: "Dropbox", slug: "dropbox-video-downloader", media: "video" },
] as const;

export type PublicPlatform = (typeof publicPlatforms)[number];
