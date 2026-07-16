import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import Link from "next/link";
import { blogIndexCopy, blogPosts, type BlogPost } from "@/lib/blog";
import { htmlLang, localePath, type Locale } from "@/lib/i18n";
import ContentPage from "./content-page";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";

function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(htmlLang[locale], { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export function BlogIndex({ locale = "en" }: { locale?: Locale }) {
  const t = blogIndexCopy[locale];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: t.title,
    description: t.description,
    url: `https://pullvio.com${localePath(locale, "/blog")}`,
    publisher: { "@type": "Organization", name: "Pullvio", url: "https://pullvio.com/" },
    blogPost: blogPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.copy[locale].title,
      url: `https://pullvio.com${localePath(locale, `/blog/${post.slug}`)}`,
      datePublished: post.published,
    })),
  };

  return <main className="content-page blog-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <SiteHeader locale={locale} simple />
    <div className="shell content-page-main">
      <header className="content-hero blog-hero"><span className="kicker">{t.eyebrow}</span><h1>{t.title}</h1><p>{t.description}</p></header>
      <section className="blog-index-section" aria-labelledby="latest-posts"><div className="blog-index-heading"><span>{t.latest}</span><span>{blogPosts.length.toString().padStart(2, "0")} / 2026</span></div><div className="blog-grid">
        {blogPosts.map((post, index) => { const copy = post.copy[locale]; return <Link className={`blog-card ${index === 0 ? "featured-blog-card" : ""}`} href={localePath(locale, `/blog/${post.slug}`)} key={post.slug}>
          <div className="blog-card-top"><span>{post.category[locale]}</span><b>0{index + 1}</b></div>
          <h2 id={index === 0 ? "latest-posts" : undefined}>{copy.title}</h2><p>{copy.description}</p>
          <div className="blog-card-meta"><span><CalendarDays size={13} />{formatDate(post.published, locale)}</span><span><Clock3 size={13} />{copy.readingTime}</span></div>
          <strong>{t.read}<ArrowRight size={15} /></strong>
        </Link>; })}
      </div></section>
    </div>
    <SiteFooter locale={locale} />
  </main>;
}

export function BlogArticle({ post, locale = "en" }: { post: BlogPost; locale?: Locale }) {
  const copy = post.copy[locale];
  const related = blogPosts.filter((item) => item.slug !== post.slug).map((item) => [item.copy[locale].title, localePath(locale, `/blog/${item.slug}`)] as [string, string]);
  const url = `https://pullvio.com${localePath(locale, `/blog/${post.slug}`)}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BlogPosting", headline: copy.title, description: copy.description, datePublished: post.published, dateModified: post.published, inLanguage: htmlLang[locale], mainEntityOfPage: url, author: { "@type": "Organization", name: "Pullvio", url: "https://pullvio.com/about" }, publisher: { "@type": "Organization", name: "Pullvio", url: "https://pullvio.com/" } },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Pullvio", item: `https://pullvio.com${localePath(locale)}` }, { "@type": "ListItem", position: 2, name: blogIndexCopy[locale].eyebrow, item: `https://pullvio.com${localePath(locale, "/blog")}` }, { "@type": "ListItem", position: 3, name: copy.title }] },
    ],
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><ContentPage eyebrow={`${post.category[locale]} · ${copy.readingTime}`} title={copy.title} description={copy.description} updated={formatDate(post.published, locale)} links={related} locale={locale}>{copy.body}</ContentPage></>;
}
