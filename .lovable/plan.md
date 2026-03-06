

# Auditoria: Preços de Fatura vs Valores Reais EuPago

## Problema central

A `create-invoice` usa um mapa estático `PRICES` para determinar o valor da fatura. Mas os preços mudaram ao longo do tempo e o mapa está desactualizado. O valor **realmente pago** pelo cliente (visível no EuPago) nunca é guardado no registo — é a única fonte de verdade e está a ser ignorada.

## Erros concretos encontrados

| Plano | PRICES (create-invoice) | Valor real (s/IVA) | Erro |
|-------|------------------------|-------------------|------|
| `bundle` (imagens) | **62,00€** | **57,00€** | +5€ a mais na fatura |
| `video-premium` | 15,00€ | **27,00€** | -12€ a menos (preço antigo) |
| `video-masterclass` | 47,00€ | **67,00€** | -20€ a menos |
| `video-bundle` | 57,00€ | **107,00€** | -50€ a menos |

E o `AMOUNT_TO_PLAN` no webhook tem `76.26` como bundle imagens, mas o CSV do EuPago mostra **70.11** (57×1.23). Há um mismatch total.

## Solução: guardar `paid_amount` e usá-lo na fatura

Em vez de manter mapas de preços estáticos que ficam desactualizados, guardar o montante real pago e derivar o preço base da fatura a partir dele.

### 1. Adicionar coluna `paid_amount` à tabela `registrations`

Migração SQL: `ALTER TABLE registrations ADD COLUMN paid_amount numeric NULL`

### 2. `eupago-webhook` — guardar `paid_amount` em todas as strategies

Nas strategies 2, 3, 3b, adicionar ao `updatePayload`:
```
paid_amount: parseFloat(amount) || null
```

### 3. `create-invoice` — usar `paid_amount` como fonte de verdade

Lógica nova:
- Se `reg.paid_amount` existe → `unitPrice = paid_amount / 1.23` (para NIF PT) ou `paid_amount` (se isento)
- Se não existe → fallback para o mapa PRICES (corrigido) + log warning
- Nunca usar fallback silencioso de 15€

### 4. Corrigir mapa PRICES como fallback (para registos antigos sem `paid_amount`)

Actualizar com preços correctos actuais:
```
premium: 15.00       → manter (pré-5 março)
masterclass: 47.00   → manter
bundle: 57.00        → corrigir (era 62.00)
gravacao: 27.00      → manter
video-premium: 27.00 → corrigir
video-masterclass: 67.00 → corrigir
video-bundle: 107.00 → corrigir
```

### 5. Corrigir `AMOUNT_TO_PLAN` no webhook

Adicionar montantes em falta e corrigir existentes:
```
imagens: {
  18.45: "premium",
  57.81: "masterclass",
  70.11: "bundle",          ← corrigir (era 76.26)
  33.21: "gravacao",        ← adicionar
}
video: {
  33.21: "video-premium",
  82.41: "video-masterclass",
  131.61: "video-bundle",   ← corrigir (era 115.62, que é grupo)
}
```

### 6. Backfill `paid_amount` para registos existentes

Query SQL para preencher `paid_amount` a partir dos `payment_events` que têm o payload com o montante original.

## Ficheiros a editar

| Ficheiro | Acção |
|----------|-------|
| Migração SQL | Adicionar coluna `paid_amount` + backfill |
| `supabase/functions/eupago-webhook/index.ts` | Guardar `paid_amount`, corrigir `AMOUNT_TO_PLAN` |
| `supabase/functions/create-invoice/index.ts` | Usar `paid_amount` como fonte, corrigir PRICES fallback |

