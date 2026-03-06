

# Correcções à Faturação — 5 pontos

## Análise do estado actual

Após revisão do código, eis o que já está implementado e o que falta:

| Ponto | Estado | Acção |
|-------|--------|-------|
| 2. Webinar hardcoded nos custos | CostModal faz fallback para `"video"` quando o contexto é "consolidado" (linha 54). Não há selector de webinar no modal. | **Corrigir** — adicionar dropdown de webinar no modal |
| 3. API Key InvoiceExpress | Já está nos secrets do backend (`INVOICEEXPRESS_API_KEY`), lida via `Deno.env.get()`. Nunca fica em localStorage ou no frontend. | **Nada a fazer** — já está seguro |
| 4. Bulk finalize sem rollback | A edge function já processa cada fatura individualmente com try/catch, continua no erro, e devolve array de `errors` com id+email+mensagem. Já é atómica por linha. | **Nada a fazer no backend** — melhorar feedback no frontend |
| 5. Exportar custos CSV | Não existe botão de export CSV isolado na secção de custos | **Adicionar** |
| 6. Filtro por webinar | `FaturacaoView.fetchCosts` já filtra por `webinarContext`. Os inscritos vêm pré-filtrados do `CRM.tsx` via `filterByWebinar`. Os KPIs reagem ao contexto. | **Já funciona** |

## Alterações a implementar

### 1. `CostModal.tsx` — Dropdown de webinar configurável

Adicionar campo "Webinar" (dropdown: Imagens / Vídeo) ao formulário. Pré-selecciona com base no `webinarContext` activo mas permite alterar. Quando `consolidado`, default para "video" mas o utilizador pode escolher.

### 2. `CostsSection.tsx` — Botão "Exportar Custos CSV"

Adicionar pequeno botão de download ao lado do "Adicionar Custo" que exporta apenas os custos filtrados em CSV (Plataforma, Descrição, Valor, Data, Categoria, Webinar).

### 3. `InvoiceTable.tsx` — Mostrar erros parciais do bulk finalize

Após a chamada a `bulk-finalize-invoices`, se o resultado contiver `errors`, mostrar toast com contagem de erros e listar os emails que falharam para permitir retry individual.

## Ficheiros a editar
- `src/components/crm/faturacao/CostModal.tsx`
- `src/components/crm/faturacao/CostsSection.tsx`
- `src/components/crm/faturacao/InvoiceTable.tsx`

