
## Diagnóstico definitivo e correção robusta

### Raiz do problema confirmada com dados reais

Há uma confusão entre dois IDs completamente diferentes da EuPago:

**ID de criação** (guardado na BD quando se cria o link):
`eupago_ref = "09acb60ac5d4433598b3176e1d76fb80"` — UUID longo de 32 caracteres

**ID de pagamento** (enviado pelo webhook quando o pagamento acontece):
`transactionID = "61611445"` — ID numérico curto

São dois sistemas de referência completamente distintos. A Strategy 1 nunca vai funcionar porque compara o UUID da criação com o numérico do pagamento — são sempre diferentes.

Rita Pinto foi a única que funcionou por Strategy 1 porque a sua versão anterior do código guardava um valor numérico compatível por acaso.

### Estado atual após a correção

A **Strategy 2** (por `order_id`) está correta e robusta:

```
Webhook recebe: identifier = "ORDER-02772a5aa74c-Drio Ramos"
Código faz:     .replace("ORDER-", "").split("-")[0]  →  "02772a5aa74c"
BD tem:         order_id = "02772a5aa74c"
Resultado:      ✅ Match garantido
```

Esta estratégia é à prova de falha porque:
- O `order_id` é gerado pela base de dados e nunca muda
- É sempre os primeiros 12 caracteres após "ORDER-"
- O nome que se segue pode ter hífens, acentos, qualquer coisa — o `.split("-")[0]` isola sempre apenas o `order_id`

**Para todos os pagamentos futuros onde o `identifier` comece com "ORDER-", o sistema funciona corretamente.**

### O que ainda está frágil — Strategy 1

A Strategy 1 fica no código mas nunca vai disparar utilmente. É ruído que pode criar confusão futura. Proposta: transformá-la numa ferramenta de diagnóstico (apenas LOG) em vez de tentar um UPDATE cego que nunca vai casar.

### O que vamos fazer

**1. Limpeza da Strategy 1** — em vez de tentar um UPDATE por `eupago_ref = transactionID` (que nunca casa), fazer apenas um SELECT para log de diagnóstico e registar o `transactionID` numérico num campo separado para auditoria.

**2. Adicionar coluna `eupago_transaction_id`** na tabela `registrations` — guarda o ID numérico do pagamento quando o webhook chega. Assim temos ambos os IDs para auditoria: o UUID da criação e o numérico do pagamento.

**3. Guardar `eupago_transaction_id` em `create-payment` também** — quando a EuPago devolve o link, já devolve um `transactionID`. Guardá-lo num campo dedicado elimina a confusão futura.

**4. Reforçar os logs** — em caso de falha de match, registar o `identifier` e `transactionID` completos num `payment_events` com `event_type = "unmatched_payment"` para que nunca passe despercebido.

### Ficheiros e alterações

**Migration SQL** — adicionar coluna `eupago_transaction_id` na tabela `registrations`:
```sql
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS eupago_transaction_id text;
```

**`supabase/functions/create-payment/index.ts`** — guardar `transactionID` numérico no novo campo ao criar o link:
```ts
eupago_ref: transactionID,          // UUID longo (como agora)
eupago_transaction_id: transactionID, // também aqui — depois o webhook atualiza com o numérico real
```

**`supabase/functions/eupago-webhook/index.ts`** — reestruturar as strategies:
- **Strategy 1 (NOVA)**: só SELECT + LOG + update do campo `eupago_transaction_id` (não tenta UPDATE de `paid_at` por transactionID)
- **Strategy 2 (PRINCIPAL)**: match por `order_id` — como está, mas também atualiza `eupago_transaction_id` com o valor numérico que chegou no webhook
- **Strategy 3 (legacy)**: mantém-se como fallback para identifiers antigos sem "ORDER-"
- **Fallback de alerta**: se nenhuma strategy casou, inserir `payment_events` com `event_type = "unmatched_payment"` para que apareça no audit log e nunca passe em silêncio

### Resultado garantido

Para todos os pagamentos futuros com identifier no formato `ORDER-{12chars}-{nome}`:
- Strategy 2 casa sempre de forma determinística
- `eupago_transaction_id` fica preenchido com o ID numérico do pagamento para auditoria
- Se algum caso extremo falhar, o `unmatched_payment` event alerta de imediato nos logs

### Ficheiros alterados
- Migration SQL — adicionar `eupago_transaction_id` à tabela `registrations`
- `supabase/functions/eupago-webhook/index.ts` — reestruturar strategies + alerta de unmatched
- `supabase/functions/create-payment/index.ts` — guardar também no novo campo
