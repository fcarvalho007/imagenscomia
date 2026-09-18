-- ============================================================================
-- 20260918190000_legacy_rls_lockdown.sql
-- DRAFT — NÃO APLICAR sem revisão do diff (auditoria de segurança do legado).
--
-- Fecha as políticas públicas (USING (true)) das tabelas do funil legado:
-- acesso direto passa a exigir sessão autenticada com role admin + MFA aal2
-- (mesmo padrão do módulo Curso IA). Os percursos públicos (inscrição, upgrade,
-- confirmação, sessão ao vivo, recursos, faturação) passam por RPCs estreitas
-- security definer, que nunca devolvem edit_token nem campos sensíveis.
-- Edge functions continuam a usar a chave de serviço (bypass RLS), sem alterações.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Helper de administração (admin + MFA aal2)
-- ---------------------------------------------------------------------------
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

-- Executável por authenticated (as políticas RLS são avaliadas com os privilégios
-- de quem consulta; revogar a authenticated quebraria as políticas). Direto devolve
-- apenas um booleano — chamado por não-admin devolve false.
revoke execute on function public.legacy_is_admin() from public, anon;
grant execute on function public.legacy_is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Políticas por tabela: só administradores autenticados com aal2
--    (as edge functions usam service_role e continuam a funcionar sem alterações)
-- ---------------------------------------------------------------------------

-- registrations
drop policy if exists "allow_anon_select" on public.registrations;
drop policy if exists "allow_anon_update" on public.registrations;
create policy "legacy_admin_select_registrations" on public.registrations
  for select to authenticated
  using (public.legacy_is_admin());
create policy "legacy_admin_update_registrations" on public.registrations
  for update to authenticated
  using (public.legacy_is_admin())
  with check (public.legacy_is_admin());

-- invoice_details
drop policy if exists "allow_anon_select_invoice_details" on public.invoice_details;
create policy "legacy_admin_select_invoice_details" on public.invoice_details
  for select to authenticated
  using (public.legacy_is_admin());
create policy "legacy_admin_insert_invoice_details" on public.invoice_details
  for insert to authenticated
  with check (public.legacy_is_admin());
create policy "legacy_admin_update_invoice_details" on public.invoice_details
  for update to authenticated
  using (public.legacy_is_admin())
  with check (public.legacy_is_admin());

-- message_logs
drop policy if exists "allow_anon_select_message_logs" on public.message_logs;
drop policy if exists "allow_anon_insert_message_logs" on public.message_logs;
drop policy if exists "allow_anon_update_message_logs" on public.message_logs;
create policy "legacy_admin_select_message_logs" on public.message_logs
  for select to authenticated
  using (public.legacy_is_admin());
create policy "legacy_admin_insert_message_logs" on public.message_logs
  for insert to authenticated
  with check (public.legacy_is_admin());

-- payment_events
drop policy if exists "allow_anon_select_payment_events" on public.payment_events;
drop policy if exists "allow_anon_insert_payment_events" on public.payment_events;
create policy "legacy_admin_select_payment_events" on public.payment_events
  for select to authenticated
  using (public.legacy_is_admin());

-- email_send_logs
drop policy if exists "allow_anon_select_email_send_logs" on public.email_send_logs;
drop policy if exists "allow_anon_insert_email_send_logs" on public.email_send_logs;
create policy "legacy_admin_select_email_send_logs" on public.email_send_logs
  for select to authenticated
  using (public.legacy_is_admin());
create policy "legacy_admin_insert_email_send_logs" on public.email_send_logs
  for insert to authenticated
  with check (public.legacy_is_admin());

-- analytics_cache
drop policy if exists "allow_anon_select_analytics_cache" on public.analytics_cache;
create policy "legacy_admin_select_analytics_cache" on public.analytics_cache
  for select to authenticated
  using (public.legacy_is_admin());

-- email_templates
drop policy if exists "allow_anon_select_email_templates" on public.email_templates;
create policy "legacy_admin_select_email_templates" on public.email_templates
  for select to authenticated
  using (public.legacy_is_admin());
create policy "legacy_admin_insert_email_templates" on public.email_templates
  for insert to authenticated
  with check (public.legacy_is_admin());
create policy "legacy_admin_update_email_templates" on public.email_templates
  for update to authenticated
  using (public.legacy_is_admin())
  with check (public.legacy_is_admin());
create policy "legacy_admin_delete_email_templates" on public.email_templates
  for delete to authenticated
  using (public.legacy_is_admin());

-- acquisition_costs
drop policy if exists "allow_anon_select_costs" on public.acquisition_costs;
drop policy if exists "allow_anon_insert_costs" on public.acquisition_costs;
drop policy if exists "allow_anon_update_costs" on public.acquisition_costs;
drop policy if exists "allow_anon_delete_costs" on public.acquisition_costs;
create policy "legacy_admin_select_acquisition_costs" on public.acquisition_costs
  for select to authenticated
  using (public.legacy_is_admin());
create policy "legacy_admin_insert_acquisition_costs" on public.acquisition_costs
  for insert to authenticated
  with check (public.legacy_is_admin());
create policy "legacy_admin_update_acquisition_costs" on public.acquisition_costs
  for update to authenticated
  using (public.legacy_is_admin())
  with check (public.legacy_is_admin());
create policy "legacy_admin_delete_acquisition_costs" on public.acquisition_costs
  for delete to authenticated
  using (public.legacy_is_admin());

