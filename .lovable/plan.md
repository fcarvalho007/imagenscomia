
# Corrigir funil do Dashboard e TabResumo para Video Webinar

## Problema

O funil do Dashboard e os nomes dos passos no TabResumo nao correspondem ao fluxo real do /upgrade-video.

Fluxo real no /upgrade-video:
- Step 1: Qualificacao (StepRole) → step_reached=1
- Step 2: Equipa (StepTeamSize) → step_reached=2
- Step 3: Masterclass €47 (StepMasterclass) → step_reached=3
- Step 4: Gravacao €15 (StepVideoPremium) → step_reached=4
- Step 5: Duvida (StepDuvida) → step_reached=5
- Step 6: Checkout (VideoConfirmation) → upgrade_clicked_at
- Step 7: Confirmacao (paid_at)

O CRM actualmente:
- Salta step_reached >= 1 (nao mostra quem completou Qualificacao)
- Chama step_reached >= 2 de "Passo 1 — Qualificacao" quando na verdade e Equipa
- Os numeros dos passos estao todos desfasados em -1
- TabResumo chama step 1 de "Inscricao" e step 2 de "Qualificacao" — errado

Alem disso, o badge "Dados ate: 20 Fev 2026" aparece no contexto Video, mas o Video nao tem cutoff (cutoffDate: null).

## Correcoes

### 1. DashboardView.tsx — Funil Video (linhas 273-281)

Adicionar step_reached >= 1 como linha separada e corrigir todos os labels:

```text
Antes (5 linhas de funil):
1. Submeteu inscricao          → step1 (total)
2. Passo 1 — Qualificacao      → step_reached >= 2
3. Masterclass (Passo 2)       → step_reached >= 3
4. Gravacao (Passo 3)          → step_reached >= 4
5. Passo 4 — Duvida            → step_reached >= 5

Depois (6 linhas de funil):
1. Submeteu inscricao          → total
2. Passo 1 — Qualificacao      → step_reached >= 1  (NOVO)
3. Passo 2 — Equipa            → step_reached >= 2  (CORRIGIDO)
4. Passo 3 — Masterclass €47   → step_reached >= 3  (CORRIGIDO)
5. Passo 4 — Gravacao €15      → step_reached >= 4  (CORRIGIDO)
6. Passo 5 — Duvida            → step_reached >= 5  (CORRIGIDO)
```

Apos estes 6, mantem-se "Clicou para pagar" e "Pagamento confirmado".

Adicionar nova variavel `step1q` para step_reached >= 1 no bloco `stats`:
```text
const step1q = active.filter((i) => (i.step_reached || 0) >= 1).length;
```

Ajustar `funnelValues` e `dropOffs` para incluir o novo step.

O separador "INTENCAO DE COMPRA" move-se para antes do Passo 3 (Masterclass).

Os sublabels ficam:
- Passo 3: "Viu a oferta de €47+IVA"
- Passo 4: "Viu a oferta de €15+IVA"

### 2. DashboardView.tsx — Badge de cutoff (linha 328-329)

Condicionar a exibicao: so mostrar "Dados ate: 20 Fev 2026" quando cutoffDate existe (imagens e consolidado). Para video, nao mostrar ou mostrar "Sem limite temporal".

### 3. TabResumo.tsx — STEP_NAMES_VIDEO (linha 23)

Corrigir:
```text
Antes:  { 1: "Inscricao", 2: "Qualificacao", 3: "Masterclass", 4: "Gravacao", 5: "Duvida" }
Depois: { 1: "Qualificacao", 2: "Equipa", 3: "Masterclass", 4: "Gravacao", 5: "Duvida" }
```

## Ficheiros alterados

| Ficheiro | Alteracao |
|---|---|
| `src/components/crm/DashboardView.tsx` | Funil video: +1 step, labels corrigidos, cutoff badge condicional |
| `src/components/crm/modal/TabResumo.tsx` | STEP_NAMES_VIDEO corrigido |

## O que NAO muda

- Funil Imagens (intacto)
- Funil Consolidado (intacto)
- Edge functions
- Templates de email
- Outros tabs do CRM
- AutomationFlowTab
