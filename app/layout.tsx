import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { esES, zhCN } from "@clerk/localizations";
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
  title: "Free Online Video Downloader - Download MP4 & MP3 | Pullvio",
  description: "Easily download public videos from URLs to MP4, convert links to MP3, and keep original quality up to 4K. Pullvio works directly in your browser without any installation.",
  keywords: ["online video downloader", "download video from link", "link to mp4 converter", "extract audio from video", "free video downloader"],
  openGraph: {
    type: "website",
    url: "https://pullvio.com/",
    siteName: "Pullvio",
    title: "Free Online Video Downloader - Download MP4 & MP3 | Pullvio",
    description: "Easily download public videos from URLs to MP4, convert links to MP3, and keep original quality up to 4K—directly in your browser.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Video Downloader - Download MP4 & MP3 | Pullvio",
    description: "Easily download public videos from URLs to MP4, convert links to MP3, and keep original quality up to 4K—directly in your browser.",
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

const schemaData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://pullvio.com/#organization",
      "name": "Pullvio",
      "url": "https://pullvio.com/",
      "logo": "https://pullvio.com/icon.svg",
    },
    {
      "@type": "WebSite",
      "@id": "https://pullvio.com/#website",
      "name": "Pullvio",
      "url": "https://pullvio.com/",
      "publisher": { "@id": "https://pullvio.com/#organization" },
      "inLanguage": ["en", "zh-CN", "es"],
    },
  ],
};

const zhClerkLocalization = {
  ...zhCN,
  formFieldInputPlaceholder__password: "请输入密码",
  formFieldInputPlaceholder__signUpPassword: "请创建密码",
};

const esClerkLocalization = {
  ...esES,
  formFieldInputPlaceholder__password: "Introduce tu contraseña",
  formFieldInputPlaceholder__signUpPassword: "Crea una contraseña",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestedLocale = (await headers()).get("x-pullvio-locale") || "en";
  const locale = isLocale(requestedLocale) ? requestedLocale : "en";
  return (
    <html lang={htmlLang[locale]} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      </head>
      <body className={`${manrope.variable} ${syne.variable}`}>
        <ClerkProvider localization={locale === "zh-cn" ? zhClerkLocalization : locale === "es" ? esClerkLocalization : undefined}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
