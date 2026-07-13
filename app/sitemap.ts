import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";

const baseUrl = "https://pullvio.com";
const lastModified = new Date("2026-07-12");

export default function sitemap(): MetadataRoute.Sitemap {
  const homeLanguages = { en: `${baseUrl}/`, "zh-CN": `${baseUrl}/zh-cn`, es: `${baseUrl}/es`, "x-default": `${baseUrl}/` };
  const homes: MetadataRoute.Sitemap = ["", "/zh-cn", "/es"].map((path) => ({ url: `${baseUrl}${path || "/"}`, lastModified, changeFrequency: "weekly", priority: 1, alternates: { languages: homeLanguages } }));
  const fixedPages = ["/about", "/contact", "/privacy", "/terms", "/copyright", "/acceptable-use", "/guides"];
  const contentPages: MetadataRoute.Sitemap = fixedPages.map((path) => ({ url: `${baseUrl}${path}`, lastModified, changeFrequency: path === "/guides" ? "monthly" : "yearly", priority: path === "/guides" ? 0.8 : 0.4 }));
  const guidePages: MetadataRoute.Sitemap = guides.map(({ slug }) => ({ url: `${baseUrl}/guides/${slug}`, lastModified, changeFrequency: "monthly", priority: 0.75 }));
  return [...homes, ...contentPages, ...guidePages];
}
