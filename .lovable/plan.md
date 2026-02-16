

## Refinar a secção "Como participar" (PricingCardsSection)

### Overview

Update the single free-participation card to improve clarity, consistency with the landing page tone, and conversion. No logic changes — purely copy + layout refinements in one file.

### File Changed

`src/components/landing/PricingCardsSection.tsx` — single file edit.

### Changes

**A) Header area — add event anchor + refine subtitle**

- Keep: `PARTICIPACAO GRATUITA -- EUR0`
- Add line below: `AO VIVO . 18 FEV . 10H00 . 60 MIN` (small caps, tracking, muted color)
- Price block: `EUR0` large + small inline tag `vaga garantida` (green-600/10 bg, green-600 text, rounded pill)
- Replace subtitle: "Ideal para quem vai estar ao vivo" becomes "Para assistir ao vivo e aplicar o metodo no dia seguinte."

**B) Bullets — more concrete, result-oriented**

Replace current 3 bullets with:
1. "Webinar ao vivo (60 min) -- do briefing a imagem pronta"
2. "Demonstracoes ao vivo (ferramentas + exemplos reais)"
3. "Resumo PDF da sessao (checklist + passos)"

**C) CTA button — align with landing page micro-commitment**

- Change text from "Sim, assistir gratis!" to "Sim, garantir vaga gratis!"

**D) Microcopy below button — neutral tone**

- Replace "(nao inclui gravacao da sessao)" with "Nota: a gravacao esta disponivel apenas no Premium Pass."

**E) Remove "Confirmacao imediata por email"**

The `register-free` function does not send a confirmation email (only saves to DB + E-goi sync), so this line will NOT be added. No false claims.

**F) Spacing and alignment polish**

- Increase card padding from `p-8` to `p-8 sm:p-10` for more breathing room
- Ensure checkmarks align with text baseline (`mt-0.5` already present)
- Button stays full-width with comfortable height (`py-4`)

### Technical Details

Single file change: `src/components/landing/PricingCardsSection.tsx`

Update the `freeFeatures` array and the JSX inside the card. No new imports needed beyond what exists (motion, Check, ScrollReveal, useRegistrationModal).

No changes to: payment logic, registration flow, modal, other sections.

