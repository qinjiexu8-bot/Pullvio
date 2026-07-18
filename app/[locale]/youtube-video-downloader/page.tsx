import { notFound } from "next/navigation";
import PlatformDownloaderPage from "../../components/platform-downloader-page";
import { isLocale, type Locale } from "@/lib/i18n";
import { platformMetadata } from "@/lib/platform-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "en") return {};
  return platformMetadata("youtube-video-downloader", locale);
}

export default async function LocalizedYouTubeVideoDownloaderPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "en") notFound();
  return <PlatformDownloaderPage slug="youtube-video-downloader" locale={locale as Locale} />;
}
