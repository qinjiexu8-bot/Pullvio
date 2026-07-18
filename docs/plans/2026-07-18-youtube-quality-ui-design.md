# Homepage spacing and YouTube quality UI design

## Scope

- Reduce the empty space between the fixed navigation and the homepage announcement without changing the platform landing-page hero layout.
- Keep enough clearance for the fixed navigation at desktop, tablet, and mobile widths.
- Hide video-quality controls on the homepage and every non-YouTube platform page.
- Show the quality selector only on `/youtube-video-downloader` and its localized routes.

## Component design

`MediaStudio` receives an explicit `showQualitySelector` boolean that defaults to
`false`. The YouTube platform page enables it by comparing the platform slug;
all other consumers keep the default. This avoids URL-driven client-side
switching, layout shifts, and accidental controls on unrelated platform pages.

The YouTube selector keeps 1080p as the recommended default. Its localized
option labels explain the practical trade-off: 720p creates a smaller file,
1080p is recommended, and 2K/4K create progressively larger files. Audio mode
continues to hide the video-quality selector.

## Cost handling

Visolix pricing was verified in the developer dashboard on 2026-07-18. YouTube
is charged at a flat `$0.00080` per successful download on pay-as-you-go, or
five credits with a subscription. The provider does not publish different API
prices for 720p, 1080p, 1440p, and 2160p. Higher resolutions can still increase
Pullvio's FFmpeg time, S3 object size, and CloudFront transfer cost, so the UI
describes file-size trade-offs without presenting invented per-resolution
prices.

## Verification

- Automated tests, TypeScript, ESLint, and production build pass.
- Homepage: no quality selector; reduced top gap at desktop and mobile widths.
- YouTube landing page: selector visible in video mode with localized labels.
- TikTok and another non-YouTube landing page: selector absent.
- YouTube audio mode: selector absent.
