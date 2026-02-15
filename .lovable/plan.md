

## CRM UI Robustness Upgrade — Follow-up Operations

This upgrade adds activity logs, follow-up visibility, payment link actions, and smart filters across the CRM Table and Inscrito Modal.

---

### A) useInscritos Hook — Lazy Log Fetching

**File:** `src/hooks/useInscritos.ts`

Add two new async functions that fetch logs on-demand (not on page load):

- `fetchMessageLogs(registrationId)` — queries `message_logs` table filtered by `registration_id`, ordered by `created_at desc`, limit 10
- `fetchPaymentEvents(registrationId)` — queries `payment_events` table filtered by `registration_id`, ordered by `received_at desc`, limit 10

Both return typed arrays. No global state — the modal manages its own local state for these.

Also add a helper `fetchFailedEmailIds()` that returns a `Set<string>` of registration IDs with failed message_logs in the last 24h (for the table filter chip). Called once when TableView mounts.

---

### B) Inscrito Modal — Activity/Logs Section

**File:** `src/components/crm/InscritoModal.tsx`

Add a new section after the Notas section titled **"Actividade / Logs"** with two tabs:

**Tab 1: Emails (message_logs)**
- Fetched lazily via `fetchMessageLogs` when the modal opens (useEffect on inscrito.id)
- Each row shows: `created_at` (formatted), `template_key`, status badge (queued = grey, sent = green, failed = red), `provider`, `provider_message_id` (with copy button), `error` (shown as tooltip/collapsed red text if present)
- Empty state: "Sem emails enviados"

**Tab 2: Pagamentos (payment_events)**
- Fetched lazily via `fetchPaymentEvents` when modal opens
- Each row shows: `received_at` (formatted), `event_type` badge (colored by type), `eupago_ref`, `processed_at`, `idempotency_key` (copy button), `payload` (collapsed JSON preview via collapsible)
- Empty state: "Sem eventos de pagamento"

Uses Radix Tabs component already in the project.

---

### C) Inscrito Modal — Enhanced Follow-up Header

**File:** `src/components/crm/InscritoModal.tsx`

Enhance the existing follow-up info block (lines 436-465) to show:

- "Follow-up automatico: etapa X/3" (already exists)
- **NEW**: "Ultima tentativa: {last_followup_at}" (formatted date, or "Nunca" if null)
- **NEW**: "Proxima tentativa: {next_followup_at}" (formatted date, or "N/A" if null or stage >= 3)
- Keep the "Nao contactar" toggle (already exists)

**NEW Payment Link Actions** (shown when `last_payment_link` exists):
- Button: "Copiar link de pagamento" — copies `last_payment_link` to clipboard
- Button: "Abrir link" — opens `last_payment_link` in new tab
- Button: "Copiar ref EuPago" — copies `eupago_ref` (if exists)

These appear as a compact button row below the follow-up info, before the "Gerar NOVO link" button.

---

### D) Table View — Quick Filter Chips

**File:** `src/components/crm/TableView.tsx`

Add a row of clickable filter chips above the existing controls:

1. **"Aguardam pagamento"** — `paid_at == null AND plan_selected != 'free' AND plan_selected != null`
2. **"Link expirado"** — `payment_link_created_at` older than 48h AND `paid_at == null`
3. **"Falhas de email"** — registration ID is in the failed-emails set (fetched once on mount)
4. **"Nao contactar"** — `do_not_contact == true`

Chips are toggle-able (click to activate/deactivate). Active chip gets highlighted styling. Only one chip active at a time (clicking another deactivates the previous). Chips show count badges.

The "Falhas de email" chip requires calling `fetchFailedEmailIds()` once when TableView mounts, storing the result in state.

---

### E) Table View — Follow-up Badges in Rows

**File:** `src/components/crm/TableView.tsx`

For rows where `paid_at == null AND plan != 'free'`, add two compact inline badges after the existing payment status badges:

- **"Follow-up X/3"** — small pill, muted style
- **"Prox. {relative time}"** — e.g., "Prox. 2h", "Prox. 06:45", computed from `next_followup_at`. Only shown if `next_followup_at` is set and in the future.

These are small, inline, using the same badge styling pattern as existing payment status badges.

---

### Technical Details

**New types needed** (inline in useInscritos or a shared types file):

```text
MessageLog: id, registration_id, template_key, channel, provider, status, provider_message_id, error, created_at, updated_at
PaymentEvent: id, registration_id, event_type, eupago_ref, idempotency_key, payload, received_at, processed_at
```

**Data flow:**
- Table View: all data comes from existing `inscritos` array (client-side filtering) + one extra query for failed email IDs
- Modal: logs fetched lazily per inscrito via two Supabase queries when modal opens

**No backend changes.** All DB fields and tables already exist from Phase B.

**Files changed:**
1. `src/hooks/useInscritos.ts` — add `fetchMessageLogs`, `fetchPaymentEvents`, `fetchFailedEmailIds`
2. `src/components/crm/InscritoModal.tsx` — add Activity/Logs tabs section, enhance follow-up header with timestamps + payment link buttons
3. `src/components/crm/TableView.tsx` — add filter chips row + follow-up badges in table rows
4. `src/pages/CRM.tsx` — pass new hook functions to InscritoModal

