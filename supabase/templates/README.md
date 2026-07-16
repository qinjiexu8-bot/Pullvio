# Pullvio authentication emails

## Confirm sign up

- Subject: `Confirm your Pullvio email`
- Sender name: `Pullvio`
- Sender address: `noreply@pullvio.com`
- Template: [`confirmation.html`](./confirmation.html)

The confirmation template uses `user_metadata.locale` to render English,
Simplified Chinese, or Spanish. The sign-up form sends this value through
Supabase Auth.

The hosted Supabase project requires custom SMTP before email subjects and
templates can be edited. Configure a transactional email provider, verify
`pullvio.com`, add its SPF and DKIM records, publish a DMARC policy, and then
copy this template into Authentication → Emails → Confirm sign up.

Disable click tracking for authentication emails at the SMTP provider. Link
rewriting can invalidate Supabase confirmation URLs.
