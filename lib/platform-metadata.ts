import type { Metadata } from "next";
import { localePath, type Locale } from "./i18n";
import { getPlatformTool, type PlatformSlug } from "./platform-tools";

export function platformMetadata(slug: PlatformSlug, locale: Locale): Metadata {
  const { platform, content } = getPlatformTool(slug, locale);
  const canonical = localePath(locale, `/${slug}`);
  const languages = {
    en: `/${slug}`,
    "zh-CN": `/zh-cn/${slug}`,
    es: `/es/${slug}`,
    "x-default": `/${slug}`,
  };

  return {
    title: content.title,
    description: content.description,
    keywords: content.keywords,
    alternates: { canonical, languages },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "Pullvio",
      title: content.title,
      description: content.description,
      locale: locale === "zh-cn" ? "zh_CN" : locale === "es" ? "es_ES" : "en_US",
    },
    twitter: { card: "summary_large_image", title: content.title, description: content.description },
    robots: { index: true, follow: true },
    category: `${platform} ${platform === "SoundCloud" ? "audio" : "video"} downloader`,
  };
}
