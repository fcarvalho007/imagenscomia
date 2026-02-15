

## Centro de Follow-up: Funil + Metricas + Auditoria + Templates

### Overview

Replace the current "Templates" sidebar entry with a new "Follow-up" section containing 3 sub-tabs: Visao Geral (funnel + metrics), Envio e Auditoria (message log table with filters), and Templates (existing editor, enriched).

### Files Changed

1. **`src/components/crm/CRMSidebar.tsx`** -- Rename "Templates" to "Follow-up", change icon from `FileText` to `Zap` (or `Mail`)
2. **`src/components/crm/FollowUpView.tsx`** (NEW) -- Container component with 3 Radix Tabs
3. **`src/components/crm/FollowUpOverview.tsx`** (NEW) -- Tab 1: Funnel + Metrics + Alerts
4. **`src/components/crm/FollowUpAudit.tsx`** (NEW) -- Tab 2: message_logs table with filters
5. **`src/components/crm/TemplatesView.tsx`** -- Enriched with per-template send counts + "Ver envios" link
6. **`src/pages/CRM.tsx`** -- Replace `<TemplatesView />` with `<FollowUpView />`

No schema changes. No edge function changes. All read-only queries to existing tables.

---

### Tab 1: Visao Geral (`FollowUpOverview.tsx`)

**Funnel cards** (horizontal on desktop, stacked on mobile):
- Pipeline data from `registrations` where `plan_selected != 'free' AND paid_at IS NULL`
- Cards: Etapa 0 / Etapa 1 / Etapa 2 / Concluido (stage >= 3) / Nao contactar / Pagos (reference)
- Each card shows count + percentage bar

**Email metrics** (4 cards, same pattern as Dashboard but scoped to follow-up):
- "Enviados via Resend" 24h / 7d: `provider='resend' AND status='sent' AND provider_message_id IS NOT NULL`
- "Falhas" 24h / 7d: `status='failed'`
- "Logs internos" 24h / 7d: `provider='internal' AND status='sent'` (muted/60% opacity)

**Per-stage breakdown** (Resend confirmed only):
- Horizontal bar chart showing counts per template_key (7d), only `provider='resend' AND provider_message_id IS NOT NULL`

**Protocol alerts** (clickable blocks):
- "Sem email Resend": count of registrations with intent but 0 message_logs with `provider='resend' AND status='sent'`
  - Query: LEFT JOIN message_logs, filter where no matching resend rows
  - Since we cannot do complex JOINs via Supabase JS client, we fetch all message_logs (registration_id, provider, status) for the 24h window and compute client-side against registrations
- "Com falha de email": registrations with at least one `status='failed'` in last 24h
- "Link expirado": `payment_link_created_at > 48h AND paid_at IS NULL`
- "Em atraso": `next_followup_at < now() AND paid_at IS NULL AND do_not_contact = false`
- Each alert shows count + icon + is clickable (switches to Tab 2 with pre-applied filter)

---

### Tab 2: Envio e Auditoria (`FollowUpAudit.tsx`)

**Data source**: `message_logs` JOIN `registrations` (client-side join since both are small datasets)

**Table columns**:
- Data/hora (created_at, formatted)
- Nome + email (from registration join)
- template_key (with friendly label mapping)
- Provider badge (green for resend, gray for internal)
- Status badge (green sent, red failed, yellow queued)
- provider_message_id (truncated, copy button)
- Error (if exists, truncated with tooltip)
- Actions: "Abrir ficha" (opens InscritoModal), "Copiar link" (last_payment_link)

**Quick filters** (chips):
- Time range: 24h / 7d / Tudo
- Provider: Resend / Internal / Todos
- Status: sent / failed / queued / Todos
- Template: dropdown select of template_keys
- "So confirmados" toggle (provider_message_id IS NOT NULL)

**Summary bar** at top: "Resend confirmados: X / Falhas: Y / Total: Z"

**Mobile**: Condensed card layout instead of table. Each card shows name, template, status badge, time.

**Props**: Accepts optional `initialFilter` prop so Tab 1 alerts can open Tab 2 pre-filtered.

---

### Tab 3: Templates (enriched `TemplatesView.tsx`)

Keep all existing functionality. Add:
- Per template row: new column "Envios 7d" showing count of Resend-confirmed sends for that template_key
- Button "Ver envios" per template that triggers a callback to switch to Tab 2 filtered by that template_key
- Query on mount: fetch `message_logs` grouped by template_key where `provider='resend' AND status='sent' AND provider_message_id IS NOT NULL` in last 7 days

---

### Container: `FollowUpView.tsx`

```text
+------------------------------------------+
| FOLLOW-UP                                |
| [Visao Geral] [Envio & Auditoria] [Templates] |
+------------------------------------------+
|  (active tab content)                    |
+------------------------------------------+
```

- Uses Radix `Tabs` component (already installed)
- State: `activeTab` + `auditFilter` (passed to Tab 2)
- When an alert in Tab 1 is clicked, sets `auditFilter` and switches to Tab 2
- When "Ver envios" in Tab 3 is clicked, sets `auditFilter.templateKey` and switches to Tab 2

---

### Data fetching strategy

All queries are direct Supabase client calls (no SQL views needed):

1. **Funnel data**: Derived from `inscritos` prop (already fetched by useInscritos)
2. **Email metrics**: `supabase.from("message_logs").select(...)` with appropriate filters
3. **Audit table**: Fetch `message_logs` (limit 500, ordered by created_at desc) + join with inscritos client-side by registration_id
4. **Template send counts**: `supabase.from("message_logs").select("template_key")` grouped client-side

This avoids creating SQL views while keeping queries efficient (message_logs is small).

---

### Technical Details

**FollowUpView.tsx** receives:
- `inscritos: Inscrito[]` (from CRM.tsx, same prop)
- `onSelectInscrito: (i: Inscrito) => void` (for "Abrir ficha" action)

**CRM.tsx changes**:
- Import `FollowUpView` instead of `TemplatesView`
- Pass `inscritos` and `onSelectInscrito` to it

**CRMSidebar.tsx changes**:
- `CRMView` type stays the same (value "templates" maps to follow-up section)
- Just rename the label from "Templates" to "Follow-up" and change icon

**TemplatesView.tsx changes**:
- Accept optional `onViewSends?: (templateKey: string) => void` prop
- Accept optional `templateSendCounts?: Record<string, number>` prop
- Add "Envios 7d" column and "Ver envios" button per row

**Queries used** (all respect the Resend confirmed rule):
- Resend confirmed: `provider='resend' AND status='sent' AND provider_message_id IS NOT NULL`
- Internal: `provider='internal' AND status='sent'`
- Failed: `status='failed'` (any provider)

