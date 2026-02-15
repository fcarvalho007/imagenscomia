

## Phase B: Follow-up Engine, Audit Logging, CRM Controls, Payment Idempotency

This plan implements items A through F from the task specification, split into incremental blocks.

---

### Block 1: Database Migrations (3 migrations)

**Migration 1 — New columns on `registrations`**

Add to the `registrations` table:
- `last_payment_link` text (nullable)
- `payment_link_created_at` timestamptz (nullable)
- `followup_stage` integer default 0
- `last_followup_at` timestamptz (nullable)
- `next_followup_at` timestamptz (nullable)
- `do_not_contact` boolean default false
- `last_payment_link_sent_at` timestamptz (nullable)

**Migration 2 — Create `message_logs` table**

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| registration_id | uuid FK | references registrations(id) on delete cascade |
| channel | text | check in ('email','whatsapp'), default 'email' |
| provider | text | e.g. 'resend', 'egoi', 'internal' |
| template_key | text | e.g. 'followup_stage_0', 'reminder_manual' |
| status | text | check in ('queued','sent','failed','bounced','opened','clicked'), default 'queued' |
| provider_message_id | text | nullable |
| error | text | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

Indexes: `(registration_id, template_key, created_at)` and `(status)`.

RLS: restrictive SELECT for anon (since CRM uses anon key to read).

**Migration 3 — Create `payment_events` table**

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| registration_id | uuid FK nullable | references registrations(id) on delete set null |
| event_type | text | e.g. 'link_created', 'webhook_received', 'payment_confirmed' |
| eupago_ref | text nullable | |
| idempotency_key | text unique | |
| payload | jsonb | full webhook/request payload |
| received_at | timestamptz | default now() |
| processed_at | timestamptz nullable | |

Indexes: `(eupago_ref)` and `(received_at)`.

RLS: restrictive SELECT for anon.

---

### Block 2: Payment Idempotency in `create-payment`

File: `supabase/functions/create-payment/index.ts`

Before calling the EuPago API:
1. Query `registrations` for this email to get `eupago_ref` and `upgrade_clicked_at`
2. If `eupago_ref` exists AND `upgrade_clicked_at` is within the last 1 hour AND `paid_at` is NULL:
   - Return the existing reference with a message "Pagamento em processamento" (no new EuPago call)
   - If `last_payment_link` is saved, return it directly
3. Otherwise, proceed normally to create a new link
4. After creating the link, save `last_payment_link` and `payment_link_created_at` on the registration
5. Insert a row into `payment_events` with `event_type = 'link_created'` and `idempotency_key = {email}-{plan}-{transactionID}`

---

### Block 3: Audit logging in `eupago-webhook`

File: `supabase/functions/eupago-webhook/index.ts`

After receiving a webhook call:
1. Insert into `payment_events` with:
   - `event_type`: 'webhook_received' (before processing) and 'payment_confirmed' (after successful match)
   - `idempotency_key`: `webhook-{transactionID}-{reference}` (unique constraint prevents duplicate processing)
   - `payload`: full webhook data as JSONB
2. If insert fails due to unique constraint on `idempotency_key`, log and skip (idempotent)
3. Set `processed_at` after successful DB update

---

### Block 4: Audit logging in `generate-reminder`

File: `supabase/functions/generate-reminder/index.ts`

After generating a new payment link:
1. Update `registrations` with `last_payment_link`, `payment_link_created_at`, and `last_payment_link_sent_at`
2. Insert into `message_logs`:
   - `registration_id` (looked up by email)
   - `channel`: 'email'
   - `provider`: 'internal'
   - `template_key`: 'reminder_manual'
   - `status`: 'queued' (since the CRM operator sends manually via Gmail)
3. Insert into `payment_events`:
   - `event_type`: 'link_created'
   - `idempotency_key`: `reminder-{email}-{transactionID}`

---

### Block 5: Edge Function `followup-abandoned`

New file: `supabase/functions/followup-abandoned/index.ts`

Config: `verify_jwt = false` (called by cron)

Logic:
1. Select registrations where:
   - `paid_at IS NULL`
   - `plan_selected IS NOT NULL` and `plan_selected != 'free'`
   - `do_not_contact = false`
   - `next_followup_at IS NULL OR next_followup_at <= now()`
   - `followup_stage < 3`
2. For each candidate, check schedule eligibility:
   - Stage 0: eligible 30 min after `upgrade_clicked_at` or `created_at`
   - Stage 1: eligible 6h after last_followup_at
   - Stage 2: eligible 24h after last_followup_at
   - Stage 3+: skip (do not send)
