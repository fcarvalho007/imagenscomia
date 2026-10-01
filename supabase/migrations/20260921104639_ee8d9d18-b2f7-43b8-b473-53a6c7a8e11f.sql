-- Replace the definer view with a narrow definer RPC (same pattern as the other
-- public legacy endpoints): public sales pages read prices, dates and branding only.
drop view if exists public.webinar_settings_public;

create or replace function public.legacy_webinar_settings_public()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'webinar', webinar,
    'label', label,
    'emoji', emoji,
    'color', color,
    'event_date', event_date,
    'cutoff_date', cutoff_date,
    'price_premium', price_premium,
    'price_masterclass', price_masterclass,
    'price_bundle', price_bundle
  )), '[]'::jsonb)
  from public.webinar_settings
$$;

revoke execute on function public.legacy_webinar_settings_public() from public;
grant execute on function public.legacy_webinar_settings_public() to anon, authenticated, service_role;