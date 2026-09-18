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

await db.close();
console.log(
  `PASS: ${checks} database checks; migrations, RLS, prices, idempotency, signed-payment reconciliation, refunds, edition isolation and capacity.`,
);
