// Verifica as propriedades de segurança da migração draft de lockdown RLS
// do legado (supabase/migrations-draft/20260918190000_legacy_rls_lockdown.sql).
// Reconstrói um schema mínimo das tabelas do funil numa base PGlite isolada,
// aplica a migração draft e valida políticas + RPCs com várias identidades.
// NÃO toca na base de dados real.
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const db = new PGlite();
let checks = 0;

await db.exec(`
create role anon;
create role authenticated;
create role service_role bypassrls;
create schema auth;
grant usage on schema public, auth to anon, authenticated, service_role;
create function auth.jwt() returns jsonb language sql stable as
  $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
create function auth.role() returns text language sql stable as $$select auth.jwt()->>'role'$$;
create function auth.uid() returns uuid language sql stable as $$select (auth.jwt()->>'sub')::uuid$$;
create function public.has_role(uuid, text) returns boolean language sql stable as
  $$select coalesce((auth.jwt()->>'admin')::boolean, false)$$;

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  name text, first_name text, last_name text, email text, whatsapp text,
  webinar text default 'imagens', edit_token text, edit_token_created_at timestamptz,
  referral_code text, referred_by text, premium_unlocked boolean,
  step_reached integer, plan_selected text, sources text, duvida text,
  gender_override text, role text, team_size text,
  paid_at timestamptz, premium_granted_at timestamptz, attended_live_at timestamptz,
  upgrade_clicked_at timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.invoice_details (
  registration_id uuid primary key,
  invoice_name text, invoice_vat text, invoice_address text,
  invoice_zip text, invoice_city text, invoice_email text,
  updated_at timestamptz default now()
);
create table public.message_logs (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid, channel text, provider text, template_key text,
  status text, created_at timestamptz default now()
);
create table public.email_send_logs (
  id uuid primary key default gen_random_uuid(),
  webinar text, email_key text, recipient_email text, status text,
  sent_at timestamptz
);
create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid, event_type text, payload jsonb,
  received_at timestamptz default now()
);
create table public.analytics_cache (key text primary key, value integer default 0);
create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text, subject text, is_active boolean default true
);
create table public.acquisition_costs (
  id uuid primary key default gen_random_uuid(),
  platform text, amount numeric default 0, cost_date date default current_date
);
create table public.webinar_settings (
  webinar text primary key, label text, emoji text, color text,
  event_date timestamptz, cutoff_date timestamptz,
  price_premium numeric default 0, price_masterclass numeric default 0,
  price_bundle numeric default 0, live_views integer
);
alter table public.registrations enable row level security;
alter table public.invoice_details enable row level security;
alter table public.message_logs enable row level security;
alter table public.email_send_logs enable row level security;
alter table public.payment_events enable row level security;
alter table public.analytics_cache enable row level security;
alter table public.email_templates enable row level security;
alter table public.acquisition_costs enable row level security;
alter table public.webinar_settings enable row level security;
grant usage on schema public to anon, authenticated, service_role;
`);

await db.exec(
  await readFile(
    new URL("../supabase/migrations-draft/20260918190000_legacy_rls_lockdown.sql", import.meta.url),
    "utf8",
  ),
);

const auth = async (role, admin = false, aal = "aal1") => {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claims',$1,false)", [
    JSON.stringify({ role, admin, aal, sub: "aa000000-0000-4000-8000-000000000001" }),
  ]);
  await db.exec("set role " + role);
};

const denied = async (fn, label) => {
  await assert.rejects(fn, undefined, "esperava negação: " + label);
  checks++;
};

