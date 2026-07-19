revoke insert on table public.waitlist_signups from anon, authenticated;

drop policy if exists waitlist_signups_public_insert on public.waitlist_signups;

comment on table public.waitlist_signups is
  'Private product-notification waitlist. Writes are accepted only through the server-side Pullvio API.';
