-- Legacy funnel lockdown: public tables become admin-only (admin role + MFA aal2).
-- Public journeys keep working through the narrow token-based RPCs already deployed
-- (legacy_reg_lookup / session / save_step / recursos_access / attendance / invoice_get)
-- and through edge functions, which use the service role and bypass RLS.

create or replace function public.legacy_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.has_role(auth.uid(), 'admin'), false)
     and coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
$$;
revoke execute on function public.legacy_is_admin() from public, anon;
grant execute on function public.legacy_is_admin() to authenticated;

-- registrations
drop policy if exists "allow_anon_select" on public.registrations;
drop policy if exists "allow_anon_update" on public.registrations;
create policy "legacy_admin_select_registrations" on public.registrations
  for select to authenticated using (public.legacy_is_admin());
create policy "legacy_admin_update_registrations" on public.registrations
  for update to authenticated using (public.legacy_is_admin()) with check (public.legacy_is_admin());
revoke all on public.registrations from anon;
grant select, update on public.registrations to authenticated;
grant all on public.registrations to service_role;

-- invoice_details
drop policy if exists "allow_anon_select_invoice_details" on public.invoice_details;
create policy "legacy_admin_select_invoice_details" on public.invoice_details
  for select to authenticated using (public.legacy_is_admin());
create policy "legacy_admin_insert_invoice_details" on public.invoice_details
  for insert to authenticated with check (public.legacy_is_admin());
create policy "legacy_admin_update_invoice_details" on public.invoice_details
  for update to authenticated using (public.legacy_is_admin()) with check (public.legacy_is_admin());
revoke all on public.invoice_details from anon;
grant select, insert, update on public.invoice_details to authenticated;
grant all on public.invoice_details to service_role;

-- message_logs
drop policy if exists "allow_anon_select_message_logs" on public.message_logs;
drop policy if exists "allow_anon_insert_message_logs" on public.message_logs;
drop policy if exists "allow_anon_update_message_logs" on public.message_logs;
create policy "legacy_admin_select_message_logs" on public.message_logs
  for select to authenticated using (public.legacy_is_admin());
create policy "legacy_admin_insert_message_logs" on public.message_logs
  for insert to authenticated with check (public.legacy_is_admin());
create policy "legacy_admin_update_message_logs" on public.message_logs
  for update to authenticated using (public.legacy_is_admin()) with check (public.legacy_is_admin());
revoke all on public.message_logs from anon;
grant select, insert, update on public.message_logs to authenticated;
grant all on public.message_logs to service_role;

-- payment_events (server-side only)
drop policy if exists "allow_anon_select_payment_events" on public.payment_events;
drop policy if exists "allow_anon_insert_payment_events" on public.payment_events;
create policy "legacy_admin_select_payment_events" on public.payment_events
  for select to authenticated using (public.legacy_is_admin());
revoke all on public.payment_events from anon;
grant select on public.payment_events to authenticated;
grant all on public.payment_events to service_role;

-- email_send_logs
drop policy if exists "allow_anon_select_email_send_logs" on public.email_send_logs;
drop policy if exists "allow_anon_insert_email_send_logs" on public.email_send_logs;
create policy "legacy_admin_select_email_send_logs" on public.email_send_logs
  for select to authenticated using (public.legacy_is_admin());
create policy "legacy_admin_insert_email_send_logs" on public.email_send_logs
  for insert to authenticated with check (public.legacy_is_admin());
revoke all on public.email_send_logs from anon;
grant select, insert on public.email_send_logs to authenticated;
grant all on public.email_send_logs to service_role;

-- analytics_cache
drop policy if exists "allow_anon_select_analytics_cache" on public.analytics_cache;
create policy "legacy_admin_select_analytics_cache" on public.analytics_cache
  for select to authenticated using (public.legacy_is_admin());
revoke all on public.analytics_cache from anon;
grant select on public.analytics_cache to authenticated;
grant all on public.analytics_cache to service_role;

-- email_templates
drop policy if exists "allow_anon_select_email_templates" on public.email_templates;
create policy "legacy_admin_select_email_templates" on public.email_templates
  for select to authenticated using (public.legacy_is_admin());
create policy "legacy_admin_insert_email_templates" on public.email_templates
  for insert to authenticated with check (public.legacy_is_admin());
create policy "legacy_admin_update_email_templates" on public.email_templates
  for update to authenticated using (public.legacy_is_admin()) with check (public.legacy_is_admin());
create policy "legacy_admin_delete_email_templates" on public.email_templates
  for delete to authenticated using (public.legacy_is_admin());
revoke all on public.email_templates from anon;
grant select, insert, update, delete on public.email_templates to authenticated;
grant all on public.email_templates to service_role;

-- acquisition_costs
drop policy if exists "allow_anon_select_costs" on public.acquisition_costs;
drop policy if exists "allow_anon_insert_costs" on public.acquisition_costs;
drop policy if exists "allow_anon_update_costs" on public.acquisition_costs;
drop policy if exists "allow_anon_delete_costs" on public.acquisition_costs;
create policy "legacy_admin_select_acquisition_costs" on public.acquisition_costs
  for select to authenticated using (public.legacy_is_admin());
create policy "legacy_admin_insert_acquisition_costs" on public.acquisition_costs
  for insert to authenticated with check (public.legacy_is_admin());
create policy "legacy_admin_update_acquisition_costs" on public.acquisition_costs
  for update to authenticated using (public.legacy_is_admin()) with check (public.legacy_is_admin());
create policy "legacy_admin_delete_acquisition_costs" on public.acquisition_costs
  for delete to authenticated using (public.legacy_is_admin());
revoke all on public.acquisition_costs from anon;
grant select, insert, update, delete on public.acquisition_costs to authenticated;
grant all on public.acquisition_costs to service_role;

-- webinar_settings: admin only; public pages read the restricted view instead
drop policy if exists "allow_anon_select_webinar_settings" on public.webinar_settings;
drop policy if exists "allow_anon_update_webinar_settings" on public.webinar_settings;
create policy "legacy_admin_select_webinar_settings" on public.webinar_settings
  for select to authenticated using (public.legacy_is_admin());
create policy "legacy_admin_update_webinar_settings" on public.webinar_settings
  for update to authenticated using (public.legacy_is_admin()) with check (public.legacy_is_admin());
revoke all on public.webinar_settings from anon;
grant select, update on public.webinar_settings to authenticated;
grant all on public.webinar_settings to service_role;

-- Public sales pages need prices/dates/branding only. The view intentionally runs
-- with definer rights so anonymous visitors can read these columns without any
-- access to the internal CRM metrics in the base table.
create or replace view public.webinar_settings_public
with (security_invoker = false) as
  select webinar, label, emoji, color, event_date, cutoff_date,
         price_premium, price_masterclass, price_bundle
  from public.webinar_settings;
grant select on public.webinar_settings_public to anon, authenticated;