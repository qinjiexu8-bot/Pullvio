import PlatformDownloaderPage from "@/app/components/platform-downloader-page";
import { platformMetadata } from "@/lib/platform-metadata";

export const metadata = platformMetadata("facebook-video-downloader", "en");

export default function Page() {
  return <PlatformDownloaderPage slug="facebook-video-downloader" />;
}

