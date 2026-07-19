import type { MetadataRoute } from "next";
import { blogPosts } from "./blog";
import { guides } from "./guides";
import { publicPlatforms } from "./public-platforms";

const baseUrl = "https://pullvio.com";
const localePrefixes = ["", "/zh-cn", "/es"] as const;

function languageAlternates(path: string) {
  return {
    en: `${baseUrl}${path || "/"}`,
    "zh-CN": `${baseUrl}/zh-cn${path}`,
    es: `${baseUrl}/es${path}`,
    "x-default": `${baseUrl}${path || "/"}`,
  };
}

function localizedEntries(path: string, lastModified?: Date): MetadataRoute.Sitemap {
  const alternates = { languages: languageAlternates(path) };
  return localePrefixes.map((locale) => ({
    url: path ? `${baseUrl}${locale}${path}` : locale ? `${baseUrl}${locale}` : `${baseUrl}/`,
    ...(lastModified ? { lastModified } : {}),
    alternates,
  }));
}

export function buildSitemap(): MetadataRoute.Sitemap {
  const evergreenPaths = [
    "",
    "/about",
    ...publicPlatforms.map(({ slug }) => `/${slug}`),
    "/guides",
    ...guides.map(({ slug }) => `/guides/${slug}`),
    "/blog",
    "/contact",
    "/privacy",
    "/terms",
    "/copyright",
    "/acceptable-use",
  ];

  const evergreenEntries = evergreenPaths.flatMap((path) => localizedEntries(path));
  const blogEntries = blogPosts.flatMap((post) =>
    localizedEntries(
      `/blog/${post.slug}`,
      new Date(`${post.modified ?? post.published}T00:00:00.000Z`),
    ),
  );

  return [...evergreenEntries, ...blogEntries];
}
