import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const db = new PGlite();
let checks = 0;
await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;grant usage on schema public,auth to anon,authenticated,service_role;
create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
create function auth.role() returns text language sql stable as $$select auth.jwt()->>'role'$$;
create function auth.uid() returns uuid language sql stable as $$select (auth.jwt()->>'sub')::uuid$$;
create function public.has_role(uuid,text) returns boolean language sql stable as $$select coalesce((auth.jwt()->>'admin')::boolean,false)$$;`);
for (const file of [
  "20260918140000_course_ia_wordpress.sql",
  "20260918143000_course_editions_payments.sql",
  "20260918144500_course_billing_tracking.sql",
  "20260918150000_course_operations.sql",
  "20260918151500_course_resources.sql",
  "20260918153532_course_queue_revoke.sql",
  "20260918180000_course_operation_hardening.sql",
  "20260919090040_9988a0ca-e1eb-4a1b-9ad9-2acc888a72ce.sql",
  "20260919092733_c5194bf1-ed45-4f6a-9c33-abfe71bec5a9.sql",
  "20260919095001_34572f4b-8574-4edb-bc2b-f97485be3c2f.sql",
  "20260919095017_646e0b16-ea32-468f-baee-97238e331df6.sql",
  "20260921120000_course_closed_payment_idempotency.sql",
  "20260921140000_course_wordpress_commerce.sql",
])
  await db.exec(
    await readFile(
      new URL("../supabase/migrations/" + file, import.meta.url),
      "utf8",
    ),
  );
const auth = async (role, admin = false, aal = "aal1") => {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claims',$1,false)", [
    JSON.stringify({
      role,
      admin,
      aal,
      sub: "aa000000-0000-4000-8000-000000000001",
    }),
  ]);
  await db.exec("set role " + role);
};
const rpc = async (sql, args = []) => (await db.query(sql, args)).rows[0];
const denied = async (fn) => {
  await assert.rejects(fn);
  checks++;
};

await auth('service_role');
const edition={id:'lisboa-2027-10-01-test',revision:1,modality:'lisboa',label:'Lisboa · teste isolado',starts_at:'2027-10-01T09:00:00Z',ends_at:'2027-10-02T17:30:00Z',early_until:'2027-09-21T23:00:00Z',early_net_cents:49700,net_cents:59700,capacity:16,product_id:123,availability:'open',operations:{venue:'Local de teste',schedule:'Datas de teste'}};
const call=async(name,p)=>(await rpc(`select ${name}($1::jsonb) as result`,[JSON.stringify(p)])).result;
assert.equal((await call('sync_course_wp_edition',edition)).accepted,true);checks++;
assert.equal((await call('sync_course_wp_edition',{...edition,revision:1,label:'ignored'})).revision,1);checks++;
assert.equal((await rpc('select label from course_editions where id=$1',[edition.id])).label,edition.label);checks++;
const base={site:'https://fredericocarvalho.pt',order_id:12345,revision:1,request_id:'bb000000-0000-4000-8000-000000000091',edition:edition.id,product_id:123,state:'pending',paid:false,paid_at:null,amount_cents:61131,net_cents:49700,currency:'EUR',name:'Teste isolado',email:'isolated@example.com',phone:'',session_id:'bb000000-0000-4000-8000-000000000092',attribution:{utm_source:'test'},sms_consent:false,marketing_consent:false};
assert.equal((await call('sync_course_woo_order',base)).state,'awaiting_payment');checks++;
const paid={...base,revision:2,state:'processing',paid:true,paid_at:'2026-09-21T12:00:00Z'};
assert.equal((await call('sync_course_woo_order',paid)).state,'confirmed');checks++;
assert.equal((await call('sync_course_woo_order',paid)).duplicate,true);checks++;
assert.equal((await call('sync_course_woo_order',base)).duplicate,true);checks++;
assert.equal((await rpc('select count(*)::int n from course_registrations')).n,1);checks++;
assert.equal((await rpc('select count(*)::int n from course_payments where state=\'paid\'')).n,1);checks++;
assert.equal((await rpc('select count(*)::int n from course_events where name=\'registration_submitted\'')).n,1);checks++;
assert.equal((await rpc('select count(*)::int n from course_jobs where (kind=\'invoice\' or template=\'confirmation\') and state in (\'queued\',\'blocked\')')).n,0);checks++;
assert.equal((await rpc('select count(*)::int n from course_tasks')).n,4);checks++;
await call('sync_course_wp_edition',{...edition,revision:2,starts_at:'2027-11-01T09:00:00Z',ends_at:'2027-11-02T17:30:00Z'});
assert.match(new Date((await rpc("select due_at from course_tasks where task_key='resources'")).due_at).toISOString(),/2027-11-03/);checks++;
assert.equal((await call('sync_course_woo_order',{...paid,revision:3,state:'partial_refund'})).state,'contacted');checks++;
assert.equal((await call('sync_course_woo_order',{...paid,revision:4,state:'refunded',paid:false})).state,'cancelled');checks++;
await denied(()=>call('sync_course_woo_order',{...paid,revision:5}));
await denied(()=>call('sync_course_woo_order',{...paid,revision:6,product_id:999}));
await denied(()=>call('sync_course_woo_order',{}));
await denied(()=>call('sync_course_wp_edition',{}));
for (const mode of ['porto','online']) {
 const e={...edition,id:mode+'-2027-10-01-test',modality:mode,product_id:mode==='porto'?124:125};await call('sync_course_wp_edition',e);
 const b={...base,edition:e.id,product_id:e.product_id,order_id:e.product_id,request_id:mode==='porto'?'bb000000-0000-4000-8000-000000000093':'bb000000-0000-4000-8000-000000000094'};
 await call('sync_course_woo_order',b);assert.equal((await call('sync_course_woo_order',{...b,revision:2,state:'failed'})).state,'cancelled');checks++;
}
await auth('anon');await denied(()=>call('sync_course_woo_order',base));await denied(()=>call('sync_course_wp_edition',edition));
await auth('authenticated',true,'aal2');await denied(()=>call('sync_course_woo_order',base));await denied(()=>call('sync_course_wp_edition',edition));
console.log(`${checks} WooCommerce integration checks passed in an isolated database; no network, orders or messages.`);
await db.close();