// ---- Seed (service_role, bypass RLS) ----
await auth("service_role");
const TOKEN = "e".repeat(40);
const TOKEN2 = "f".repeat(40);
await db.exec(`
insert into registrations (name, first_name, email, webinar, edit_token, step_reached, plan_selected)
values ('Paga Teste', 'Paga', 'paga@teste.pt', 'imagens', '${TOKEN}', 3, 'premium');
insert into registrations (name, first_name, email, webinar, edit_token, step_reached)
values ('Grátis Teste', 'Gratis', 'gratis@teste.pt', 'imagens', '${TOKEN2}', 1);
update registrations set paid_at = now() where email = 'paga@teste.pt';
insert into invoice_details (registration_id, invoice_name, invoice_vat, invoice_address, invoice_zip, invoice_city, invoice_email)
select id, 'Paga Teste Lda', '123456789', 'Rua Teste 1', '1000-001', 'Lisboa', 'paga@teste.pt' from registrations where email='paga@teste.pt';
insert into message_logs (registration_id, channel, provider, template_key, status)
select id, 'email', 'resend', 't1', 'sent' from registrations where email='paga@teste.pt';
insert into payment_events (registration_id, event_type, payload)
select id, 'paid', '{"x":1}'::jsonb from registrations where email='paga@teste.pt';
insert into email_send_logs (webinar, email_key, recipient_email, status) values ('imagens','k1','paga@teste.pt','sent');
insert into analytics_cache (key, value) values ('landing_visitors_video', 100);
insert into email_templates (template_key, subject) values ('t1', 'S1');
insert into acquisition_costs (platform, amount) values ('meta', 12.5);
insert into webinar_settings (webinar, label, emoji, color, price_premium, live_views) values ('imagens','Imagens com IA','🖼️','#111',18.45, 555);
`);

// ---- 1. Anónimo: leitura de todas as tabelas negada ----
await auth("anon");
for (const t of ["registrations", "invoice_details", "message_logs", "email_send_logs",
  "payment_events", "analytics_cache", "email_templates", "acquisition_costs", "webinar_settings"]) {
  await denied(() => db.query(`select * from ${t}`), `anon select ${t}`);
}

// ---- 2. Anónimo: escrita negada ----
await denied(() => db.query("update registrations set plan_selected='bundle'"), "anon update registrations");
await denied(() => db.query("update webinar_settings set price_premium=0"), "anon update webinar_settings");
await denied(() => db.query("insert into message_logs (registration_id, channel, provider, template_key, status) values (gen_random_uuid(),'email','x','k','s')"), "anon insert message_logs");
await denied(() => db.query("insert into acquisition_costs (platform, amount) values ('x', 1)"), "anon insert acquisition_costs");
await denied(() => db.query("delete from acquisition_costs"), "anon delete acquisition_costs");
await denied(() => db.query("insert into email_send_logs (webinar, email_key, recipient_email, status) values ('i','k','a@b.pt','s')"), "anon insert email_send_logs");
await denied(() => db.query("insert into payment_events (registration_id, event_type, payload) values (gen_random_uuid(),'x','{}'::jsonb)"), "anon insert payment_events");
await denied(() => db.query("insert into email_templates (template_key, subject) values ('k','s')"), "anon insert email_templates");

// ---- 3. Helper de admin não executável ----
await denied(() => db.query("select public.legacy_is_admin()"), "anon legacy_is_admin");

// ---- 4. Utilizador autenticado sem role admin: negado ----
await auth("authenticated", false, "aal2");
await denied(() => db.query("select * from registrations"), "não-admin select registrations");
await denied(() => db.query("select * from email_templates"), "não-admin select email_templates");

// ---- 5. Admin sem MFA aal2: negado ----
await auth("authenticated", true, "aal1");
await denied(() => db.query("select * from registrations"), "admin aal1 select registrations");

// ---- 6. Admin com aal2: leitura permitida ----
await auth("authenticated", true, "aal2");
const rows = (await db.query("select * from registrations")).rows;
assert.equal(rows.length, 2); checks++;
const tpl = (await db.query("select * from email_templates")).rows;
assert.equal(tpl.length, 1); checks++;

// ---- 7. RPCs públicas com sessão anónima ----
await auth("anon");

