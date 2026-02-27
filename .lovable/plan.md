
# Group Email Improvements in eupago-webhook

## What Changes

Only one file is modified: `supabase/functions/eupago-webhook/index.ts` (Strategy GROUP block, lines 147-244).

Additionally, a new row is inserted into the `email_templates` table for `video_group_confirmation_payer`.

---

## Current Behavior (lines 147-244)

1. **Every** attendee (including the buyer) receives `video_payment_masterclass` email
2. The buyer (first row in group) receives a `video_group_payment_summary` email with an attendee list
3. Result: the buyer gets **2 emails** (individual + summary)

## New Behavior

1. The **buyer** receives ONE email (`video_group_confirmation_payer`) with:
   - Subject: "A tua inscricao esta confirmada"
   - Body: list of all participants (name + email), plan name, total paid
   - Note: "Cada participante recebeu o seu proprio email de confirmacao."
2. Each **other participant** (email differs from buyer) receives their individual `video_payment_masterclass` email (unchanged)
3. If buyer's email matches a participant, they get ONLY the summary -- the individual email is skipped for them

---

## Code Changes in eupago-webhook

### 1. Identify the buyer email

After `updatedGroupRows` is fetched (line 138), determine the buyer email. The buyer is the first registration in the group (line 216 already assumes this). We keep this convention.

```typescript
const buyerAttendee = updatedGroupRows[0];
const buyerEmail = buyerAttendee?.email;
```

### 2. Skip buyer in the individual email loop

In the `for (const attendee of updatedGroupRows)` loop (line 150), add a condition:

```typescript
// Skip buyer -- they get the summary email instead
if (attendee.email === buyerEmail) continue;
```

This means the buyer no longer receives the individual `video_payment_masterclass` email.

### 3. Enhance the buyer summary email

Replace the current summary block (lines 215-243) with an improved version:

- Load template from `email_templates` with key `video_group_confirmation_payer` (fallback to hardcoded)
- Compute total: `count * 57.81 * (count >= 3 ? 0.9 : 1.0)` (matching create-group-payment pricing)
- Build attendee list HTML with name + email
- Include plan label, total paid (Portuguese decimals), and the note about individual emails
- Subject: `A tua inscricao esta confirmada` (with checkmark)
- Template key for logging: `video_group_confirmation_payer`

### 4. Idempotency

The existing idempotency checks remain:
- Individual emails: check `message_logs` for `video_payment_masterclass` per attendee
- Buyer summary: check `message_logs` for `video_group_confirmation_payer` per buyer registration

---

## Database: Insert email template row

Insert a new row into `email_templates`:

| Field | Value |
|---|---|
| template_key | `video_group_confirmation_payer` |
| name | Confirmacao Grupo (Pagador) |
| subject | `A tua inscricao esta confirmada` |
| html_body | Full HTML with `{{fname}}`, `{{attendee_list}}`, `{{plan_label}}`, `{{total}}` placeholders |
| channel | email |
| is_active | true |
| variables | `["fname", "attendee_list", "plan_label", "total"]` |

The edge function will replace these variables at send time. If the template is missing or html_body is NULL, the hardcoded fallback is used.

---

## Hardcoded Fallback HTML for buyer summary

```html
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#1e293b;line-height:1.6">
  <h2>A tua inscricao esta confirmada</h2>
  <p>Ola {{fname}},</p>
  <p>O pagamento do grupo foi confirmado com sucesso.</p>
  <h3>Resumo</h3>
  <p><strong>Plano:</strong> {{plan_label}}</p>
  <p><strong>Total pago:</strong> EUR{{total}}</p>
  <h3>Participantes confirmados</h3>
  <ul>{{attendee_list}}</ul>
  <p style="font-size:13px;color:#64748b">Cada participante recebeu o seu proprio email de confirmacao.</p>
  <hr/>
  <p>Suporte: WhatsApp +351 915 015 508</p>
  <p>Frederico Carvalho</p>
</div>
```

---

## Files changed

| File | Change |
|---|---|
| `supabase/functions/eupago-webhook/index.ts` | Skip buyer in individual loop; enhance summary email with plan/total/template |
| `email_templates` table (data insert) | New row for `video_group_confirmation_payer` |

No other files or edge functions are modified.
