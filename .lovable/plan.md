

# Página "Faturação" — Plano de Implementação

## Resumo

Criar uma nova vista "Faturação" no CRM com 4 blocos: KPIs financeiros, breakdown por plano, custos de aquisição manuais e integração InvoiceExpress (lote + individual). Requer 1 tabela nova na BD + 1 edge function nova + ~5 ficheiros frontend novos.

## Alterações na Base de Dados

### Nova tabela `acquisition_costs`

```sql
CREATE TABLE public.acquisition_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  description text NOT NULL DEFAULT '',
  amount numeric(10,2) NOT NULL,
  cost_date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL DEFAULT 'paid_media',
  webinar text NOT NULL DEFAULT 'video',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.acquisition_costs ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can CRUD (via edge functions or anon policies matching existing pattern)
CREATE POLICY "allow_anon_select_costs" ON public.acquisition_costs FOR SELECT USING (true);
CREATE POLICY "allow_anon_insert_costs" ON public.acquisition_costs FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_anon_update_costs" ON public.acquisition_costs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_delete_costs" ON public.acquisition_costs FOR DELETE USING (true);
```

## Ficheiros a criar/editar

### 1. `src/components/crm/CRMSidebar.tsx`
- Adicionar `"faturacao"` ao tipo `CRMView`
- Novo item no `NAV_ITEMS` entre "Tabela" e "Automações": `{ icon: Receipt, label: "Faturação", view: "faturacao" }`

### 2. `src/pages/CRM.tsx`
- Importar `FaturacaoView`
- Render quando `activeView === "faturacao"`
- Passar `filteredInscritos` e `refresh`

### 3. `src/components/crm/FaturacaoView.tsx` (NOVO — componente principal)

**Bloco 1 — KPIs Financeiros** (6 cards horizontais):
- Receita Confirmada: soma de `valor` onde `payment_status === "paid"`
- Pipeline Pendente: soma onde `payment_status === "awaiting_payment" | "selected"`
- Receita Total Potencial: soma dos dois
- Ticket Médio: receita confirmada / nº pagamentos
- Nº de Pagamentos: contagem de pagos
- Margem Operacional: receita confirmada − total custos (cor condicional verde/vermelho)

**Bloco 2 — Detalhe por Plano** (tabela com breakdown):
- Separar Pré-Webinar (webinar) vs Pós-Webinar (gravacao) por `registration_source`
- Colunas: Plano, Preço, Pagos, Pendentes, Total (€)
- Barra de progresso por plano (% do total de receita)
- Badge "Grupo" para inscritos com `group_payment_ref`
- Subtotais por grupo + total geral

**Bloco 3 — Custos de Aquisição**:
- Lista de custos da tabela `acquisition_costs`
- Botão "(+) Adicionar Custo" → modal com campos: Plataforma (dropdown), Descrição, Valor, Data, Categoria
- Plataformas pré-definidas: Meta Ads, Google Ads, LinkedIn Ads, E-goi, SMS, Lovable.app, Outro
- Categorias: Paid Media, Plataforma, Produção, Outro
- Editar/eliminar cada linha (confirmação modal para eliminar)
- Total automático, CAC (custos ÷ pagamentos), ROAS (receita ÷ custos paid media)

**Bloco 4 — Faturação InvoiceExpress**:
- Tabela de pagantes com estado de fatura: 🔘 Sem fatura / 🟡 Rascunho / 🟢 Emitida / 🔴 Erro
- Checkbox para selecção individual
- Botão "Gerar Rascunhos em Lote" → chama `bulk-create-invoices`
- Botão "Confirmar e Enviar Selecionados" → chama nova edge function `bulk-finalize-invoices`
- Botão individual "Emitir" por linha → chama `create-invoice`

**Secção final — Mapa de Contas (P&L visual)**:
- Layout tipo dashboard com receitas, custos, resultado
- Gráfico de barras (Recharts) receita vs custos
- Donut chart distribuição por plano

**Header**: botão "Exportar CSV" no canto superior direito

### 4. `src/components/crm/faturacao/CostModal.tsx` (NOVO)
- Modal para adicionar/editar custo com formulário validado
- Dropdown de plataformas, date picker, campos de texto e número

### 5. `src/components/crm/faturacao/InvoiceTable.tsx` (NOVO)
- Tabela de pagantes com estado de fatura, checkboxes, acções individuais

### 6. `src/components/crm/faturacao/PLSummary.tsx` (NOVO)
- Vista P&L consolidada com gráficos Recharts

### 7. `supabase/functions/bulk-finalize-invoices/index.ts` (NOVO)
- Recebe array de `registration_id`s
- Para cada um: finaliza o rascunho no InvoiceExpress + envia email
- Actualiza `invoice_sent = true` e regista em `message_logs`
- Rate limit 1s entre chamadas

## Estimativa de complexidade
- ~1 migração BD
- ~1 edge function nova
- ~4-5 componentes React novos
- ~2 ficheiros existentes editados (Sidebar + CRM.tsx)

