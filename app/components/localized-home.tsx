"use client";

import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  CircleCheck,
  Download,
  Gauge,
  Headphones,
  Layers3,
  Link2,
  LockKeyhole,
  Menu,
  Moon,
  Play,
  ShieldCheck,
  Sparkles,
  Sun,
  Video,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { localizedContent, localePath, type LocalizedLocale } from "@/lib/i18n";
import LanguageMenu from "./language-menu";

const platforms = ["YouTube", "TikTok", "Vimeo", "Twitch", "SoundCloud", "X / Twitter"];
const stepIcons = [Link2, WandSparkles, ArrowDownToLine];
const featureIcons = [ShieldCheck, Gauge, Layers3];

function Brand({ locale }: { locale: LocalizedLocale }) {
  return (
    <a className="brand" href={localePath(locale)} aria-label="Pullvio home">
      <span className="brand-mark" aria-hidden="true"><span /><Play size={13} fill="currentColor" strokeWidth={0} /></span>
      <span>pullvio</span>
    </a>
  );
}

function ThemeToggle() {
  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("pullvio-theme", next);
  }
  return (
    <button className="theme-toggle" type="button" aria-label="Toggle light and dark theme" onClick={toggleTheme}>
      <Sun className="theme-sun" size={17} /><Moon className="theme-moon" size={17} />
    </button>
  );
}

function Header({ locale }: { locale: LocalizedLocale }) {
  const t = localizedContent[locale];
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  return (
    <header className="site-header">
      <div className="shell nav-shell">
        <Brand locale={locale} />
        <nav className="desktop-nav" aria-label="Main navigation">
          {t.nav.map(([label, href]) => <a href={href} key={href}>{label}</a>)}
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <LanguageMenu locale={locale} />
          <a className="sign-in" href={localePath(locale, "/login")}>{t.signIn}</a>
          <a className="pro-button" href="#pricing">{t.getPro} <ArrowRight size={16} /></a>
        </div>
        <div className="mobile-header-actions">
          <LanguageMenu locale={locale} /><ThemeToggle />
          <button className="menu-button" type="button" aria-label="Menu" onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <div className="mobile-panel">
          <nav>{t.nav.map(([label, href]) => <a href={href} key={href} onClick={() => setOpen(false)}>{label}<ArrowRight size={18} /></a>)}</nav>
          <div className="mobile-actions"><a href={localePath(locale, "/login")}>{t.signIn}</a><a className="pro-button" href="#pricing">{t.getPro}</a></div>
        </div>
      )}
    </header>
  );
}

function DownloadStudio({ locale }: { locale: LocalizedLocale }) {
  const t = localizedContent[locale].studio;
  const [url, setUrl] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [mode, setMode] = useState<"video" | "audio">("video");
  function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const parsed = new URL(url);
      if (!parsed.protocol.startsWith("http")) throw new Error();
      setState("loading");
      window.setTimeout(() => setState("ready"), 950);
    } catch { setState("error"); }
  }
  return (
    <div className="studio-wrap"><div className="studio-glow" /><div className="studio" aria-live="polite">
      <div className="studio-topline">
        <div className="mode-switch"><button className={mode === "video" ? "active" : ""} onClick={() => setMode("video")} type="button"><Video size={16} />{t.video}</button><button className={mode === "audio" ? "active" : ""} onClick={() => setMode("audio")} type="button"><Headphones size={16} />{t.audio}</button></div>
        <span className="quota"><span />{t.quota}</span>
      </div>
      <form onSubmit={submit} noValidate><label htmlFor="media-url">{t.label}</label><div className={`url-field ${state === "error" ? "has-error" : ""}`}><Link2 size={21} /><input id="media-url" inputMode="url" placeholder={t.placeholder} value={url} onChange={(event) => { setUrl(event.target.value); setState("idle"); }} /><button type="submit" disabled={state === "loading"}>{state === "loading" ? <span className="spinner" /> : <Sparkles size={18} />}<span>{state === "loading" ? t.loading : t.submit}</span></button></div>{state === "error" && <p className="field-message">{t.error}</p>}</form>
      {state === "loading" && <div className="analysis-state"><div className="skeleton thumbnail-skeleton" /><div className="skeleton-lines"><span /><span /><span /></div></div>}
      {state === "ready" && <div className="result-card"><div className="result-thumb"><div className="play-orbit"><Play size={17} fill="currentColor" /></div><span>08:42</span></div><div className="result-copy"><span className="result-source"><CircleCheck size={15} />{t.ready}</span><h3>{t.preview}</h3><p>MP4 · 1080p · 82 MB</p></div><button className="download-result" type="button"><Download size={18} />{t.download}</button></div>}
      <div className="studio-footer"><p><LockKeyhole size={15} />{t.legal}</p><div><span>MP4</span><span>MP3</span><span>4K <b>PRO</b></span></div></div>
    </div></div>
  );
}

