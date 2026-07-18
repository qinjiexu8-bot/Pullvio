import PlatformDownloaderPage from "../components/platform-downloader-page";
import { platformMetadata } from "@/lib/platform-metadata";
export const metadata = platformMetadata("imgur-video-downloader", "en");
export default function Page() { return <PlatformDownloaderPage slug="imgur-video-downloader" />; }
