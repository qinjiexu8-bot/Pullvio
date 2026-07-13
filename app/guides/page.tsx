import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";
import { guides } from "@/lib/guides";

export const metadata: Metadata = { title: "Media Format, Quality & Permission Guides | Pullvio", description: "Practical guides to MP4, MP3, video resolution, source quality, and responsible media saving from the Pullvio private beta.", alternates: { canonical: "/guides" } };
export default function GuidesPage() { return <main className="content-page"><SiteHeader simple /><div className="shell content-page-main"><header className="content-hero"><span className="kicker">PULLVIO GUIDES</span><h1>Make better media choices.</h1><p>Clear, practical explanations of formats, resolution, storage, source quality, and responsible use—published before the processing service goes live.</p></header><div className="guide-hub-grid">{guides.map((guide, index) => <Link className="guide-hub-card" href={`/guides/${guide.slug}`} key={guide.slug}><span>GUIDE 0{index + 1}</span><h2>{guide.title}</h2><p>{guide.description}</p><b>{guide.readingTime}<ArrowRight size={15} /></b></Link>)}</div></div><SiteFooter /></main>; }
