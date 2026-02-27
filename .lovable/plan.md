

# Checkout Modal Fixes — PurchaseModal + GroupCheckoutForm

Three files changed. No page cards, copy, payment logic, or other pages touched.

---

## FIX 1 — Modal width + scroll + close button

**File: `src/components/webinar/PurchaseModal.tsx`** (line 118)

Change DialogContent class from:
```
sm:max-w-[400px] p-0 overflow-hidden gap-0 border-0 max-h-[90vh] overflow-y-auto
```
To:
```
w-[95vw] mx-auto sm:max-w-2xl p-0 gap-0 border-0 max-h-[90vh] overflow-y-auto
```

The close button (X) already exists in the dark header (line 134-138). No change needed there.

---

## FIX 2 — Group toggle on ALL plans (including Gravacao)

**File: `src/components/webinar/PurchaseModal.tsx`** (line 54)

Change:
```typescript
const showGroupToggle = plan === "masterclass" || plan === "bundle";
```
To:
```typescript
const showGroupToggle = plan === "masterclass" || plan === "bundle" || plan === "gravacao";
```

**File: `src/components/webinar/PurchaseModal.tsx`** — pass `plan` prop to GroupCheckoutForm (line 221-224):
```tsx
<GroupCheckoutForm
  buyerFirstName={firstName}
  buyerLastName={lastName}
  buyerEmail={email}
  plan={plan}
/>
```

**File: `src/components/webinar/GroupCheckoutForm.tsx`** — accept `plan` prop and use plan-aware pricing/labels:

Add `plan` to interface:
```typescript
interface GroupCheckoutFormProps {
  buyerFirstName: string;
  buyerLastName: string;
  buyerEmail: string;
  plan?: "masterclass" | "bundle" | "gravacao" | "premium";
}
```

Replace hardcoded `PRICE_PER_PERSON = 57.81` with a plan-based lookup:
```typescript
const PRICES: Record<string, number> = {
  masterclass: 57.81,
  bundle: 76.26,
  gravacao: 15.00,
};
const PLAN_LABELS: Record<string, string> = {
  masterclass: "Masterclass Video com IA",
  bundle: "Masterclass + Gravacao",
  gravacao: "Gravacao HD + Pack de Apoio",
};
```

Use `PRICES[plan] || 57.81` as the per-person price throughout.

Update the summary line (line 218) from hardcoded "Masterclass Video com IA" to `PLAN_LABELS[plan]`.

Update the `handleSubmit` body (line 90) to pass `plan` instead of hardcoded `"masterclass"`:
```typescript
plan: plan === "bundle" ? "masterclass" : plan,
```

For gravacao, `plan_selected` in the edge function will receive `"gravacao"` -- but note the backend gap below.

---

## FIX 3 — Mobile layout (375px)

**File: `src/components/webinar/GroupCheckoutForm.tsx`**

Attendee row fields (line 151): change from `flex items-center gap-2` to `flex flex-col sm:flex-row items-stretch sm:items-center gap-2` so inputs stack vertically on mobile.

The "Adicionar outra pessoa" button (line 185) is already `w-full`. No change needed.

The sticky CTA wrapper (line 241) already has `sticky bottom-0 z-10 bg-white pt-1 pb-[env(safe-area-inset-bottom)]`. No change needed.

The toggle label (PurchaseModal line 212): add `flex-wrap` to the parent button class so the label wraps gracefully on 375px.

---

## Backend Gap (informational -- no code change)

The `create-group-payment` edge function is hardcoded for masterclass pricing (EUR 57.81/person). When gravacao groups are submitted, the edge function will charge 57.81/person instead of 15.00/person. This is a **critical gap** that requires an edge function update to support `gravacao` group payments with the correct pricing.

**Recommendation:** Before enabling gravacao group purchases in production, update `create-group-payment` to accept a `plan` parameter and use plan-specific pricing. Until then, the UI will show the correct gravacao price but the actual charge would be incorrect.

**Options:**
1. Ship the UI now with a note that gravacao group mode needs backend work (toggle visible but backend charges wrong price)
2. Keep the toggle restricted to masterclass/bundle only until the backend is updated

I will implement the UI changes as requested but flag this clearly. The toggle will show for all plans per the request.

---

## Summary of files changed

| File | Change |
|---|---|
| `src/components/webinar/PurchaseModal.tsx` | Wider modal (max-w-2xl), group toggle for all plans, pass plan prop |
| `src/components/webinar/GroupCheckoutForm.tsx` | Plan-aware pricing/labels, mobile-stacked attendee rows, flex-wrap toggle |

