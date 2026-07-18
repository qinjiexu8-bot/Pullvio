# Visolix social platform integration

## Scope

Add production support for Instagram, Facebook, Snapchat, and OK.ru through the existing Visolix provider account. Publish dedicated English, Simplified Chinese, and Spanish downloader pages for each platform. Keep YouTube's quality selector exclusive to YouTube because Visolix accepts `X-FORMAT` only for YouTube.

## Architecture

The worker will treat YouTube, Instagram, Facebook, Snapchat, and OK.ru as Visolix-backed sources. A shared provider workflow submits a URL with the platform identifier, polls progress, downloads the temporary provider result, normalizes it to MP4, derives MP3 and a cover image with FFmpeg, uploads all artifacts to private S3, and exposes only signed Pullvio delivery URLs. Existing yt-dlp sources remain unchanged.

Provider runs will record the source platform and use `source` as the provider format for non-YouTube requests. The provider run RPC will accept only the five reviewed Visolix platforms. A 402 response is an account-level balance incident: all Visolix-backed platform switches are disabled, one deduplicated Feishu alert is queued, and clients receive the existing friendly `PROVIDER_BALANCE_EXHAUSTED` message.

Repeated-request Turnstile checks will apply to every Visolix-backed source, using the current user/device and network thresholds. Source URLs remain HTTPS-only, host-allowlisted, stripped of fragments, and restricted to direct public media paths.

## SEO and routes

Publish `/instagram-video-downloader`, `/facebook-video-downloader`, `/snapchat-video-downloader`, and `/okru-video-downloader` with localized equivalents. Each page gets a unique title, description, H1, first-paragraph answer, platform-specific formats and limitations, FAQ content, canonical URL, hreflang links, internal links, and sitemap entries.

Keyword maps:

- Instagram: `instagram video downloader`, `instagram reel downloader`, `download instagram video`, `instagram to mp4`, `instagram to mp3`.
- Facebook: `facebook video downloader`, `facebook reel downloader`, `download facebook video`, `facebook to mp4`, `facebook to mp3`.
- Snapchat: `snapchat video downloader`, `snapchat spotlight downloader`, `download snapchat video`, `snapchat to mp4`, `snapchat to mp3`.
- OK.ru: `okru video downloader`, `ok.ru video downloader`, `download ok.ru video`, `okru to mp4`, `okru to mp3`.

The copy will describe only public, permitted media and will not promise private, login-only, DRM-protected, expired, or deleted content.

## Verification

Add TypeScript URL-normalization and public-platform catalog tests, Python Visolix client/worker routing tests, and SQL migration assertions through code review. Run frontend tests, worker tests, typecheck, lint, and production build. Render the new pages at desktop and mobile widths, verify one H1, canonical/hreflang metadata, sitemap inclusion, platform-specific placeholders, and absence of the YouTube quality selector.
