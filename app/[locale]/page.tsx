import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LocalizedHome from "../components/localized-home";
import { homeContent, isLocale, localePath, seo, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return ["zh-cn", "es"].map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "en") return {};
  const content = seo[locale];
  const canonical = localePath(locale);
  return {
    title: content.title,
    description: content.description,
    keywords: content.keywords,
    alternates: { canonical, languages: { en: "/", "zh-CN": "/zh-cn", es: "/es", "x-default": "/" } },
    openGraph: { type: "website", url: canonical, siteName: "Pullvio", locale: locale === "zh-cn" ? "zh_CN" : "es_ES", title: content.title, description: content.description },
    twitter: { card: "summary_large_image", title: content.title, description: content.description },
  };
}

export default async function LocalizedPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "en" || !(locale in homeContent)) notFound();
  return <LocalizedHome locale={locale as Locale} />;
}
