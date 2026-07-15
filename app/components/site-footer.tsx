import Link from "next/link";
import { Brand } from "./site-header";
import { betaCopy, localePath, type Locale } from "@/lib/i18n";

export default function SiteFooter({ locale = "en" }: { locale?: Locale }) {
  const t = betaCopy[locale];
  const labels = locale === "zh-cn" ? { about: "关于我们", guides: "实用指南" } : locale === "es" ? { about: "Nosotros", guides: "Guías" } : { about: "About", guides: "Guides" };
  return <footer><div className="shell footer-shell"><div><Brand locale={locale} /><p>{t.footer}</p></div><div className="footer-links"><Link href={localePath(locale, "/about")}>{labels.about}</Link><Link href="/contact">Contact</Link><Link href={localePath(locale, "/guides")}>{labels.guides}</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/copyright">Copyright</Link></div></div><div className="shell footer-bottom"><span>© 2026 Pullvio</span><span>{t.legal}</span></div></footer>;
}
