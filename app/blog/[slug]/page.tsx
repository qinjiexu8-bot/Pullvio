import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticle } from "../../components/blog-pages";
import { blogPosts, getBlogPost } from "@/lib/blog";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return blogPosts.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPost((await params).slug);
  if (!post) return {};
  const copy = post.copy.en;
  return { title: `${copy.title} | Pullvio`, description: copy.description, alternates: { canonical: `/blog/${post.slug}`, languages: { en: `/blog/${post.slug}`, "zh-CN": `/zh-cn/blog/${post.slug}`, es: `/es/blog/${post.slug}`, "x-default": `/blog/${post.slug}` } }, openGraph: { type: "article", title: copy.title, description: copy.description, publishedTime: post.published, url: `/blog/${post.slug}` } };
}
export default async function BlogPostPage({ params }: Props) { const post = getBlogPost((await params).slug); if (!post) notFound(); return <BlogArticle post={post} />; }
