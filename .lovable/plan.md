

# Faturação: IVA Toggle + Correcções

## Problemas identificados

1. **Valores mostram sempre COM IVA** — o `valor` vem de `paid_amount` que inclui IVA (×1.23). O utilizador quer ver sem IVA por defeito, com toggle para ver com IVA.
2. **Ícone `DollarSign` ($)** — usado em `FaturacaoKPIs.tsx` e `CostsSection.tsx` em vez de símbolo €.
3. **Nomes dos planos no PlanBreakdown** — "Pack Completo" no pré-webinar deve clarificar que é o bundle (Premium + Masterclass). Os nomes pós-webinar estão correctos conforme a memória.

## Plano de implementação

### A. IVA Toggle global (FaturacaoView.tsx)

Adicionar estado `showIVA` (default `false`) no `FaturacaoView`. Criar um switcher compacto junto aos tabs ("s/ IVA | c/ IVA"). Passar `showIVA` como prop a todos os sub-componentes.

Criar helper partilhado:
```typescript
const removeIVA = (v: number) => v / 1.23;
const applyIVA = (v: number, showIVA: boolean) => showIVA ? v : removeIVA(v);
```

### B. Propagar `showIVA` a todos os componentes financeiros

| Componente | Campos afectados |
|-----------|-----------------|
| `FaturacaoKPIs` | receitaConfirmada, pipelinePendente, ticketMedio, CAC |
| `FaturacaoCharts` | barData, pieData, gauge labels |
| `PlanBreakdown` | preço médio, total por plano, subtotal |
| `CostsSection` | Custos NÃO têm IVA (são custos operacionais) — sem alteração nos valores de custo, mas o CAC e ROAS mudam porque a receita muda |
| `InvoiceTable` | coluna "Valor" por inscrito |
| `PLSummary` | Todas as linhas de receita e margem |

Adicionar label "(s/ IVA)" ou "(c/ IVA)" nos headers para clareza.

### C. Substituir DollarSign por Euro icon

`lucide-react` tem o ícone `Euro`. Substituir `DollarSign` por `Euro` em:
- `FaturacaoKPIs.tsx` (linha 2, 68)
- `CostsSection.tsx` (linhas 2, 64-65)

### D. Clarificar nomes dos planos

No `PlanBreakdown`, o "Pack Completo" no contexto pré-webinar já está correcto conforme o negócio. Manter como está, dado que a memória confirma que é o bundle de SP + MC.

### Ficheiros a alterar

1. **`FaturacaoView.tsx`** — estado `showIVA`, switcher UI, passar prop
2. **`FaturacaoKPIs.tsx`** — receber `showIVA`, aplicar conversão, trocar `DollarSign` → `Euro`
3. **`FaturacaoCharts.tsx`** — receber `showIVA`, aplicar conversão
4. **`PlanBreakdown.tsx`** — receber `showIVA`, aplicar conversão, actualizar footer label
5. **`CostsSection.tsx`** — trocar `DollarSign` → `Euro`, receber `showIVA` para ROAS/CAC
6. **`InvoiceTable.tsx`** — receber `showIVA`, aplicar conversão na coluna Valor
7. **`PLSummary.tsx`** — receber `showIVA`, aplicar conversão nas linhas de receita/margem

