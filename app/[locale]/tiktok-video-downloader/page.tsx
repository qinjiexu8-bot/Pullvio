import { notFound } from "next/navigation";
import PlatformDownloaderPage from "../../components/platform-downloader-page";
import { isLocale, type Locale } from "@/lib/i18n";
import { platformMetadata } from "@/lib/platform-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "en") return {};
  return platformMetadata("tiktok-video-downloader", locale);
}

export default async function LocalizedTikTokVideoDownloaderPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "en") notFound();
  return <PlatformDownloaderPage slug="tiktok-video-downloader" locale={locale as Locale} />;
}
