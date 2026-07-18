import {
  ArrowRight,
  Check,
  CircleSlash2,
  FileAudio,
  FileVideo,
  Link2,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n";
import { getPlatformTool, type PlatformSlug } from "@/lib/platform-tools";
import MediaStudio from "./media-studio";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";

const stepIcons = [Link2, FileVideo, Smartphone];
const formatIcons = [FileVideo, FileAudio, ShieldCheck];

export default function PlatformDownloaderPage({ slug, locale = "en" }: { slug: PlatformSlug; locale?: Locale }) {
  const tool = getPlatformTool(slug, locale);
  const t = tool.content;
  const pagePath = localePath(locale, `/${slug}`);
  const pageUrl = `https://pullvio.com${pagePath}`;
  const language = locale === "zh-cn" ? "zh-CN" : locale;
  const homeName = locale === "zh-cn" ? "首页" : locale === "es" ? "Inicio" : "Home";
  const guidePath = localePath(locale, `/guides/${tool.guideSlug}`);
  const relatedPath = localePath(locale, `/${tool.relatedSlug}`);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: `${tool.platform} ${tool.audioOnly ? "Audio" : "Video"} Downloader by Pullvio`,
        url: pageUrl,
        description: t.description,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires a modern web browser",
        inLanguage: language,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "HowTo",
        name: t.howTitle,
        description: t.intro,
        inLanguage: language,
        step: t.steps.map(([name, text], index) => ({ "@type": "HowToStep", position: index + 1, name, text })),
      },
      {
        "@type": "FAQPage",
        mainEntity: t.faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: homeName, item: `https://pullvio.com${localePath(locale)}` },
          { "@type": "ListItem", position: 2, name: t.h1, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <main className="platform-tool-page" id="top">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <SiteHeader locale={locale} simple />

      <section className="platform-tool-hero">
        <div className="hero-grid" />
        <div className="orb orb-one" />
        <div className="shell platform-tool-hero-shell">
          <div className="platform-tool-heading">
            <span className="kicker">{t.eyebrow}</span>
            <h1>{t.h1}</h1>
            <em>{t.accent}</em>
          </div>
          <div className="platform-tool-intro">
            <p>{t.intro}</p>
            <ul>{t.benefits.map((benefit) => <li key={benefit}><Check size={16} />{benefit}</li>)}</ul>
          </div>
          <MediaStudio locale={locale} placeholder={t.placeholder} audioOnly={tool.audioOnly} />
        </div>
      </section>

      <section className="platform-how-section">
        <div className="shell">
          <div className="platform-section-head centered"><span className="kicker">{t.howEyebrow}</span><h2>{t.howTitle}</h2></div>
          <div className="platform-step-grid">
            {t.steps.map(([title, copy], index) => {
              const Icon = stepIcons[index];
              return <article key={title}><span>0{index + 1}</span><Icon size={25} /><h3>{title}</h3><p>{copy}</p></article>;
            })}
          </div>
        </div>
      </section>

      <section className="platform-formats-section">
        <div className="shell">
          <div className="platform-section-head split"><div><span className="kicker">{t.formatsEyebrow}</span><h2>{t.formatsTitle}</h2></div><p>{t.formatsIntro}</p></div>
          <div className="platform-format-grid">
            {t.formats.map(([label, title, copy], index) => {
              const Icon = formatIcons[index];
              return <article key={label}><div><Icon size={20} /><b>{label}</b></div><h3>{title}</h3><p>{copy}</p></article>;
            })}
          </div>
        </div>
      </section>

      <section className="platform-boundaries-section">
        <div className="shell">
          <div className="platform-section-head"><span className="kicker">{t.boundariesEyebrow}</span><h2>{t.boundariesTitle}</h2></div>
          <div className="platform-boundary-grid">
            <article className="positive"><Check size={24} /><h3>{t.worksTitle}</h3><p>{t.worksCopy}</p></article>
            <article><CircleSlash2 size={24} /><h3>{t.limitsTitle}</h3><p>{t.limitsCopy}</p></article>
            <article><ShieldCheck size={24} /><h3>{t.responsibleTitle}</h3><p>{t.responsibleCopy}</p></article>
          </div>
        </div>
      </section>

      <section className="platform-discovery-section">
        <div className="shell platform-discovery-grid">
          <article className="platform-guide-card"><span className="kicker">{t.guideEyebrow}</span><h2>{t.guideTitle}</h2><p>{t.guideCopy}</p><Link href={guidePath}>{t.guideCta}<ArrowRight size={17} /></Link></article>
          <article className="platform-related-card"><span className="kicker">{t.relatedEyebrow}</span><h2>{t.relatedTitle}</h2><p>{t.relatedCopy}</p><Link href={relatedPath}>{t.relatedCta}<ArrowRight size={17} /></Link></article>
        </div>
      </section>

      <section className="faq-section platform-faq-section">
        <div className="shell faq-shell">
          <div className="faq-intro"><span className="kicker">{t.faqEyebrow}</span><h2>{t.faqTitle}</h2><p>{t.faqIntro}</p><Link href={localePath(locale, "/contact")}>{locale === "zh-cn" ? "还有问题？联系我们" : locale === "es" ? "¿Más preguntas? Contáctanos" : "Still have questions? Contact us"}<ArrowRight size={15} /></Link></div>
          <div className="faq-list">{t.faqs.map(([question, answer], index) => <details key={question}><summary><b>{String(index + 1).padStart(2, "0")}</b>{question}<span>+</span></summary><p>{answer}</p></details>)}</div>
        </div>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
