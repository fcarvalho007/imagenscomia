

# Verificação de preços /comprar ↔ EuPago

## Resultado da auditoria

Os preços estão **correctos e alinhados** entre o frontend e o backend (EuPago):

| Plano | Frontend | Backend (`create-payment`) | Plan ID enviado | Valor c/ IVA |
|---|---|---|---|---|
| Sessão Prática | €27 + IVA | `video-premium` → 33,21€ | ✅ | ✅ |
| Masterclass | €67 + IVA | `video-masterclass` → 82,41€ | ✅ | ✅ |
| Pack IA Completo | €107 + IVA | `video-bundle` → 131,61€ | ✅ | ✅ |

O mapeamento no `PurchaseModal` (linha 130-131) converte correctamente:
- `gravacao` → `video-premium`
- `masterclass` → `video-masterclass`
- `bundle` → `video-bundle`

## Problema encontrado (menor)

Na linha 149 do `PurchaseModal.tsx`, o valor do Facebook Pixel para `video-bundle` está desactualizado:

```
"video-bundle": 115.62  ← antigo (€94 + IVA)
```

Deveria ser **131.61** (€107 + IVA). Isto não afecta o pagamento real — apenas o tracking de conversões do Facebook.

## Correção

### `src/components/webinar/PurchaseModal.tsx` (linha 149)
- Actualizar `"video-bundle": 115.62` → `"video-bundle": 131.61`
- Actualizar `bundle: 115.62` → `bundle: 131.61` (consistência)

Uma linha, uma correcção.

