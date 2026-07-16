"use client";

import { useAuth } from "@clerk/nextjs";
import {
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  Check,
  FolderArchive,
  Gauge,
  Headphones,
  Layers3,
  Link2,
  Menu,
  MonitorSmartphone,
  Moon,
  Music2,
  Play,
  ShieldCheck,
  Sun,
  Video,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { blogIndexCopy, blogPosts } from "@/lib/blog";
import { homeContent, localePath, type Locale } from "@/lib/i18n";
import LanguageMenu from "./language-menu";
import MediaStudio from "./media-studio";
import SiteFooter from "./site-footer";

const platforms = [
  ["YouTube", "/youtube-video-downloader"],
  ["TikTok", "/tiktok-video-downloader"],
  ["Vimeo", ""],
  ["Twitch", ""],
  ["SoundCloud", ""],
  ["X / Twitter", ""],
] as const;
const stepIcons = [Link2, WandSparkles, ArrowDownToLine];
const featureIcons = [ShieldCheck, Gauge, Layers3];
const useCaseIcons = [MonitorSmartphone, Music2, FolderArchive];
const journalIcons = [ShieldCheck, MonitorSmartphone, FolderArchive];

const discoveryCopy = {
  en: {
    formatsKicker: "FORMATS & QUALITY",
    formatsTitle: "Choose the file for what happens next.",
    formatsCopy: "The best download is not always the largest one. Start with how you plan to watch, listen, edit, or store the media.",
    formats: [
      ["MP4", "Video for everyday playback", "Keep picture and sound together in a widely supported container for phones, computers, TVs, and editing apps.", "Best for watching, sharing, and editing"],
      ["MP3", "Audio without the video track", "Extract an audio-only file for permitted listening workflows, spoken material, or a smaller mobile copy.", "Best when the picture is not needed"],
      ["SOURCE", "Quality that matches the original", "Choose an available resolution instead of enlarging a low-quality source. Pullvio shows 2K and 4K only when the original provides them.", "Best for preserving genuine source detail"],
    ],
    qualityTitle: "A practical quality guide.",
    qualityCopy: "Resolution affects clarity, file size, processing time, and storage. For most phone and laptop screens, 1080p is a balanced default. Reserve 4K for genuine 4K sources and workflows that benefit from the extra detail.",
    resolutions: [["480p", "Small screens and limited data", "LIGHT"], ["720p", "Compact HD playback", "HD"], ["1080p", "Everyday high-definition video", "FULL HD"], ["2K / 4K", "Large displays, editing, and archives", "PRO"]],
    usesKicker: "BUILT AROUND REAL WORKFLOWS",
    usesTitle: "Useful from the first link to the final folder.",
    usesCopy: "Pullvio keeps the browser workflow focused while giving you enough context to choose a sensible format and handle the result responsibly.",
    uses: [["Save your own published work", "Keep an offline copy of media you created and uploaded, then move it into your own archive or editing workflow."], ["Listen when video is unnecessary", "Choose MP3 for authorized audio-first material and reduce the storage used by an unneeded picture track."], ["Build a cleaner personal archive", "Use meaningful formats and source quality as the starting point for organized, backed-up media files."]],
    allowed: "DESIGNED FOR",
    allowedTitle: "Your own and authorized media",
    allowedCopy: "Personal uploads, public-domain works, appropriately licensed media, and content you otherwise have a legal right to save.",
    notAllowed: "NOT DESIGNED FOR",
    notAllowedTitle: "Bypassing access controls",
    notAllowedCopy: "Pullvio is not intended to circumvent DRM, subscriptions, private accounts, paywalls, or other technical restrictions.",
    journalTitle: "From the Pullvio journal.",
    journalCopy: "Detailed, original guidance for safer downloads, mobile file handling, and personal media organization.",
    read: "Read article",
  },
  "zh-cn": {
    formatsKicker: "格式与画质",
    formatsTitle: "根据下一步用途，选择合适文件。",
    formatsCopy: "最大的文件不一定是最好的选择。先考虑您准备如何观看、收听、剪辑或保存媒体，再决定格式与画质。",
    formats: [["MP4", "适合日常播放的视频", "将画面和声音保存在广泛兼容的容器中，可用于手机、电脑、电视和常见剪辑软件。", "适合观看、分享和剪辑"], ["MP3", "不包含画面的视频音频", "为获得授权的收听场景提取纯音频文件，适合语音内容或更小的移动副本。", "适合不需要画面的场景"], ["源画质", "与原始内容匹配的清晰度", "选择来源真实提供的分辨率，而不是放大低画质文件。仅在原始媒体提供时显示 2K 与 4K。", "适合保留真实来源细节"]],
    qualityTitle: "实用画质选择指南。",
    qualityCopy: "分辨率会影响清晰度、文件大小、处理时间与存储空间。对于大多数手机和笔记本，1080p 是均衡默认选项；只有来源确实提供 4K 且后续用途需要额外细节时，才建议选择 4K。",
    resolutions: [["480p", "小屏幕与有限流量", "轻量"], ["720p", "更紧凑的高清视频", "HD"], ["1080p", "日常高清观看", "FULL HD"], ["2K / 4K", "大屏、剪辑与归档", "PRO"]],
    usesKicker: "围绕真实工作流设计",
    usesTitle: "从第一个链接，到最终文件夹。",
    usesCopy: "Pullvio 让浏览器操作保持专注，同时提供足够信息，帮助您选择合理格式并负责任地处理结果。",
    uses: [["保存自己发布的作品", "为自己创作并上传的媒体保留离线副本，再移动到个人档案或剪辑流程中。"], ["不需要画面时只保留音频", "为获得授权的音频优先内容选择 MP3，避免不必要的画面轨占用存储空间。"], ["建立更清晰的个人档案", "以合理格式与真实源画质为起点，整理并备份自己的媒体文件。"]],
    allowed: "适用范围",
    allowedTitle: "您自己或获得授权的媒体",
    allowedCopy: "个人上传、公共领域作品、符合许可条件的媒体，以及您通过其他方式拥有合法保存权利的内容。",
    notAllowed: "不适用范围",
    notAllowedTitle: "绕过访问控制",
    notAllowedCopy: "Pullvio 不用于规避 DRM、订阅、私人账户、付费墙或其他技术限制。",
    journalTitle: "来自 Pullvio 博客。",
    journalCopy: "围绕下载安全、移动端文件处理和个人媒体整理的原创深度指南。",
    read: "阅读文章",
  },
  es: {
    formatsKicker: "FORMATOS Y CALIDAD",
    formatsTitle: "Elige el archivo según lo que harás después.",
    formatsCopy: "La descarga más grande no siempre es la mejor. Piensa primero si vas a ver, escuchar, editar o archivar el contenido.",
    formats: [["MP4", "Video para la reproducción diaria", "Mantiene imagen y sonido en un contenedor compatible con móviles, ordenadores, televisores y editores.", "Ideal para ver, compartir y editar"], ["MP3", "Audio sin la pista de video", "Extrae audio autorizado para escuchar, conservar voz o crear una copia móvil de menor tamaño.", "Ideal cuando no necesitas imagen"], ["ORIGEN", "Calidad que respeta el original", "Elige una resolución disponible sin ampliar una fuente de baja calidad. Pullvio solo muestra 2K o 4K cuando existen.", "Ideal para conservar detalle real"]],
    qualityTitle: "Una guía práctica de calidad.",
    qualityCopy: "La resolución afecta claridad, tamaño, tiempo de proceso y almacenamiento. Para la mayoría de móviles y portátiles, 1080p es un buen equilibrio. Reserva 4K para fuentes 4K reales y usos que aprovechen ese detalle.",
    resolutions: [["480p", "Pantallas pequeñas y pocos datos", "LIGERO"], ["720p", "Reproducción HD compacta", "HD"], ["1080p", "Video diario en alta definición", "FULL HD"], ["2K / 4K", "Pantallas grandes, edición y archivo", "PRO"]],
    usesKicker: "PENSADO PARA FLUJOS REALES",
    usesTitle: "Útil desde el primer enlace hasta la carpeta final.",
    usesCopy: "Pullvio mantiene el proceso enfocado y ofrece contexto para elegir un formato sensato y gestionar el resultado de forma responsable.",
    uses: [["Guarda tus propias publicaciones", "Conserva una copia offline del contenido que has creado y súmala a tu archivo o flujo de edición."], ["Escucha cuando el video no es necesario", "Elige MP3 para contenido autorizado centrado en audio y evita almacenar una pista visual innecesaria."], ["Construye un archivo personal ordenado", "Utiliza formatos claros y calidad de origen como base para organizar y respaldar tus archivos."]],
    allowed: "DISEÑADO PARA",
    allowedTitle: "Contenido propio y autorizado",
    allowedCopy: "Publicaciones propias, obras de dominio público, contenido con licencia adecuada y material que tengas derecho legal a guardar.",
    notAllowed: "NO DISEÑADO PARA",
    notAllowedTitle: "Eludir controles de acceso",
    notAllowedCopy: "Pullvio no está pensado para evitar DRM, suscripciones, cuentas privadas, muros de pago ni otras restricciones técnicas.",
    journalTitle: "Desde la revista Pullvio.",
    journalCopy: "Guías originales sobre descargas más seguras, archivos móviles y organización de contenido personal.",
    read: "Leer artículo",
  },
} as const;

function Brand({ locale }: { locale: Locale }) {
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

function Header({ locale }: { locale: Locale }) {
  const t = homeContent[locale];
  const accountLabel = locale === "zh-cn" ? "个人中心" : locale === "es" ? "Cuenta" : "Account";
  const navHref = (href: string) => href.startsWith("#") ? href : localePath(locale, href);
  const { isLoaded, isSignedIn } = useAuth();
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
          {t.nav.map(([label, href]) => <a href={navHref(href)} key={href}>{label}</a>)}
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <LanguageMenu locale={locale} />
          {isLoaded && (isSignedIn
            ? <a className="sign-in" href={localePath(locale, "/account")}>{accountLabel}</a>
            : <a className="sign-in" href={localePath(locale, "/login")}>{t.signIn}</a>)}
          <a className="pro-button" href="#pricing">{t.getPro} <ArrowRight size={16} /></a>
        </div>
        <div className="mobile-header-actions">
          <LanguageMenu locale={locale} /><ThemeToggle />
          <button className="menu-button" type="button" aria-label="Menu" onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <div className="mobile-panel">
          <nav>{t.nav.map(([label, href]) => <a href={navHref(href)} key={href} onClick={() => setOpen(false)}>{label}<ArrowRight size={18} /></a>)}</nav>
          <div className="mobile-actions">
            {isLoaded && (isSignedIn
              ? <a href={localePath(locale, "/account")} onClick={() => setOpen(false)}>{accountLabel}</a>
              : <a href={localePath(locale, "/login")} onClick={() => setOpen(false)}>{t.signIn}</a>)}
            <a className="pro-button" href="#pricing" onClick={() => setOpen(false)}>{t.getPro}</a>
          </div>
        </div>
      )}
    </header>
  );
}

