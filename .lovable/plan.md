

## Fix EuPago 404 Links in Follow-up Emails

### Diagnosis

The payment links stored in the database ARE correctly sourced from EuPago's API (format: `https://clientes.eupago.pt/api/extern/paybylink/form/<txId>`). The 404 errors occur because EuPago pay-by-link URLs expire server-side, but the system reuses links up to 48h old without verifying they still work. The `sendEmail` function also does not record which URL was actually sent, making post-mortem analysis impossible.

### Changes Overview

| File | Scope |
|------|-------|
| DB migration | Add `payment_url` column to `message_logs` |
| `supabase/functions/followup-abandoned/index.ts` | Record payment_url in logs; reduce reuse threshold to 24h; add link validation (HEAD check) before sending; regenerate on 404; add WhatsApp fallback line to text-only templates |
| `src/components/crm/InscritoModal.tsx` | Show link status (OK/Expired) + "Regenerar link" button |
| `src/components/crm/TableView.tsx` | Already has "Link expirado" filter — no changes needed |

### Detailed Changes

**1. Database Migration — Add `payment_url` to `message_logs`**

Add a nullable `payment_url` text column to `message_logs` so every email send records the exact URL injected into the template.

```sql
ALTER TABLE message_logs ADD COLUMN payment_url text;
```

**2. `followup-abandoned/index.ts` — Core Fixes**

A) **Record payment_url in message_logs**: In the `sendEmail` function, accept `paymentLink` as a parameter (already does), and after inserting the `queued` log row, update it to include `payment_url`.

B) **Reduce link reuse threshold from 48h to 12h**: Change the check in `refreshPaymentLink` from `linkAge <= 48 * 60 * 60 * 1000` to `linkAge <= 12 * 60 * 60 * 1000`. This ensures links sent in emails are always relatively fresh.

C) **Add link health check**: Before sending, do a HEAD request to the payment URL. If it returns 404 or non-2xx/3xx, force-regenerate the link via EuPago API. This catches expired links before they reach the user's inbox.

```text
async function validateLink(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
}
```

D) **Update cron flow**: In the normal stage flow and backlog tracks, after obtaining `paymentLink`, call `validateLink()`. If it fails, call `refreshPaymentLink()` with force-refresh (bypass age check). If regeneration also fails, log `status='failed'` with `error='link_validation_failed'` and skip.

E) **Persist payment_url on log update**: When updating the message_log from `queued` to `sent`, also set `payment_url = paymentLink`.

**3. `sendEmail` function signature update**

The `sendEmail` function already receives `paymentLink`. After the `queued` log insert, store the URL:

```typescript
// After insert queued log:
// Update to include payment_url
await supabase.from("message_logs").update({
  payment_url: paymentLink,
}).eq("id", logRow.id);
```

And again when marking as `sent`:

```typescript
await supabase.from("message_logs").update({
  status: "sent",
  provider_message_id: resendData.id,
  payment_url: paymentLink,
  updated_at: new Date().toISOString(),
}).eq("id", logRow.id);
```

**4. `refreshPaymentLink` — Force mode**

Add optional `forceRefresh` parameter. When true, skip the age check and always create a new EuPago link:

```typescript
async function refreshPaymentLink(
  reg, supabase, EUPAGO_API_KEY, supabaseUrl, nowMs, stage, forceRefresh = false
): Promise<string | null> {
  // ...
  if (!forceRefresh && reg.last_payment_link && linkAge <= 12 * 60 * 60 * 1000) {
    return reg.last_payment_link;
  }
  // Create new link...
}
```

**5. Email template fallback line**

The HTML templates already include WhatsApp support links. For text-only templates (stage 0, 1, 2), the `{{support_whatsapp}}` variable is already used. No template changes needed — the WhatsApp fallback is already present in all templates.

**6. CRM InscritoModal — Link Status + Regenerate**

In the payment section of the inscrito modal:

- Show link age and status: "Link criado ha Xh" with colour coding (green <12h, amber 12-24h, red >24h)
- Add "Regenerar link EuPago" button that calls `generate-reminder` (already exists) and updates the inscrito's `last_payment_link`
- Show "Link expirado" badge when link age > 24h

### What Does NOT Change

- Payment amounts, EuPago API integration, webhook processing
- Email template content (already has WhatsApp fallback)
- CRM table view (already has "Link expirado" filter)
- `create-payment` function (user-initiated, separate flow)
- Idempotency logic for follow-up stages

### Expected Outcomes

- Every email sent now has an audit trail of the exact URL used (`payment_url` in `message_logs`)
- Links older than 12h are automatically regenerated before sending
- Links that return 404 are caught and regenerated before the email goes out
- CRM shows link health status with one-click regeneration
- Zero 404 errors reaching end users going forward

