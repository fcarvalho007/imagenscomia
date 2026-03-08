

# Masterclass Vídeo — Secção CRM + Templates

## O que vamos fazer

1. **Nova sub-tab "Masterclass"** no fluxo de Automações (ao lado de "Pré-Webinar" e "Pós-Evento"), com emoji 📽 e cor verde
2. **4 nodes visuais** no fluxo: Thankyou (imediato), Day 1 email, Day 1 SMS, Day 3 email
3. **Template keys e labels** registados para matching e display

## Alterações por ficheiro

### `src/components/crm/AutomationFlowTab.tsx`

- Add 3 new `DAY_GROUP_CONFIG` entries: `mc_thankyou` (green), `mc_d1` (amber), `mc_d3` (red)
- Create `getMasterclassNodes(): NodeDef[]` with 4 nodes:
  - Step 1: `video_masterclass_thankyou` — imediato, dia 12, segmento masterclass+bundle, requirePaid
  - Step 2: `video_masterclass_day1` — 13 Mar 10h, segmento masterclass+bundle, requirePaid
  - Step 3: SMS `sms_masterclass_day1` — 13 Mar 11h, manual, requirePaid+requirePhone, texto: "Ola! A gravacao da Masterclass e os materiais estao disponiveis em imagenscomia.com/recursos-video — usa o email de registo. Deixa a tua avaliacao Google aqui: [link]. Ate ja! — Frederico"
  - Step 4: `video_masterclass_day3` — 15 Mar 10h, segmento masterclass+bundle, requirePaid
- Expand `SubTabPills` to include a third tab `"mc"` with label "Masterclass" and emoji 📽, purple background when active
- Update `flowSubTab` state type from `"pre" | "post"` to `"pre" | "post" | "mc"`
- In `Timeline`, when `flowSubTab === "mc"`, use `getMasterclassNodes()` and filter inscritos to masterclass+bundle paid

### `src/components/crm/FollowUpView.tsx`

- Add 3 new template keys to `TEMPLATE_KEYS`: `video_masterclass_thankyou`, `video_masterclass_day1`, `video_masterclass_day3`

### `src/components/crm/templateLabels.ts`

- Add 4 labels:
  - `video_masterclass_thankyou`: "Pós-Masterclass — Obrigado"
  - `video_masterclass_day1`: "Masterclass Day 1 — Recursos + Avaliação"
  - `sms_masterclass_day1`: "SMS Masterclass Day 1 — Lembrete avaliação"
  - `video_masterclass_day3`: "Masterclass Day 3 — Fecho + próximos passos"

## Lógica de elegibilidade

Todos os nodes filtram por `planFilter: ["masterclass", "bundle"]` com `requirePaid: true`. O SMS adiciona `requirePhone: true`. Reutiliza a função `computeEligible` existente sem alterações.

