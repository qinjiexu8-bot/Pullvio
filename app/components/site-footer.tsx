import Link from "next/link";
import { Brand } from "./site-header";
import { betaCopy, type Locale } from "@/lib/i18n";

export default function SiteFooter({ locale = "en" }: { locale?: Locale }) {
  const t = betaCopy[locale];
  return <footer><div className="shell footer-shell"><div><Brand locale={locale} /><p>{t.footer}</p></div><div className="footer-links"><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/guides">Guides</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/copyright">Copyright</Link></div></div><div className="shell footer-bottom"><span>© 2026 Pullvio</span><span>{t.legal}</span></div></footer>;
}
