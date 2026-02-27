

# Part 1: UX/UI Fixes for /comprar Group Flow + Part 2: Integration Audit

---

## PART 1 — UX/UI Changes

### Files Modified
1. `src/components/webinar/PurchaseModal.tsx` — add group toggle + inline group form
2. `src/pages/Comprar.tsx` — remove group toggle and GroupCheckoutForm import
3. `src/components/webinar/GroupCheckoutForm.tsx` — rewrite labels, start with 1 attendee, visual sections, Portuguese decimals

### FIX 1 — Move group toggle into PurchaseModal

**Remove from `Comprar.tsx`:**
- Delete `groupMode` state
- Delete group toggle UI block (lines 282-309)
- Delete `GroupCheckoutForm` rendering (lines 311-314)
- Remove `GroupCheckoutForm` import
- Remove `hideButton` logic from PlanCard calls
- All cards always show their CTA button; clicking any card opens PurchaseModal

**Add to `PurchaseModal.tsx`:**
- New `groupMode` state (boolean, default false)
- Toggle rendered between form fields and trust row, only when `plan === "masterclass" || plan === "bundle"`
- When OFF: existing single-person form unchanged
- When ON: buyer fields become "Os teus dados de contacto" section, GroupCheckoutForm appears below inline (rendered inside the modal body, not as a separate page-level component)
- Import GroupCheckoutForm inside PurchaseModal
- When groupMode is ON, hide the single-person CTA button and show the group form + group CTA instead

### FIX 2 — Rewrite labels (GroupCheckoutForm)

| Current | New |
|---|---|
| "Quem paga" | "Os teus dados de contacto" |
| "Participantes na Masterclass" | "Quem vai participar?" |
| "Cada participante recebe um email de confirmacao" | "Cada pessoa recebe um email individual com todos os detalhes." |
| "Nome 1 *" / "Email 1 *" | "Nome completo" / "Email" |
| "Adicionar participante" | "+ Adicionar outra pessoa" |
| "Empresa (opcional)" | "Empresa (para fatura, opcional)" |
| "Garantir N lugares na Masterclass" | "Confirmar inscricao para N pessoas" |

**In PurchaseModal (single person):**
| Current | New |
|---|---|
| "Ir para pagamento" | "Confirmar e pagar" |

### FIX 3 — Start with 1 attendee, pre-fill from buyer

- Change initial `attendees` state from 2 rows to 1 row
- When group toggle is turned ON, copy buyer's firstName, lastName, and email from the PurchaseModal fields into attendee row 1
- Row 1 label: "Tu" (small grey badge, 10px)
- Rows 2+: "Participante [N]"
- Row 1 cannot be removed (remove button hidden for idx === 0)

### FIX 4 — Price summary with Portuguese decimals

Replace current format with:
```
"2 pessoas · Masterclass Video com IA"
"€57,81 por pessoa · IVA incluido"
───────────────────
"Total: €115,62"
```

For 3+ people with discount:
```
"3 pessoas · Masterclass Video com IA"
"€57,81 por pessoa · desconto grupo (-10%)"
───────────────────
"Total: €156,09"
```

Use `.toFixed(2).replace(".", ",")` for Portuguese decimal format.
Remove "IVA (23%) incluido" standalone line.

### FIX 5 — Visual sections in GroupCheckoutForm

- Buyer section: wrap in card with `background: #fafafa`, `border: 1px solid #f3f4f6`, `border-radius: 10px`, `padding: 16px`
- Attendees section: same card style, `margin-top: 12px`
- Summary section: `background: #f5f3ff`, `border-radius: 10px`, `padding: 14px 16px`, `margin-top: 12px`
- CTA button in modal: add `position: sticky`, `bottom: 0`, `z-index: 10` on mobile

### GroupCheckoutForm receives buyer data as props

Since the group form now lives inside PurchaseModal, GroupCheckoutForm needs to receive the buyer's name/email from the modal's state. Add props:
```typescript
interface GroupCheckoutFormProps {
  buyerFirstName: string;
  buyerLastName: string;
  buyerEmail: string;
}
```

The component uses these to pre-fill buyer fields (read-only or synced) and pre-fill attendee row 1. The buyer section inside GroupCheckoutForm becomes hidden (since the modal already shows buyer fields above), and the GroupCheckoutForm only shows:
1. Attendees list (with row 1 pre-filled from buyer)
2. Company field (optional)
3. Price summary
4. CTA button

---

## PART 2 — Integration Audit Results

### AUDIT A — Single person flow (/comprar -> Masterclass)

**Status: ✅ COMPLETE**

1. User fills firstName, lastName, email in PurchaseModal
2. Clicks "Confirmar e pagar"
3. `register-free` is called first (creates/updates registration row with webinar="video")
4. Data sent to register-free: `{ firstName, lastName, email, webinar: "video" }`
5. Data sent to create-payment: `{ plan: "masterclass", email, nome: "FirstName LastName" }`
6. EuPago identifier: `ORDER-{order_id}-{nome}` (e.g. `ORDER-c9b10cfd5df6-Joao Silva`)
7. User lands on EuPago checkout page, then redirected to `/upgrade/sucesso?rid={id}&t={token}` on success
8. eupago-webhook: Strategy 2 matches by order_id (12-char hex extracted from identifier), sets `paid_at`, `eupago_ref`, `eupago_transaction_id`
9. Emails sent:
   - `video_payment_masterclass` to the customer (confirmation with calendar link)
   - `invoice_notification` (or `invoice_notification_missing_details`) to info@fredericocarvalho.pt
