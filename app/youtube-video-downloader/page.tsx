import PlatformDownloaderPage from "../components/platform-downloader-page";
import { platformMetadata } from "@/lib/platform-metadata";

export const metadata = platformMetadata("youtube-video-downloader", "en");

export default function YouTubeVideoDownloaderPage() {
  return <PlatformDownloaderPage slug="youtube-video-downloader" />;
}
