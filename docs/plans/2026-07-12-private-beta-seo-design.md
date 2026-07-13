# Pullvio Private Beta SEO Design

## Goal

Launch a truthful, indexable frontend before media processing is available. The site must build brand and informational search visibility without implying that downloads, subscriptions, platform support, or paid features are already live.

## Chosen approach

Use the existing refined visual system, but replace the simulated downloader with a static beta-status panel. The homepage will explain the product direction, publishing principles, delivery roadmap, and link to useful educational guides. Transactional platform downloader pages will not be published until their corresponding workflow works end to end.

## Indexable information architecture

- `/`, `/zh-cn`, `/es`: localized beta homepages
- `/about`, `/contact`: identity and support
- `/privacy`, `/terms`, `/copyright`, `/acceptable-use`: trust and policy
- `/guides`: content hub
- `/guides/mp4-vs-mp3`
- `/guides/video-resolution-guide`
- `/guides/save-online-media-legally`

Account and authentication routes remain `noindex`.

## SEO rules

- Canonical, language links, navigation, and sitemap use the same no-trailing-slash URLs.
- The root homepage provides `WebSite` and `Organization` JSON-LD.
- Guides provide `Article` and `BreadcrumbList` JSON-LD.
- No fake ratings, unsupported `SoftwareApplication` rich-result claims, or paid offers.
- Each indexable page has a unique title, description, H1, and contextual internal links.

## Verification

Run ESLint, TypeScript, and a production build. Verify canonical and robots output with HTTP responses, then inspect the homepage, one guide, and policy pages at desktop and 390px mobile widths.
