

# Correcao: identificador de pagamento sem informacao do cliente

## Problema diagnosticado

1. **Pagamento orfao**: O pagamento de 76,26 EUR (txID: 106795053, ref: 62556563) esta registado como `unmatched_payment` na tabela `payment_events`. Nenhuma das 3 estrategias do webhook conseguiu reconciliar.

2. **Causa raiz**: A funcao `create-payment` tem um fallback no identificador (linha 151-153):

```text
identifier: orderId
  ? `ORDER-${orderId}-${nome}`
  : `${product.identifier}-${Date.now()}`
```

Quando o lookup do email falha (ex: plano "bundle" procura webinar "imagens" mas o inscrito so tem registo "video"), nao ha `orderId` e o identificador gerado e `WEBINAR-BUNDLE-{timestamp}` — sem qualquer referencia ao cliente.

3. **Porque o lookup falhou**: O plano "bundle" (sem prefixo "video-") faz `webinar = "imagens"` (linha 80). Se o inscrito so tem registo no webinar "video", a query nao encontra nada.

## Identificar quem pagou (acao manual)

Verificar no painel da EuPago qual email esta associado a transacao **106795053** (referencia 62556563). Depois reconciliar manualmente na BD.

## Correcoes no codigo

### Ficheiro 1: `supabase/functions/create-payment/index.ts`

**Alteracao A** — Incluir SEMPRE o email no identificador, mesmo no fallback (linhas 151-153):

```text
// ANTES:
identifier: orderId
  ? `ORDER-${orderId}-${(nome || "").replace(/[^a-zA-Z0-9 ]/g, "").trim().slice(0, 30)}`
  : `${product.identifier}-${Date.now()}`,

// DEPOIS:
identifier: orderId
  ? `ORDER-${orderId}-${(nome || "").replace(/[^a-zA-Z0-9 ]/g, "").trim().slice(0, 30)}`
  : `${product.identifier}-${(email || "no-email").replace(/[^a-zA-Z0-9@._-]/g, "").slice(0, 60)}-${Date.now()}`,
```

Isto garante que mesmo sem order_id, o identificador contem o email para reconciliacao manual e automatica.

**Alteracao B** — Tentar lookup sem filtro de webinar como fallback (apos linha 135):

```text
// Se o primeiro lookup falhou, tentar sem filtro de webinar
if (!regId && email) {
  const { data: regFallback } = await supabase
    .from("registrations")
    .select("id, edit_token, order_id")
    .eq("email", email.toLowerCase().trim())
    .is("paid_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (regFallback) {
    regId = regFallback.id;
    editToken = regFallback.edit_token || "";
    orderId = regFallback.order_id || "";
  }
}
```

Assim, se o inscrito tem registo "video" mas o plano e "bundle", o sistema ainda encontra o order_id.

### Ficheiro 2: `supabase/functions/eupago-webhook/index.ts`

**Alteracao** — Adicionar Strategy 3b antes do fallback (apos linha 399): extrair email do identificador no formato `WEBINAR-{PLAN}-{email}-{timestamp}`:

```text
// Strategy 3b: extract email from new fallback format WEBINAR-{PLAN}-{email}-{timestamp}
if (!matched && identifier && identifier.startsWith("WEBINAR-")) {
  const parts = identifier.split("-");
  // Format: WEBINAR-{PLAN}-{email}-{timestamp}
  // Email is between the second and last segment
  if (parts.length >= 4) {
    const possibleEmail = parts.slice(2, -1).join("-");
    if (possibleEmail.includes("@")) {
      console.log(`Strategy 3b: extracted email="${possibleEmail}" from identifier`);
      const { data: fallbackReg } = await supabase
        .from("registrations")
        .select("id, email, webinar")
        .eq("email", possibleEmail)
        .is("paid_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fallbackReg) {
        const { data: updatedRows, error } = await supabase
          .from("registrations")
          .update({
            paid_at: new Date().toISOString(),
            eupago_ref: reference || transactionID,
            eupago_transaction_id: transactionID || null,
          })
          .eq("id", fallbackReg.id)
          .select("id, email");

        if (!error && updatedRows?.length) {
          matched = true;
          matchedRegId = updatedRows[0].id;
          console.log(`Strategy 3b: matched by email=${possibleEmail}`);
        }
      }
    }
  }
}
```

## Ficheiros alterados

| Ficheiro | Alteracao |
|---|---|
| `supabase/functions/create-payment/index.ts` | Incluir email no fallback identifier + lookup sem filtro webinar |
| `supabase/functions/eupago-webhook/index.ts` | Adicionar Strategy 3b para extrair email do novo formato |

## Reconciliacao imediata

Apos identificar o email no painel EuPago, executar manualmente:

```sql
UPDATE registrations
SET paid_at = '2026-03-01T14:28:23Z',
    eupago_ref = '62556563',
    eupago_transaction_id = '106795053',
    plan_selected = 'video-bundle'
WHERE email = '{EMAIL_DO_CLIENTE}'
  AND webinar = 'video'
  AND paid_at IS NULL;
```

