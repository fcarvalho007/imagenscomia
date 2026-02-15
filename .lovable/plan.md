

## Templates DB + CRM UI + Edge Function Update

The `email_templates` table already exists with 3 seeded rows. This plan covers the remaining work: updating the edge function to use DB templates, adding a Templates page to the CRM, and adding email counts.

---

### 1. Edge Function: Load templates from DB

**File:** `supabase/functions/followup-abandoned/index.ts`

- Remove the hardcoded `STAGE_TEMPLATES` array and `WHATSAPP_FOOTER` constant (lines 22-43)
- After determining `templateKey` for a candidate, query `email_templates`:
  ```
  select subject, text_body, html_body from email_templates
  where template_key = templateKey and is_active = true limit 1
  ```
- If no row returned: insert a `message_logs` row with `status='failed'`, `error='template_missing'`, skip send, increment `summary.errors`
- Replace placeholders in subject and body (use `coalesce(html_body, text_body)`):
  - `{{name}}` -> `reg.first_name || reg.name.split(" ")[0]`
  - `{{payment_link}}` -> `paymentLink`
  - `{{plan_selected}}` -> `reg.plan_selected`
  - `{{support_whatsapp}}` -> `"915 015 508"`
  - `{{webinar_date}}` -> `"18 Fev 2026 · 10h00"`
- Send via Resend using the resolved subject and body (if `html_body` exists, send as `html`; otherwise as `text`)
- Remove the old `product.label` / `displayValue` logic from email building (lines 225-229)

---

### 2. CRM Sidebar: Add "Templates" view

**File:** `src/components/crm/CRMSidebar.tsx`

- Add `"templates"` to the `CRMView` type union
- Add a new nav item: `{ icon: FileText, label: "Templates", view: "templates" }` (import `FileText` from lucide-react)

---

### 3. New Component: TemplatesView

**File:** `src/components/crm/TemplatesView.tsx` (new)

A full CRM page listing email templates from the `email_templates` table.

**List view:**
- Fetch all rows from `email_templates` on mount, ordered by `template_key`
- Table with columns: Template Key, Subject (truncated), Active (toggle), Updated At
- Click a row to open the edit modal

**Edit modal (inline dialog):**
- Fields: `subject` (input), `text_body` (textarea), `html_body` (textarea, optional)
- Live preview panel below: shows the body with sample variable replacements:
  - `{{name}}` -> "Maria"
  - `{{payment_link}}` -> "https://exemplo.pt/pagamento"
  - `{{plan_selected}}` -> "Premium"
  - `{{support_whatsapp}}` -> "915 015 508"
  - `{{webinar_date}}` -> "18 Fev 2026 · 10h00"
- Save button: updates `subject`, `text_body`, `html_body`, `updated_at = now()`, `updated_by = 'crm'`
- Toggle `is_active`: when activating, no special logic needed (template_key is unique, so only one row per key)

---

### 4. Wire Templates into CRM page

**File:** `src/pages/CRM.tsx`

- Import `TemplatesView`
- Add rendering for `activeView === "templates"`

---

### 5. Dashboard: Email count cards

**File:** `src/components/crm/DashboardView.tsx`

- On mount, fetch two counts from `message_logs`:
  - `sent_7d`: count where `status = 'sent'` and `created_at >= 7 days ago`
  - `failed_7d`: count where `status = 'failed'` and `created_at >= 7 days ago`
- Also fetch per-stage breakdown: count `message_logs` where `status = 'sent'` grouped by `template_key` (for `followup_stage_0/1/2`)
- Add a new section after KPIs titled "Emails (7 dias)" with 3 compact cards:
  - "Enviados": sent_7d count (green)
  - "Falhas": failed_7d count (red)
  - "Por etapa": mini list showing stage 0/1/2 sent counts

---

### 6. Inscrito Modal: Email counts summary

**File:** `src/components/crm/InscritoModal.tsx`

- In the Activity/Logs section header, add inline counts computed from the already-fetched `messageLogs` array:
  - "Emails enviados: X" (count where status === 'sent')
  - "Falhas: Y" (count where status === 'failed')
- These are computed client-side from the logs already loaded lazily

---

### Technical Notes

- The `email_templates` table already has RLS policies allowing anon SELECT, UPDATE, and INSERT
- The edge function uses service role key, so RLS is bypassed for its queries
- No new DB migrations needed
- Edge function will be redeployed after changes
- All UI labels in PT-PT, consistent with existing CRM design patterns