// recursos: desconhecido / grátis / pago
const unknown = (await db.query("select legacy_recursos_access('ninguem@teste.pt', null) as r")).rows[0].r;
assert.equal(unknown.found, false); checks++;
const free = (await db.query("select legacy_recursos_access('gratis@teste.pt', null) as r")).rows[0].r;
assert.equal(free.found, true); assert.equal(free.access, false); checks++;
const paid = (await db.query("select legacy_recursos_access('paga@teste.pt', null) as r")).rows[0].r;
assert.equal(paid.access, true); assert.equal(paid.plan, "premium");
assert.ok(!("edit_token" in paid)); checks++;

// recursos: filtro por webinar
const wrongWebinar = (await db.query("select legacy_recursos_access('paga@teste.pt', 'video') as r")).rows[0].r;
assert.equal(wrongWebinar.found, false); checks++;

// sessão por email: sem edit_token
const sess = (await db.query("select legacy_reg_session('paga@teste.pt', null) as r")).rows[0].r;
assert.equal(sess.paid, true);
assert.ok(!("edit_token" in sess));
assert.ok(!("email" in sess)); checks++;

// lookup por token
const look = (await db.query("select legacy_reg_lookup($1) as r", [TOKEN])).rows[0].r;
assert.equal(look.paid, true); assert.ok(!("edit_token" in look)); checks++;
const badLook = (await db.query("select legacy_reg_lookup($1) as r", ["z".repeat(40)])).rows[0].r;
assert.equal(badLook, null); checks++;

// save_step: whitelist — campo proibido levanta erro
await assert.rejects(() =>
  db.query("select legacy_reg_save_step('paga@teste.pt', null, 4, $1::jsonb)", [JSON.stringify({ paid_at: "2026-01-01" })]),
); checks++;
await assert.rejects(() =>
  db.query("select legacy_reg_save_step('paga@teste.pt', null, 4, $1::jsonb)", [JSON.stringify({ plan_selected: "plano-falso" })]),
); checks++;
const saved = await db.query("select legacy_reg_save_step('paga@teste.pt', null, 4, $1::jsonb)",
  [JSON.stringify({ plan_selected: "bundle", sources: "instagram, amigo", duvida: "Quanto custa?" })]);
assert.equal(saved.rows[0].legacy_reg_save_step, true); checks++;
const after = (await db.query("select step_reached, plan_selected, sources, paid_at from registrations where email='paga@teste.pt'")).rows[0];
assert.equal(after.step_reached, 4);
assert.equal(after.plan_selected, "bundle");
assert.equal(after.sources, "instagram, amigo");
assert.ok(after.paid_at, "paid_at não pode ser alterado nem apagado"); checks++;
// save_step: email desconhecido
const noReg = await db.query("select legacy_reg_save_step('fantasma@teste.pt', null, 1, '{}') as r");
assert.equal(noReg.rows[0].r, false); checks++;

// attendance: marca e devolve flags apenas
const att = (await db.query("select legacy_reg_attendance('gratis@teste.pt', 'imagens') as r")).rows[0].r;
assert.equal(att.found, true); assert.equal(att.attended, true); checks++;
const attRow = (await db.query("select attended_live_at from registrations where email='gratis@teste.pt'")).rows[0];
assert.ok(attRow.attended_live_at); checks++;

// invoice_get por token
const inv = (await db.query("select legacy_invoice_get($1) as r", [TOKEN])).rows[0].r;
assert.equal(inv.invoice_vat, "123456789"); checks++;
const badInv = (await db.query("select legacy_invoice_get($1) as r", ["y".repeat(40)])).rows[0].r;
assert.equal(badInv, null); checks++;

// ---- 8. Vista pública: só campos de venda ----
const vis = (await db.query("select webinar, price_premium from webinar_settings_public")).rows;
assert.equal(vis.length, 1); checks++;
await denied(() => db.query("select live_views from webinar_settings_public"), "vista não expõe métricas");

// ---- 9. Vista não permite escrita ----
await denied(() => db.query("update webinar_settings_public set price_premium=0"), "anon update view");

console.log(`\nOK — ${checks} verificações de segurança do legado a passar.`);
