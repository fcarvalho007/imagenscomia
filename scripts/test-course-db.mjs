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
await auth("anon");
await denied(() => db.query("select * from course_registrations"));
await denied(() => db.query("select course_metrics()"));
await auth("authenticated", false, "aal2");
assert.equal(
  (await db.query("select * from course_registrations")).rows.length,
  0,
);
checks++;
await denied(() => db.query("select course_edition_metrics(null)"));
await auth("authenticated", true, "aal1");
await denied(() => db.query("select course_edition_metrics(null)"));
await auth("service_role");
await db.exec(
  "update course_editions set sales_enabled=true,starts_at=now()+interval '90 days',ends_at=now()+interval '91 days',early_until=now()+interval '1 day'",
);
const q = (await rpc("select course_quote('lisboa-2026') as result")).result;
assert.equal(q.amount_cents, 61131);
checks++;
const payload = {
  request_id: "bb000000-0000-4000-8000-000000000001",
  edition: "lisboa-2026",
  name: "Teste SQL",
  email: "qa@example.com",
  phone: "",
  marketing_consent: false,
  privacy_version: "curso-ia-v1",
  session_id: null,
};
const claim = async (p = payload, amount = 61131) =>
  (
    await rpc("select claim_course_payment($1::jsonb,$2) as result", [
      JSON.stringify(p),
      amount,
    ])
  ).result;
assert.equal((await claim(payload, 1)).state, "price_changed");
checks++;
const order = await claim();
assert.equal(order.state, "claimed");
checks++;
assert.equal((await claim()).state, "creating");
assert.equal((await db.query("select * from course_payments")).rows.length, 1);
checks++;
assert.equal(
  (
    await claim({
      ...payload,
      request_id: "bb000000-0000-4000-8000-000000000002",
    })
  ).state,
  "contact_support",
);
checks++;
await denied(() =>
  db.query("select confirm_course_payment($1,$2,$3,$4,$5)", [
    order.id,
    "123",
    1,
    "EUR",
    "Paid",
  ]),
);
await db.query("select confirm_course_payment($1,$2,$3,$4,$5)", [
  order.id,
  "123",
  61131,
  "EUR",
  "Paid",
]);
await db.query("select confirm_course_payment($1,$2,$3,$4,$5)", [
  order.id,
  "123",
  61131,
  "EUR",
  "Paid",
]);
assert.equal((await db.query("select * from course_tasks")).rows.length, 4);
assert.equal((await db.query("select * from course_invoices")).rows.length, 1);
checks++;
await denied(() =>
  db.query("select confirm_course_payment($1,$2,$3,$4,$5)", [
    order.id,
    "124",
    61131,
    "EUR",
    "Paid",
  ]),
);
await auth("authenticated", true, "aal2");
const metrics = (
  await rpc("select course_edition_metrics('lisboa-2026') as result")
).result;
assert.equal(metrics.confirmed, 1);
assert.equal(metrics.revenue_cents, 61131);
assert.equal(
  (await rpc("select course_edition_metrics('porto-2026') as result")).result
    .confirmed,
  0,
);
checks++;
const rid = (await rpc("select id from course_registrations")).id;
await denied(() =>
  db.query("select update_course_request($1,$2,$3,$4)", [
    rid,
    "cancelled",
    "",
    null,
  ]),
);
await db.query("select record_course_invoice($1,$2)", [rid, "FT QA/1"]);
checks++;
await auth("service_role");
await db.query("select confirm_course_payment($1,$2,$3,$4,$5)", [
  order.id,
  "123",
  61131,
  "EUR",
  "Refund",
]);
await db.query("select confirm_course_payment($1,$2,$3,$4,$5)", [
  order.id,
  "123",
  61131,
  "EUR",
  "Paid",
]);
assert.equal(
  (await rpc("select state from course_payments")).state,
  "refunded",
);
assert.equal(
  (await rpc("select status from course_registrations")).status,
  "cancelled",
);
assert.equal(
  (await db.query("select * from course_tasks where state='pending'")).rows
    .length,
  0,
);
checks++;
await db.exec("update course_editions set capacity=1 where id='porto-2026'");
const porto = {
  ...payload,
  edition: "porto-2026",
  email: "porto@example.com",
  request_id: "cc000000-0000-4000-8000-000000000001",
};
const portoOrder = await claim(porto);
assert.equal(portoOrder.state, "claimed");
assert.equal(
  (
    await claim({
      ...porto,
      email: "porto2@example.com",
      request_id: "cc000000-0000-4000-8000-000000000002",
    })
  ).state,
  "full",
);
checks++;
await db.query("select confirm_course_payment($1,$2,$3,$4,$5)", [
  portoOrder.id,
  "456",
  61131,
  "EUR",
  "Expired",
]);
assert.equal(
  (
    await claim({
      ...porto,
      email: "porto2@example.com",
      request_id: "cc000000-0000-4000-8000-000000000002",
    })
  ).state,
  "claimed",
);
checks++;
await denied(() =>
  db.query("select confirm_course_payment($1,$2,$3,$4,$5)", [
    portoOrder.id,
    "456",
    61131,
    "EUR",
    "Paid",
  ]),
);
await db.exec(
  "update course_editions set early_until=now()-interval '1 second' where id='lisboa-2026'",
);
assert.equal(
  (await rpc("select course_quote('lisboa-2026') as result")).result
    .amount_cents,
  73431,
);
checks++;

