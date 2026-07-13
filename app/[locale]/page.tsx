import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BetaHome from "../components/beta-home";
import { betaCopy, isLocale, localePath, seo, type Locale } from "@/lib/i18n";

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
    alternates: { canonical, languages: { en: "/", "zh-CN": "/zh-cn", es: "/es", "x-default": "/" } },
    openGraph: { type: "website", url: canonical, siteName: "Pullvio", locale: locale === "zh-cn" ? "zh_CN" : "es_ES", title: content.title, description: content.description },
    twitter: { card: "summary_large_image", title: content.title, description: content.description },
  };
}

export default async function LocalizedPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "en" || !(locale in betaCopy)) notFound();
  return <BetaHome locale={locale as Locale} />;
}
