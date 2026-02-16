

## CRM: Regenerar Link + Reenviar Email Manual

### Overview

Add two manual action buttons to the InscritoModal for pending-payment inscriptions: "Regenerar link EuPago" (force-refresh link with HEAD validation) and "Reenviar email de pagamento" (send via Resend with full audit trail).

### Files Changed

| File | Action | Scope |
|------|--------|-------|
| `supabase/functions/followup-abandoned/index.ts` | Edit | Skip idempotency check for `reminder_manual` template_key (allow multiple sends) |
| `src/components/crm/InscritoModal.tsx` | Edit | Add "Regenerar link" and "Reenviar email" buttons with confirmation dialogs and toast feedback |
| `src/hooks/useInscritos.ts` | Edit | Add `regenerateLink` and `resendPaymentEmail` helper functions |

### Detailed Changes

**1. `followup-abandoned/index.ts` — Allow repeated `reminder_manual` sends**

The current idempotency check (lines 375-387) blocks any template_key that was already sent. For `reminder_manual`, this must be relaxed since it's a manual recovery action that may need to be repeated.

Change: Skip the idempotency check when `templateKey === "reminder_manual"` or starts with `"reminder_manual"`.

```text
// Before:
if (existing && existing.length > 0) {
  return 409 already_sent
}

// After:
if (existing && existing.length > 0 && manualMode.templateKey !== "reminder_manual") {
  return 409 already_sent
}
```

**2. `src/hooks/useInscritos.ts` — Add two new functions**

A) `regenerateLink(inscritoId)`:
- Calls `generate-reminder` edge function (already creates a fresh EuPago link, validates, and updates DB)
- Returns `{ paymentLink, transactionID }`
- Updates local state with new `last_payment_link` and `payment_link_created_at`

B) `resendPaymentEmail(inscritoId)`:
- Calls `followup-abandoned` with `mode: "manual_send"`, `template_key: "reminder_manual"`
- Returns the response (includes `success`, `messageId`, `payment_url`)
- No local state changes needed (logs are in message_logs)

**3. `src/components/crm/InscritoModal.tsx` — Two new action buttons**

Place them in the payment section (between the link status block and the existing "Gerar link de pagamento" button), visible only when `payment_status` is `"awaiting_payment"` or `"selected"` and plan is not free.

A) **"Regenerar link EuPago"** button:
- Icon: `RefreshCw`
- On click: calls `regenerateLink`, shows loading spinner
- On success: toast "Link regenerado com sucesso" + shows new link with Abrir/Copiar buttons
- On error: toast with error message
- Updates the inscrito's `last_payment_link` in local state via `refresh()`

B) **"Reenviar email de pagamento"** button:
- Icon: `Send`
- On click: shows confirm dialog ("Enviar email de pagamento para {email}?")
- On confirm: calls `resendPaymentEmail`, shows loading
- On success: toast "Email enviado com sucesso" + shows provider_message_id
- On error: toast with error, or if `already_sent` (409), explain it was already sent (though we're relaxing this for reminder_manual)
- After success, refresh message logs

Both buttons are styled consistently with the existing action buttons in the payment section (blue-50 bg, compact).

### What Does NOT Change

- `generate-reminder` edge function (already does the right thing: creates EuPago link, validates, updates DB, creates audit trail)
- Payment amounts, webhook processing, stage-based follow-up idempotency
- Existing "Gerar link de pagamento" button (kept as-is for Gmail-based workflow)
- Template content or email_templates table

### Proof Delivery

After implementation, will execute a manual send via the CRM to produce a real `message_logs` row with `provider='resend'`, `provider_message_id`, and `payment_url` filled.