// Outbox: auth, single claim, refunds, paused/during windows and immutable delivery.
await auth("authenticated", true, "aal1");
await denied(() =>
  db.query("select configure_course_edition('lisboa-2026','{}',true)"),
);
await auth("service_role");
await denied(() =>
  db.query("select save_course_billing($1,$2)", [payload.request_id, "{}"]),
);
const ops = {
  schedule: "Teste",
  venue: "Lisboa",
  before_url: "https://example.com/before",
  after_url: "https://example.com/after",
  resources_url: "https://example.com/resources",
};
await db.query(
  "update course_editions set automation_enabled=true,operations=$1 where id='porto-2026'",
  [JSON.stringify(ops)],
);
const activePorto = (
  await db.query("select id from course_payments where state='creating'")
).rows[0].id;
await db.query("select confirm_course_payment($1,'900',61131,'EUR','Paid')", [
  activePorto,
]);
assert.equal(
  (
    await db.query(
      "select count(*)::int n from course_jobs where state='queued'",
    )
  ).rows[0].n,
  6,
);
checks++;
const claimed = (await rpc("select claim_course_job('email') as j")).j;
assert.equal(claimed.job.template, "confirmation");
assert.equal((await rpc("select claim_course_job('email') as j")).j, null);
checks++;
const frozen = JSON.stringify({ subject: "Olá" });
await db.query("select prepare_course_job($1,$2,$3)", [
  claimed.job.id,
  claimed.job.lease,
  frozen,
]);
await denied(() =>
  db.query("select prepare_course_job($1,$2,$3)", [
    claimed.job.id,
    claimed.job.lease,
    JSON.stringify({ subject: "Changed" }),
  ]),
);
await denied(() =>
  db.query("select finish_course_job($1,$2,'sent','x',null)", [
    claimed.job.id,
    "00000000-0000-4000-8000-000000000001",
  ]),
);
await db.query("select finish_course_job($1,$2,'sent','mail1',null)", [
  claimed.job.id,
  claimed.job.lease,
]);
await db.exec(
  "update course_jobs set due_at=now()-interval '1 minute' where state='queued' and kind='email'",
);
await db.exec(
  "update course_editions set starts_at=now()-interval '1 hour',ends_at=now()+interval '1 hour' where id='porto-2026'",
);
assert.equal((await rpc("select claim_course_job('email') as j")).j, null);
checks++;
await db.exec(
  "update course_editions set ends_at=now()-interval '1 minute' where id='porto-2026'",
);
const postJob = (await rpc("select claim_course_job('email') as j")).j;
assert.ok(["resources", "individual_after"].includes(postJob.job.template));
checks++;
await db.exec(
  "update course_jobs set locked_at=now()-interval '10 minutes' where state='processing'",
);
await db.query("select claim_course_job('email')");
assert.equal(
  (await rpc("select state from course_jobs where id=$1", [postJob.job.id]))
    .state,
  "review",
);
checks++;
await db.query("select confirm_course_payment($1,'900',61131,'EUR','Refund')", [
  activePorto,
]);
assert.equal((await rpc("select claim_course_job('invoice') as j")).j, null);
checks++;

