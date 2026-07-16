import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticle } from "../../../components/blog-pages";
import { blogPosts, getBlogPost } from "@/lib/blog";
import { isLocale, localePath } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string; slug: string }> };
export function generateStaticParams() { return ["zh-cn", "es"].flatMap((locale) => blogPosts.map(({ slug }) => ({ locale, slug }))); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPost(slug);
  if (!post || !isLocale(locale) || locale === "en") return {};
  const copy = post.copy[locale];
  return { title: `${copy.title} | Pullvio`, description: copy.description, alternates: { canonical: localePath(locale, `/blog/${slug}`), languages: { en: `/blog/${slug}`, "zh-CN": `/zh-cn/blog/${slug}`, es: `/es/blog/${slug}`, "x-default": `/blog/${slug}` } }, openGraph: { type: "article", title: copy.title, description: copy.description, publishedTime: post.published, url: localePath(locale, `/blog/${slug}`) } };
}
export default async function LocalizedBlogPostPage({ params }: Props) { const { locale, slug } = await params; const post = getBlogPost(slug); if (!post || !isLocale(locale) || locale === "en") notFound(); return <BlogArticle post={post} locale={locale} />; }
