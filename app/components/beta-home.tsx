import { ArrowRight, BookOpen, Check, CircleDashed, FileAudio, FileVideo2, Flag, LockKeyhole, Radar, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { betaCopy, type Locale } from "@/lib/i18n";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";

const principleIcons = [ShieldCheck, Radar, LockKeyhole];

export default function BetaHome({ locale }: { locale: Locale }) {
  const t = betaCopy[locale];
  return <main id="top">
    <SiteHeader locale={locale} />
    <section className="hero beta-hero"><div className="hero-grid" aria-hidden="true" /><div className="orb orb-one" aria-hidden="true" /><div className="orb orb-two" aria-hidden="true" /><div className="shell hero-shell"><div className="hero-copy"><div className="announcement"><span>BETA</span>{t.eyebrow}<ArrowRight size={14} /></div><h1>{t.title}<br /><em>{t.accent}</em></h1><p>{t.intro}</p><div className="trust-line"><div className="avatar-stack"><span>P</span><span>R</span><span>V</span></div><div><strong>{t.trustTitle}</strong><small>{t.trustCopy}</small></div></div></div><aside className="beta-status-card" id="beta-status"><div className="beta-card-top"><span><CircleDashed size={16} />{t.panelLabel}</span><b>01 / 03</b></div><h2>{t.panelTitle}</h2><p>{t.panelCopy}</p><div className="beta-checklist">{t.panelItems.map(([label, status], index) => <div key={label}><span>{index < 2 ? <Check size={15} /> : <CircleDashed size={15} />}{label}</span><b className={index < 2 ? "ready" : "pending"}>{status}</b></div>)}</div><Link className="beta-guide-button" href="/guides"><BookOpen size={17} />{t.panelButton}<ArrowRight size={16} /></Link></aside></div><div className="platform-strip shell"><span>{t.planned}</span><div>{t.plannedItems.map((item) => <span key={item}>{item}</span>)}</div></div></section>

    <section className="features-section beta-principles"><div className="shell"><div className="feature-intro"><span className="kicker">{t.principlesKicker}</span><h2>{t.principlesTitle}</h2><p>{t.principlesCopy}</p></div><div className="feature-grid">{t.principles.map(([title, copy], index) => { const Icon = principleIcons[index]; return <article className="feature-card" key={title}><div className="feature-icon"><Icon size={24} /></div><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>; })}</div></div></section>

    <section className="roadmap-section" id="roadmap"><div className="shell roadmap-heading"><span className="kicker">{t.roadmapKicker}</span><h2>{t.roadmapTitle}</h2><p>{t.roadmapCopy}</p></div><div className="shell roadmap-grid">{t.roadmap.map(([phase, title, copy], index) => <article className={index === 0 ? "current" : ""} key={phase}><div><span>{phase}</span>{index === 0 ? <Sparkles size={18} /> : index === 1 ? <Radar size={18} /> : <Flag size={18} />}</div><b>0{index + 1}</b><h3>{title}</h3><p>{copy}</p></article>)}</div></section>

    <section className="guides-preview" id="guides"><div className="shell guides-head"><div><span className="kicker">{t.guidesKicker}</span><h2>{t.guidesTitle}</h2></div><p>{t.guidesCopy}</p></div><div className="shell guide-preview-grid">{t.guides.map(([title, copy, href], index) => <Link className="guide-preview-card" href={href} key={href}><div>{index === 0 ? <FileAudio size={23} /> : index === 1 ? <FileVideo2 size={23} /> : <ShieldCheck size={23} />}<span>GUIDE 0{index + 1}</span></div><h3>{title}</h3><p>{copy}</p><b>Read guide <ArrowRight size={15} /></b></Link>)}</div></section>

    <section className="faq-section" id="faq"><div className="shell faq-shell"><div><span className="kicker">{t.faqKicker}</span><h2>{t.faqTitle}</h2></div><div className="faq-list">{t.faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></div></section>
    <SiteFooter locale={locale} />
  </main>;
}