3. Idempotency check: query `message_logs` for `(registration_id, template_key)` where `template_key = 'followup_stage_{N}'`. If exists, skip.
4. If `last_payment_link` is NULL or `payment_link_created_at` is older than 48h:
   - Call `create-payment` internally to generate a fresh link
   - Save `last_payment_link` and `payment_link_created_at`
5. Insert `message_logs` row with status 'queued'
6. Build email template (same format as generate-reminder, adapted per stage):
   - Stage 0: "Faltou um passo" (short, friendly)
   - Stage 1: "O teu plano ainda esta a espera" (urgency)
   - Stage 2: "Ultima oportunidade" (scarcity)
7. For now, log the prepared email (provider = 'internal'). Actual sending can be wired to Resend/E-goi later.
8. Update registration: `followup_stage++`, `last_followup_at = now()`, `next_followup_at` per schedule
9. Update message_logs status to 'sent' or 'failed'
10. Return summary: `{ processed: N, sent: N, skipped: N, errors: N }`

---

### Block 6: CRM UI Enhancements

**InscritoModal.tsx** — Enhanced reminder section:
- Show `last_payment_link_sent_at` timestamp if it exists: "Ultimo link enviado em {date}"
- Show `followup_stage` indicator: "Follow-up automatico: etapa {N}/3"
- Show `do_not_contact` toggle (checkbox) with update to DB
- Button text changes:
  - No previous link: "Gerar link de pagamento"
  - Previous link exists: "Gerar NOVO link de pagamento (o anterior expira)"
- After generating, update `last_payment_link_sent_at` in local state

**mockData.ts** — Add new fields to `Inscrito` type:
- `last_payment_link: string | null`
- `payment_link_created_at: string | null`
- `followup_stage: number`
- `last_followup_at: string | null`
- `next_followup_at: string | null`
- `do_not_contact: boolean`
- `last_payment_link_sent_at: string | null`

**useInscritos.ts** — Map new fields from DB response in `mapRegistration()`.

**useInscritos.ts** — Add `toggleDoNotContact(inscritoId)` action that updates DB and local state.

---

### Block 7: Cron Job for `followup-abandoned`

SQL insert (via insert tool, not migration) to schedule:
```sql
select cron.schedule(
  'followup-abandoned-every-15min',
  '*/15 * * * *',
  $$
  select net.http_post(
    url:='https://gwphpsehcnhwjiypyolg.supabase.co/functions/v1/followup-abandoned',
    headers:='{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'::jsonb,
    body:='{"source":"cron"}'::jsonb
  ) as request_id;
  $$
);
```

Requires enabling `pg_cron` and `pg_net` extensions first (via migration).

---

### File Change Summary

| File | Action |
|---|---|
| Migration SQL (3 migrations) | Create new columns + tables |
| `supabase/functions/create-payment/index.ts` | Add idempotency check + save payment link + log to payment_events |
| `supabase/functions/eupago-webhook/index.ts` | Add payment_events logging with idempotency |
| `supabase/functions/generate-reminder/index.ts` | Save link + log to message_logs + payment_events |
| `supabase/functions/followup-abandoned/index.ts` | NEW — follow-up engine |
| `supabase/config.toml` | Add `[functions.followup-abandoned] verify_jwt = false` |
| `src/pages/crm/mockData.ts` | Add 7 new fields to Inscrito type |
| `src/hooks/useInscritos.ts` | Map new fields + add toggleDoNotContact |
| `src/components/crm/InscritoModal.tsx` | Enhanced reminder UI + do_not_contact toggle + follow-up stage display |

### Execution Order

1. Run 3 migrations (Block 1)
2. Deploy `create-payment` with idempotency (Block 2) — test with curl
3. Deploy `eupago-webhook` with audit logging (Block 3)
4. Deploy `generate-reminder` with logging (Block 4) — test via CRM
5. Create + deploy `followup-abandoned` (Block 5) — test with curl
6. Update CRM frontend (Block 6) — visual verification
7. Enable cron (Block 7) — verify in logs after 15 min

### Risk Assessment

| Change | Risk | Mitigation |
|---|---|---|
| New DB columns | None (all nullable with defaults) | Non-breaking |
| create-payment idempotency | Low — adds guard before EuPago call | Falls through to existing behavior if check fails |
| eupago-webhook logging | Low — additive, existing flow untouched | Unique constraint prevents double-processing |
| followup-abandoned | Medium — new automated outreach | Stage cap at 3, do_not_contact flag, idempotent via message_logs |
| CRM UI changes | Low — additive fields and toggle | No existing UI removed |

