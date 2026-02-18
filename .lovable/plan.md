
## Diagnóstico: Porquê é que pagamentos ficaram sem registo

### O problema raiz — discrepância de identificadores

O webhook da EuPago chega com um `transactionID` numérico curto (ex: `106016430`), mas a base de dados guarda um UUID longo gerado pela EuPago no momento da criação do link (ex: `09acb60ac5d4433598b3176e1d76fb80`).

O webhook tenta fazer o match **Strategy 1** por `eupago_ref = transactionID`, e falha sempre — porque o `eupago_ref` guardado na BD é o UUID longo, mas o `transactionID` que vem no webhook é o ID numérico curto.

```
BD guarda:    eupago_ref = "09acb60ac5d4433598b3176e1d76fb80"  (UUID longo)
Webhook traz: transactionID = "106016430"                       (ID numérico — diferente!)
```

**Strategy 2** deveria recuperar a situação: extrai o `order_id` do `identifier` e faz match na BD. Mas aqui há um segundo problema: o `identifier` que vem no webhook da EuPago tem formato `ORDER-{order_id}-{nome}` (ex: `ORDER-02772a5aa74c-Drio Ramos`), e o código faz apenas `identifier.replace("ORDER-", "")`, ficando com `02772a5aa74c-Drio Ramos` — que não casa com `order_id = "02772a5aa74c"`.

### Prova no CSV vs. Base de Dados

| Pessoa | order_id (CSV identifier) | paid_at BD | Situação |
|---|---|---|---|
| Dário Ramos | `02772a5aa74c` | `null` | ❌ Não registado |
| Ana Pinto | `e0e048fd5cd2` | `null` | ❌ Não registado |
| Margarida Pregueiro | `0f8f365dd5b1` | `null` | ❌ Não registado |
| Graça Sá da Bandeira | `b66129554aae` | `null` | ❌ Não registado |
| Ana Olívia | `d65ce09eabb3` | `null` | ❌ Não registado |
| Hericka Santos | `6854dd2bb70a` | `null` | ❌ Não registado |
| Sofia Albinski | `e1228db9dc79` | `null` | ❌ Não registado |
| Rita Pinto | `cea36416128f` | ✅ 2026-02-17 | ✅ OK (match direto) |
| pcsantos@learninghubz.com | formato antigo | ✅ 2026-02-16 | ✅ OK (strategy 3 email) |

Os 7 pagamentos em falta estão confirmados no CSV como "paga" mas sem `paid_at` na BD.

### O que vai ser corrigido

**1. Correção no webhook `eupago-webhook/index.ts` — Strategy 2**

Extrair corretamente o `order_id` do identifier `ORDER-{order_id}-{nome}`:

```ts
// Antes (errado):
const oid = identifier.replace("ORDER-", "");
// Resultado: "02772a5aa74c-Drio Ramos" — não casa com order_id

// Depois (correto):
const parts = identifier.replace("ORDER-", "").split("-");
const oid = parts[0]; // "02772a5aa74c" — casa!
```

Nota: o `order_id` tem sempre 12 caracteres hexadecimais, por isso `parts[0]` é suficiente e seguro.

**2. Atualização manual dos 7 registos em falta**

Marcar manualmente os 7 pagamentos confirmados pela EuPago como `paid_at`:

| Email | order_id | paid_at a aplicar |
|---|---|---|
| darioramos@drkasas.pt | 02772a5aa74c | 2026-02-18 11:24 |
| anaritajfp@gmail.com | e0e048fd5cd2 | 2026-02-18 11:23 |
| amargaridapregueiro@gmail.com | 0f8f365dd5b1 | 2026-02-18 11:23 |
| gracasabandeira@gmail.com | b66129554aae | 2026-02-18 11:17 |
| ana.isabel.ao@gmail.com | d65ce09eabb3 | 2026-02-18 10:04 |
| herickasantospro@gmail.com | 6854dd2bb70a | 2026-02-18 08:54 |
| sofiaalbinski@gmail.com | e1228db9dc79 | 2026-02-18 02:37 |

O `plan_selected` já está correto em todos os casos (`premium`).

### Ficheiros alterados
- `supabase/functions/eupago-webhook/index.ts` — corrigir extração do `order_id` na Strategy 2
- Base de dados — UPDATE manual nos 7 registos com `paid_at` correto (via SQL direto, não migração de schema)

### O que NÃO muda
- Registos "pendente" e "expirada" do CSV (e os da SMSonline.pt) não são do sistema de webinar — não são alterados
- A lógica do resto do webhook permanece intacta
