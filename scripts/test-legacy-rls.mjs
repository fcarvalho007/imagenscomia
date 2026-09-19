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
grant all on all tables in schema public to anon, authenticated, service_role;
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

// Existing public grants are present: rows must be hidden by RLS, not by fixture omissions.
const tables = ['registrations','invoice_details','message_logs','email_send_logs','payment_events','analytics_cache','email_templates','acquisition_costs','webinar_settings'];
for (const [role,admin,aal] of [['anon',false,'aal1'],['authenticated',false,'aal2'],['authenticated',true,'aal1']]) {
  await auth(role,admin,aal);
  for (const table of tables) { assert.equal((await db.query(`select * from ${table}`)).rows.length,0); checks++; }
  assert.equal((await db.query("update registrations set plan_selected='bundle' returning id")).rows.length,0);checks++;
  await denied(()=>db.query("insert into payment_events(event_type) values ('paid')"),'forged payment event');
}
await auth('authenticated',true,'aal2');
assert.equal((await db.query('select * from registrations')).rows.length,2);checks++;
assert.equal((await db.query("update email_templates set subject='Admin' returning id")).rows.length,1);checks++;
await auth('anon');
for (const credential of ['paga@teste.pt','gratis@teste.pt','invalid','z'.repeat(40)]) {
  assert.equal((await db.query('select legacy_reg_session($1,null) as r',[credential])).rows[0].r,null);checks++;
  assert.equal((await db.query('select legacy_recursos_access($1,null) as r',[credential])).rows[0].r.access,false);checks++;
  assert.equal((await db.query("select legacy_reg_save_step($1,null,4,'{}') as r",[credential])).rows[0].r,false);checks++;
  assert.equal((await db.query("select legacy_reg_attendance($1,'imagens') as r",[credential])).rows[0].r.found,false);checks++;
}
const paid=(await db.query('select legacy_recursos_access($1,null) as r',[TOKEN])).rows[0].r;
assert.equal(paid.access,true);assert.equal(paid.plan,'premium');assert.equal('edit_token' in paid,false);checks++;
assert.equal((await db.query("select legacy_recursos_access($1,'video') as r",[TOKEN])).rows[0].r.access,false);checks++;
const own=(await db.query('select legacy_reg_lookup($1) as r',[TOKEN])).rows[0].r;
assert.equal(own.email,'paga@teste.pt');assert.equal('edit_token' in own,false);checks++;
for (const patch of [{paid_at:'2026-01-01'},{premium_granted_at:'2026-01-01'},{edit_token:'new'},{plan_selected:'bad-plan'}]) {
  await denied(()=>db.query('select legacy_reg_save_step($1,null,4,$2)',[TOKEN2,JSON.stringify(patch)]),'protected field');
}
await denied(()=>db.query('select legacy_reg_save_step($1,null,4,$2)',[TOKEN,JSON.stringify({plan_selected:'bundle'})]),'paid entitlement cannot be upgraded');
assert.equal((await db.query('select legacy_reg_save_step($1,null,4,$2) as r',[TOKEN2,JSON.stringify({plan_selected:'premium',sources:'Referral source long enough to exceed forty characters safely'})])).rows[0].r,true);checks++;
assert.equal((await db.query("select legacy_reg_attendance($1,'imagens') as r",[TOKEN2])).rows[0].r.attended,true);checks++;
const inv=(await db.query('select legacy_invoice_get($1) as r',[TOKEN])).rows[0].r;
assert.equal(inv.invoice_vat,'123456789');checks++;
assert.equal((await db.query('select legacy_invoice_get($1) as r',[TOKEN2])).rows[0].r,null);checks++;
assert.equal((await db.query('select webinar,price_premium from webinar_settings_public')).rows.length,1);checks++;
await denied(()=>db.query('select live_views from webinar_settings_public'),'private metrics excluded');
await denied(()=>db.query('update webinar_settings_public set price_premium=0'),'public price change');
await auth('service_role');
const after=(await db.query("select step_reached,plan_selected,paid_at from registrations where email='gratis@teste.pt'")).rows[0];
assert.equal(after.step_reached,4);assert.equal(after.plan_selected,'premium');assert.equal(after.paid_at,null);checks++;
console.log(`${checks} isolated legacy RLS checks passed. DRAFT ONLY: public flows not migrated.`);
await db.close();
