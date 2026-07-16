# Account dashboard integration

## Decision

Pullvio's account page will use a hybrid Supabase pattern. The server component verifies the session and reads the current user's profile, subscription, daily usage, and recent download jobs before rendering. Small user-owned mutations remain client-side: users can update the profile fields permitted by column grants and delete completed history rows permitted by the existing RLS policy.

This avoids a loading-state flash on the account landing page while keeping the browser bundle and API surface small. A standalone account API would add duplication today and can be introduced later for privileged billing or media-processing operations.

## Data and states

- Missing subscription rows resolve to the Free plan.
- Missing daily usage resolves to zero jobs against the Free allowance of three.
- Missing download rows render a useful empty state rather than placeholder claims.
- Active, trialing, and past-due Pro subscriptions are represented explicitly; payment-state wording remains visible.
- Database failures show a localized, non-technical retry notice without exposing query details.
- Unconfigured local environments keep the existing setup notice.

Profile changes are limited to display name, locale, and theme. Email remains managed by Supabase Auth. A locale change navigates to the matching localized account route after the update. Theme changes are applied immediately and persisted in the account profile as well as the browser preference.

Download history displays source, media format, quality, status, date, and file size when available. Only terminal jobs can be deleted, matching the database policy. Source links open with safe external-link attributes.

## Verification

Run lint, TypeScript, internal-link checks, and a production build. Verify authenticated and unauthenticated account routes, empty states, responsive layout, profile updates, and history deletion in the browser. RLS remains the final authorization boundary for every client mutation.
