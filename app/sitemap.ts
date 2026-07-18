import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog";
import { guides } from "@/lib/guides";
import { publicPlatforms } from "@/lib/public-platforms";

const baseUrl = "https://pullvio.com";
const lastModified = new Date("2026-07-18");

export default function sitemap(): MetadataRoute.Sitemap {
  const homeLanguages = { en: `${baseUrl}/`, "zh-CN": `${baseUrl}/zh-cn`, es: `${baseUrl}/es`, "x-default": `${baseUrl}/` };
  const homes: MetadataRoute.Sitemap = ["", "/zh-cn", "/es"].map((path) => ({ url: `${baseUrl}${path || "/"}`, lastModified, changeFrequency: "weekly", priority: 1, alternates: { languages: homeLanguages } }));
  const localizedPaths = ["/about", ...publicPlatforms.map(({ slug }) => `/${slug}`), "/guides", ...guides.map(({ slug }) => `/guides/${slug}`), "/blog", ...blogPosts.map(({ slug }) => `/blog/${slug}`)];
  const localizedPages: MetadataRoute.Sitemap = localizedPaths.flatMap((path) => {
    const languages = { en: `${baseUrl}${path}`, "zh-CN": `${baseUrl}/zh-cn${path}`, es: `${baseUrl}/es${path}`, "x-default": `${baseUrl}${path}` };
    const blogPost = path.startsWith("/blog/") ? blogPosts.find(({ slug }) => path === `/blog/${slug}`) : undefined;
    return ["", "/zh-cn", "/es"].map((locale) => ({
      url: `${baseUrl}${locale}${path}`,
      lastModified: blogPost ? new Date(blogPost.modified ?? blogPost.published) : lastModified,
      changeFrequency: path === "/about" ? "yearly" as const : path === "/blog" || path.includes("downloader") ? "weekly" as const : "monthly" as const,
      priority: path.includes("downloader") ? 0.9 : path === "/guides" || path === "/blog" ? 0.8 : path === "/about" ? 0.4 : 0.75,
      alternates: { languages },
    }));
  });
  const fixedPages = ["/contact", "/privacy", "/terms", "/copyright", "/acceptable-use"];
  const contentPages: MetadataRoute.Sitemap = fixedPages.flatMap((path) => {
    const languages = { en: `${baseUrl}${path}`, "zh-CN": `${baseUrl}/zh-cn${path}`, es: `${baseUrl}/es${path}`, "x-default": `${baseUrl}${path}` };
    return ["", "/zh-cn", "/es"].map((locale) => ({ url: `${baseUrl}${locale}${path}`, lastModified, changeFrequency: "yearly" as const, priority: 0.4, alternates: { languages } }));
  });
  return [...homes, ...localizedPages, ...contentPages];
}
