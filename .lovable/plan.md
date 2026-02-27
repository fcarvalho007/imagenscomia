

# Group Registration for /comprar (Masterclass)

## Overview

Add a "group mode" toggle to the `/comprar` page that lets a buyer register and pay for multiple Masterclass attendees in a single EuPago transaction. The single-person flow remains untouched.

## Changes

### 1. Database Migration

Add `group_payment_ref` column to `registrations`:

```sql
ALTER TABLE registrations 
  ADD COLUMN IF NOT EXISTS group_payment_ref uuid DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_group_payment_ref 
  ON registrations(group_payment_ref) 
  WHERE group_payment_ref IS NOT NULL;
```

### 2. New Component: `src/components/webinar/GroupCheckoutForm.tsx`

A self-contained form component rendered inline on the `/comprar` page when group mode is ON and plan is masterclass. Contains:

- **Buyer section**: name (first + last), email, company (optional)
- **Attendees list**: dynamic rows (name + email per row), starts with 2 rows, min 1, max 10, add/remove buttons
- **Price summary**: live-calculated total. Base price per person: 57.81 EUR. 10% discount for 3+ attendees. Shows original price struck through when discounted.
- **CTA button**: "Garantir [N] lugares na Masterclass" -- updates dynamically
- **Submit handler**: calls `create-group-payment` edge function, then redirects to EuPago

### 3. Update `src/pages/Comprar.tsx`

- Add `groupMode` state (boolean, default false)
- Show toggle "Inscrever varias pessoas?" below benefits list, only when plan is masterclass
- When `groupMode` is ON, hide PurchaseModal CTA and render `GroupCheckoutForm` inline instead
- When OFF, existing PurchaseModal flow is unchanged
- Toggle styled as a pill/switch with purple accent when active

### 4. New Edge Function: `supabase/functions/create-group-payment/index.ts`

Accepts:
```typescript
{
  buyer: { firstName: string, lastName: string, email: string, company?: string },
  attendees: Array<{ firstName: string, lastName: string, email: string }>,
  plan: "masterclass",
  webinar: "video",
  discountApplied: boolean
}
```

Logic:
1. Generate a `group_payment_ref` UUID for this batch
2. For each attendee, call the same registration logic as `register-free` (insert into `registrations` with `webinar: "video"`, `plan_selected: "masterclass-group-pending"`, `group_payment_ref`)
3. Calculate total: `attendees.length * 57.81`, apply 10% discount if 3+
4. Create single EuPago PayByLink with:
   - `identifier: "GROUP-{group_payment_ref}"` (12-char prefix for order_id extraction in webhook)
   - `successUrl: /confirmacao?plan=masterclass&group=true`
   - `callbackUrl: eupago-webhook`
   - `value: calculated total`
   - `description: "Masterclass Video com IA -- [N] lugares"`
5. Store `eupago_ref` and `last_payment_link` on the buyer's registration row
6. Return `{ paymentLink, groupPaymentRef, attendeeCount }`

### 5. Update `supabase/functions/eupago-webhook/index.ts`

Add a new strategy before the existing Strategy 2, specifically for group payments:

```
if identifier starts with "GROUP-":
  1. Extract group_payment_ref from identifier
  2. UPDATE all registrations WHERE group_payment_ref = ref AND webinar = 'video'
     SET plan_selected = 'masterclass', paid_at = NOW(), eupago_ref = transactionID
  3. For each updated row, send video_payment_masterclass email (idempotent)
  4. Send one summary email to buyer (identified as the registration with company field or first in group)
     using template_key: "video_group_payment_summary"
  5. Set matched = true
```

### 6. Update `supabase/config.toml`

Add:
```toml
[functions.create-group-payment]
verify_jwt = false
```

### 7. Update `src/components/crm/templateLabels.ts`

Add entry:
```typescript
video_group_payment_summary: "Confirmacao grupo -- resumo para comprador"
```

### 8. Update `src/components/crm/PipelineView.tsx`

On each registration card, if `group_payment_ref` is not null, show a small grey badge "GRUPO" (9px, uppercase).

---

## Technical Details

### Price Calculation
- Base: 57.81 EUR per person (47 EUR + 23% IVA)
- Discount: 10% off total for 3+ attendees
- Formula: `N * 57.81 * (N >= 3 ? 0.90 : 1.00)`

### EuPago Identifier Format
- `GROUP-{first-12-chars-of-group_payment_ref}`
- The webhook extracts this via `identifier.startsWith("GROUP-")`
- The full `group_payment_ref` is stored on all attendee rows for reliable matching

### Webhook Matching
- The webhook uses `group_payment_ref` column (not order_id) to find all attendees
- The identifier contains the first 12 chars of the UUID for traceability
- All attendees are updated atomically

### Registration Flow
- Each attendee gets their own `registrations` row with unique `referral_code`, `edit_token`, `order_id`
- `plan_selected` starts as `"masterclass-group-pending"` (pre-payment)
- After payment: updated to `"masterclass"`
- `group_payment_ref` links them all together

### Files Modified
1. `src/pages/Comprar.tsx` -- add group toggle + conditional rendering
2. `src/components/crm/templateLabels.ts` -- add 1 entry
3. `src/components/crm/PipelineView.tsx` -- add GRUPO badge
4. `supabase/functions/eupago-webhook/index.ts` -- add GROUP strategy
5. `supabase/config.toml` -- add function entry

### Files Created
1. `src/components/webinar/GroupCheckoutForm.tsx` -- new component
2. `supabase/functions/create-group-payment/index.ts` -- new edge function

### Not Modified
- `PurchaseModal.tsx` -- untouched
- `/upgrade-video` flow -- untouched
- `register-free` -- not modified (group function inlines the registration logic)
- Any other existing page or component

