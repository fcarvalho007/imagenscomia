

# Refinamentos Multi-Webinar no CRM

## Estado actual

A base esta feita: coluna `webinar` na BD, contexto React, switcher no sidebar, filtragem no CRM.tsx. No entanto, as views individuais nao se adaptam ao contexto seleccionado -- mostram exactamente a mesma UI independentemente de ser Imagens, Video ou Consolidado.

---

## Problemas identificados

### 1. Dashboard com dados hardcoded para Imagens
- `FIXED_VISITORS = 2686`, `CUTOFF_DATE`, `LIVE_RESULTS` sao especificos do webinar Imagens mas aparecem em qualquer contexto
- Estes valores devem ser condicionais ao webinar ou ocultados quando irrelevantes

### 2. Nenhuma view adapta a UI ao modo Consolidado
- Pipeline: cards nao mostram de que webinar sao
- Tabela: nao ha coluna "Webinar"
- Follow-up: sem empty state para Video
- Trash: sem indicacao visual de webinar

### 3. Dashboard sem metricas comparativas
- Sem widget "Comparacao entre Webinars" no modo consolidado
- Sem tracking Early Bird vs Regular
- KPIs nao mostram split imagens/video

---

## Plano de implementacao

### Fase 1 -- Dashboard awareness (DashboardView.tsx)

**1a. Configuracao por webinar**

Mover `FIXED_VISITORS`, `CUTOFF_DATE`, `LIVE_RESULTS` para constantes indexadas por webinar:

```text
WEBINAR_DASHBOARD_CONFIG = {
  imagens: { visitors: 2686, cutoff: "2026-02-20", liveResults: {...} },
  video: { visitors: 0, cutoff: null, liveResults: null },
}
```

- Quando `webinarContext === "video"`: ocultar bloco "Resultados Live" e visitor funnel step se visitors = 0
- Quando `webinarContext === "consolidado"`: somar visitors, mostrar ambos live results (se existirem)

**1b. KPI sub-labels no modo consolidado**

Abaixo de cada valor KPI, adicionar linha tipo:
`"234 imagens + 0 video"` (texto `text-[11px]`, cor `#888`)

Requer acesso ao contexto webinar -- importar `useWebinarContext` no DashboardView e computar split internamente a partir de `inscritos` (que ja vem filtrado, excepto em consolidado onde vem tudo).

Problema: o DashboardView recebe `inscritos` ja filtrado. Para o modo consolidado mostrar split, precisa dos dados originais OU receber o contexto e fazer split interno.

Solucao: DashboardView importa `useWebinarContext()` e, quando consolidado, separa `inscritos` por campo `.webinar` para calcular splits.

**1c. Funil dual-bar no consolidado**

Cada step do funil mostra 2 barras lado a lado:
- Azul (#1e40af) = imagens count
- Verde (#16a34a) = video count
- Legenda: "Imagens / Video" abaixo do titulo

**1d. Widget "Comparacao entre Webinars" (consolidado only)**

Inserido entre KPIs e Email Follow-up:
- 2 cards lado a lado com metricas identicas (inscritos, receita, taxa, ticket medio)
- Card video mostra "--" com texto cinza se sem dados
- Linha de insight abaixo: delta de inscritos e receita

**1e. Widget "Early Bird vs Regular"**

Novo card no dashboard (todos os contextos):
- Compara `valor` dos pagantes contra thresholds das datas em `WEBINAR_CONFIG`
- Premium: X a 15 EUR | Y a 27 EUR
- Masterclass: X a 47 EUR | Y a 97 EUR
- Usa `paid_at` vs `WEBINAR_CONFIG[webinar].startDate` para determinar early bird

### Fase 2 -- Pipeline badges (PipelineView.tsx)

**2a. Badge webinar nos cards (consolidado)**

Dentro de `PipelineCard`, quando contexto = consolidado:
- Adicionar badge "IMG" (azul) ou "VID" (verde) no canto superior direito do card
- `font-size: 8px`, `padding: 2px 5px`, `border-radius: 3px`

**2b. Contagens split nos headers de coluna (consolidado)**

Headers mostram: "Inscritos (42 IMG + 0 VID)" em vez de apenas "42"

Requer: PipelineView importar `useWebinarContext()`

### Fase 3 -- Tabela webinar column (TableView.tsx)

**3a. Coluna "Webinar" no consolidado**

- Primeira coluna apos checkbox
- Mostra badge "IMG" ou "VID" com cor
- Clicavel para ordenar
- Dropdown no header para filtrar por webinar

**3b. Coluna price_paid**

Nao implementar por agora -- o campo `valor` ja existe e e calculado. Uma coluna `price_paid` na BD seria redundante com a logica actual. Manter `valor` na tabela.

### Fase 4 -- Follow-up adaptacoes (FollowUpView.tsx)

**4a. Empty state para Video**

Quando contexto = video e `inscritos.length === 0`:
- Icone calendario
- "Webinar Video a 2 de Marco"
- "Follow-up aparecera aqui apos as primeiras inscricoes"

**4b. Badge webinar nos itens (consolidado)**

Adicionar badge IMG/VID nas listas de pessoas e envios em modo consolidado.

### Fase 5 -- Trash badges (TrashView.tsx)

Adicionar badge IMG/VID em cada linha quando contexto = consolidado.

---

## Detalhes tecnicos

### Ficheiros a modificar

| Ficheiro | Alteracoes |
|----------|-----------|
| `src/components/crm/DashboardView.tsx` | Importar useWebinarContext, config por webinar, KPI splits, funil dual-bar, widget comparacao, widget early bird |
| `src/components/crm/PipelineView.tsx` | Importar useWebinarContext, badge IMG/VID nos cards, split counts nos headers |
| `src/components/crm/TableView.tsx` | Importar useWebinarContext, coluna Webinar condicional |
| `src/components/crm/FollowUpView.tsx` | Importar useWebinarContext, empty state video |
| `src/components/crm/FollowUpPessoas.tsx` | Badge webinar no consolidado |
| `src/components/crm/FollowUpAudit.tsx` | Badge webinar no consolidado |
| `src/components/crm/TrashView.tsx` | Importar useWebinarContext, badge condicional |
| `src/config/webinarConfig.ts` | Adicionar dashboard-specific constants (visitors, cutoff, liveResults) |

### Dependencias

- Todas as views precisam de `useWebinarContext()` -- ja disponivel via contexto
- Nenhuma alteracao de BD necessaria
- Nenhuma edge function nova

### Ordem de implementacao

1. `webinarConfig.ts` -- adicionar constantes dashboard
2. `DashboardView.tsx` -- maior volume de alteracoes (KPIs, funil, widgets)
3. `PipelineView.tsx` -- badges + split counts
4. `TableView.tsx` -- coluna webinar
5. `FollowUpView.tsx` + sub-componentes -- empty state + badges
6. `TrashView.tsx` -- badges

### Notas de compatibilidade

- Todas as alteracoes sao aditivas -- UI existente mantem-se identica quando contexto = "imagens"
- O modo "imagens" e o default, preservando comportamento actual
- Dados existentes sem campo webinar sao tratados como "imagens" pelo filtro

