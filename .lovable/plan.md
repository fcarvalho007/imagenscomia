## Fix: EuPago 404 no Checkout + Validacao de Links + Identifier com Nome

---

### Causa Raiz

A BD confirma o bug: o `last_payment_link` guardado e `https://clientes.eupago.pt/api/extern/paybylink/form/703f98209b3a4265a5ca2400d12a120c`. Este URL esta a devolver 404 na EuPago (link expirado ou invalidado). O `resolve-payment` actual usa `HEAD` com `redirect: "follow"` (linha 93), que pode passar mesmo quando o GET real devolve 404.

---

### Alteracoes

#### 1. `supabase/functions/resolve-payment/index.ts`

**a) Substituir HEAD por GET com `redirect: "manual"**` (linhas 92-101):

```text
// ANTES (linha 93):
const res = await fetch(reg.last_payment_link, { method: "HEAD", redirect: "follow" });
if (res.status >= 200 && res.status < 400) { ... }

// DEPOIS:
const res = await fetch(reg.last_payment_link, { method: "GET", redirect: "manual" });
const isValid = [200, 301, 302, 303, 307, 308].includes(res.status);
```

**b) Adicionar loop de validacao + regeneracao (max 2 tentativas)**:

Apos obter o `redirect_url` (seja do DB ou regenerado), validar com GET antes de devolver ao frontend. Se 404/410, regenerar novo link via chamada directa a EuPago API (reutilizando a logica ja existente nas linhas 117-149). Maximo 2 regeneracoes.

**c) Novo status de resposta `error_link_invalid**`:

Se apos 2 tentativas o link continua invalido, responder:

```text
{ status: "error_link_invalid" }
```

Em vez de devolver um URL que vai dar 404.

**d) Logging detalhado**:

Em cada tentativa de validacao, logar:

```text
console.log(`[resolve-payment] validate: order_id=${order_id}, url=${url}, http_status=${status}, attempt=${n}, regenerated=${true/false}`);
```

E inserir em `message_logs` com o `error` field contendo: `http_status`, `attempts`, `final_status`.

---

#### 2. `supabase/functions/create-payment/index.ts`

**a) Melhorar logging da resposta EuPago** (linha 134):

```text
// ANTES:
console.log("EuPago full response:", JSON.stringify(data));

// DEPOIS (seguro, sem tokens):
console.log("EuPago response keys:", Object.keys(data));
console.log("EuPago response (safe):", JSON.stringify({
  transactionStatus: data.transactionStatus,
  url: data.url,
  redirectUrl: data.redirectUrl,
  paymentLink: data.paymentLink,
  payment_url: data.payment_url,
  reference: data.reference,
  transactionID: data.transactionID,
}));
```

**b) Identifier com nome da pessoa** (linha 117):

```text
// ANTES:
identifier: orderId ? `ORDER-${orderId}` : `${product.identifier}-${email}-${Date.now()}`

// DEPOIS:
identifier: orderId
  ? `ORDER-${orderId}-${(nome || "").replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 30)}`
  : `${product.identifier}-${Date.now()}`
```

Exemplo: `ORDER-cea36416128f-Frederico Carvalho` (visivel no painel EuPago).

O fallback tambem deixa de expor o email.

---

#### 3. `src/pages/Pagar.tsx`

**a) Adicionar `ErrorType = "link_invalid"**` e tratar `data.status === "error_link_invalid"`:

Novo bloco no handler da resposta (apos linha 66):

```text
if (data.status === "error_link_invalid") {
  setStatus("error");
  setErrorType("link_invalid");
  return;
}
```

**b) Mensagem de erro para `link_invalid**`:

```text
link_invalid: {
  title: "Nao foi possivel abrir o checkout",
  subtitle: "O link de pagamento nao esta disponivel de momento. Tente novamente ou fale connosco.",
}
```

Com botoes "Tentar novamente" + WhatsApp (igual ao cenario `network`).  


1. Validação com GET: adicionar timeout + tratar 5xx/403/401 como erro recuperável.
2. Logging: garantir `registration_id` e guardar `error` como string JSON.
3. Identifier: evitar nome completo; usar versão reduzida (ou manter só `ORDER-{orderId}`).

---

### Ficheiros a alterar


| Ficheiro                                      | Accao                                                                                   |
| --------------------------------------------- | --------------------------------------------------------------------------------------- |
| `supabase/functions/resolve-payment/index.ts` | GET em vez de HEAD + loop validacao/regeneracao + status `error_link_invalid` + logging |
| `supabase/functions/create-payment/index.ts`  | Logging seguro + identifier com nome                                                    |
| `src/pages/Pagar.tsx`                         | Tratar `error_link_invalid` + novo ErrorType                                            |
