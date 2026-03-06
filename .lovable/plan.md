

# Auditoria Pipeline Pós-webinar — problemas encontrados

## Dados reais na base de dados (webinar=video)

| plan_selected | total | Aparece no Pipeline? |
|---|---|---|
| video-free | 138 | ✅ normaliza → "free" |
| video-premium | 15 | ✅ normaliza → "premium" |
| video-masterclass | 8 | ✅ normaliza → "masterclass" |
| video-bundle | 12 | ✅ normaliza → "bundle" |
| masterclass | 7 | ✅ já é "masterclass" |
| masterclass-group-pending | 5 | ❌ **Invisível** — não mapeia a nenhuma coluna |
| gravacao | 1 | ❌ **Invisível** — não mapeia a nenhuma coluna |
| null | 94 | ✅ torna-se "free" |

## 3 Problemas a corrigir

### 1. Planos invisíveis no Pipeline
`masterclass-group-pending` (5 inscritos com pagamento de grupo pendente) e `gravacao` (1 inscrito) não correspondem a nenhuma coluna. Solução: normalizar no `mapRegistration()`.

- `masterclass-group-pending` → `masterclass`
- `gravacao` → `premium` (sessão prática)

### 2. Preço do bundle errado nos cálculos
`PLAN_VALUES_BY_WEBINAR.video.bundle` = **131.61** mas deveria ser **115.62** (€94+IVA). Isto afecta os totais "Faturado" e "Pendente" no header.

### 3. Header do Pipeline (já parcialmente corrigido)
O screenshot mostra a versão antiga com preços nos títulos. O código actual já está correcto — títulos limpos, preços só no `ColumnFinancials`. Pode ser cache do browser.

## Ficheiro a editar: `src/hooks/useInscritos.ts`

### Linha 9 — Corrigir valor do bundle
```
video: { premium: 33.21, masterclass: 82.41, bundle: 115.62 }
```

### Linhas 14-15 — Normalizar planos adicionais
```typescript
const rawPlan = r.plan_selected || "free";
let plan = rawPlan.replace(/^video-/, "");
if (plan === "masterclass-group-pending") plan = "masterclass";
if (plan === "gravacao") plan = "premium";
```

Resultado: +6 inscritos que estavam invisíveis passam a aparecer nas colunas correctas, e os totais financeiros do bundle ficam com o valor correcto (€115,62 em vez de €131,61).

