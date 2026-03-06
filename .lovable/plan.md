

# Garantir Consistência Financeira: `paid_amount` como Fonte de Verdade

## Problema

O campo `valor` em cada inscrito (usado em Dashboard, Pipeline e Faturação) é calculado a partir de um **mapa estático de preços** (`PLAN_VALUES_BY_WEBINAR`) no `useInscritos.ts`:

```
imagens: { premium: 18.45, masterclass: 57.81, bundle: 76.26 }
video:   { premium: 33.21, masterclass: 82.41, bundle: 115.62 }
```

Isto está errado porque:
- Os preços mudaram a 5 de março (de €15/€47/€57 para €27/€67/€107 + IVA)
- Pagamentos anteriores usaram preços antigos (€18.45, €57.81, €76.26)
- Pagamentos de grupo têm valores diferentes (€312.17, €115.62)
- A coluna `paid_amount` já existe na BD mas **é completamente ignorada** pelo `mapRegistration`

**Resultado**: os totais de receita no Dashboard, Pipeline e Faturação podem não coincidir com a realidade do EuPago.

## Solução

Usar `paid_amount` da BD como fonte de verdade para o campo `valor`. O mapa estático passa a ser apenas fallback para registos pendentes (sem pagamento confirmado).

### 1. `src/hooks/useInscritos.ts` — `mapRegistration`

Alterar a lógica do `valor`:

```typescript
// ANTES (linha 43):
valor: planValues[plan] || 0,

// DEPOIS:
valor: r.paid_at && r.paid_amount 
  ? Number(r.paid_amount)           // Fonte de verdade: valor real pago
  : (planValues[plan] || 0),         // Fallback: mapa estático (para pendentes/pipeline)
```

Também expor `paid_amount` no tipo `Inscrito` para que a `create-invoice` e outros componentes possam usá-lo directamente.

### 2. `src/pages/crm/mockData.ts` — Tipo `Inscrito`

Adicionar campo opcional:
```typescript
paid_amount: number | null;
```

### 3. Impacto nos componentes (zero alterações necessárias)

Todos os componentes já usam `i.valor` para somar receitas:
- `FaturacaoView.tsx`: `paid.reduce((s, i) => s + i.valor, 0)` — passa a usar valores reais
- `PipelineView.tsx`: `paidItems.reduce((s, i) => s + i.valor, 0)` — idem
- `DashboardView.tsx`: usa `i.valor` — idem
- `FaturacaoCharts.tsx`, `PLSummary.tsx`, `PlanBreakdown.tsx` — todos downstream de `i.valor`

Nenhum destes ficheiros precisa de ser alterado. A correcção é toda no `mapRegistration`.

## Ficheiros a editar

| Ficheiro | Acção |
|----------|-------|
| `src/pages/crm/mockData.ts` | Adicionar `paid_amount: number \| null` ao tipo |
| `src/hooks/useInscritos.ts` | Usar `r.paid_amount` como fonte primária do `valor` |