// Private resources: admin MFA, paid-only access, edition isolation and expiry.
await auth("authenticated", true, "aal2");
await db.query("select configure_course_edition('online-2026',$1,true)", [
  JSON.stringify({ schedule: "Quatro sessões" }),
]);
checks++;
const saveResource = async (
  edition,
  kind,
  title,
  active = true,
  available = new Date().toISOString(),
) =>
  (
    await rpc(
      "select save_course_resource(null,$1,$2,$3,'https://example.com/material','',$4,$5) as id",
      [edition, title, kind, available, active],
    )
  ).id;
await saveResource("online-2026", "template", "Template online");
await saveResource("online-2026", "recording", "Gravação online");
await saveResource("online-2026", "guide", "Rascunho", false);
await saveResource(
  "online-2026",
  "video",
  "Vídeo futuro",
  true,
  new Date(Date.now() + 86400000).toISOString(),
);
await saveResource("porto-2026", "guide", "Guia Porto");
await denied(() =>
  saveResource("porto-2026", "recording", "Gravação indevida"),
);
await auth("authenticated", true, "aal1");
await denied(() => saveResource("online-2026", "guide", "Sem MFA"));
await auth("anon");
await denied(() => db.query("select * from course_resources"));
await denied(() =>
  db.query(
    "select read_course_resources('00000000-0000-4000-8000-000000000001')",
  ),
);
await auth("service_role");
const onlineOrder = await claim(
  {
    ...payload,
    edition: "online-2026",
    email: "online@example.com",
    request_id: "dd000000-0000-4000-8000-000000000001",
  },
  48831,
);
assert.equal(onlineOrder.state, "claimed");
const token = (
  await rpc(
    "select resource_token from course_registrations where edition='online-2026'",
  )
).resource_token;
const readResources = async () =>
  (await rpc("select read_course_resources($1) as r", [token])).r;
await denied(readResources);
await db.query("select confirm_course_payment($1,'901',48831,'EUR','Paid')", [
  onlineOrder.id,
]);
assert.equal((await readResources()).resources.length, 2);
checks++;
await db.exec(
  "update course_editions set starts_at=now()-interval '2 years',ends_at=now()-interval '1 year 1 day' where id='online-2026'",
);
assert.equal((await readResources()).resources.length, 1);
checks++;
await db.query("select confirm_course_payment($1,'901',48831,'EUR','Refund')", [
  onlineOrder.id,
]);
await denied(readResources);

