import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";

export default function ContentPage({ eyebrow, title, description, updated, children, links }: { eyebrow: string; title: string; description: string; updated?: string; children: ReactNode; links?: Array<[string, string]> }) {
  return <main className="content-page"><SiteHeader simple /><div className="shell content-page-main"><header className="content-hero"><span className="kicker">{eyebrow}</span><h1>{title}</h1><p>{description}</p>{updated && <div className="content-meta"><span>Last updated {updated}</span><span>Pullvio Private Beta</span></div>}</header><article className="content-body">{children}{links && <nav className="content-links" aria-label="Related pages">{links.map(([label, href]) => <Link href={href} key={href}>{label}<ArrowRight size={16} /></Link>)}</nav>}</article></div><SiteFooter /></main>;
}
