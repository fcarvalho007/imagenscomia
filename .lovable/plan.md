

# /comprar Page Redesign + Bundle Card

Visual and UX refinement of the `/comprar` page. No changes to edge functions, payment logic, or registration flow.

## Changes Summary

### File 1: `src/pages/Comprar.tsx` (REWRITE)

**Plan type expanded** from `"masterclass" | "gravacao"` to `"masterclass" | "bundle" | "gravacao"`.

**PLANS config** gets a new `bundle` entry (center position) with:
- Title: "Masterclass + Gravacao"
- Price display: "€57 + IVA" with "€62" struck through + "Poupa €5" green pill
- Combined benefits from both plans (6 items)
- Date box (same as masterclass)
- CTA: "Garantir Bundle completo" (purple #7c3aed)
- `featured: true` flag for styling differentiation

**PlanCard component** redesigned:
- Cards: white bg, 16px radius, 28px/24px padding, subtle shadow, hover shadow transition
- Featured card (bundle): 2px purple border, `scale(1.03)`, "MAIS POPULAR" badge hanging from top
- Price: 32px bold, "+IVA" suffix 14px grey
- Benefits: colored circle checkmarks (purple for masterclass/bundle, blue for gravacao), 13px text
- Date box: purple-tinted bg (#f5f3ff), purple text
- CTA: 48px height, 10px radius

**Page layout changes:**
- Header badge: white card with shadow + border, 12px text
- Trust line below header: "Acesso garantido em segundos apos confirmacao de pagamento"
- Max-width widened to ~900px for 3-card desktop layout
- Mobile: cards stacked, Bundle rendered first
- Footer: separator line, lock icon + payment methods on two lines

**Card ordering:**
- Desktop (no URL param): Masterclass | Bundle (featured) | Gravacao
- Mobile (no URL param): Bundle first, then Masterclass, then Gravacao
- URL param `?plan=bundle`: shows only Bundle card, auto-opens modal

**Group toggle:** shown for masterclass AND bundle (both are masterclass-based products). When active on bundle, renders GroupCheckoutForm.

**PurchaseModal** receives `plan="bundle"` for the bundle option. The existing `create-payment` edge function already has a `bundle` key in its PRODUCTS map.

### File 2: `src/components/webinar/PurchaseModal.tsx` (VISUAL ONLY)

No logic changes. Only visual presentation updates:

**PurchaseModal type** already accepts `"premium" | "masterclass" | "gravacao"` -- expand to also accept `"bundle"`.

**Modal structure:**
- Dark header section (#1e1b4b): plan name (white, 16px semibold) + price (#a5b4fc, 14px), close button repositioned to white
- Body: white bg, 24px padding
- Form fields: stacked full-width (remove 2-col grid for names), 44px height inputs, 8px radius, purple focus ring
- Trust row: 3 micro-badges (lock + "Pagamento seguro", lightning + "Acesso imediato", envelope + "Confirmacao por email"), 10px grey
- CTA button: 52px height, 10px radius, 15px font, purple/blue based on plan, gradient for bundle
- Terms line below CTA: 10px grey
- Modal max-width: 400px
- Overlay: blur(4px)

**Field IDs, names, validation, and submit handler remain identical.**

### File 3: `src/components/ui/dialog.tsx` (MINOR)

Add backdrop blur to DialogOverlay: add `backdrop-blur-sm` class alongside existing `bg-black/80` -- change to `bg-black/50 backdrop-blur-sm` for the softer blur effect specified.

---

## Technical Notes

- Bundle plan key `"bundle"` maps to `PRODUCTS["bundle"]` in `create-payment` (value: 76.26, identifier: "WEBINAR-BUNDLE"). The display price on the page (€57 + IVA) is cosmetic -- the actual charge is determined by the edge function.
- PurchaseModal's internal `prices` dict already has `bundle: 76.26` for Facebook pixel tracking.
- Group toggle works for bundle since it's masterclass-based: toggle condition checks for `masterclass` or `bundle`.
- No edge functions modified. No database changes. No other pages touched.

## Files Changed
1. `src/pages/Comprar.tsx` -- redesigned layout, added bundle card
2. `src/components/webinar/PurchaseModal.tsx` -- visual-only modal redesign
3. `src/components/ui/dialog.tsx` -- backdrop blur on overlay

