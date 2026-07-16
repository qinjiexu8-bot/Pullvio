import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";
import type { Locale } from "@/lib/i18n";

const pageLabels = {
  en: { updated: "Last updated", context: "Pullvio product information", related: "Related pages" },
  "zh-cn": { updated: "更新于", context: "Pullvio 产品信息", related: "相关页面" },
  es: { updated: "Actualizado", context: "Información del producto Pullvio", related: "Páginas relacionadas" },
} satisfies Record<Locale, Record<string, string>>;

export default function ContentPage({ eyebrow, title, description, updated, children, links, locale = "en" }: { eyebrow: string; title: string; description: string; updated?: string; children: ReactNode; links?: Array<[string, string]>; locale?: Locale }) {
  const labels = pageLabels[locale];
  return <main className="content-page"><SiteHeader locale={locale} simple /><div className="shell content-page-main"><header className="content-hero"><span className="kicker">{eyebrow}</span><h1>{title}</h1><p>{description}</p>{updated && <div className="content-meta"><span>{labels.updated} {updated}</span><span>{labels.context}</span></div>}</header><article className="content-body">{children}{links && <nav className="content-links" aria-label={labels.related}>{links.map(([label, href]) => <Link href={href} key={href}>{label}<ArrowRight size={16} /></Link>)}</nav>}</article></div><SiteFooter locale={locale} /></main>;
}
