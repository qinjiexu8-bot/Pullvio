import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";

const baseUrl = "https://pullvio.com";
const lastModified = new Date("2026-07-12");

export default function sitemap(): MetadataRoute.Sitemap {
  const homeLanguages = { en: `${baseUrl}/`, "zh-CN": `${baseUrl}/zh-cn`, es: `${baseUrl}/es`, "x-default": `${baseUrl}/` };
  const homes: MetadataRoute.Sitemap = ["", "/zh-cn", "/es"].map((path) => ({ url: `${baseUrl}${path || "/"}`, lastModified, changeFrequency: "weekly", priority: 1, alternates: { languages: homeLanguages } }));
  const localizedPaths = ["/about", "/guides", ...guides.map(({ slug }) => `/guides/${slug}`)];
  const localizedPages: MetadataRoute.Sitemap = localizedPaths.flatMap((path) => {
    const languages = { en: `${baseUrl}${path}`, "zh-CN": `${baseUrl}/zh-cn${path}`, es: `${baseUrl}/es${path}`, "x-default": `${baseUrl}${path}` };
    return ["", "/zh-cn", "/es"].map((locale) => ({
      url: `${baseUrl}${locale}${path}`,
      lastModified,
      changeFrequency: path === "/about" ? "yearly" as const : "monthly" as const,
      priority: path === "/guides" ? 0.8 : path === "/about" ? 0.4 : 0.75,
      alternates: { languages },
    }));
  });
  const fixedPages = ["/contact", "/privacy", "/terms", "/copyright", "/acceptable-use"];
  const contentPages: MetadataRoute.Sitemap = fixedPages.map((path) => ({ url: `${baseUrl}${path}`, lastModified, changeFrequency: "yearly", priority: 0.4 }));
  return [...homes, ...localizedPages, ...contentPages];
}
