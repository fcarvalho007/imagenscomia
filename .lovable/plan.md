

# CRM Subscriber Modal — Replace Technical Jargon with Human Labels

## Summary

Text-only changes across 3 files to replace technical event names, status badges, and button labels with clear Portuguese language. No layout or functionality changes.

---

## Files to modify

| File | Changes |
|---|---|
| `src/components/crm/templateLabels.ts` | Expand TEMPLATE_LABELS with new human-readable entries; update fallback function to format unknown keys |
| `src/components/crm/modal/ActivityTimeline.tsx` | Add status label map; add tooltip to "Resend" badge; add info icon for backlog events |
| `src/components/crm/modal/SidebarActions.tsx` | Rename backlog button + add tooltip; update confirm dialog text |
| `src/components/crm/modal/LinkFollowUpSection.tsx` | Rename "Follow-up automatico" label and value text |

---

## CHANGE 1 — templateLabels.ts: expand labels + smart fallback

Add/update entries in TEMPLATE_LABELS:

```
resolve_attempt: "Tentativa de resolver pagamento"
link_created: "Link de pagamento gerado"
video_confirmation: "Email de confirmacao enviado"
followup_stage_0: "Email de follow-up — Etapa inicial"
followup_stage_1: "Email de follow-up — 2a tentativa"
followup_stage_2: "Email de follow-up — Ultima chamada"
followup_backlog_checkin: "Email de check-in (reactivacao)"
followup_backlog_weak: "Email de follow-up fraco (sem clique)"
followup_final_before_event: "Email — ultima oportunidade antes do webinar"
payment_confirmed_customer: "Email de confirmacao de pagamento"
invoice_notification: "Email de notificacao de fatura"
```

Update `getTemplateLabel` fallback (line 31-33): instead of returning raw key, replace underscores with spaces and capitalise first letter:
```typescript
export function getTemplateLabel(key: string): string {
  if (TEMPLATE_LABELS[key]) return TEMPLATE_LABELS[key];
  // Humanise unknown keys: replace _ with space, capitalise first letter
  const humanised = key.replace(/_/g, " ");
  return humanised.charAt(0).toUpperCase() + humanised.slice(1);
}
```

---

## CHANGE 2 — ActivityTimeline.tsx: status labels + tooltips

### Status badge labels (line 204-206)

Add a STATUS_LABELS map and use it instead of raw status string:

```typescript
const STATUS_LABELS: Record<string, string> = {
  pending: "A aguardar",
  sent: "Enviado",
  delivered: "Enviado",
  failed: "Falhou",
  resolved: "Resolvido",
  created: "Criado",
  processing: "A processar",
  processed: "Processado",
  queued: "Em fila",
};
```

Replace `{item.status}` (line 205) with `{STATUS_LABELS[item.status] || item.status}`.

### Resend badge tooltip (line 208-213)

Add `title="Plataforma de envio de emails (sistema automatico)"` to the Resend provider badge span.

### Backlog info icon (line 196-199)

After the title `<span>`, if the item's underlying template_key contains "backlog", append a small info icon:
```
<span title="Inscrito que nao interagiu com o link de pagamento ha mais de 36h" style={{ cursor: "help" }}>
  ℹ️
</span>
```

To detect backlog keys, pass `template_key` through from `messageLogs` into `TimelineItem` as a new optional field `templateKey`.

---

## CHANGE 3 — SidebarActions.tsx: backlog button rename

Line 126: Change `"Enviar check-in backlog"` to `"Enviar email de reactivacao"`.

Line 126: Change `"Check-in enviado"` to `"Email de reactivacao enviado"`.

Line 119-127: Add `title="Envia um email para inscritos que estao ha mais de 36h sem interagir com o link de pagamento"` to the backlog button element.

Line 72: Update confirm dialog text from `"Enviar check-in backlog para"` to `"Enviar email de reactivacao para"`.

---

## CHANGE 4 — LinkFollowUpSection.tsx: rename follow-up label

Line 84: Change label from `"Follow-up automatico"` to `"EMAILS AUTOMATICOS"` (already uppercase via CSS, just change the text content).

Line 85: Change value from `"Etapa {n}/3"` to `"A enviar sequencia (email {n} de 3)"`.

---

## What does NOT change

- Data queries, Supabase calls, or any functionality
- Resend message IDs (remain visible for support debugging)
- EuPago reference numbers
- Layout, navigation, authentication
- Any other CRM view or modal tab
- Filter tabs (already clear)

