create or replace view public.webinar_settings_public as
  select webinar, label, emoji, color, event_date, cutoff_date,
         price_premium, price_masterclass, price_bundle
  from public.webinar_settings;

grant select on public.webinar_settings_public to anon, authenticated;

create or replace function public.legacy_reg_lookup(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare r registrations;
begin
  if p_token is null or length(btrim(p_token)) < 20 then return null; end if;
  select * into r from registrations where edit_token = btrim(p_token)
    order by created_at desc limit 1;
  if not found then return null; end if;
  return jsonb_build_object(
    'id', r.id,
    'webinar', r.webinar,
    'email', r.email,
    'name', r.name,
    'first_name', r.first_name,
    'last_name', r.last_name,
    'whatsapp', r.whatsapp,
    'role', r.role,
    'team_size', r.team_size,
    'sources', r.sources,
    'duvida', r.duvida,
    'referral_code', r.referral_code,
    'step_reached', r.step_reached,
    'plan_selected', r.plan_selected,
    'paid', r.paid_at is not null,
    'premium', (r.premium_granted_at is not null or coalesce(r.premium_unlocked, false)),
    'attended', r.attended_live_at is not null
  );
end $$;

create or replace function public.legacy_reg_session(p_token text, p_webinar text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare r registrations;
begin
  if p_token is null or length(btrim(p_token)) < 20 then return null; end if;
  select * into r from registrations
    where edit_token = btrim(p_token)
      and (p_webinar is null or webinar = p_webinar)
    order by paid_at desc nulls last, premium_granted_at desc nulls last, created_at desc
    limit 1;
  if not found then return null; end if;
  return jsonb_build_object(
    'id', r.id,
    'webinar', r.webinar,
    'name', r.name,
    'first_name', r.first_name,
    'role', r.role,
    'team_size', r.team_size,
    'step_reached', r.step_reached,
    'plan_selected', r.plan_selected,
    'paid', r.paid_at is not null,
    'premium', (r.premium_granted_at is not null or coalesce(r.premium_unlocked, false)),
    'attended', r.attended_live_at is not null
  );
end $$;

create or replace function public.legacy_reg_save_step(
  p_token text,
  p_webinar text default null,
  p_step integer default null,
  p_patch jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare r registrations; k text; v text;
  allowed constant text[] := array[
    'first_name','last_name','whatsapp','role','team_size',
    'sources','duvida','gender_override','plan_selected','upgrade_clicked_at'];
  plans constant text[] := array[
    'premium','masterclass','bundle','gravacao','gravacao-masterclass',
    'video-premium','video-masterclass','video-bundle'];
begin
  if p_token is null or length(btrim(p_token)) < 20 then return false; end if;
  if jsonb_typeof(p_patch) is distinct from 'object' then raise exception 'Invalid patch'; end if;
  if p_step is not null and (p_step < 0 or p_step > 50) then raise exception 'Invalid step'; end if;
  for k in select jsonb_object_keys(p_patch) loop
    if not (k = any(allowed)) then raise exception 'Field not allowed: %', k; end if;
    v := p_patch ->> k;
    if v is not null then
      if k in ('first_name','last_name') and length(v) > 120 then
        raise exception 'Value too long: %', k;
      elsif k = 'sources' and length(v) > 400 then
        raise exception 'Value too long: %', k;
      elsif k = 'duvida' and length(v) > 2000 then
        raise exception 'Value too long: %', k;
      elsif k = 'whatsapp' and length(v) > 30 then
        raise exception 'Value too long: %', k;
      elsif k = 'role' and length(v) > 120 then
        raise exception 'Value too long: %', k;
      elsif k not in ('first_name','last_name','sources','duvida','whatsapp','role') and length(v) > 40 then
        raise exception 'Value too long: %', k;
      end if;
    end if;
    if k = 'plan_selected' and v is not null and not (v = any(plans)) then raise exception 'Invalid plan'; end if;
  end loop;
  select * into r from registrations
    where edit_token = btrim(p_token)
      and (p_webinar is null or webinar = p_webinar)
    order by paid_at desc nulls last, created_at desc
    limit 1
    for update;
  if not found then return false; end if;
  if (r.paid_at is not null or r.premium_granted_at is not null)
     and p_patch ? 'plan_selected' and (p_patch->>'plan_selected') is distinct from r.plan_selected then
    raise exception 'Paid plan requires a new order';
  end if;
  update registrations set
    step_reached = coalesce(p_step, step_reached),
    first_name = coalesce(btrim(p_patch ->> 'first_name'), first_name),
    last_name = coalesce(btrim(p_patch ->> 'last_name'), last_name),
    whatsapp = coalesce(btrim(p_patch ->> 'whatsapp'), whatsapp),
    role = coalesce(btrim(p_patch ->> 'role'), role),
    team_size = coalesce(btrim(p_patch ->> 'team_size'), team_size),
    sources = coalesce(btrim(p_patch ->> 'sources'), sources),
    duvida = coalesce(btrim(p_patch ->> 'duvida'), duvida),
    gender_override = coalesce(btrim(p_patch ->> 'gender_override'), gender_override),
    plan_selected = coalesce(p_patch ->> 'plan_selected', plan_selected),
    upgrade_clicked_at = coalesce(
      case when p_patch ->> 'upgrade_clicked_at' is null then null
           else (p_patch ->> 'upgrade_clicked_at')::timestamptz end,
      upgrade_clicked_at),
    updated_at = now()
  where id = r.id;
  return true;
end $$;

create or replace function public.legacy_recursos_access(p_token text, p_webinar text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare r registrations;
begin
  if p_token is null or length(btrim(p_token)) < 20 then
    return jsonb_build_object('found', false, 'access', false, 'name', null, 'plan', null);
  end if;
  select * into r from registrations
    where edit_token = btrim(p_token)
      and (p_webinar is null or webinar = p_webinar)
    order by paid_at desc nulls last, premium_granted_at desc nulls last, created_at desc
    limit 1;
  if not found then
    return jsonb_build_object('found', false, 'access', false, 'name', null, 'plan', null);
  end if;
  return jsonb_build_object(
    'found', true,
    'access', (r.paid_at is not null or r.premium_granted_at is not null),
    'name', r.first_name,
    'plan', r.plan_selected
  );
end $$;

create or replace function public.legacy_reg_attendance(p_token text, p_webinar text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare r registrations; now_attended boolean;
begin
  if p_token is null or length(btrim(p_token)) < 20 then
    return jsonb_build_object('found', false, 'attended', false);
  end if;
  select * into r from registrations
    where edit_token = btrim(p_token) and webinar = p_webinar
    order by created_at desc limit 1;
  if not found then
    return jsonb_build_object('found', false, 'attended', false);
  end if;
  now_attended := r.attended_live_at is not null;
  if not now_attended then
    update registrations set attended_live_at = now(), updated_at = now() where id = r.id;
    now_attended := true;
  end if;
  return jsonb_build_object('found', true, 'attended', now_attended);
end $$;

create or replace function public.legacy_invoice_get(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare inv invoice_details;
begin
  if p_token is null or length(btrim(p_token)) < 20 then return null; end if;
  select i.* into inv
    from invoice_details i
    join registrations r on r.id = i.registration_id
    where r.edit_token = btrim(p_token)
    limit 1;
  if not found then return null; end if;
  return jsonb_build_object(
    'invoice_name', inv.invoice_name,
    'invoice_vat', inv.invoice_vat,
    'invoice_address', inv.invoice_address,
    'invoice_zip', inv.invoice_zip,
    'invoice_city', inv.invoice_city,
    'invoice_email', inv.invoice_email
  );
end $$;

revoke execute on function public.legacy_reg_lookup(text) from public;
revoke execute on function public.legacy_reg_session(text, text) from public;
revoke execute on function public.legacy_reg_save_step(text, text, integer, jsonb) from public;
revoke execute on function public.legacy_recursos_access(text, text) from public;
revoke execute on function public.legacy_reg_attendance(text, text) from public;
revoke execute on function public.legacy_invoice_get(text) from public;
grant execute on function public.legacy_reg_lookup(text) to anon, authenticated;
grant execute on function public.legacy_reg_session(text, text) to anon, authenticated;
grant execute on function public.legacy_reg_save_step(text, text, integer, jsonb) to anon, authenticated;
grant execute on function public.legacy_recursos_access(text, text) to anon, authenticated;
grant execute on function public.legacy_reg_attendance(text, text) to anon, authenticated;
grant execute on function public.legacy_invoice_get(text) to anon, authenticated;

create or replace function public.legacy_access_link_claim(
  p_registration_id uuid,
  p_destination text
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_recent integer;
  v_daily integer;
begin
  if p_registration_id is null then return false; end if;

  perform pg_advisory_xact_lock(hashtextextended('legacy_access_link:' || p_registration_id::text, 0));

  select count(*) into v_recent
  from message_logs
  where registration_id = p_registration_id
    and template_key = 'legacy_access_link'
    and created_at > now() - interval '10 minutes';
  if v_recent > 0 then return false; end if;

  select count(*) into v_daily
  from message_logs
  where registration_id = p_registration_id
    and template_key = 'legacy_access_link'
    and created_at > now() - interval '24 hours';
  if v_daily >= 3 then return false; end if;

  insert into message_logs (registration_id, channel, provider, template_key, status)
  values (p_registration_id, 'email', 'resend', 'legacy_access_link', 'queued');

  return true;
end $$;

revoke execute on function public.legacy_access_link_claim(uuid, text) from public, anon, authenticated;
grant execute on function public.legacy_access_link_claim(uuid, text) to service_role;