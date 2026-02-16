

## Upgrade Page — Confirmation Banner + Free Card + Copy Refinement

### Overview

Make it crystal clear that the free webinar spot is already secured, and upgrades are optional. Add a sticky confirmation banner, a read-only "what's included free" card before upsell steps, refine all skip/CTA copy, and add a sticky mobile footer for "Continuar gratis".

### Files Changed

| File | Action | Scope |
|------|--------|-------|
| `src/pages/Upsell.tsx` | Edit | Add confirmation banner (sticky mobile), "included free" card before steps 3-4, sticky mobile footer with "Continuar gratis", update progress label |
| `src/components/upgrade/StepPremium.tsx` | Edit | Remove "inscricao confirmada" heading (now in banner), update skip button copy, add "Recomendado para..." microcopy |
| `src/components/upgrade/StepMasterclass.tsx` | Edit | Update skip button copy |
| `src/components/upgrade/SummaryPanel.tsx` | Edit | Update MobileSummaryBar to show confirmation status |

### Detailed Changes

**1. Upsell.tsx — Confirmation Banner + Free Card + Sticky Footer**

A) Add a confirmation banner that appears on steps 3-5 (after qualification/personalization). Sticky on mobile, static on desktop:

```text
Background: green-50, border green-200, rounded
Icon: checkmark circle (green)
Title: "Vaga garantida no Webinar Gratuito"
Line: "18 Fev . 10h00 . 60 min . Online ao vivo"
Microcopy: "Esta pagina e opcional: serve apenas para adicionar extras."
```

Placed above the progress bar on steps 3+. On mobile, sticky below the MobileSummaryBar (z-40).

B) On steps 3 and 4 (upsell steps), insert a compact "Incluido na inscricao gratuita" read-only card above the upgrade card:

```text
Background: surface/gray-50, border dashed, rounded
Title: "Incluido na inscricao gratuita (EUR0)"
3 bullets (compact, single line each):
- "Webinar ao vivo (60 min)"
- "Demonstracoes ao vivo"
- "Resumo PDF da sessao"
Note: "Nota: a gravacao esta disponivel apenas no Premium Pass."
```

This card is purely informational (no buttons), visually "locked" with muted styling.

C) Update progress bar label from "Passo X de 5" to "Passo X/5 -- Melhorias opcionais" on steps 3-4.

D) Add sticky mobile footer on steps 3-4 with "Continuar com inscricao gratuita" button (secondary style, full-width). When user has selected an upgrade, this changes to show the upgrade CTA as primary + "Continuar gratis" as a text link below.

**2. StepPremium.tsx — Copy Updates**

- Remove heading "Frederico, a tua inscricao gratuita esta confirmada." (redundant with banner)
- New heading: "Adicionar Premium Pass (opcional)"
- New subtitle: "Para aplicar o metodo com mais tranquilidade, ao teu ritmo."
- Skip button: "Continuar com inscricao gratuita" (instead of "Continuar sem gravacao, Q&A nem guia")
- Add microcopy below skip: "A vaga no webinar ja esta garantida."
- Add small line below CTA: "Recomendado para quem quer rever e aplicar sem pressa."

**3. StepMasterclass.tsx — Copy Updates**

- Skip button: "Continuar com inscricao gratuita" (instead of "Continuar sem implementacao guiada")
- Add microcopy below skip: "A vaga no webinar ja esta garantida."

**4. SummaryPanel.tsx — MobileSummaryBar Update**

- When on steps 3-5 and total is 0, show "Inscricao gratuita confirmada" instead of just "EUR0"

### What Does NOT Change

- Payment logic, EuPago integration, idempotency
- Step navigation order (1-5)
- Plan selection logic
- StepConfirmation (already handles free vs paid well)
- StepQualification, StepPersonalization (steps 1-2 stay as-is)
- Desktop SummaryPanel layout (already shows "Webinar Gratuito EUR0")

### Key UX Outcomes

- In 3 seconds on mobile: green banner confirms free spot, "opcional" label is visible, skip button says "Continuar com inscricao gratuita"
- No guilt-trip copy: skip buttons are neutral and reassuring
- Free card provides visual anchor showing what's already secured before any upsell
- Sticky footer on mobile ensures "continue free" is always reachable without scrolling

