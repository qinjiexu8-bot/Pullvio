# Public platform alignment design

## Goal

Make Pullvio's public product surface match the production backend exactly. Publicly advertise and index only platforms whose production platform switch is enabled: TikTok, Vimeo, and SoundCloud. YouTube and every unintegrated platform remain absent until their backend path passes an authorized end-to-end test.

## Public routes and SEO

- Keep the localized TikTok downloader pages.
- Add localized Vimeo video downloader and SoundCloud audio downloader pages.
- Remove the English, Simplified Chinese, and Spanish YouTube downloader routes.
- Remove the YouTube platform guide from guide hubs, static parameters, internal links, and the XML sitemap. Its editorial source may remain dormant so it can be reviewed and restored later.
- Return a normal 404 for retired URLs instead of redirecting them to a different platform or the homepage. This avoids misleading users and preserves a clear removal signal for search engines.
- Include only TikTok, Vimeo, and SoundCloud tool URLs in localized `hreflang`, canonical metadata, structured data, homepage links, footer links, and sitemap entries.

## Product behavior

The homepage and shared error copy list TikTok, Vimeo, and SoundCloud as supported. Vimeo supports video or audio output. The SoundCloud page starts in Audio mode and disables Video mode because the backend accepts SoundCloud only as audio. Unsupported source parsing and the dormant YouTube backend integration remain server-side so platforms can be re-enabled without rebuilding the worker architecture.

## Re-enabling a platform

A platform may return to the public site only after its database switch is enabled and an authorized full path succeeds through API reservation, queue, worker, object storage, and private delivery. Restoration includes its route, localized copy, internal links, metadata, structured data, and sitemap entry in the same release.

## Verification

- Run unit tests, type checking, and a production build.
- Confirm the build route manifest includes TikTok, Vimeo, and SoundCloud pages in all three locales.
- Confirm retired YouTube tool and guide URLs return 404.
- Confirm the sitemap contains no YouTube URL and contains every localized enabled-platform URL.
- Check all internal links for local 404 responses and inspect desktop/mobile layouts for the new pages.
