

# Fluxo Tab — Clickable Send Counts + Pending Indicator + Consolidated Split

## Summary

Three changes to the Automacoes > Fluxo tab: (1) make "N enviados" clickable to open a drawer listing recipients, (2) add pending/scheduled indicator below counts, (3) split totals by webinar in consolidado mode.

---

## Files to modify/create

| File | Action |
|---|---|
| `src/components/crm/AutomationFlowTab.tsx` | Add drawer state, clickable counts, pending indicator, consolidated status bar split |
| `src/components/crm/modal/EmailRecipientsDrawer.tsx` | **New** — slide-in drawer showing who received an email |

---

## CHANGE 1 — Clickable sent count + Recipients Drawer

### New component: EmailRecipientsDrawer.tsx

A right-side drawer (using the existing `Sheet` component from `src/components/ui/sheet.tsx`) that displays recipients for a specific email.

**Props:**
- `open: boolean`
- `onClose: () => void`
- `emailKey: string` (e.g. "confirmation", "reminder_48h")
- `webinar: WebinarKey | "consolidado"`
- `emailTitle: string` (e.g. "Lembrete 48h")

**Data fetching:**
On open, query `email_send_logs`:
```sql
SELECT fname, recipient_email, status, error_message, sent_at, webinar
FROM email_send_logs
WHERE email_key = [emailKey]
  AND (webinar = [webinar] OR consolidado -> both)
ORDER BY sent_at DESC
```

**Layout:**
- Header: "[Email name] . Enviados" + subtitle "Lista de inscritos que receberam este email"
- Scrollable list of recipients:
  - Avatar with initials (first letter of fname, or first letter of email)
  - Name (bold, 13px) + email (grey, 12px)
  - Timestamp: relative ("ha 3h") or absolute ("23 Fev . 12:15") using date-fns
  - Webinar badge (IMG/VID) — only in consolidado context
  - Status dot: green circle for sent, red for failed
- Failures section: collapsible "Falhas (N)" section at bottom, collapsed by default. Each failed row shows error_message on expand.
- Footer bar: "[N] enviados . [M] falharam . Taxa: X%"
- Export CSV button: generates and downloads a CSV with columns: name, email, status, sent_at, error
- Close: X button (built into Sheet)

### AutomationFlowTab.tsx changes

Add state for drawer:
```typescript
const [drawerOpen, setDrawerOpen] = useState(false);
const [drawerEmailKey, setDrawerEmailKey] = useState("");
const [drawerTitle, setDrawerTitle] = useState("");
const [drawerWebinar, setDrawerWebinar] = useState<WebinarKey | "consolidado">("video");
```

Pass `onClickSentCount` callback to Timeline component.

In the Timeline email node right-side stats (lines 393-402), change the sent count `<span>` to a `<button>`:
- Style: `color: #2563eb`, `text-decoration: underline`, `cursor: pointer`, font-size 12px
- On click: set drawer state with the node's email_key and webinar, open drawer
- Only clickable if `counts.sent > 0`; otherwise keep as plain text

Render `<EmailRecipientsDrawer>` once at the bottom of the component.

---

## CHANGE 2 — Pending recipients indicator

In each email node, below the sent/failed counts, add a "pending" line.

**Logic (computed in `nodeCounts` memo or separate memo):**

For each email node, derive pending count:
- `pending = inscritosCount - counts.sent - counts.failed`
- If the email's scheduled send date has NOT passed yet AND pending > 0: show "-> [N] por receber" in blue (#3b82f6, 11px)
- If the send date HAS passed and counts.sent > 0 and pending <= 0: show "checkmark Todos receberam" in green (#16a34a, 11px)
- If inscritosCount === 0: show "-- Sem inscritos ainda" in grey (#aaa, 11px)

**Send date determination:**
- Confirmation: immediate (always "passed" — no pending indicator needed, skip)
- Reminder 48h: webinar start date minus 48h
- Reminder 24h: webinar start date minus 24h
- Reminder 1h: webinar start date minus 1h
- Post-webinar: webinar start date plus 3h (or manual, so skip pending for this too)

Use `WEBINAR_CONFIG[webinar].startDate` to compute these thresholds.

**Render location:** Inside the right-side `<div>` of email nodes, after the sent/failed counts block (after line 402), before the "Ver email" button.

---

## CHANGE 3 — Status bar split by webinar in consolidado

In the `StatusBar` component (lines 132-200), when `webinar` is undefined (consolidado mode):

Currently shows: "📧 74 emails enviados"

Change to compute per-webinar counts from emailStats:
```typescript
let imgSent = 0, imgFailed = 0, vidSent = 0, vidFailed = 0;
for (const [key, val] of Object.entries(emailStats)) {
  if (key.startsWith("imagens_") || key.startsWith("followup_")) {
    imgSent += val.sent; imgFailed += val.failed;
  } else if (key.startsWith("video_")) {
    vidSent += val.sent; vidFailed += val.failed;
  }
}
```

Display:
- "📧 [total] enviados ([imgSent] IMG . [vidSent] VID)"
- "❌ [total] falhas ([imgFailed] IMG . [vidFailed] VID)"

In single-webinar context: keep current format unchanged.

---

## Technical details

1. The `email_key` values in `email_send_logs` match the raw key (e.g. "confirmation", "reminder_48h") — the template_key prefix (`video_`, `imagens_`) is stored in the `webinar` column separately.

2. The drawer uses the existing `Sheet` / `SheetContent` from `src/components/ui/sheet.tsx` (right side, width 400px via className).

3. CSV export: build in-memory string, create Blob, trigger download via temporary anchor element. No server call needed.

4. The `Collapsible` component from `src/components/ui/collapsible.tsx` is used for the failures section in the drawer.

5. Avatar initials: take first character of `fname` if available, otherwise first character of `recipient_email`, uppercase. Same circular avatar style as used in Pipeline cards.

6. Relative time formatting: use `formatDistanceToNow` from date-fns with `{ addSuffix: true, locale: pt }` or manual formatting like "ha Xh".

7. No changes to any other tabs, views, or data persistence logic.

