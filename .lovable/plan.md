

## Robustez Final de Faturacao: Seguranca + Idempotencia + UX

### Resumo

Quatro blocos: (A) seguranca via edge function invoice-upsert com edit_token, removendo escrita directa do frontend; (B) idempotencia do email invoice_notification no webhook + fallback para dados em falta; (C) melhorias UX no formulario (autocomplete, aria, estados de save com erro); (D) badge + botao copiar no CRM.

### Ficheiros Alterados

| Ficheiro | Accao |
|----------|-------|
| DB migration | Adicionar `edit_token` + `edit_token_created_at` a registrations; remover policies INSERT/UPDATE de invoice_details |
| `supabase/functions/invoice-upsert/index.ts` | Novo — valida edit_token, faz upsert server-side |
| `supabase/functions/register-free/index.ts` | Gerar edit_token ao criar registo |
| `src/components/upgrade/InvoiceForm.tsx` | Chamar invoice-upsert em vez de upsert directo; adicionar autocomplete + aria; estados de erro no save |
| `src/pages/Upsell.tsx` | Passar edit_token (da querystring ou recuperado do DB) ao InvoiceForm |
| `supabase/functions/eupago-webhook/index.ts` | Adicionar check idempotencia antes de enviar email; fallback "dados em falta" |
| `src/components/crm/InscritoModal.tsx` | Badge "Completo"/"Em falta" + botao "Copiar dados faturacao" |
| `supabase/config.toml` | Registar invoice-upsert com verify_jwt = false |

---

### A. Seguranca — edit_token + Edge Function

**1. DB Migration**

```sql
-- Add edit_token to registrations
ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS edit_token text,
  ADD COLUMN IF NOT EXISTS edit_token_created_at timestamptz;

-- Remove permissive INSERT/UPDATE on invoice_details (keep SELECT for CRM reads)
DROP POLICY IF EXISTS "allow_anon_insert_invoice_details" ON invoice_details;
DROP POLICY IF EXISTS "allow_anon_update_invoice_details" ON invoice_details;
```

Apos isto, apenas o service_role (edge functions, webhook) consegue escrever em invoice_details. O SELECT anon permanece para o CRM poder ler.

**2. register-free/index.ts — Gerar edit_token**

Ao criar o registo, gerar um token aleatorio de 32 chars e guardar em `edit_token` + `edit_token_created_at`:

```text
const editToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 8);
// ... insert into registrations with edit_token: editToken, edit_token_created_at: new Date().toISOString()
```

O token e devolvido na resposta para o frontend guardar e passar via querystring ao /upgrade.

**3. Upsell.tsx — Receber e propagar edit_token**

- Ler `t` da querystring (`searchParams.get("t")`)
- No recovery flow, o edit_token e devolvido pelo select de registrations
- Passar `editToken` + `registrationId` como props ao StepConfirmation/InvoiceForm

**4. supabase/functions/invoice-upsert/index.ts — Nova edge function**

```text
POST { registration_id, edit_token, payload: { invoice_name, invoice_vat, ... } }

1. Validar campos com zod (mesma schema do frontend)
2. SELECT registrations WHERE id = registration_id AND edit_token = edit_token
3. Se nao encontrar ou token expirado (>30 dias): return 401
4. UPSERT invoice_details com service_role
5. Return 200 { success: true }
```

**5. InvoiceForm.tsx — Usar edge function**

Substituir os `supabase.from("invoice_details").upsert(...)` por `supabase.functions.invoke("invoice-upsert", { body: { registration_id, edit_token, payload } })`.

O autosave debounce continua igual, apenas o destino muda de upsert directo para edge function.

### B. Idempotencia do Email no Webhook

**eupago-webhook/index.ts** — Antes de enviar o email invoice_notification:

```text
// 1. Check if already sent
const { data: alreadySent } = await supabase
  .from("message_logs")
  .select("id")
  .eq("registration_id", matchedRegId)
  .eq("template_key", "invoice_notification")
  .eq("status", "sent")
  .limit(1);

if (alreadySent && alreadySent.length > 0) {
  console.log("Invoice notification already sent — skipping");
  // skip sending
}
```

**Fallback para dados em falta:**

Se `invoice` for null apos o lookup:

```text
// Send "missing details" notification
const subject = `FATURA -- DADOS EM FALTA -- ${reg.email} -- ${planLabel}`;
const htmlBody = `<h2>Pagamento confirmado — dados de faturacao em falta</h2>
  <p><strong>Cliente:</strong> ${reg.name} (${reg.email})</p>
  <p><strong>Produto:</strong> ${planLabel}</p>
  <p><strong>Total:</strong> ${totalVal} EUR</p>
  <p><strong>Ref EuPago:</strong> ${transactionID || reference}</p>
  <hr/>
  <p><strong>Dados de faturacao nao recolhidos.</strong> Solicitar ao cliente.</p>`;

// Send + log with template_key = "invoice_notification_missing_details"
```

### C. UX/UI — InvoiceForm Melhorias

**1. Autocomplete nos inputs:**

```text
invoice_name    -> autocomplete="organization"
invoice_address -> autocomplete="street-address"
invoice_zip     -> autocomplete="postal-code"
invoice_city    -> autocomplete="address-level2"
invoice_email   -> autocomplete="email"
```

**2. Acessibilidade (aria):**

Cada input recebe `aria-invalid={touched && hasError}` e `aria-describedby="err-{key}"`. A mensagem de erro recebe `id="err-{key}"`.

**3. Estados de autosave com erro:**

Adicionar estado `saveError` (boolean). Se o upsert via edge function falhar:
- Mostrar "Falha ao guardar. Tentar novamente." em vermelho no header do card
- Manter o CTA "Confirmar e pagar" disabled enquanto `saveError` for true
- Retry automatico no proximo onChange

O CTA fica disabled quando: `!invoiceValid || saving || saveError`.

### D. CRM — Badge + Copiar

**InvoiceSection no InscritoModal:**

1. Badge junto ao titulo "Faturacao":
   - Se dados existem: badge verde "Completo"
   - Se nao existem: badge vermelho "Em falta"

2. Botao "Copiar dados faturacao":
   - Copia bloco formatado para clipboard:
   ```text
   Nome/Empresa: {invoice_name}
   NIF: {invoice_vat}
   Morada: {invoice_address}
   CP: {invoice_zip} {invoice_city}
   Email fatura: {invoice_email}
   ```
   - Feedback "Copiado!" com fade-out 2s

### O que NAO muda

- Logica de pagamentos EuPago (create-payment, precos, redirect)
- Fluxo de follow-up automatico/manual e idempotencia dos stages
- Templates de email existentes
- Webhook idempotency para payment_events (duplo webhook)
- Botao "Gerar link de pagamento" no CRM (Gmail)

### Fluxo resumido

```text
register-free -> gera edit_token -> devolve ao frontend
    |
    v
/upgrade?email=...&t={edit_token}
    |
    v
Step 5: InvoiceForm
  - valida campos (zod client-side)
  - autosave via POST invoice-upsert (com edit_token)
  - CTA disabled ate valido + ultimo save OK
    |
    v
CTA "Confirmar e pagar"
  - save final via invoice-upsert
  - create-payment -> EuPago redirect
    |
    v
eupago-webhook (paid_at)
  - check message_logs idempotencia
  - se invoice_details existe: email completo
  - se nao existe: email "dados em falta"
  - registar em message_logs
```

