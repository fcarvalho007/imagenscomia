

# Auditoria — Secção Faturação do CRM

## Estado actual

A secção está funcional e bem estruturada em 6 sub-componentes: KPIs, Charts, PlanBreakdown, CostsSection, InvoiceTable e PLSummary. A integração com InvoiceExpress funciona para emissão individual e em lote. Os dados financeiros já estão na DB (`webinar_settings`, `acquisition_costs`, `registrations.paid_amount`).

## Melhorias identificadas

### 1. Webinar hardcoded no CostModal (prioridade alta)
O selector de webinar no modal de custos tem apenas duas opções hardcoded (`imagens`, `video`). Deveria ler da tabela `webinar_settings` para suportar novos webinars sem alterar código.

**Ficheiro:** `src/components/crm/faturacao/CostModal.tsx` (linhas 128-131)

### 2. PLAN_LABELS hardcoded no InvoiceTable (prioridade média)
Os labels dos planos (`PLAN_LABELS` na linha 14) estão hardcoded. Não é bloqueante porque os nomes dos planos raramente mudam, mas deviam ser consistentes com o `PlanBreakdown` que usa `PLAN_CONFIG`.

**Ficheiro:** `src/components/crm/faturacao/InvoiceTable.tsx` (linha 14)

### 3. Coluna "Grupo" em falta na InvoiceTable (prioridade média)
A tabela de faturas não indica visualmente se um pagamento é de grupo (ex: "Grupo ×6"). O `PlanBreakdown` já tem esta informação. Adicionar um badge na coluna Nome quando `group_payment_ref` existe, mostrando quantos membros tem o grupo.

**Ficheiro:** `src/components/crm/faturacao/InvoiceTable.tsx`

### 4. PLSummary não distingue receita por webinar (prioridade baixa)
O Mapa de Contas mostra totais consolidados sem breakdown por webinar. Quando o tab "Todos" está activo, seria útil ver uma linha por webinar na secção de Receitas.

**Ficheiro:** `src/components/crm/faturacao/PLSummary.tsx`

### 5. Sem indicação de IVA no PlanBreakdown (prioridade baixa)
Os valores mostrados incluem IVA mas não há indicação disso. Adicionar uma nota "(com IVA)" ou mostrar o valor base + IVA para maior clareza fiscal.

**Ficheiro:** `src/components/crm/faturacao/PlanBreakdown.tsx`

### 6. BulkInvoiceButton redundante (cleanup)
O `BulkInvoiceButton.tsx` parece ser um componente legado — a mesma funcionalidade já existe dentro do `InvoiceTable.tsx` com mais opções (rascunho, finalizar, emitir). Pode ser removido se não for usado noutro sítio.

**Ficheiro:** `src/components/crm/BulkInvoiceButton.tsx`

## Plano de implementação

### Ficheiros a editar (4) + 1 a remover

1. **`CostModal.tsx`** — Fetch webinars de `webinar_settings` para popular o selector dinamicamente
2. **`InvoiceTable.tsx`** — Adicionar badge de grupo; unificar PLAN_LABELS
3. **`PLSummary.tsx`** — Adicionar breakdown por webinar quando tab = "Todos"
4. **`PlanBreakdown.tsx`** — Adicionar nota "(c/ IVA)" nos valores
5. **`BulkInvoiceButton.tsx`** — Verificar se é usado; se não, remover

### Sem migrações necessárias

Todas as tabelas necessárias já existem. As melhorias são puramente de frontend.

