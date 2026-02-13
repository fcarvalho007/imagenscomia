

## Correcoes ao Dashboard, Email e Tabela

### 1. Corrigir template do email de lembrete

Ficheiro: `supabase/functions/generate-reminder/index.ts`

**Problemas actuais:**
- Menciona "Cartao de Credito" como metodo de pagamento (nao existe)
- Nao descreve os produtos correctamente
- "Valor:" em vez de "Valor total (c/ IVA):"

**Correccoes:**
- Produtos: Premium Pass (15+IVA) e Masterclass IA Video (47+IVA). Nao existe Workshop.
- Actualizar o map PRODUCTS para reflectir labels correctos:
  - premium: "Premium Pass (15+IVA)"
  - masterclass: "Masterclass IA Video (47+IVA)" 
  - bundle: "Premium Pass (15+IVA) + Masterclass IA Video (47+IVA)"
- Substituir "Valor:" por "Valor total (c/ IVA):"
- Substituir metodos por "MB WAY, Multibanco" (remover Cartao de Credito)
- Actualizar o assunto do email para usar o label correcto

### 2. Corrigir KPIs do Dashboard — separar dados reais de intencoes

Ficheiro: `src/components/crm/DashboardView.tsx`

**Problemas actuais:**
- "Receita" soma `i.valor` de TODOS os inscritos com plano (incluindo quem nao pagou)
- "Conversao para pago" conta quem tem plan != "free" como pagante (inclui pendentes)
- "Ticket medio" dividido pelo numero errado
- "Taxa modal → pagamento" repete informacao da caixa de conversao

**Correccoes na logica (linhas 60-66):**
- `receita` = soma de `i.valor` APENAS quando `i.paid_at !== null`
- `pagantes` = filtrar por `i.paid_at !== null` (quem realmente pagou)
- `conversao` = pagantes reais / total
- `ticket` = receita real / pagantes reais
- Adicionar metricas de "pipeline" (intencoes): total pendentes e valor potencial

**Novo layout dos 4 KPIs:**

| KPI | Logica |
|---|---|
| Inscritos | Total activos (manter como esta) |
| Receita Confirmada | Soma de `valor` so de quem tem `paid_at` |
| Conversao para pago | % de inscritos que realmente pagaram |
| Ticket medio | Receita confirmada / pagantes reais |

**Adicionar 5a caixa ou sub-info:**
- "Pipeline" — valor pendente (soma de `valor` de quem tem `payment_status === "pending"`) com contagem
- Sub-texto: "X pendentes · €Y potencial"

**Remover a linha "Taxa modal → pagamento"** no final do funil (linha 239-242) — e redundante com a caixa "Conversao para pago".

**Actualizar sub-texto da caixa Receita:**
- De "X Premium · Y MC · Z Bundle" para mostrar so os PAGOS, ex: "1 Premium · 0 MC · 2 Bundle pagos"

### 3. Tabela — mostrar 100 por pagina

Ficheiro: `src/components/crm/TableView.tsx`

Alterar `PER_PAGE` de 10 para 100 (linha 56).

### Ficheiros afectados

| Ficheiro | Alteracao |
|---|---|
| `supabase/functions/generate-reminder/index.ts` | Corrigir labels, metodos pagamento, formato valor |
| `src/components/crm/DashboardView.tsx` | KPIs baseados em paid_at real; remover taxa duplicada; adicionar pipeline |
| `src/components/crm/TableView.tsx` | PER_PAGE = 100 |

