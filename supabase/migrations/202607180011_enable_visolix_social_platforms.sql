update public.media_platform_config
set accepting_jobs = true
where platform in ('instagram', 'facebook', 'snapchat', 'okru');
