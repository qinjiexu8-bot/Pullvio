import type { Metadata } from "next";
import { BlogIndex } from "../components/blog-pages";
import { blogIndexCopy } from "@/lib/blog";

const copy = blogIndexCopy.en;
export const metadata: Metadata = {
  title: "Online Media Tips & Video Workflow Guides | Pullvio Blog",
  description: copy.description,
  alternates: { canonical: "/blog", languages: { en: "/blog", "zh-CN": "/zh-cn/blog", es: "/es/blog", "x-default": "/blog" } },
  openGraph: { title: copy.title, description: copy.description, url: "/blog", type: "website" },
};

export default function BlogPage() { return <BlogIndex />; }
