

# UX/UI Improvements for /upgrade-video — Video Differentiation

## Summary

Apply visual and text changes to clearly differentiate the Video webinar upgrade flow from the Imagens webinar. Changes span 3 files with no logic, pricing, or data modifications.

---

## Files to modify

| File | Changes |
|---|---|
| `src/pages/UpgradeVideo.tsx` | Sidebar identity, product line, context note, progress bar labels |
| `src/components/upgrade/StepVideoPremium.tsx` | Header text, eyebrow badges, date box, CTA text, skip note |
| `src/components/upgrade/StepMasterclass.tsx` | Header/subtitle, eyebrow badges, date box, benefit wording, CTA color/text, skip note |

---

## CHANGE 1 — Sidebar (UpgradeVideo.tsx)

**Header area (lines 193-194)**:
- Replace `<p>Formacao em IA</p>` with a green webinar badge: "🎬 Video com IA" pill (green background, rounded, 11px bold)

**Product line — free state (lines 218-226)**:
- Change "Webinar Gratuito" to "Webinar Video com IA"
- Add date line below: "📅 5 de Marco . 10h00" in 12px, color #888

**Context note below product line (after line 226)**:
- Add thin divider + context paragraph: "Este e um webinar diferente — focado em video curto para marketing, nao em imagens estaticas."
- Always shown (since URL param detection is unreliable for all cases)

**Progress bar labels (line 262)**:
- "Gravacao (opcional)" becomes "Gravacao Video (opcional)"
- "Masterclass (opcional)" becomes "Masterclass Video (opcional)"

---

## CHANGE 2 — StepVideoPremium.tsx

**Step header (line 34-35)**:
- Title: "Gravacao do Webinar Video (opcional)" (was "Adicionar Gravacao da Sessao")
- Subtitle: unchanged

**Card header (line 52-53)**:
- Replace single "GRAVACAO + PACK" text with 2 inline eyebrow badges:
  - "🎬 WEBINAR VIDEO COM IA" (green border/text)
  - "GRAVACAO + PACK" (light green bg)

**Date box (insert between divider at line 64 and benefits at line 66)**:
- Green-themed date card: "Sessao Q&A em grupo / Terca-feira, 10 de Marco . 14h30-15h00"

**CTA text (line 85)**:
- "Garantir Gravacao do Video + Pack ->"

**Skip note (after line 105)**:
- Add: "A inscricao gratuita no Webinar Video fica confirmada de qualquer forma." (11px, #aaa, centered)

---

## CHANGE 3 — StepMasterclass.tsx

**Step header (lines 37-41)**:
- Title: "Masterclass Video com IA — sistema completo ao vivo"
- Subtitle: "O webinar cobre o essencial. A Masterclass aprofunda o sistema completo — 3 horas ao vivo com casos reais, fluxos replicaveis e ferramentas testadas."

**Card eyebrow (lines 50-52)**:
- Replace single "IMAGEM -> VIDEO" tag with 2 inline badges:
  - "🎬 MASTERCLASS VIDEO COM IA" (purple border/text)
  - "SESSAO AVANCADA" (light purple bg)

**Date box (insert between divider at line 69 and benefits at line 71)**:
- Purple-themed date card: "Sessao ao vivo . 3 horas / Quinta-feira, 12 de Marco . 10h00-13h00 . Online"

**Benefits wording (lines 13-29)**:
- Bullet 1 title: "Sistema completo de producao de video curto" (was "Imagem -> video: do estatico ao clip")
- Bullet 2: unchanged
- Bullet 3: unchanged
- Bullet 4 title: "Gravacao da Masterclass incluida — reve quando precisares" (was "Acesso a sessao incluido")

**CTA button (lines 93-101)**:
- Color: change from black (`ink-900`) to purple `#7c3aed` (hover: `#6d28d9`)
- Text: "Garantir lugar na Masterclass Video ->"

**Confirmation dialog button (line 134)**:
- Background: `#7c3aed` instead of `ink-900`

**Skip note (after line 120)**:
- Add same note as Premium step: "A inscricao gratuita no Webinar Video fica confirmada de qualquer forma."

---

## What does NOT change

- Step count, navigation, or progress bar logic
- Pricing (EUR15, EUR47, EUR27, EUR97)
- Early bird badges
- Data persistence / Supabase calls
- Step 1 (qualification) or Step 4 (confirmation)
- Any other page or component

