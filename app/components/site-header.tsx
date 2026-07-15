"use client";

import { ArrowRight, Menu, Moon, Play, Sun, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { betaCopy, localePath, type Locale } from "@/lib/i18n";
import LanguageMenu from "./language-menu";

export function Brand({ locale = "en" }: { locale?: Locale }) {
  return (
    <Link className="brand" href={localePath(locale)} aria-label="Pullvio home">
      <span className="brand-mark" aria-hidden="true"><span /><Play size={13} fill="currentColor" strokeWidth={0} /></span>
      <span>pullvio</span>
    </Link>
  );
}

export function ThemeToggle() {
  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("pullvio-theme", next);
  }
  return <button className="theme-toggle" type="button" aria-label="Toggle light and dark theme" onClick={toggleTheme}><Sun className="theme-sun" size={17} /><Moon className="theme-moon" size={17} /></button>;
}

export default function SiteHeader({ locale = "en", simple = false }: { locale?: Locale; simple?: boolean }) {
  const t = betaCopy[locale];
  const navHref = (href: string) => href.startsWith("#") ? `${localePath(locale)}${href}` : localePath(locale, href);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={`site-header ${simple ? "content-site-header" : ""}`}>
      <div className="shell nav-shell">
        <Brand locale={locale} />
        <nav className="desktop-nav" aria-label="Main navigation">
          {t.nav.map(([label, href]) => <Link href={navHref(href)} key={href}>{label}</Link>)}
        </nav>
        <div className="nav-actions">
          <ThemeToggle /><LanguageMenu locale={locale} />
          <Link className="sign-in" href={localePath(locale, "/login")}>{t.signIn}</Link>
          <Link className="pro-button beta-button" href={`${localePath(locale)}#beta-status`}>{t.statusCta}<ArrowRight size={16} /></Link>
        </div>
        <div className="mobile-header-actions"><LanguageMenu locale={locale} /><ThemeToggle /><button className="menu-button" type="button" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</button></div>
      </div>
      {open && <div className="mobile-panel"><nav>{t.nav.map(([label, href]) => <Link href={navHref(href)} key={href} onClick={() => setOpen(false)}>{label}<ArrowRight size={18} /></Link>)}</nav><div className="mobile-actions"><Link href={localePath(locale, "/login")}>{t.signIn}</Link><Link className="pro-button" href={`${localePath(locale)}#beta-status`} onClick={() => setOpen(false)}>{t.statusCta}</Link></div></div>}
    </header>
  );
}
