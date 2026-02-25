

# Corrigir funil do Dashboard e Progresso no Funil por contexto de webinar

## Problema

Os dois webinars tem sequencias de passos diferentes, mas o CRM mostra sempre os labels do webinar de imagens:

| step_reached | Imagens | Video |
|---|---|---|
| 1 | Inscricao | Inscricao |
| 2 | Origem | Qualificacao (Role/Equipa) |
| 3 | Duvida | Masterclass |
| 4 | Premium | Premium/Gravacao |
| 5 | Masterclass/Conclusao | Duvida/Conclusao |

Isto afecta:
- O funil no **Dashboard** (a) — labels errados no contexto video
- O **Progresso no Funil** na ficha de cliente (b) — labels errados para inscritos video

## Componentes afectados (4 ficheiros)

### 1. `DashboardView.tsx` — Funil de Inscricao (linhas 254-262)

`funnelSteps` esta hardcoded com "Origem", "Duvida", "Premium", "Masterclass". Quando `webinarContext === "video"`, os labels devem ser:
- Passo 1 — Qualificacao
- Passo 2 — Masterclass (€47)
- Passo 3 — Gravacao (€15)
- Passo 4 — Duvida

Usar condicional baseada em `webinarContext` para alternar entre os dois conjuntos de labels e sublabels.

### 2. `FunnelView.tsx` — buildFunnelSteps (linhas 31-118)

Funcao `buildFunnelSteps` hardcoded para imagens. Para inscritos com `webinar === "video"`, a logica deve ser:
- Passo 1 (step >= 1): Qualificacao — mostrar role/team_size se preenchidos
- Passo 2 (step >= 2): Masterclass — verificar plan includes masterclass/bundle (prefixo video-)
- Passo 3 (step >= 3): Premium/Gravacao — verificar plan includes premium/bundle (prefixo video-)
- Passo 4 (step >= 4): Duvida — mostrar duvida text
- Passo 5 (step >= 5): Conclusao

Nota: a logica de "interested"/"completed" para Premium/Masterclass precisa incluir prefixos `video-` (ex: `video-premium`, `video-bundle`).

### 3. `TabResumo.tsx` — STEP_NAMES (linha 22)

`STEP_NAMES` hardcoded como `{1: "Inscricao", 2: "Origem", 3: "Duvida", 4: "Premium", 5: "Masterclass"}`. Para video, deve ser `{1: "Inscricao", 2: "Qualificacao", 3: "Masterclass", 4: "Premium", 5: "Duvida"}`.

Condicionar com base em `inscrito.webinar`.

### 4. `SidebarFunnel.tsx` — STEPS (linhas 3-9)

`STEPS` hardcoded para imagens. Receber `webinar` como prop e alternar labels.

## Plano tecnico

| Ficheiro | Alteracao |
|---|---|
| `DashboardView.tsx` | Condicionar `funnelSteps` por `webinarContext` (video vs imagens) com labels e sublabels correctos |
| `FunnelView.tsx` | Criar `buildVideoFunnelSteps` alternativo; seleccionar com base em `inscrito.webinar`; incluir prefixos `video-` na logica de planos |
| `TabResumo.tsx` | Condicionar `STEP_NAMES` por `inscrito.webinar` |
| `SidebarFunnel.tsx` | Receber prop `webinar` e alternar array de steps; actualizar chamadas no componente pai |

No modo **consolidado** do Dashboard, o funil agrega ambos os webinars — como os step numbers representam coisas diferentes, sera necessario escolher uma abordagem: ou mostrar o funil generico ("Passo 1", "Passo 2"...) sem labels especificos, ou mostrar dois funis lado a lado. A abordagem mais simples: no modo consolidado, usar labels genericos ("Passo 1", "Passo 2", etc.) com uma nota visual a indicar que os passos diferem entre webinars.
