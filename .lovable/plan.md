

## Correcao: Campo de resposta da EuPago incorreto

### Problema

A funcao `create-payment` recebe resposta de sucesso da EuPago (status 200, `transactionStatus: "Success"`), mas os nomes dos campos na resposta JSON sao diferentes do que o codigo espera:
- O codigo procura `data.paymentLink` e `data.reference`
- A EuPago provavelmente devolve campos com nomes diferentes (ex: `url`, `redirectUrl`, `payment_url`)
- Como os campos nao existem, `JSON.stringify` omite-os e devolve `{}` ao cliente
- O cliente ve "Link de pagamento nao recebido"

### Solucao (2 passos)

**Passo 1 - Adicionar logging completo da resposta EuPago**

Modificar `supabase/functions/create-payment/index.ts` para registar a resposta completa da API antes de extrair campos:

```typescript
const data = await eupagoResponse.json();
console.log("EuPago full response:", JSON.stringify(data));
```

Isto permite ver os nomes exactos dos campos na resposta.

**Passo 2 - Corrigir o mapeamento dos campos**

Depois de confirmar os nomes dos campos, actualizar a linha de retorno para usar os campos correctos. Provavelmente a resposta usa campos como `url` ou `redirectUrl` em vez de `paymentLink`:

```typescript
return new Response(
  JSON.stringify({
    paymentLink: data.url || data.redirectUrl || data.paymentLink,
    reference: data.reference || data.referencia
  }),
  ...
);
```

### Alteracoes tecnicas

| Ficheiro | Alteracao |
|---|---|
| `supabase/functions/create-payment/index.ts` | Adicionar `console.log` da resposta completa + corrigir nomes dos campos de resposta |

### Verificacao

Apos o deploy, testar o fluxo de pagamento para confirmar que o link EuPago e devolvido correctamente e o redirect funciona.

