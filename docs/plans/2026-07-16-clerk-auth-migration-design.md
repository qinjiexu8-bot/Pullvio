# Clerk authentication migration

## Architecture

Clerk becomes Pullvio's identity provider for email/password, Google sign-in, email verification, password recovery, and session cookies. Supabase remains the application database. The Next.js Clerk SDK supplies the session token to every Supabase client through the native `accessToken` hook.

Supabase trusts the Clerk development issuer through its first-party third-party authentication integration. Row Level Security compares each row's text `user_id` (or profile `id`) with `auth.jwt() ->> 'sub'`. No service-role key is sent to the browser.

## Data migration

Existing UUID user identifiers are cast to text in place, so no profile, subscription, usage, or download rows are deleted. Existing Supabase Auth accounts are not automatically synchronized into Clerk. During the current pre-launch phase, users create a new Clerk account. A future email-based reconciliation job can map legacy rows if preserving test accounts becomes necessary.

## Application flow

The localized `/login` and `/signup` pages keep Pullvio's existing layout and embed Clerk's components with hash routing, so verification and recovery steps do not require new localized catch-all routes. Successful authentication redirects to the localized account page. The account page reads Clerk's server identity, lazily creates the user's Supabase profile, and queries all remaining data under RLS.

## Security and verification

The migration keeps authorization in Postgres, enables compromised-password checks and new-device verification in Clerk, and never exposes the Clerk secret key to client code or Git. Verification covers type checking, linting, production build, internal links, migration dry-run/push, unauthenticated redirects, sign-in rendering, and authenticated account data isolation.
