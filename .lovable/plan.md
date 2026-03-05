

# Design consistency /recursos-video vs /recursos + WhatsApp global

## 1. Design comparison: /recursos vs /recursos-video

After reviewing both components, they are **already structurally identical** — same layout (header, 2-col grid, sidebar, footer logout), same card styles, same section hierarchy. The only differences are intentional branding:

- `/recursos`: blue accent (bg blue-600, blue-50 highlights)
- `/recursos-video`: green accent (bg green-600, green-50 highlights, greenish gradient background)

This is consistent and correct — no design discrepancies to fix.

## 2. WhatsApp button missing from several pages

Currently missing `<WhatsAppSupportButton />` on:
- `src/pages/Recursos.tsx`
- `src/pages/RecursosVideo.tsx`
- `src/pages/Confirmacao.tsx`
- `src/pages/Fatura.tsx`
- `src/pages/Pagar.tsx`
- `src/pages/Termos.tsx`
- `src/pages/UpgradeSucesso.tsx`
- `src/pages/NotFound.tsx`

(CRM excluded — admin page)

### Implementation
Add `import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton"` and render `<WhatsAppSupportButton />` at the end of each page's JSX return. For `Recursos.tsx` and `RecursosVideo.tsx`, add it in the page-level component (not inside the login/content sub-components) so it shows in all states.

### Files to edit (8 files)
- `src/pages/Recursos.tsx`
- `src/pages/RecursosVideo.tsx`
- `src/pages/Confirmacao.tsx`
- `src/pages/Fatura.tsx`
- `src/pages/Pagar.tsx`
- `src/pages/Termos.tsx`
- `src/pages/UpgradeSucesso.tsx`
- `src/pages/NotFound.tsx`

