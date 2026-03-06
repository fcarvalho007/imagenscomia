

# Melhorar identificadores EuPago para clareza

## Situação actual

| Função | Formato actual | Exemplo |
|---|---|---|
| `create-payment` (individual) | `ORDER-{orderId}-{nome}` | `ORDER-d406908ce04d-Lcia Furtado` |
| `create-group-payment` | `GROUP-{uuid12chars}` | `GROUP-698019e6868c` |
| `send-payment-link` (reenvio CRM) | Precisa verificar | — |

O individual já tem o nome, mas o de grupo é ilegível.

## Alterações

### `supabase/functions/create-group-payment/index.ts` (linha 160)

Alterar o `identifierStr` de:
```
GROUP-698019e6868c
```
Para:
```
GRP-3x-joao.silva@email-MC
```

Formato: `GRP-{count}x-{buyerEmail_truncado}-{plan_abrev}`

Isto permite ver imediatamente no EuPago: quantas pessoas, quem é o comprador, e que plano.

### `supabase/functions/create-payment/index.ts` (linha 169-170)

O formato individual já inclui o nome — pequeno refinamento para incluir também o plano abreviado:
```
ORDER-d406908ce04d-Lucia Furtado
```
Para:
```
ORD-Lucia Furtado-SP
```

Onde `SP` = Sessão Prática, `MC` = Masterclass, `PK` = Pack Completo. Remove o orderId (já é redundante com a referência EuPago) e adiciona clareza sobre o produto.

### Mapa de abreviaturas
- `premium` / `video-premium` / `gravacao` → `SP` (Sessão Prática)
- `masterclass` / `video-masterclass` → `MC`
- `bundle` / `video-bundle` → `PK` (Pack)
- `gravacao-masterclass` → `GRMC`

### Limite de caracteres
O campo `identifier` do EuPago tem limite (~64 chars). O email será truncado a 30 chars e caracteres especiais sanitizados.

