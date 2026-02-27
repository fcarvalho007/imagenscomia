

# Create /comprar Direct Checkout Page

Single new file + one route addition. No modifications to any existing component.

---

## File 1: `src/pages/Comprar.tsx` (NEW)

A lightweight standalone checkout page that:

1. **Reads URL params**: `?plan=masterclass|gravacao`, optional `?name=` and `?email=`
2. **Shows plan card(s)**: Single card if plan param present, both cards side-by-side if not
3. **Opens PurchaseModal on CTA click**: Passes `webinar="video"` hardcoded

### Structure

```text
+----------------------------------------------+
|   "Webinar Video com IA · 5 de Marco" badge  |
+----------------------------------------------+
|                                               |
|  +------------------+  +------------------+  |
|  | Masterclass      |  | Gravacao + Pack  |  |
|  | €47 + IVA        |  | €15              |  |
|  | [early bird]     |  |                  |  |
|  | * benefit 1      |  | * benefit 1      |  |
|  | * benefit 2      |  | * benefit 2      |  |
|  | * benefit 3      |  | * benefit 3      |  |
|  | * benefit 4      |  |                  |  |
|  | [date box]       |  |                  |  |
|  | [CTA purple]     |  | [CTA blue]       |  |
|  +------------------+  +------------------+  |
|                                               |
|  "Inscricao gratuita confirmada..." (11px)    |
|  "Pagamento seguro via EuPago..." (11px)      |
+----------------------------------------------+
```

When `?plan=masterclass` is in the URL, only the Masterclass card shows and the PurchaseModal auto-opens.

### Key details
- Background: `#f9fafb`, max-width 480px centered
- PlanCard component (local, not exported) renders each plan with title, price, early bird badge (amber, masterclass only), benefits with green checkmarks, date box, and colored CTA button
- Masterclass CTA: purple `#7c3aed`, Gravacao CTA: blue `#1e40af`
- PurchaseModal rendered with `open={modalOpen}`, `plan` set to selected plan, `webinar="video"`, `planLabel` includes price
- Cards stack vertically on mobile (`flex-col sm:flex-row`)

### Note on pre-fill limitation
PurchaseModal uses internal `useState` for name/email fields and does not accept pre-fill props. The `?name=` and `?email=` URL params will be read but cannot be passed into the modal without modifying it (which is explicitly forbidden). These params are parsed but won't pre-fill -- this is a known limitation that can be addressed later if needed.

---

## File 2: `src/App.tsx` (EDIT)

Add import and route:

```typescript
import Comprar from "./pages/Comprar";
// ...
<Route path="/comprar" element={<Comprar />} />
```

Placed alongside the other webinar routes.

---

## No other changes

- PurchaseModal.tsx: untouched
- /upgrade-video: untouched
- Edge functions: untouched
- CRM components: untouched

