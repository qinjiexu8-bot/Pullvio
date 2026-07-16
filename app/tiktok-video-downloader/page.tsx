import PlatformDownloaderPage from "../components/platform-downloader-page";
import { platformMetadata } from "@/lib/platform-metadata";

export const metadata = platformMetadata("tiktok-video-downloader", "en");

export default function TikTokVideoDownloaderPage() {
  return <PlatformDownloaderPage slug="tiktok-video-downloader" />;
}