// Regression: payment 30 minutes before start must not postpone practical information until after start.
await auth('service_role');
await db.exec("update course_editions set starts_at=now()+interval '30 minutes',ends_at=now()+interval '1 day',early_until=now()+interval '1 day',sales_enabled=true,automation_enabled=true where id='lisboa-2026'");
const late=await claim({...payload,request_id:'ee000000-0000-4000-8000-000000000001',email:'late@example.invalid',phone:'912345678',sms_consent:true});
await db.query("select confirm_course_payment($1,'late',61131,'EUR','Paid')",[late.id]);
const lateRid=(await rpc('select registration_id from course_payments where id=$1',[late.id])).registration_id;
assert.equal((await rpc("select count(*)::int n from course_jobs where registration_id=$1 and template='practical_information' and due_at<=now()",[lateRid])).n,1);checks++;
assert.equal((await rpc("select count(*)::int n from course_jobs where registration_id=$1 and kind='sms'",[lateRid])).n,2);checks++;
assert.equal((await rpc("select claim_course_job('sms') as j")).j,null);checks++;
await auth('authenticated',false,'aal2');
await denied(()=>db.query("select set_course_session($1,'before','booked')",[lateRid]));
await auth('authenticated',true,'aal2');
await db.query("select set_course_session($1,'before','booked')",[lateRid]);
assert.equal((await rpc("select state from course_jobs where registration_id=$1 and template='individual_before'",[lateRid])).state,'cancelled');checks++;
await db.query("select configure_course_operation('lisboa-2026',$1,false,false,true)",[JSON.stringify(ops)]);
await auth('service_role');
assert.equal((await rpc("select claim_course_job('email') as j")).j,null);checks++;
const independentInvoice=(await rpc("select claim_course_job('invoice') as j")).j;
assert.equal(independentInvoice.registration.id,lateRid);checks++;
assert.equal((await rpc("select prepare_course_job($1,$2,'{}') as ready",[independentInvoice.job.id,independentInvoice.job.lease])).ready,true);checks++;
await db.query("select finish_course_job($1,$2,'blocked',null,'billing_data_missing')",[independentInvoice.job.id,independentInvoice.job.lease]);
await db.exec("update course_editions set automation_enabled=true,starts_at=now()-interval '40 days',ends_at=now()-interval '31 days' where id='lisboa-2026'");
await db.query("select claim_course_job('email')");
assert.equal((await rpc("select state from course_jobs where registration_id=$1 and template='individual_after'",[lateRid])).state,'cancelled');checks++;
await auth('authenticated',true,'aal1');
await denied(()=>db.query("select course_period_metrics('lisboa-2026',now()-interval '7 days')"));
await auth('authenticated',true,'aal2');
assert.equal((await rpc("select course_period_metrics('lisboa-2026',now()+interval '1 day') as m")).m.revenue_cents,0);checks++;
assert.equal((await rpc("select course_period_metrics('lisboa-2026',now()-interval '7 days') as m")).m.revenue_cents,61131);checks++;
// An edition disabled between claim and prepare must never contact a provider.
await auth('service_role');
await db.exec("update course_editions set starts_at=now()+interval '1 day',ends_at=now()+interval '2 days' where id='lisboa-2026'");
await db.query("update course_jobs set state='queued',due_at=now() where registration_id=$1 and template='practical_information'",[lateRid]);
const race=(await rpc("select claim_course_job('email') as j")).j;
await db.exec("update course_editions set automation_enabled=false where id='lisboa-2026'");
assert.equal((await rpc("select prepare_course_job($1,$2,'{}') as ready",[race.job.id,race.job.lease])).ready,false);checks++;

