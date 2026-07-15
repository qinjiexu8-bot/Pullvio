import type { Metadata, Viewport } from "next";
import { Manrope, Syne } from "next/font/google";
import { headers } from "next/headers";
import { htmlLang, isLocale } from "@/lib/i18n";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pullvio.com"),
  title: "Pullvio Private Beta | A Cleaner Online Media Tool",
  description: "Follow the Pullvio private beta as we build a cleaner browser-based media tool for permitted media workflows. Explore practical MP4, MP3, quality, and permission guides.",
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      "zh-CN": "/zh-cn",
      es: "/es",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    url: "https://pullvio.com/",
    siteName: "Pullvio",
    title: "Pullvio Private Beta | A Cleaner Online Media Tool",
    description: "A truthful frontend beta with practical media format, quality, and permission guides.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pullvio Private Beta | A Cleaner Online Media Tool",
    description: "A truthful frontend beta with practical media format, quality, and permission guides.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#071012" },
    { media: "(prefers-color-scheme: light)", color: "#f4f7f5" },
  ],
};

const themeScript = `
  try {
    const saved = localStorage.getItem('pullvio-theme');
    const theme = saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.dataset.theme = theme;
  } catch (_) {
    document.documentElement.dataset.theme = 'dark';
  }
`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestedLocale = (await headers()).get("x-pullvio-locale") || "en";
  const locale = isLocale(requestedLocale) ? requestedLocale : "en";
  return (
    <html lang={htmlLang[locale]} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${manrope.variable} ${syne.variable}`}>{children}</body>
    </html>
  );
}
