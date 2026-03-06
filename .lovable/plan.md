

# Análise do Bug — Maria João / Cluttons

## O que aconteceu (cronologia da BD)

| Quando | O que | plan_selected depois |
|--------|-------|---------------------|
| 16 Fev 15:30 | Maria João regista-se (webinar "imagens") | "premium" (selecção no upgrade flow) |
| 18 Fev 11:59 | Admin envia payment link via CRM para "masterclass" | deveria ser "masterclass" |
| 19 Fev 01:02 | Webhook recebe pagamento de **€57,81** (= €47 + IVA) | **"premium"** ← BUG |
| 19 Fev 01:02 | Auto-invoice cria rascunho com plan_selected="premium" → €15 | Fatura errada |

## Root cause

**A Strategy 2 do `eupago-webhook` não actualiza `plan_selected`.**

Quando o webhook faz match por `order_id` (Strategy 2, linhas 335-342), só actualiza `paid_at`, `eupago_ref` e `eupago_transaction_id`. Não toca em `plan_selected`.

Se entre a criação do link e o pagamento houve alguma sobreposição (outro link, race condition, versão anterior do código), o `plan_selected` ficou errado e a Strategy 2 não o corrigiu.

O valor pago (€57,81) prova inequivocamente que é **masterclass** (€47 + 23% IVA), mas o sistema ignorou essa informação.

## Correcção — 2 partes

### Parte 1: Correcção de dados (imediata)

Corrigir na BD:
- `plan_selected` → "masterclass"
- A fatura InvoiceExpress emitida está errada — terá de ser anulada manualmente no InvoiceExpress e re-emitida

### Parte 2: Fix no webhook (prevenir recorrência)

No `eupago-webhook/index.ts`, adicionar **derivação de plano a partir do montante** como safety net nas Strategies 2, 3, 3b e no fallback por referência.

Criar uma função `derivePlanFromAmount(amount, webinar)` que mapeia:

```text
Imagens: €18.45→premium, €57.81→masterclass, €76.26→bundle
Vídeo:   €33.21→premium, €82.41→masterclass, €115.62→bundle
```

Nas strategies que só fazem `update({ paid_at, eupago_ref })`, adicionar:

```typescript
const derivedPlan = derivePlanFromAmount(amount, reg.webinar);
if (derivedPlan) {
  updatePayload.plan_selected = derivedPlan;
}
```

Isto garante que mesmo que o `plan_selected` esteja errado, o valor pago corrige-o automaticamente.

### Ficheiros a editar
- `supabase/functions/eupago-webhook/index.ts` — adicionar `derivePlanFromAmount()` + usar nas strategies 2, 3, 3b
- Migração SQL para corrigir os dados da Maria João

