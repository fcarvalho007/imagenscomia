

## CRM Email Templates: Production-Ready Upgrade

Upgrades the existing `email_templates` system with versioning, validation, and enhanced metrics.

---

### Current State

The system already has:
- `email_templates` table with 3 active templates (stage 0/1/2)
- Edge function loading templates from DB with `{{placeholder}}` format
- Basic TemplatesView with inline editing and preview
- Dashboard with 7-day email count cards
- InscritoModal with lazy-loaded activity logs

### What Changes

---

### Part A: Database Migration

**Add columns** to `email_templates`:
- `name text NOT NULL DEFAULT ''` (human-friendly label)
- `channel text NOT NULL DEFAULT 'email'` with check constraint `channel IN ('email')`
- `version integer NOT NULL DEFAULT 1`
- `variables jsonb NOT NULL DEFAULT '[]'::jsonb` (array of required placeholder names)

**Constraints:**
- Drop existing unique on `template_key` (if any)
- Add `UNIQUE(template_key, version)`
- Add partial unique index: `CREATE UNIQUE INDEX idx_one_active_per_key ON email_templates(template_key) WHERE is_active = true`

**Update existing rows** (via SQL insert tool, not migration):
- Set `name` for each: "Follow-up Etapa 0", "Follow-up Etapa 1", "Follow-up Etapa 2"
- Set `variables` to `["name","payment_link","plan_selected","support_whatsapp","webinar_date"]`
- Set `version = 1` (already default)

**Seed new template:**
- `reminder_manual` (version 1, is_active true) with PT-PT copy, CTA "Retomar pagamento", WhatsApp footer

---

### Part B: Edge Function Update

**File:** `supabase/functions/followup-abandoned/index.ts`

Minor enhancement only (current DB-loading already works):

1. After loading template, read `variables` jsonb from the row
2. Build the template vars dict as today
3. Validate: if any variable in the template's `variables` array is missing/empty in the dict, log `message_logs` with `status='failed'`, `error='missing_variable:{var_name}'`, skip send
4. No other changes -- payment logic, idempotency, Resend sending all stay exactly as-is

---

### Part C: TemplatesView Rewrite

**File:** `src/components/crm/TemplatesView.tsx`

Major UI upgrade:

**List view:**
- Show: `name`, `template_key` (mono), active version number, `updated_at`, is_active toggle, "Preview" button
- Group by template_key if multiple versions exist
- Show version history count per key

**Versioned editing:**
- When editing an ACTIVE template, clicking "Guardar" creates a NEW row with `version + 1`, sets it `is_active = true`, and sets the old version `is_active = false` (two DB calls)
- This preserves full edit history in DB

**Editor fields:**
- Subject (text input)
- Body text (textarea, monospace)
- Body HTML (textarea, optional)
- Required variables: checkbox list from allowed set (`name`, `payment_link`, `plan_selected`, `support_whatsapp`, `webinar_date`)
- Selected checkboxes stored in `variables` jsonb

**Validation before save:**
- Subject and body must contain `{{payment_link}}` at least once
- All checked required variables must appear as `{{var}}` in subject or body (warn + block save if missing)
- Only whitelisted placeholder names allowed (flag unknown `{{...}}` patterns)

**Live preview:**
- Sample data panel (same as today but always visible in edit mode)
- Rendered subject + body with replacements

**Restore previous version:**
- In the version history, show a list of past versions with "Restaurar" button
- Restoring sets that version active and deactivates the current one

---

### Part D: Dashboard Metrics Enhancement

**File:** `src/components/crm/DashboardView.tsx`

Add 24h counts alongside existing 7d counts:
- Modify the existing email stats section to show both time windows
- Layout: "Enviados: X (24h) / Y (7d)" format in the existing cards
- Per-stage breakdown stays as-is

---

### Part E: InscritoModal Email Summary

**File:** `src/components/crm/InscritoModal.tsx`

In the Activity/Logs section header, show:
- "Emails enviados (7d): X" -- count from `messageLogs` where status=sent and created_at within 7d
- "Falhas: Y" -- count where status=failed
- "Ultimo status: sent/failed" -- from the most recent log entry
- These are computed client-side from the already-fetched `messageLogs` array (no new queries)

---

### Implementation Order

1. DB migration (add columns + constraints)
2. SQL insert to update existing rows + seed `reminder_manual`
3. Update edge function (add variables validation)
4. Deploy edge function
5. Rewrite TemplatesView (versioned editing, validation, restore)
6. Update DashboardView (24h counts)
7. Update InscritoModal (email summary line)

### Files Changed

1. `supabase/migrations/` -- new migration for schema changes
2. SQL insert for data updates + seed
3. `supabase/functions/followup-abandoned/index.ts` -- add variables validation
4. `src/components/crm/TemplatesView.tsx` -- full rewrite with versioning
5. `src/components/crm/DashboardView.tsx` -- add 24h counts
6. `src/components/crm/InscritoModal.tsx` -- add email summary line

