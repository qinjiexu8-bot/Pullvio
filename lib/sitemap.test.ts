import { describe, expect, it } from "vitest";
import { buildSitemap } from "./sitemap";
import { blogPosts } from "./blog";
import { publicPlatforms } from "./public-platforms";

describe("buildSitemap", () => {
  const sitemap = buildSitemap();

  it("includes every public platform in every supported locale", () => {
    const urls = new Set(sitemap.map(({ url }) => url));
    for (const { slug } of publicPlatforms) {
      expect(urls.has(`https://pullvio.com/${slug}`)).toBe(true);
      expect(urls.has(`https://pullvio.com/zh-cn/${slug}`)).toBe(true);
      expect(urls.has(`https://pullvio.com/es/${slug}`)).toBe(true);
    }
  });

  it("provides complete language alternates", () => {
    const youtube = sitemap.find(({ url }) => url === "https://pullvio.com/youtube-video-downloader");
    expect(youtube?.alternates?.languages).toEqual({
      en: "https://pullvio.com/youtube-video-downloader",
      "zh-CN": "https://pullvio.com/zh-cn/youtube-video-downloader",
      es: "https://pullvio.com/es/youtube-video-downloader",
      "x-default": "https://pullvio.com/youtube-video-downloader",
    });
  });

  it("uses canonical locale home URLs without redirecting trailing slashes", () => {
    const urls = new Set(sitemap.map(({ url }) => url));
    expect(urls.has("https://pullvio.com/zh-cn")).toBe(true);
    expect(urls.has("https://pullvio.com/es")).toBe(true);
    expect(urls.has("https://pullvio.com/zh-cn/")).toBe(false);
    expect(urls.has("https://pullvio.com/es/")).toBe(false);
  });

  it("uses content dates only where a real modification date exists", () => {
    expect(sitemap.find(({ url }) => url === "https://pullvio.com/")?.lastModified).toBeUndefined();

    const post = blogPosts[0];
    const entry = sitemap.find(({ url }) => url === `https://pullvio.com/blog/${post.slug}`);
    expect(entry?.lastModified).toEqual(new Date(`${post.modified ?? post.published}T00:00:00.000Z`));
  });

  it("publishes the SoundCloud quality guide in every supported locale", () => {
    const slug = "soundcloud-mp3-quality-and-bitrate";
    const urls = new Set(sitemap.map(({ url }) => url));

    expect(urls.has(`https://pullvio.com/blog/${slug}`)).toBe(true);
    expect(urls.has(`https://pullvio.com/zh-cn/blog/${slug}`)).toBe(true);
    expect(urls.has(`https://pullvio.com/es/blog/${slug}`)).toBe(true);
  });

  it("does not emit ignored priority or change-frequency hints", () => {
    expect(sitemap.every((entry) => entry.priority === undefined)).toBe(true);
    expect(sitemap.every((entry) => entry.changeFrequency === undefined)).toBe(true);
  });
});
