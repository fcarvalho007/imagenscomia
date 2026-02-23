
# Corrigir bug: plan_selected "video-free" tratado como plano pago

## Problema

Os registos do webinar video guardam `plan_selected` com prefixo `video-` (ex: `"video-free"`, `"video-premium"`). O campo `plan` e normalizado correctamente (remove o prefixo), mas `plan_selected` mantem o valor original.

Varios locais no CRM comparam `plan_selected !== "free"` para identificar intencao de pagamento. Como `"video-free" !== "free"` e `true`, os inscritos gratuitos do webinar video aparecem incorrectamente como:
- "Seleccionou e saiu" no Pipeline
- Contados nos quick filters "Aguarda pgto" na Tabela
- Incluidos nos filtros de backlog

## Registos afectados (actualmente na BD)

5 registos com `plan_selected = "video-free"` estao a ser tratados como intencao de compra quando sao de facto gratuitos.

## Solucao

Normalizar `plan_selected` no `mapRegistration` da mesma forma que `plan`, removendo o prefixo `video-`:

**Ficheiro:** `src/hooks/useInscritos.ts`

Na funcao `mapRegistration`, linha 46:

| Antes | Depois |
|---|---|
| `plan_selected: r.plan_selected \|\| null` | `plan_selected: r.plan_selected ? r.plan_selected.replace(/^video-/, "") : null` |

Isto garante que `plan_selected` fica `"free"`, `"premium"`, `"masterclass"` ou `"bundle"` independentemente do webinar, alinhando com as comparacoes existentes em todo o CRM (TableView, PipelineView, StatusBlock, TabResumo, TabHistorico).

## Impacto

- Pipeline: os 5 inscritos video-free deixam de aparecer como "Seleccionou e saiu" e voltam a coluna "Inscrito"
- Tabela: quick filters corrigidos (awaiting, backlog, no_resend)
- Modal: StatusBlock ja normaliza por si, sem impacto

## Ficheiro afectado

`src/hooks/useInscritos.ts` -- 1 linha alterada.
