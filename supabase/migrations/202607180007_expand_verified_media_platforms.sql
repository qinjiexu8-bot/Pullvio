begin;

alter table public.download_jobs
  drop constraint if exists download_jobs_source_platform_check;

alter table public.download_jobs
  add constraint download_jobs_source_platform_check check (
    source_platform in (
      'youtube', 'tiktok', 'vimeo', 'soundcloud', 'bilibili',
      'pinterest', 'twitch', 'dailymotion', 'streamable',
      'snapchat', 'imgur', 'loom', 'dropbox'
    )
  );

alter table public.media_platform_config
  drop constraint if exists media_platform_config_platform_check;

alter table public.media_platform_config
  add constraint media_platform_config_platform_check check (
    platform in (
      'youtube', 'tiktok', 'vimeo', 'soundcloud', 'bilibili',
      'pinterest', 'twitch', 'dailymotion', 'streamable',
      'snapchat', 'imgur', 'loom', 'dropbox'
    )
  );

insert into public.media_platform_config (platform, accepting_jobs)
values
  ('bilibili', false),
  ('pinterest', false),
  ('twitch', false),
  ('dailymotion', false),
  ('streamable', false),
  ('snapchat', false),
  ('imgur', false),
  ('loom', false),
  ('dropbox', false)
on conflict (platform) do update
set accepting_jobs = false;

comment on table public.media_platform_config is
  'Backend-only per-platform media job switches. New sources remain disabled until their production end-to-end checks pass.';

commit;
