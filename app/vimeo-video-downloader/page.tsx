import PlatformDownloaderPage from "../components/platform-downloader-page";
import { platformMetadata } from "@/lib/platform-metadata";

export const metadata = platformMetadata("vimeo-video-downloader", "en");

export default function VimeoVideoDownloaderPage() {
  return <PlatformDownloaderPage slug="vimeo-video-downloader" />;
}
