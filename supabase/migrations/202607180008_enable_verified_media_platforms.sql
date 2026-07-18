update public.media_platform_config
set accepting_jobs = true
where platform in (
  'pinterest',
  'twitch',
  'dailymotion',
  'streamable',
  'snapchat',
  'imgur',
  'loom',
  'dropbox'
);

comment on table public.media_platform_config is
  'Per-platform production switches. YouTube and Bilibili stay disabled until their egress paths pass production probes.';
