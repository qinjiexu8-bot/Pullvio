# Account download history pagination

## Decision

Use server-side, URL-addressable pagination for account download history. The
supported page sizes are 10, 20, and 50, with 10 as the default. `page` and
`pageSize` query parameters make refresh, browser navigation, and localized account
routes deterministic.

Only the current page of jobs and artifacts is queried and only those artifacts
receive fresh CloudFront signatures. The query uses a stable
`created_at desc, id desc` order backed by a composite user history index. Exact
counts power numbered navigation; this is appropriate for per-account history and
the requested random page navigation, while avoiding the much larger cost of
loading and signing the full history in the browser.

Invalid values fall back to page 1 and 10 rows. A page beyond the final page is
redirected to the last valid page. Changing page size returns to page 1. Deleting
the final row on a non-first page moves to the preceding page.

## Result-card layout

Ready-state messaging occupies the first row. Artifact actions occupy a dedicated
second row in the fixed order Video, Audio, Cover. Desktop uses a horizontal row;
small screens allow wrapping and then full-width controls.
