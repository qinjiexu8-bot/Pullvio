"use client";

import { Check, ChevronDown, Globe2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { localeNames, localePath, locales, type Locale } from "@/lib/i18n";

function pathWithoutLocale(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] && locales.includes(parts[0] as Locale)) parts.shift();
  return `/${parts.join("/")}`;
}

export default function LanguageMenu({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const currentPath = pathWithoutLocale(pathname);

  return (
    <div className="language-menu" ref={menuRef}>
      <button
        className="language-button"
        type="button"
        aria-label="Change language"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Globe2 size={17} /> {locale === "zh-cn" ? "中文" : locale.toUpperCase()} <ChevronDown size={14} />
      </button>
      {open && (
        <div className="language-popover" role="menu">
          <span>Language</span>
          {locales.map((item) => (
            <a
              href={localePath(item, currentPath)}
              hrefLang={item === "zh-cn" ? "zh-CN" : item}
              lang={item === "zh-cn" ? "zh-CN" : item}
              role="menuitem"
              key={item}
              onClick={() => {
                localStorage.setItem("pullvio-locale", item);
                setOpen(false);
              }}
            >
              {localeNames[item]}
              {item === locale && <Check size={15} />}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