-- webinar_settings (escrita só de admin; leitura pública passa pela vista abaixo)
drop policy if exists "allow_anon_select_webinar_settings" on public.webinar_settings;
drop policy if exists "allow_anon_update_webinar_settings" on public.webinar_settings;
create policy "legacy_admin_select_webinar_settings" on public.webinar_settings
  for select to authenticated
  using (public.legacy_is_admin());
create policy "legacy_admin_update_webinar_settings" on public.webinar_settings
  for update to authenticated
  using (public.legacy_is_admin())
  with check (public.legacy_is_admin());

-- ---------------------------------------------------------------------------
-- 3. Vista pública com apenas os campos necessários às páginas de vendas
--    (preços, datas e identidade visual — sem métricas internas de CRM)
-- ---------------------------------------------------------------------------
create or replace view public.webinar_settings_public as
  select webinar, label, emoji, color, event_date, cutoff_date,
         price_premium, price_masterclass, price_bundle
  from public.webinar_settings;

grant select on public.webinar_settings_public to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. RPCs públicas estreitas (security definer) para os percursos públicos.
--    Nunca devolvem edit_token nem campos de faturação/pagamento.
-- ---------------------------------------------------------------------------

-- Por token (links ?t= já enviados): dados próprios mínimos
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
    'step_reached', r.step_reached,
    'plan_selected', r.plan_selected,
    'paid', r.paid_at is not null,
    'premium', (r.premium_granted_at is not null or coalesce(r.premium_unlocked, false)),
    'attended', r.attended_live_at is not null
  );
end $$;

-- Por email (recuperação sem link): dados de funil mínimos, sem edit_token
create or replace function public.legacy_reg_session(p_email text, p_webinar text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare r registrations;
begin
  if p_email is null or p_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then return null; end if;
  select * into r from registrations
    where email = lower(btrim(p_email))
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

-- Guarda de progresso do funil por email, com lista branca de campos.
-- Nunca altera paid_at, premium_*, faturação, estado ou permissões.
create or replace function public.legacy_reg_save_step(
  p_email text,
  p_webinar text default null,
  p_step integer default null,
  p_patch jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
stable
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
  if p_email is null or p_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then return false; end if;
  if jsonb_typeof(p_patch) is distinct from 'object' then raise exception 'Invalid patch'; end if;
  if p_step is not null and (p_step < 0 or p_step > 50) then raise exception 'Invalid step'; end if;
  for k in select jsonb_object_keys(p_patch) loop
    if not (k = any(allowed)) then raise exception 'Field not allowed: %', k; end if;
    v := p_patch ->> k;
    -- Nota: evita `case` dentro da condição do `if` (o validador plpgsql do PGlite
    -- não o aceita; equivalente em if/elsif mantém o teste isolado a passar).
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
      elsif length(v) > 40 then
        raise exception 'Value too long: %', k;
      end if;
    end if;
    if k = 'plan_selected' and v is not null and not (v = any(plans)) then raise exception 'Invalid plan'; end if;
  end loop;
  select * into r from registrations
    where email = lower(btrim(p_email))
      and (p_webinar is null or webinar = p_webinar)
    order by paid_at desc nulls last, created_at desc
    limit 1
    for update;
  if not found then return false; end if;
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

-- Acesso às áreas de recursos (validação no servidor, sem devolver token)
create or replace function public.legacy_recursos_access(p_email text, p_webinar text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare r registrations;
begin
  if p_email is null or p_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    return jsonb_build_object('found', false, 'access', false, 'name', null, 'plan', null);
  end if;
  select * into r from registrations
    where email = lower(btrim(p_email))
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

-- Registo de presença na sessão ao vivo (marca uma vez; devolve apenas flags)
create or replace function public.legacy_reg_attendance(p_email text, p_webinar text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare r registrations; now_attended boolean;
begin
  if p_email is null or p_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    return jsonb_build_object('found', false, 'attended', false);
  end if;
  select * into r from registrations
    where email = lower(btrim(p_email)) and webinar = p_webinar
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

-- Dados de faturação por token (pré-preenchimento; escrita continua na
-- edge function invoice-upsert, que já valida o token)
create or replace function public.legacy_invoice_get(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare i invoice_details;
begin
  if p_token is null or length(btrim(p_token)) < 20 then return null; end if;
  select i.* into i
    from invoice_details i
    join registrations r on r.id = i.registration_id
    where r.edit_token = btrim(p_token)
    limit 1;
  if not found then return null; end if;
  return jsonb_build_object(
    'invoice_name', i.invoice_name,
    'invoice_vat', i.invoice_vat,
    'invoice_address', i.invoice_address,
    'invoice_zip', i.invoice_zip,
    'invoice_city', i.invoice_city,
    'invoice_email', i.invoice_email
  );
end $$;

-- ---------------------------------------------------------------------------
-- 5. Execução das RPCs públicas
-- ---------------------------------------------------------------------------
grant execute on function public.legacy_reg_lookup(text) to anon, authenticated;
grant execute on function public.legacy_reg_session(text, text) to anon, authenticated;
grant execute on function public.legacy_reg_save_step(text, text, integer, jsonb) to anon, authenticated;
grant execute on function public.legacy_recursos_access(text, text) to anon, authenticated;
grant execute on function public.legacy_reg_attendance(text, text) to anon, authenticated;
grant execute on function public.legacy_invoice_get(text) to anon, authenticated;