export default function LocalizedHome({ locale }: { locale: Locale }) {
  const t = homeContent[locale];
  const d = discoveryCopy[locale];
  const journal = blogIndexCopy[locale];
  const pageUrl = `https://pullvio.com${localePath(locale)}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", name: "Pullvio", url: pageUrl, applicationCategory: "MultimediaApplication", operatingSystem: "Any", browserRequirements: "Requires a modern web browser", inLanguage: locale === "zh-cn" ? "zh-CN" : locale, description: t.heroCopy, offers: [{ "@type": "Offer", name: "Pullvio Free", price: "0", priceCurrency: "USD" }, { "@type": "Offer", name: "Pullvio Pro", price: "5.99", priceCurrency: "USD" }] },
      { "@type": "FAQPage", mainEntity: t.faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
    ],
  };
  return (
    <main id="top">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Header locale={locale} />
      <section className="hero localized-hero"><div className="hero-grid" /><div className="orb orb-one" /><div className="shell hero-shell"><div className="hero-copy"><div className="announcement"><span>NEW</span>{t.announcement}<ArrowRight size={14} /></div><h1><span>{t.heroTitle}</span><em>{t.heroAccent}</em></h1></div><div className="hero-support"><p>{t.heroCopy}</p><div className="trust-line"><div className="avatar-stack"><span>P</span><span>R</span><span>V</span></div><div><strong>{t.trustTitle}</strong><small>{t.trustCopy}</small></div></div></div><MediaStudio locale={locale} /></div><div className="platform-strip shell"><span>{t.supported}</span><div>{platforms.map(([name, path]) => path ? <a href={localePath(locale, path)} key={name}>{name}</a> : <span key={name}>{name}</span>)}</div></div></section>
      <section className="steps-section" id="how"><div className="shell"><div className="section-heading centered"><span className="kicker">{t.howKicker}</span><h2>{t.howTitle}</h2></div><div className="steps-grid">{t.steps.map(([title, copy], index) => { const Icon = stepIcons[index]; return <article className="step-card" key={title}><span className="step-number">0{index + 1}</span><div className="step-icon"><Icon size={24} /></div><h3>{title}</h3><p>{copy}</p></article>; })}</div></div></section>
      <section className="features-section" id="features"><div className="shell"><div className="feature-intro"><span className="kicker">{t.featureKicker}</span><h2>{t.featureTitle}</h2><p>{t.featureCopy}</p></div><div className="feature-grid">{t.features.map(([title, copy], index) => { const Icon = featureIcons[index]; return <article className="feature-card" key={title}><div className="feature-icon"><Icon size={24} /></div><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>; })}</div></div></section>
      <section className="formats-section"><div className="shell"><div className="formats-intro"><div><span className="kicker">{d.formatsKicker}</span><h2>{d.formatsTitle}</h2></div><p>{d.formatsCopy}</p></div><div className="format-card-grid">{d.formats.map(([label, title, copy, note], index) => <article className={`format-card ${index === 1 ? "featured-format" : ""}`} key={label}><div className="format-label">{index === 0 ? <Video size={18} /> : index === 1 ? <Headphones size={18} /> : <Gauge size={18} />}<span>{label}</span></div><h3>{title}</h3><p>{copy}</p><small>{note}</small></article>)}</div><div className="quality-guide"><div className="quality-copy"><h3>{d.qualityTitle}</h3><p>{d.qualityCopy}</p><Link2 size={21} /></div><div className="resolution-list">{d.resolutions.map(([quality, use, badge], index) => <div className={index === 3 ? "pro-resolution" : ""} key={quality}><strong>{quality}</strong><span>{use}</span><b>{badge}</b></div>)}</div></div></div></section>
      <section className="use-cases-section"><div className="shell"><div className="use-cases-head shell"><span className="kicker">{d.usesKicker}</span><h2>{d.usesTitle}</h2><p>{d.usesCopy}</p></div><div className="use-case-grid">{d.uses.map(([title, copy], index) => { const Icon = useCaseIcons[index]; return <article key={title}><Icon size={24} /><h3>{title}</h3><p>{copy}</p></article>; })}</div><div className="boundaries-panel"><div><span className="boundary-label positive">{d.allowed}</span><h3>{d.allowedTitle}</h3><p>{d.allowedCopy}</p></div><div><span className="boundary-label">{d.notAllowed}</span><h3>{d.notAllowedTitle}</h3><p>{d.notAllowedCopy}</p></div></div></div></section>
      <section className="pricing-section" id="pricing"><div className="shell pricing-section-head"><span className="kicker">{t.pricingKicker}</span><h2>{t.pricingTitle}</h2><p>{t.pricingCopy}</p></div><div className="shell plan-grid"><article className="plan-card free-plan"><div className="plan-name"><span>FREE</span><small>{t.freeFor}</small></div><div className="plan-price"><strong>$0</strong><span>{t.forever}</span></div><a className="plan-button secondary" href="#top">{t.startFree}</a><ul>{t.freeItems.map((item) => <li key={item}><Check size={17} />{item}</li>)}</ul></article><article className="plan-card pro-plan"><div className="recommended"><Zap size={13} fill="currentColor" />{t.popular}</div><div className="plan-name"><span>PRO</span><small>{t.proFor}</small></div><div className="plan-price"><strong>$5.99</strong><span>{t.monthly}</span></div><a className="plan-button primary" href={localePath(locale, "/signup")}>{t.getPro}<ArrowRight size={17} /></a><ul>{t.proItems.map((item) => <li key={item}><Check size={17} />{item}</li>)}</ul></article></div></section>
      <section className="guides-preview" id="journal"><div className="shell"><div className="guides-head"><div><span className="kicker">{journal.eyebrow}</span><h2>{d.journalTitle}</h2></div><p>{d.journalCopy}</p></div><div className="guide-preview-grid">{blogPosts.slice(0, 3).map((post, index) => { const copy = post.copy[locale]; const JournalIcon = journalIcons[index]; return <a className={`guide-preview-card journal-card-${index + 1}`} href={localePath(locale, `/blog/${post.slug}`)} key={post.slug}><div className="guide-preview-top"><span>{post.category[locale]}</span><BookOpen size={18} /></div><div className="guide-preview-visual" aria-hidden="true"><JournalIcon size={39} strokeWidth={1.35} /><span>0{index + 1}</span></div><h3>{copy.title}</h3><p>{copy.description}</p><b>{d.read}<ArrowRight size={15} /></b></a>; })}</div><a className="journal-all-link" href={localePath(locale, "/blog")}>{journal.latest}<ArrowRight size={16} /></a></div></section>
      <section className="faq-section" id="faq"><div className="shell faq-shell"><div className="faq-intro"><span className="kicker">{t.faqKicker}</span><h2>{t.faqTitle}</h2><p>{t.faqCopy}</p><a href={localePath(locale, "/contact")}>{t.faqSupport}<ArrowRight size={15} /></a></div><div className="faq-list">{t.faqs.map(([question, answer], index) => <details key={question}><summary><b>{String(index + 1).padStart(2, "0")}</b>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></div></section>
      <SiteFooter locale={locale} />
    </main>
  );
}
