
# Auditoria de Consistencia do Funil Video no CRM

## Problemas encontrados

### 1. StatusBlock.tsx -- nomes de passo errados para webinar video

O `StatusBlock` usa uma lista fixa de nomes baseada no webinar Imagens:
```text
const STEP_NAMES = ["Inscricao", "Origem", "Duvida", "Premium", "Masterclass", "Conclusao"];
```

Para um inscrito do webinar video com step_reached=3 (Masterclass), a ficha mostra "Saiu no passo 3 -- Duvida" quando deveria mostrar "Saiu no passo 3 -- Masterclass".

**Fix:** Tornar STEP_NAMES dinamico baseado no campo `inscrito.webinar`:
```text
STEP_NAMES_IMAGENS = ["Inscricao", "Origem", "Duvida", "Premium", "Masterclass", "Conclusao"]
STEP_NAMES_VIDEO   = ["Inscricao", "Qualificacao", "Qualificacao", "Masterclass", "Gravacao", "Duvida"]
```
E selecionar a lista correcta: `inscrito.webinar === "video" ? STEP_NAMES_VIDEO : STEP_NAMES_IMAGENS`.

### 2. TabResumo.tsx -- nome errado no passo 4

Linha 23: `STEP_NAMES_VIDEO = { 1: "Inscricao", 2: "Qualificacao", 3: "Masterclass", 4: "Premium", 5: "Duvida" }`

O passo 4 diz "Premium" mas no funil video o step_reached=4 corresponde a "Gravacao" (StepVideoPremium). 

**Fix:** Alterar para `4: "Gravacao"`.

### 3. SidebarFunnel.tsx -- mapeamento off-by-one

A sidebar define 5 passos para video:
```text
STEPS_VIDEO = [
  { num: 1, name: "Qualificacao" },
  { num: 2, name: "Masterclass" },
  { num: 3, name: "Gravacao" },
  { num: 4, name: "Duvida" },
  { num: 5, name: "Conclusao" },
]
```

Mas no DB, step_reached funciona assim:
- 1 = Role concluido (qualificacao parcial)
- 2 = TeamSize concluido (qualificacao completa)
- 3 = Masterclass visto
- 4 = Gravacao visto
- 5 = Duvida concluida

Entao step_reached=2 na sidebar mostra "Masterclass → Actual", quando na realidade o utilizador acabou de completar a qualificacao e ainda nao viu a Masterclass.

**Fix:** Ajustar a lista para reflectir que os passos 1 e 2 sao ambos Qualificacao:
```text
STEPS_VIDEO = [
  { num: 1, name: "Qualificacao (1/2)" },
  { num: 2, name: "Qualificacao (2/2)" },
  { num: 3, name: "Masterclass" },
  { num: 4, name: "Gravacao" },
  { num: 5, name: "Duvida" },
]
```

Ou, abordagem alternativa mais limpa: colapsar os dois passos de qualificacao num unico visual (como ja faz o FunnelView) e mostrar 4 passos visuais em vez de 5. Mas isto mudaria a barra de progresso e a logica de "Saiu aqui".

**Abordagem recomendada:** Manter 5 linhas visuais mas agrupar label:
```text
{ num: 1, name: "Funcao" },
{ num: 2, name: "Equipa" },
{ num: 3, name: "Masterclass" },
{ num: 4, name: "Gravacao" },
{ num: 5, name: "Duvida" },
```
Isto torna claro que os passos 1 e 2 sao sub-passos de qualificacao sem confundir com ofertas de pagamento.

### 4. FunnelView.tsx -- OK (sem alteracao)

O `buildVideoFunnelSteps` ja esta correcto: colapsa passos 1+2 em "Qualificacao" e mapeia correctamente step_reached para os nomes certos. Sem alteracao necessaria.

### 5. DashboardView.tsx -- OK (sem alteracao)

O funil do Dashboard para video ja esta correcto: usa step1-step5 com labels descritivos que reflectem o significado real de cada step_reached. Sem alteracao necessaria.

### 6. PipelineView.tsx -- valores de plano video

As colunas do Pipeline usam "Premium Pass -- EUR15" e "Masterclass -- EUR57,81". Para o webinar video, os valores sao EUR47+IVA (Masterclass) e EUR15+IVA (Gravacao). Os inscritos video com plano "masterclass" vao aparecer na coluna "Masterclass -- EUR57,81" que mostra o preco errado.

**Fix:** Este e um problema mais amplo que requereria colunas dinamicas por webinar. Para ja, nao alterar -- os inscritos aparecem na coluna certa pelo tipo de plano, so o valor no titulo pode diferir. Documentar como limitacao conhecida.

---

## Resumo de alteracoes

| Ficheiro | Alteracao |
|---|---|
| `StatusBlock.tsx` | STEP_NAMES dinamico por webinar |
| `TabResumo.tsx` | Corrigir passo 4 de "Premium" para "Gravacao" |
| `SidebarFunnel.tsx` | Renomear passos 1-2 para "Funcao"/"Equipa" |

## O que NAO muda

- FunnelView.tsx (ja esta correcto)
- DashboardView.tsx (ja esta correcto)
- PipelineView.tsx (limitacao documentada, sem fix nesta iteracao)
- Logica de pagamento, Supabase, edge functions
- Nenhum outro ficheiro
