import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContentPage from "../../components/content-page";
import { localePath, localizedContent, type LocalizedLocale } from "@/lib/i18n";
import { localizedAboutPages } from "@/lib/localized-pages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!(locale in localizedContent)) return {};
  const language = locale as LocalizedLocale;
  const page = localizedAboutPages[language];
  const titles = { "zh-cn": "关于 Pullvio | 产品原则", es: "Sobre Pullvio | Principios del producto" };
  return {
    title: titles[language],
    description: page.description,
    alternates: { canonical: localePath(language, "/about"), languages: { en: "/about", "zh-CN": "/zh-cn/about", es: "/es/about", "x-default": "/about" } },
  };
}

export default async function LocalizedAboutPage({ params }: Props) {
  const { locale } = await params;
  if (!(locale in localizedContent)) notFound();
  const language = locale as LocalizedLocale;
  const page = localizedAboutPages[language];
  const related = language === "zh-cn"
    ? [["阅读媒体实用指南", "/zh-cn/guides"], ["返回 Pullvio 首页", "/zh-cn"]] as Array<[string, string]>
    : [["Leer las guías multimedia", "/es/guides"], ["Volver al inicio de Pullvio", "/es"]] as Array<[string, string]>;
  return <ContentPage {...page} locale={language} updated={language === "zh-cn" ? "2026 年 7 月 17 日" : "17 de julio de 2026"} links={related}>{page.body}</ContentPage>;
}
