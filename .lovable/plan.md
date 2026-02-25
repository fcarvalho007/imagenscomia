

# Corrigir Dashboard CRM: Emails, Pipeline e Duvidas por contexto

## 3 Problemas identificados

### 1. "Emails de Follow-up Resend" mostra 0/0 no contexto video

O painel de emails faz queries directas ao Supabase (`message_logs`) sem filtrar por webinar. Como o cutoffDate do video e `null`, a query e abortada e mostra zeros. Mesmo que nao fosse null, a query nao filtra por `registration_id` dos inscritos do webinar activo.

**Dados reais:** Existem 35 logs associados ao webinar video (30 confirmacoes + 5 follow-ups). No entanto, o campo `provider` destes e "resend", entao deviam aparecer.

**Correccao:** Filtrar as queries de email por `registration_id` dos inscritos do webinar activo. Quando `cutoffDate` e null (video), nao aplicar cutoff temporal.

### 2. "Pipeline Pendente" e "Pendentes ha +6h" incluem 31 inscritos video-free (CRITICO)

A causa raiz esta em `useInscritos.ts` na funcao `mapRegistration`. O calculo de `payment_status` verifica `plan_selected !== "free"`, mas `video-free` nao e igual a `"free"` — logo 31 inscritos gratuitos sao classificados como `"selected"`, inflando o pipeline para 33 e o valor para 134EUR.

**Valores reais:** Apenas 2 inscritos video tem intencao de compra real (1 video-bundle + 1 video-masterclass). O pipeline deveria mostrar ~134EUR reduzido para os valores destes 2.

**Correccao:** Na funcao `mapRegistration`, alterar a condicao para excluir tambem planos terminados em `-free`:
```
r.plan_selected && r.plan_selected !== "free" && !r.plan_selected.endsWith("-free")
```

### 3. "Dificuldades Mais Comuns" e "Duvidas dos Inscritos" usam opcoes do webinar errado

O array `PREDEFINED_DUVIDAS` e `PREDEFINED_DIFFICULTIES` estao hardcoded com as opcoes do webinar de imagens ("Nao sei descrever o estilo visual...", "Resultados genericos..."). O webinar de video usa opcoes diferentes:
- "Como criar videos curtos sem filmar"
- "Que ferramentas de IA usar para video"
- "Como integrar video na estrategia de marketing"

Logo, no contexto video, as barras aparecem todas com 0 e as duvidas nao sao correctamente parseadas.

**Correccao:** Condicionar os arrays por `webinarContext` e actualizar os labels de resumo.

## Plano tecnico

| Ficheiro | Alteracao |
|---|---|
| `src/hooks/useInscritos.ts` | Corrigir `payment_status` em `mapRegistration` para excluir planos `*-free` do estado "selected" |
| `src/components/crm/DashboardView.tsx` | 1. Filtrar queries de email por webinar (usando IDs dos inscritos); 2. Condicionar `PREDEFINED_DUVIDAS`/`PREDEFINED_DIFFICULTIES` e respectivos `diffLabels` por `webinarContext`; 3. Actualizar subtitulos ("Passo 2" para imagens, "Passo 4" para video) |

### Detalhe da correccao em mapRegistration

```text
// Antes (buggy):
r.plan_selected && r.plan_selected !== "free" ? "selected" : "free"

// Depois (correcto):
r.plan_selected && r.plan_selected !== "free" && !r.plan_selected.endsWith("-free") ? "selected" : "free"
```

Esta correccao resolve automaticamente o Pipeline, os Pendentes ha +6h, e os contadores de "seleccionaram produto" — porque o estado "selected" deixa de ser atribuido incorrectamente.

### Detalhe da correccao de emails

Para o painel "Emails de Follow-up Resend", a query actual usa `cutoffDate` que e `null` para video, cancelando a query. A correccao:
- Quando `cutoffDate` e null, nao aplicar filtro temporal de cutoff (mostrar todos)
- Adicionar filtro `.in("registration_id", inscritoIds)` para alinhar com o webinar activo

### Detalhe das duvidas por contexto

Definir dois conjuntos:
```text
VIDEO_DUVIDAS = [
  "Como criar videos curtos sem filmar",
  "Que ferramentas de IA usar para video",
  "Como integrar video na estrategia de marketing"
]

VIDEO_DIFF_LABELS = {
  "Como criar videos curtos sem filmar": "Videos sem filmar",
  "Que ferramentas de IA usar para video": "Ferramentas de IA",
  "Como integrar video na estrategia de marketing": "Estrategia de marketing"
}
```

No contexto consolidado, combinar ambos os conjuntos.

