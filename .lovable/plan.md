

# Refinamentos para Garantir Integridade Financeira

## Problemas Encontrados

### 1. BUG CRÍTICO — Strategy 1b não funciona (webhook)

O comentário no próprio código (linha 98-103) diz que o `transactionID` do webhook é um **ID numérico curto** (ex: "61611445"), enquanto o `eupago_ref` guardado na criação do link é um **UUID** (ex: "09acb60ac5d4433598b3176e1d76fb80"). São valores DIFERENTES.

A Strategy 1b faz lookup por `eupago_ref.eq.${transactionID}` — mas como os valores nunca coincidem, **nunca encontra match**. Os 2 pagamentos "perdidos" (Maria Soares, Carla Jorge) continuam sem ser capturados automaticamente.

**Fix**: Fazer lookup por `reference` (referência MB) em vez de `transactionID`, OU usar um fallback por email extraído do registo mais recente sem pagamento que tenha o mesmo `plan_selected`.

### 2. BUG — Grupo: `paid_amount` é o TOTAL, não o individual

Na Strategy GROUP (linha 206), o webhook guarda `paid_amount: parseFloat(amount)` em TODOS os membros do grupo. Mas o `amount` é o **total do grupo** (ex: €312.17 para 6 pessoas). 

Resultado: cada membro mostra €312.17 como valor pago, e a `create-invoice` emitiria faturas de €312.17/1.23 = €253.80 **por pessoa**.

**Fix**: Dividir o montante pelo número de membros: `paid_amount: parseFloat(amount) / matchingRows.length`.

### 3. Preços hardcoded desactualizados em 3 funções

| Função | Preço usado | Deveria ser |
|--------|------------|-------------|
| `create-payment` PRODUCTS | premium: 18.45 | 33.21 (pós-5 março) |
| `create-payment` PRODUCTS | bundle: 76.26 | 131.61 |
| `create-group-payment` PRICE_PER_PERSON | 57.81 | 82.41 |
| `send-payment-link` PRICES | earlybird values | Remover earlybird, usar preços actuais |

Isto significa que **novos pagamentos criados via CRM ou frontend usam preços antigos**.

**Fix**: Actualizar todos os mapas de preços para os valores pós-5 março. Idealmente, centralizar os preços numa única fonte (tabela na BD ou constantes partilhadas).

### 4. Email de notificação usa mapa estático em vez de `paid_amount`

No webhook (linhas 713-717), o email de notificação ao admin usa `unitPriceMap` hardcoded. Já temos o `amount` do webhook disponível — deve usá-lo directamente.

### 5. `send-payment-link` não guarda `eupago_transaction_id`

Linha 152: guarda `eupago_ref: transactionID` mas **não** guarda `eupago_transaction_id`. A Strategy 1b precisa deste campo para funcionar (se corrigida).

---

## Plano de Correcção

### Ficheiros a editar

| Ficheiro | Acção |
|----------|-------|
| `supabase/functions/eupago-webhook/index.ts` | Fix Strategy 1b (lookup por reference/email); fix GROUP paid_amount (dividir por membros); usar amount real no email de notificação |
| `supabase/functions/create-payment/index.ts` | Actualizar PRODUCTS para preços pós-5 março |
| `supabase/functions/send-payment-link/index.ts` | Actualizar PRICES; guardar `eupago_transaction_id` |
| `supabase/functions/create-group-payment/index.ts` | Actualizar PRICE_PER_PERSON para 82.41 |

### Detalhe das correcções

**Strategy 1b (webhook)** — Mudar a abordagem: quando identifier começa com `ORD-`, extrair o planTag (`SP`/`MC`/`PK`), e fazer lookup pelo email do registo mais recente sem pagamento que tenha o plano correspondente. Guardar a `reference` do webhook como campo adicional de reconciliação.

**GROUP paid_amount** — Calcular por pessoa:
```
const perPersonAmount = parseFloat(amount) / matchingRows.length;
// Usar perPersonAmount no update de cada membro
```

**Preços actualizados**:
```
create-payment: premium→33.21, masterclass→82.41, bundle→131.61, video-premium→33.21, video-masterclass→82.41, video-bundle→131.61
create-group-payment: PRICE_PER_PERSON→82.41
send-payment-link: remover earlybird/normal, usar preço único actual
```

