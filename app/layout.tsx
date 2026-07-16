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
  title: "Online Video Downloader – MP4, MP3 & 4K | Pullvio",
  description: "Download permitted online videos as MP4, extract MP3 audio, and keep original quality up to 4K. Pullvio works directly in your browser on mobile and desktop.",
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
    title: "Online Video Downloader – MP4, MP3 & 4K | Pullvio",
    description: "Download permitted online videos as MP4, extract MP3 audio, and keep original quality up to 4K—directly in your browser.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Video Downloader – MP4, MP3 & 4K | Pullvio",
    description: "Download permitted online videos as MP4, extract MP3 audio, and keep original quality up to 4K—directly in your browser.",
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
