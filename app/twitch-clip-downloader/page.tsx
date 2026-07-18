import PlatformDownloaderPage from "../components/platform-downloader-page";
import { platformMetadata } from "@/lib/platform-metadata";
export const metadata = platformMetadata("twitch-clip-downloader", "en");
export default function Page() { return <PlatformDownloaderPage slug="twitch-clip-downloader" />; }
