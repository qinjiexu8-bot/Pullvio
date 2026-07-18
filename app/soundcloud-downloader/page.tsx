import PlatformDownloaderPage from "../components/platform-downloader-page";
import { platformMetadata } from "@/lib/platform-metadata";

export const metadata = platformMetadata("soundcloud-downloader", "en");

export default function SoundCloudDownloaderPage() {
  return <PlatformDownloaderPage slug="soundcloud-downloader" />;
}
