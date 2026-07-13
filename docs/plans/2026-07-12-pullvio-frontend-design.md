# Pullvio Frontend V1

## Goal

Create a responsive, premium SaaS landing page for Pullvio that makes the first action obvious: paste a permitted public media link, understand what will happen, and progress toward a Pro subscription.

## Direction

Pullvio uses a refined, dark utility aesthetic rather than the visual language of ad-supported download sites. Deep blue-black surfaces and mint highlights communicate privacy, speed, and precision. Syne provides a distinctive editorial display face, while Manrope keeps functional UI copy readable.

## Information architecture

1. Header with product navigation, language, sign-in, and Pro CTA.
2. Hero with product promise and interactive media-link studio.
3. Supported-platform strip.
4. Three-step workflow.
5. Product principles: privacy, source quality, unified workflow.
6. Pullvio Pro pricing and benefit summary.
7. FAQ and legal-use reminder.

## Interaction states

The studio includes video/audio modes, URL validation, a loading skeleton, an error message, and a simulated success result. The implementation is intentionally frontend-only; later API integration can replace the simulated timer while preserving the same state model.

## Responsive behavior

Desktop uses an asymmetric two-column hero. Tablet stacks the promise above the studio. Mobile turns the URL action into a full-width button, stacks result actions, replaces the header with an accessible menu, and collapses all multi-column content into a single reading flow.

## Acceptance criteria

- Builds successfully with Next.js and TypeScript.
- No horizontal overflow at 375px.
- Navigation and form controls are keyboard reachable.
- URL form visibly represents idle, loading, error, and success states.
- Reduced-motion preferences are respected.

## V1.1 refinements

- Add a light/dark theme toggle that follows the system on first visit and remembers explicit user preference.
- Target the transactional search intent around online video downloads, MP4 video, MP3 audio extraction, and 4K quality without keyword stuffing.
- Add canonical metadata, social metadata, robots.txt, sitemap.xml, SoftwareApplication structured data, and visible FAQ content mirrored by FAQ schema.
- Separate Free and Pro with two plan cards and a feature-by-feature comparison that remains readable at 375px.
- Expand the homepage with original format guidance, resolution explanations, user scenarios, service boundaries, and eight visible FAQ answers. This follows competitor content depth without copying claims or promising unbuilt GIF, subtitle, transcript, or MCP features.
