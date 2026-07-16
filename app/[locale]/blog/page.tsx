import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogIndex } from "../../components/blog-pages";
import { blogIndexCopy } from "@/lib/blog";
import { isLocale, localePath, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };
export function generateStaticParams() { return [{ locale: "zh-cn" }, { locale: "es" }]; }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "en") return {};
  const copy = blogIndexCopy[locale];
  return { title: `${copy.title} | Pullvio`, description: copy.description, alternates: { canonical: localePath(locale, "/blog"), languages: { en: "/blog", "zh-CN": "/zh-cn/blog", es: "/es/blog", "x-default": "/blog" } }, openGraph: { title: copy.title, description: copy.description, url: localePath(locale, "/blog"), type: "website" } };
}
export default async function LocalizedBlogPage({ params }: Props) { const { locale } = await params; if (!isLocale(locale) || locale === "en") notFound(); return <BlogIndex locale={locale as Locale} />; }
