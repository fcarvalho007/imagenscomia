

# Auditoria Faturação — Valores Incorrectos no Pipeline

## Diagnóstico

Cruzei o CSV da EuPago com a base de dados e identifiquei 3 bugs no cálculo de valores:

### Bug 1: Pricing cross-webinar errado
2 registos no webinar `imagens` têm `plan_selected = 'video-premium'`. O código usa o campo `webinar` para determinar preços, aplicando €18,45 (imagens) em vez de €33,21 (vídeo). Diferença: €29,52 no pipeline de Imagens.

**Ficheiro**: `useInscritos.ts` linha 29-30
```js
// ACTUAL (errado)
const webinarType = r.webinar === "video" ? "video" : "imagens";

// FIX: derivar contexto de pricing do plan_selected
const planHasVideoPrefix = (r.plan_selected || "").startsWith("video-");
const pricingContext = planHasVideoPrefix ? "video" : webinarType;
const planValues = PLAN_VALUES_BY_WEBINAR[pricingContext];
```

### Bug 2: Pipeline inclui registos com valor €0
Registos com `plan = "free"` mas que têm `eupago_ref` (ex: Luis Menezes com `video-free`, Frederico Carvalho com `plan_selected = NULL`) aparecem como `awaiting_payment` com €0. Inflam a contagem de pendentes sem acrescentar valor.

**Ficheiro**: `useInscritos.ts` linhas 20-26
```js
// FIX: só marcar awaiting_payment se o plan normalizado não é "free"
const payment_status = r.paid_at
  ? "paid"
  : (r.upgrade_clicked_at || r.eupago_ref) && plan !== "free"
    ? "awaiting_payment"
    : r.plan_selected && r.plan_selected !== "free" && !r.plan_selected.endsWith("-free")
      ? "selected"
      : "free";
```

### Bug 3: Registos perdidos no pipeline
Registos com `lost_at` definido continuam no pipeline. Actualmente não há nenhum, mas é um bug latente. O campo `lost_at` existe na DB mas o `mapRegistration` não o usa para excluir do pipeline.

**Ficheiro**: `FaturacaoView.tsx` linha 61
```js
// FIX: excluir perdidos do pipeline
const pending = tabInscritos.filter(i =>
  (i.payment_status === "awaiting_payment" || i.payment_status === "selected")
  && !i.lost_at
);
```

## Valores esperados após correção

| Tab | Receita (sem alteração) | Pipeline (corrigido) |
|-----|------------------------|---------------------|
| Imagens | €489,54 | ~€747,84 (era ~€718,32) |
| Vídeo | €1.355,22 | €1.485,84 (sem alteração) |
| Todos | €1.844,76 | ~€2.233,68 |

A receita confirmada **não muda** — usa `paid_amount` da DB, que está correcta para todos os 45 pagantes.

## Ficheiros alterados (2)
- `src/hooks/useInscritos.ts` — fix pricing context + payment_status para free plans
- `src/components/crm/FaturacaoView.tsx` — excluir `lost_at` do pipeline