// Course parity: mutations remain server-authorized, scoped, auditable and idempotent.
await auth('authenticated',false,'aal2');
await denied(()=>db.query("select set_course_contact_pause($1,true)",[lateRid]));
await denied(()=>db.query("select course_operation_counts(null)"));
await denied(()=>db.query("select save_course_cost(null,'lisboa-2026','Meta','','100','2026-09-19','paid_media')"));
await auth('authenticated',true,'aal2');
const cost=(await rpc("select save_course_cost(null,'lisboa-2026','Meta','Campanha',100,'2026-09-19','paid_media') id")).id;
await denied(()=>db.query("select save_course_cost($1,'porto-2026','Meta','',100,'2026-09-19','paid_media')",[cost]));
await denied(()=>db.query("select save_course_cost(null,'lisboa-2026','Meta','',-1,'2026-09-19','paid_media')"));
assert.equal((await rpc("select sum(amount)::int n from course_costs where edition='lisboa-2026'")).n,100);checks++;
await db.query("select delete_course_cost($1)",[cost]);
assert.equal((await rpc("select count(*)::int n from course_costs")).n,0);checks++;
const fresh=(await rpc("select status,notes,next_followup_at from course_registrations where id=$1",[lateRid]));
await db.query("select update_course_request_checked($1,$2,'Uma nota',null,$2,$3,$4)",[lateRid,fresh.status,fresh.notes,fresh.next_followup_at]);
await denied(()=>db.query("select update_course_request_checked($1,$2,'Nota obsoleta',null,$2,$3,$4)",[lateRid,fresh.status,fresh.notes,fresh.next_followup_at]));
await db.query("select set_course_contact_pause($1,true)",[lateRid]);
await auth('service_role');
await db.exec("update course_editions set automation_enabled=true where id='lisboa-2026'");
assert.equal((await rpc("select course_job_eligible(j) yes from course_jobs j where registration_id=$1 and template='practical_information'",[lateRid])).yes,false);checks++;
await auth('authenticated',true,'aal2');
const campaign='fa000000-0000-4000-8000-000000000001';
const scheduled=new Date().toISOString();
const queue=(edition='lisboa-2026',body='Mensagem de acompanhamento',id=campaign)=>db.query("select queue_course_campaign($1,$2,'email','Acompanhamento',$3,$4::uuid[],$5) n",[id,edition,body,[lateRid],scheduled]);
await denied(()=>queue());
await db.query("select set_course_contact_pause($1,false)",[lateRid]);
assert.equal((await queue()).rows[0].n,1);checks++;
assert.equal((await queue()).rows[0].n,1);checks++;
assert.equal((await rpc("select count(*)::int n from course_jobs where campaign_id=$1",[campaign])).n,1);checks++;
await denied(()=>queue('porto-2026'));
await denied(()=>queue('lisboa-2026','Conteúdo alterado'));
await denied(()=>db.query("select queue_course_campaign(gen_random_uuid(),'lisboa-2026','sms','','Olá',$1::uuid[],now())",[[lateRid]]));
const job=(await rpc("select id from course_jobs where campaign_id=$1",[campaign])).id;
await db.query("select manage_course_job($1,'cancel')",[job]);
assert.equal((await rpc("select state from course_jobs where id=$1",[job])).state,'cancelled');checks++;
await denied(()=>db.query("select manage_course_job($1,'retry')",[job]));
await denied(()=>db.query("select manage_course_job($1,'cancel')",[independentInvoice.job.id]));
assert.ok((await rpc("select course_operation_counts('lisboa-2026') counts")).counts.cancelled>0);checks++;
assert.equal(Object.values((await rpc("select course_operation_counts('porto-2026') counts")).counts).reduce((n,v)=>n+v,0),(await rpc("select count(*)::int n from course_jobs j join course_registrations r on r.id=j.registration_id where r.edition='porto-2026'")).n);checks++;
await auth('authenticated',true,'aal1');
await denied(()=>queue('lisboa-2026','Teste','fa000000-0000-4000-8000-000000000002'));
await auth('anon');
await denied(()=>db.query("select * from course_campaigns"));
await denied(()=>db.query("select * from course_costs"));

await auth('authenticated',true,'aal2');
const version=(await rpc("select save_course_email_template('lisboa-2026','confirmation','Assunto','Texto para participantes',null) v")).v;
await denied(()=>db.query("select save_course_email_template('lisboa-2026','confirmation','Outro assunto','Texto para participantes',null)"));
await db.query("select save_course_email_template('lisboa-2026','confirmation','Outro assunto','Texto para participantes',$1)",[version]);
await denied(()=>db.query("select save_course_email_template('lisboa-2026','arbitrary','Assunto','Texto para participantes',null)"));
await denied(()=>db.query("select save_course_resource(null,'lisboa-2026','Guia','guide','https://user:password@example.com/file','',now(),false)"));
await auth('authenticated',false,'aal2');
assert.equal((await db.query("select * from course_email_templates")).rows.length,0);checks++;
await denied(()=>db.query("select save_course_email_template('porto-2026','confirmation','Assunto','Texto para participantes',null)"));


