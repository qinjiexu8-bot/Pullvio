import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";
import { localePath, localizedContent, type LocalizedLocale } from "@/lib/i18n";
import { localizedGuideHubs, localizedGuides } from "@/lib/localized-pages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!(locale in localizedContent)) return {};
  const language = locale as LocalizedLocale;
  const hub = localizedGuideHubs[language];
  const titles = { "zh-cn": "媒体格式、画质与授权指南 | Pullvio", es: "Guías de formatos, calidad y permisos | Pullvio" };
  return {
    title: titles[language],
    description: hub.description,
    alternates: { canonical: localePath(language, "/guides"), languages: { en: "/guides", "zh-CN": "/zh-cn/guides", es: "/es/guides", "x-default": "/guides" } },
  };
}

export default async function LocalizedGuidesPage({ params }: Props) {
  const { locale } = await params;
  if (!(locale in localizedContent)) notFound();
  const language = locale as LocalizedLocale;
  const hub = localizedGuideHubs[language];
  const guides = localizedGuides[language];
  return <main className="content-page"><SiteHeader locale={language} simple /><div className="shell content-page-main"><header className="content-hero"><span className="kicker">{hub.eyebrow}</span><h1>{hub.title}</h1><p>{hub.description}</p></header><div className="guide-hub-grid">{guides.map((guide, index) => <Link className="guide-hub-card" href={localePath(language, `/guides/${guide.slug}`)} key={guide.slug}><span>{hub.guideLabel} 0{index + 1}</span><h2>{guide.title}</h2><p>{guide.description}</p><b>{guide.readingTime}<ArrowRight size={15} /></b></Link>)}</div></div><SiteFooter locale={language} /></main>;
}
