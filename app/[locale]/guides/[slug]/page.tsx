import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContentPage from "../../../components/content-page";
import { localePath, localizedContent, type LocalizedLocale } from "@/lib/i18n";
import { getLocalizedGuide, localizedGuides } from "@/lib/localized-pages";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!(locale in localizedContent)) return {};
  const language = locale as LocalizedLocale;
  const guide = getLocalizedGuide(language, slug);
  if (!guide) return {};
  return {
    title: `${guide.title} | Pullvio`,
    description: guide.description,
    alternates: {
      canonical: localePath(language, `/guides/${slug}`),
      languages: { en: `/guides/${slug}`, "zh-CN": `/zh-cn/guides/${slug}`, es: `/es/guides/${slug}`, "x-default": `/guides/${slug}` },
    },
    openGraph: { type: "article", title: guide.title, description: guide.description },
  };
}

export default async function LocalizedGuidePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!(locale in localizedContent)) notFound();
  const language = locale as LocalizedLocale;
  const guide = getLocalizedGuide(language, slug);
  if (!guide) notFound();
  const related = localizedGuides[language].filter((item) => item.slug !== slug).map((item) => [item.title, localePath(language, `/guides/${item.slug}`)] as [string, string]);
  const base = "https://pullvio.com";
  const guideUrl = `${base}${localePath(language, `/guides/${slug}`)}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", headline: guide.title, description: guide.description, inLanguage: language === "zh-cn" ? "zh-CN" : "es", datePublished: "2026-07-12", dateModified: "2026-07-15", author: { "@type": "Organization", name: "Pullvio", url: `${base}/` }, publisher: { "@type": "Organization", name: "Pullvio", url: `${base}/` }, mainEntityOfPage: guideUrl },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: language === "zh-cn" ? "首页" : "Inicio", item: `${base}${localePath(language)}` }, { "@type": "ListItem", position: 2, name: language === "zh-cn" ? "实用指南" : "Guías", item: `${base}${localePath(language, "/guides")}` }, { "@type": "ListItem", position: 3, name: guide.title }] },
    ],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><ContentPage eyebrow={guide.eyebrow} title={guide.title} description={guide.description} locale={language} updated={language === "zh-cn" ? "2026 年 7 月 15 日" : "15 de julio de 2026"} links={related}>{guide.body}</ContentPage></>;
}