await auth('authenticated',true,'aal2');
const smsVersion=(await rpc("select save_course_sms_template('lisboa-2026','practical_sms','Texto revisto para o curso.',null) v")).v;
await denied(()=>db.query("select save_course_sms_template('lisboa-2026','practical_sms','Outra mensagem de teste.',null)"));
await db.query("select save_course_sms_template('lisboa-2026','practical_sms','Texto atualizado para o curso.',$1)",[smsVersion]);
for(const body of ['Olá participantes','x'.repeat(161),'Mensagem com [extensao]','Mensagem com ~ extensao'])await denied(()=>db.query("select save_course_sms_template('porto-2026','practical_sms',$1,null)",[body]));
await auth('authenticated',false,'aal2');
assert.equal((await db.query("select * from course_sms_templates")).rows.length,0);checks++;
await denied(()=>db.query("select save_course_sms_template('porto-2026','practical_sms','Texto para participantes.',null)"));
await auth('anon');
await denied(()=>db.query("select * from course_sms_templates"));

// Complete isolated journey: consent-based visits are separate from authoritative purchases.
await auth('service_role');
await db.exec("update course_editions set sales_enabled=true,capacity=1000,starts_at=now()+interval '90 days',ends_at=now()+interval '91 days',early_until=now()+interval '1 day'");
for(const [i,edition] of ['lisboa-2026','porto-2026','online-2026'].entries()){
 await auth('authenticated',true,'aal2');
 const before=(await rpc("select course_period_metrics($1,null) m",[edition])).m;
 await auth('service_role');
 const sid=`ee000000-0000-4000-8000-00000000000${i+1}`;
 const request=`ef000000-0000-4000-8000-00000000000${i+1}`;
 for(const name of ['page_view','quiz_completed','pricing_viewed','registration_started']){
  for(let duplicate=0;duplicate<2;duplicate++)await db.query("insert into course_events(id,session_id,name,edition) values(gen_random_uuid(),$1,$2,$3)",[sid,name,name==='page_view'?null:edition]);
 }
 const amount=(await rpc("select course_quote($1) q",[edition])).q.amount_cents;
 const claimed=await claim({...payload,request_id:request,edition,email:`journey-${i}@example.invalid`,session_id:sid},amount);
 assert.equal(claimed.state,'claimed');checks++;
 await auth('authenticated',true,'aal2');
 const pending=(await rpc("select course_period_metrics($1,null) m",[edition])).m;
 assert.equal(pending.confirmed,before.confirmed);assert.equal(pending.requests,before.requests+1);assert.equal(pending.registration_sessions,before.registration_sessions+1);checks++;
 await auth('service_role');
 for(let duplicate=0;duplicate<2;duplicate++)await db.query("select confirm_course_payment($1,$2,$3,'EUR','Paid')",[claimed.id,`journey-${i}`,amount]);
 await auth('authenticated',true,'aal2');
 const paid=(await rpc("select course_period_metrics($1,null) m",[edition])).m;
 assert.equal(paid.confirmed,before.confirmed+1);assert.equal(paid.revenue_cents,before.revenue_cents+amount);checks++;
}
// Cancel/expiry and repeated terminal callbacks for every edition, in memory only.
for(const [i,edition] of ['lisboa-2026','porto-2026','online-2026'].entries()){
 for(const [j,status] of ['Cancel','Expired'].entries()){
  await auth('service_role');
  const amount=(await rpc('select course_quote($1) q',[edition])).q.amount_cents;
  const closed=await claim({...payload,edition,request_id:`ed000000-0000-4000-8000-0000000000${i}${j}`,email:`closed-${i}-${j}@example.invalid`},amount);
  assert.equal(closed.state,'claimed');checks++;
  for(let n=0;n<2;n++)await db.query("select confirm_course_payment($1,$2,$3,'EUR',$4)",[closed.id,`closed-${i}-${j}`,amount,status]);
  const row=await rpc('select state,registration_id from course_payments where id=$1',[closed.id]);
  assert.equal(row.state,status==='Cancel'?'cancelled':'expired');checks++;
  assert.equal((await rpc("select count(*)::int n from course_activity where registration_id=$1 and action='payment_closed'",[row.registration_id])).n,1);checks++;
  assert.equal((await rpc('select count(*)::int n from course_invoices where registration_id=$1',[row.registration_id])).n,0);checks++;
  await denied(()=>db.query("select confirm_course_payment($1,$2,$3,'EUR','Paid')",[closed.id,`closed-${i}-${j}`,amount]));
 }
}
// Rich-text format indicator and self-test log.
await auth('authenticated',true,'aal2');
assert.equal((await rpc("select format f from course_email_templates where edition='lisboa-2026' and template='confirmation'")).f,'text');checks++;
const richVersion=(await rpc("select updated_at v from course_email_templates where edition='lisboa-2026' and template='confirmation'")).v;
await db.query("select save_course_email_template('lisboa-2026','confirmation','Assunto','<p>Ola</p>',$1,'html')",[richVersion]);
assert.equal((await rpc("select format f from course_email_templates where edition='lisboa-2026' and template='confirmation'")).f,'html');checks++;
await denied(()=>db.query("select save_course_email_template('lisboa-2026','confirmation','Assunto','<p>Ola</p>',null,'markdown')"));
await denied(()=>db.query("select queue_course_campaign(gen_random_uuid(),'lisboa-2026','sms','','Ola',$1::uuid[],now(),'html')",[[lateRid]]));
await denied(()=>db.query("select claim_course_test_send(gen_random_uuid(),gen_random_uuid(),'email','a@b.pt')"));
await auth('anon');
await denied(()=>db.query("select * from course_test_sends"));
await denied(()=>db.query("select claim_course_test_send(gen_random_uuid(),gen_random_uuid(),'email','a@b.pt')"));
await auth('service_role');
const actor='fa000000-0000-4000-8000-000000000001';
const first=(await rpc("select claim_course_test_send($1,'aa000000-0000-4000-8000-000000000001','email','admin@example.pt') r",[actor])).r;
assert.equal(first.state,'claimed');checks++;
assert.equal((await rpc("select claim_course_test_send($1,'aa000000-0000-4000-8000-000000000001','email','admin@example.pt') r",[actor])).r.state,'duplicate');checks++;
assert.equal((await rpc("select claim_course_test_send($1,'aa000000-0000-4000-8000-000000000002','email','admin@example.pt') r",[actor])).r.state,'throttled');checks++;
assert.equal((await rpc("select claim_course_test_send($1,'aa000000-0000-4000-8000-000000000003','sms','351900000000') r",[actor])).r.state,'claimed');checks++;
await db.query("select finish_course_test_send($1,'sent','prov-1',null)",[first.id]);
assert.equal((await rpc("select state s from course_test_sends where id=$1",[first.id])).s,'sent');checks++;
await denied(()=>db.query("select finish_course_test_send($1,'sent','prov-1',null)",[first.id]));
await denied(()=>db.query("select finish_course_test_send($1,'delivered',null,null)",[first.id]));
assert.equal((await rpc("select count(*)::int n from course_registrations where email='admin@example.pt'")).n,0);checks++;
await db.close();
console.log(
  `PASS: ${checks} database checks; migrations, RLS, prices, idempotency, signed-payment reconciliation, refunds, edition isolation and capacity.`,
);
