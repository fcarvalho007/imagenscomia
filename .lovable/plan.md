

# Auditoria Final: Valores no Dashboard vs EuPago

## Resultado da comparação linha-a-linha

Cruzei todas as 39 transacções "paga" do CSV com os registos na BD. **Todos os pagamentos individuais estão correctos.** Há um único problema remanescente, mas com impacto significativo:

## PROBLEMA: Grupos com `paid_amount` = TOTAL em vez de per-person

| Grupo | Membros | paid_amount actual | Deveria ser | Overcount |
|-------|---------|-------------------|-------------|-----------|
| Rita + Diana (698019e6) | 2 | €115,62 cada | €57,81 cada | +€115,62 |
| Olga Cruz + 5 (efbe2724) | 6 | €312,17 cada | €52,03 cada | +€1.560,85 |

**Impacto total: receita inflacionada em €1.676,47 no Dashboard, Pipeline e Faturação.**

Isto também afecta a emissão de faturas: o `create-invoice` usa `paid_amount` directamente, e emitiria faturas de €253,80 (312.17/1.23) por pessoa em vez de €42,30 (52.03/1.23).

O grupo do Júlio Silva (1 pessoa, €57,81) está correcto.

## Todos os outros 31 pagamentos individuais: VERIFICADOS ✓

Cada `paid_amount` na BD corresponde exactamente ao valor do CSV EuPago. Os planos estão todos correctos após as correcções anteriores.

## Correcção

Uma única operação SQL para actualizar os 8 registos de grupo:

```sql
-- Grupo Rita+Diana: 115.62 / 2 = 57.81
UPDATE registrations SET paid_amount = 57.81
WHERE group_payment_ref = '698019e6-868c-433a-a9c3-951451a32744';

-- Grupo de 6: 312.17 / 6 = 52.03 (arredondado)
UPDATE registrations SET paid_amount = 52.03
WHERE group_payment_ref = 'efbe2724-06c3-452b-935f-9c123d52bcde';
```

Nenhum ficheiro de código precisa de ser alterado. O `useInscritos` já usa `paid_amount` como fonte de verdade, e o `create-invoice` lê directamente da BD. A correcção propaga automaticamente para Dashboard, Pipeline, KPIs, PLSummary e emissão de faturas.