export default function LocalizedHome({ locale }: { locale: LocalizedLocale }) {
  const t = localizedContent[locale];
  return (
    <main id="top">
      <Header locale={locale} />
      <section className="hero localized-hero"><div className="hero-grid" /><div className="orb orb-one" /><div className="shell hero-shell"><div className="hero-copy"><div className="announcement"><span>NEW</span>{t.announcement}<ArrowRight size={14} /></div><h1>{t.heroTitle}<br /><em>{t.heroAccent}</em></h1><p>{t.heroCopy}</p><div className="trust-line"><div className="avatar-stack"><span>P</span><span>R</span><span>V</span></div><div><strong>{t.trustTitle}</strong><small>{t.trustCopy}</small></div></div></div><DownloadStudio locale={locale} /></div><div className="platform-strip shell"><span>{t.supported}</span><div>{platforms.map((item) => <span key={item}>{item}</span>)}</div></div></section>
      <section className="steps-section" id="how"><div className="shell"><div className="section-heading centered"><span className="kicker">{t.howKicker}</span><h2>{t.howTitle}</h2></div><div className="steps-grid">{t.steps.map(([title, copy], index) => { const Icon = stepIcons[index]; return <article className="step-card" key={title}><span className="step-number">0{index + 1}</span><div className="step-icon"><Icon size={24} /></div><h3>{title}</h3><p>{copy}</p></article>; })}</div></div></section>
      <section className="features-section" id="features"><div className="shell"><div className="feature-intro"><span className="kicker">{t.featureKicker}</span><h2>{t.featureTitle}</h2><p>{t.featureCopy}</p></div><div className="feature-grid">{t.features.map(([title, copy], index) => { const Icon = featureIcons[index]; return <article className="feature-card" key={title}><div className="feature-icon"><Icon size={24} /></div><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>; })}</div></div></section>
      <section className="pricing-section" id="pricing"><div className="shell pricing-section-head"><span className="kicker">{t.pricingKicker}</span><h2>{t.pricingTitle}</h2><p>{t.pricingCopy}</p></div><div className="shell plan-grid"><article className="plan-card free-plan"><div className="plan-name"><span>FREE</span><small>{t.freeFor}</small></div><div className="plan-price"><strong>$0</strong><span>{t.forever}</span></div><a className="plan-button secondary" href="#top">{t.startFree}</a><ul>{t.freeItems.map((item) => <li key={item}><Check size={17} />{item}</li>)}</ul></article><article className="plan-card pro-plan"><div className="recommended"><Zap size={13} fill="currentColor" />{t.popular}</div><div className="plan-name"><span>PRO</span><small>{t.proFor}</small></div><div className="plan-price"><strong>$5.99</strong><span>{t.monthly}</span></div><a className="plan-button primary" href={localePath(locale, "/signup")}>{t.getPro}<ArrowRight size={17} /></a><ul>{t.proItems.map((item) => <li key={item}><Check size={17} />{item}</li>)}</ul></article></div></section>
      <section className="faq-section" id="faq"><div className="shell faq-shell"><div><span className="kicker">{t.faqKicker}</span><h2>{t.faqTitle}</h2></div><div className="faq-list">{t.faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></div></section>
      <footer><div className="shell footer-shell"><div><Brand locale={locale} /><p>{t.footer}</p></div><div className="footer-links">{t.nav.map(([label, href]) => <a href={href} key={href}>{label}</a>)}</div></div><div className="shell footer-bottom"><span>© 2026 Pullvio</span><span>{t.legal}</span></div></footer>
    </main>
  );
}
