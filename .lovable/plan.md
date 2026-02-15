

## UX/UI Clarity: Modal Logs + Table Enrichment + Event Countdown

### What Already Exists
- Follow-up center with 3 tabs (Visao Geral, Pessoas & Auditoria, Templates) -- fully functional
- FollowUpOverview with funnel, coverage KPI, SLA buckets, metrics, and protocol alerts
- FollowUpPessoas with pipeline table and filters
- FollowUpAudit with message_logs table
- TableView with quick filters for "Backlog 36h+" and "Falhas de email"
- InscritoModal with basic email logs (template_key + status badge + provider + copy ID)

### What Changes

**1. InscritoModal -- Logs Section Overhaul (lines 771-901)**

Replace the current simple log display with a rich, self-explanatory layout:

**A) Sticky summary block** (top of Actividade/Logs section):
- "Ultimo email confirmado": template label + relative time (e.g. "Etapa 1 -- Reforco (6h) ha 3h")
- "Estado actual": badge -- CONFIRMADO / PENDENTE / FALHOU / NUNCA ENVIADO
- "Proxima accao recomendada": derived text:
  - If failed in last 2h: "Reenviar quando possivel / verificar rate limit"
  - If no resend confirmed ever: "Enviar check-in backlog"
  - If next_followup_at in future: "Aguardar: {date}"
  - If next_followup_at in past: "Em atraso: rever"

**B) Rich log lines** replacing current simple format:
- Human-readable title via TEMPLATE_LABELS map (followup_stage_0 -> "Etapa 0 -- Confirmacao de acesso", etc.)
- Status badge (queued/sent/failed) + Provider badge (Resend/Internal)
- Confirmed checkmark icon only if provider_message_id exists
- Subject line: fetched from email_templates table by template_key as fallback
- Recipient email shown
- Resend ID: copy button + truncated display
- Error in collapsible block (Radix Collapsible, already imported)

**C) "Reenviar ultimo email" button**:
- Visible only if: last log status=failed OR 0 resend confirmed logs
- Uses template_key='reminder_manual' to avoid breaking idempotency
- Checks if reminder_manual was already sent in last 6h; if so, blocks with warning
- Reuses existing sendBacklogCheckin prop with templateKey='reminder_manual'

**D) Quick actions** always visible at top of logs section (not buried):
- Copy payment link, Open link, Copy EuPago ref, WhatsApp -- compact row of icon buttons

**2. TableView -- Enrich Rows (minimal changes)**

Add to the existing Plano column area (where followup badges already show):
- "Ultimo email" badge: template label + relative time + status icon (checkmark/warning/clock)
- This requires passing message_logs data to TableView (new prop or fetch)

Add new quick filter chips (alongside existing ones):
- "Sem Resend confirmado" -- pipeline with 0 confirmed Resend logs
- "Em atraso" -- next_followup_at < now AND !do_not_contact

Data strategy: fetch message_logs summary (registration_id, latest template_key, status, provider_message_id) once on mount, build a Map for O(1) lookup per row.

**3. FollowUpOverview -- Event Countdown**

Add a small "Countdown to event" card at the very top:
- "T-XXh XXm ate ao evento (18 Fev 10:00)"
- Below: "X pessoas com intencao 48h+ sem Resend confirmado" and "Y pessoas com falha nas ultimas 24h"
- Uses EVENT_DATE constant

### Files Changed

| File | Action | Scope |
|------|--------|-------|
| `src/components/crm/InscritoModal.tsx` | Edit | Overhaul logs section (lines 771-901): add sticky summary, rich log lines, subject fallback query, reenviar button, always-visible quick actions |
| `src/components/crm/TableView.tsx` | Edit | Add "Sem Resend" and "Em atraso" filter chips; add last-email badge per row; accept message_logs summary prop |
| `src/components/crm/FollowUpOverview.tsx` | Edit | Add event countdown card at top with T-minus and operational alerts |
| `src/pages/CRM.tsx` | Edit | Fetch message_logs summary for TableView; pass as prop |
| `src/hooks/useInscritos.ts` | Edit | Add fetchMessageLogsSummary function for TableView consumption |

### Technical Details

**Template labels map** (shared constant, used in Modal + Table + Audit):
```text
followup_stage_0     -> "Etapa 0 -- Confirmacao de acesso"
followup_stage_1     -> "Etapa 1 -- Reforco (6h)"
followup_stage_2     -> "Etapa 2 -- Ultima chamada (24h)"
followup_backlog_checkin -> "Backlog -- Check-in"
followup_backlog_weak    -> "Backlog -- Sinal fraco"
followup_final_before_event -> "Final -- Antes do webinar"
reminder_manual      -> "Lembrete manual"
```

**Subject fallback**: On modal open, query `email_templates` for matching template_keys to get subject lines. Cache in state. If message_logs eventually gets a subject column, use that instead.

**"Reenviar" idempotency**: Uses template_key='reminder_manual'. Before sending, checks message_logs client-side for existing reminder_manual within last 6h for that registration_id. If found, shows "Ja enviado ha Xh -- aguardar" instead of button.

**TableView data**: New prop `lastEmailMap: Map<string, {template_key, status, provider_message_id, created_at}>` built from a single query fetching the most recent log per registration_id. Computed in CRM.tsx or useInscritos.

**Event countdown**: `const EVENT_DATE = new Date("2026-02-18T10:00:00Z")` -- shows hours/minutes remaining, updates every minute via setInterval.

**No changes to**: payment logic, edge functions, idempotency rules, database schema.

