

# Pipeline: Adicionar resumo financeiro nos cabeçalhos das colunas

## Contexto

Actualmente o cabeçalho de cada coluna mostra apenas o total de receita (`€colRevenue`), sem distinguir entre pago e pendente. O utilizador quer ver claramente:
- O preço unitário do plano (diferente pré vs pós-webinar)
- Total faturado (pagos) com contagem
- Total pendente com contagem

## Alterações

### `src/components/crm/PipelineView.tsx`

**1. Calcular métricas por coluna** — para cada coluna paga (premium, masterclass, bundle), computar a partir dos `items`:
- `paidItems` = items com `payment_status === "paid"` → somar `valor`, contar
- `pendingItems` = items com `payment_status === "awaiting_payment"` ou `"selected"` → somar `valor`, contar

**2. Adicionar preço unitário ao cabeçalho** — mostrar o preço base+IVA relevante por contexto:

| Filtro | Premium | Masterclass | Bundle |
|---|---|---|---|
| Pré-webinar | €15+IVA | €47+IVA | €76,26 c/IVA |
| Pós-webinar | €27+IVA | €67+IVA | €107+IVA |
| Todos | (sem preço — misto) | — | — |

**3. Substituir o `€colRevenue` simples** por um bloco compacto no header da coluna:

```text
Sessão Prática · €27+IVA
────────────────────────
Faturado: €33,21 (1)
Pendente: €131,61 (1)
```

Formato visual: texto `10px`, verde para faturado, laranja/vermelho para pendente. Aplicar tanto no desktop (kanban header) como no mobile (accordion header).

**4. Colunas sem receita** (Inscrito, Flow Completo, Follow-up, Lost) — manter apenas o contador, sem bloco financeiro.

### Ficheiro único: `src/components/crm/PipelineView.tsx`

Extrair uma pequena função `ColumnFinancials` que recebe os items da coluna e o `sourceFilter`, e renderiza as 2-3 linhas de resumo financeiro. Aplicá-la no header do desktop (linhas 326-344) e no accordion do mobile (linhas 276-287).