10. **Yes** — fredericodigital@gmail.com receives notification via info@fredericocarvalho.pt (invoice notification email)
11. **Yes** — registration is visible in /crm (webinar="video", has paid_at set)

**Finding:** Flow is complete and robust. No gaps.

### AUDIT B — Group flow (3 people)

**Status: ✅ COMPLETE**

1. Buyer fills data + 3 attendees
2. Clicks CTA -> calls `create-group-payment`
3. `create-group-payment` is called (not register-free + create-payment)
4. **3 rows** created in registrations (one per attendee), all with `group_payment_ref = shared UUID`, `plan_selected = "masterclass-group-pending"`, `webinar = "video"`
5. `plan_selected` per attendee: `"masterclass-group-pending"` (pre-payment)
6. EuPago identifier: `GROUP-{first-12-chars-of-UUID}` (e.g. `GROUP-a1b2c3d4e5f6`)
7. After payment: eupago-webhook Strategy GROUP matches, updates ALL registrations with matching `group_payment_ref` to `plan_selected = "masterclass"`, sets `paid_at`
8. Emails sent: **3 individual** `video_payment_masterclass` emails (one per attendee) + **1 summary** `video_group_payment_summary` to buyer
9. **See Gap below**
10. **Yes** — all 3 visible in /crm Pipeline (webinar="video", paid_at set)
11. They appear in Automacoes stats based on email_send_logs entries

**Gap found:**

- **Invoice notification**: The invoice notification email (to info@fredericocarvalho.pt) runs in the post-match processing block (line 428+). For GROUP strategy, `matched = true` and `matchedRegId` is set to the first attendee's ID. So the invoice notification **IS sent** for the first attendee. However, it only sends ONE notification for the entire group (which is correct behaviour — one payment = one invoice).

- **E-Goi tags**: The E-Goi tag attachment (line 367+) only runs for `matchedRegId` (first attendee). The other 2 attendees do NOT get E-Goi tags attached. This is a **minor gap** — not critical but means group attendees 2+ won't have purchase tags in E-Goi.

**Status revised: ⚠️ PARTIAL** (E-Goi tags not applied to all group attendees — non-critical)

### AUDIT C — CRM visibility

**Status: ✅ COMPLETE**

1. Pipeline: Yes — `plan_selected` changes from "masterclass-group-pending" to "masterclass", `paid_at` is set, `webinar = "video"`
2. Tabela: Yes — same data, visible in table view
3. Automacoes Pessoas: Yes — appears based on `email_send_logs` + `message_logs` entries
4. `email_send_logs`: Yes — each attendee's `video_payment_masterclass` email is logged to both `message_logs` AND `email_send_logs`
5. Webinar field: Yes — correctly set to `"video"` in both single and group flows

### AUDIT D — Frederico notification

**Status: ✅ COMPLETE (with caveat)**

a) **Single person via /comprar**: Yes — `invoice_notification` or `invoice_notification_missing_details` sent to info@fredericocarvalho.pt. Runs in post-match block (line 428-521).

b) **Group via /comprar**: Yes — same post-match block runs using `matchedRegId` (first attendee). Sends one invoice notification email covering the group payment.

**Template keys used:**
- `invoice_notification` (when invoice_details exist)
- `invoice_notification_missing_details` (when no billing data)

**Caveat for group flow:** The invoice notification email shows the FIRST attendee's registration data (name, email, plan). It does NOT mention the total group amount or number of attendees. The subject line will show the per-person price from `totalMap["masterclass"] = "57,81"` rather than the actual group total. This is **functionally correct but the displayed amount is misleading** for group payments.

---

## Summary of Gaps Found

| Gap | Severity | Fix Needed? |
|---|---|---|
| E-Goi tags not applied to group attendees 2+ | Minor | No immediate fix (enhancement) |
| Invoice notification shows per-person price instead of group total | Minor | No code change in this PR (cosmetic, non-critical) |

**No critical gaps found.** No risk of:
- Payment without registration ✅
- Registration without confirmation email ✅
- No CRM visibility ✅
- No Frederico notification ✅

---

## Technical Summary of Code Changes

### `src/pages/Comprar.tsx`
- Remove: `groupMode` state, group toggle block, GroupCheckoutForm import and rendering, `hideButton` prop usage
- Simplify: all PlanCard CTAs always visible, clicking opens PurchaseModal

### `src/components/webinar/PurchaseModal.tsx`
- Add: `groupMode` state, toggle UI between fields and CTA (only for masterclass/bundle)
- Add: import and render GroupCheckoutForm when groupMode is ON
- Pass buyer data (firstName, lastName, email) as props to GroupCheckoutForm
- Change CTA text: "Ir para pagamento" -> "Confirmar e pagar"
- When groupMode ON: hide single-person CTA, show group form instead

### `src/components/webinar/GroupCheckoutForm.tsx`
- Accept new props: `buyerFirstName`, `buyerLastName`, `buyerEmail`
- Remove buyer section (handled by parent modal)
- Start with 1 attendee row pre-filled from buyer props
- Row 1 label: "Tu" badge; rows 2+: "Participante N"
- Row 1 not removable
- All label rewrites per FIX 2
- Portuguese decimal format (comma separator)
- Visual card sections per FIX 5
- Sticky CTA on mobile

