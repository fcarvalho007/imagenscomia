

## Dados de Faturacao Obrigatorios no /upgrade + Email Automatico pos-pagamento

### Resumo

Recolher dados de faturacao (Nome/Empresa, NIF, Morada, CP, Localidade, Email) no Step 5 antes de permitir pagamento. Apos confirmacao de pagamento (webhook), enviar automaticamente email com todos os dados para info@fredericocarvalho.pt. Mostrar dados no CRM (read-only).

### Ficheiros Alterados

| Ficheiro | Accao |
|----------|-------|
| DB migration | Criar tabela `invoice_details` |
| `src/components/upgrade/StepConfirmation.tsx` | Adicionar formulario de faturacao com validacao PT + autosave + bloquear CTA ate valido |
| `src/pages/Upsell.tsx` | Passar `userEmail` ao StepConfirmation para pre-preencher e gravar invoice_details |
| `supabase/functions/eupago-webhook/index.ts` | Apos `paid_at`, ler invoice_details e enviar email via Resend para info@fredericocarvalho.pt + registar em message_logs |
| `src/components/crm/InscritoModal.tsx` | Adicionar seccao "Faturacao" read-only |

---

### 1. DB Migration -- Tabela `invoice_details`

```sql
CREATE TABLE invoice_details (
  registration_id uuid PRIMARY KEY REFERENCES registrations(id) ON DELETE CASCADE,
  invoice_name text NOT NULL,
  invoice_vat text NOT NULL,
  invoice_address text NOT NULL,
  invoice_zip text NOT NULL,
  invoice_city text NOT NULL,
  invoice_email text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE invoice_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anon_select_invoice_details" ON invoice_details FOR SELECT USING (true);
CREATE POLICY "allow_anon_insert_invoice_details" ON invoice_details FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_anon_update_invoice_details" ON invoice_details FOR UPDATE USING (true) WITH CHECK (true);
```

### 2. StepConfirmation.tsx -- Formulario de faturacao

Dentro do `VariantPayment`, ANTES do bloco de resumo (blue-50 card), adicionar:

**Card "Dados para fatura (obrigatorio)":**
- Fundo `bg-surface` / `border border-border` / `rounded-xl p-5`
- Titulo: "Dados para fatura" com badge "(obrigatorio)" em vermelho discreto
- Subtitulo: "Preencher antes de confirmar o pagamento."
- 6 campos com layout: 1 coluna mobile, 2 colunas desktop (`grid grid-cols-1 sm:grid-cols-2 gap-3`)
- Cada campo: label + input + mensagem de erro inline (vermelho, 12px)
- Autosave com debounce 600ms (upsert em invoice_details via supabase client)
- Micro-indicador "Guardado" discreto (verde, fade-out apos 2s)

**Campos e validacoes (zod schema):**

```text
invoice_name: string, trim, min 2 chars -> "Indicar nome ou empresa."
invoice_vat: string, regex /^\d{9}$/ -> "NIF invalido. Deve ter 9 digitos."
invoice_address: string, trim, min 5 chars -> "Indicar morada completa."
invoice_zip: string, regex /^\d{4}-\d{3}$/ -> "Codigo postal invalido. Ex.: 1100-420"
invoice_city: string, trim, min 2 chars -> "Indicar localidade."
invoice_email: string, email -> "Email invalido."
```

**Comportamento do CTA:**
- Botao "Confirmar e pagar" fica `disabled` ate todos os campos passarem validacao
- Quando disabled, mostra microcopy: "Preencha os dados de faturacao para continuar"
- Ao clicar (quando habilitado), faz upsert final dos dados antes de chamar `onPay`

**Pre-preenchimento:**
- `invoice_email` = email do inscrito (prop `userEmail`)
- Ao montar, fazer `select` de invoice_details pelo registration_id (lookup por email -> registrations.id -> invoice_details); se existir, pre-preencher todos os campos

**Auto-format (nao intrusivo):**
- NIF: remover tudo que nao seja digito ao sair do campo (onBlur)
- CP: se o utilizador escrever "1234567", formatar para "1234-567" no onBlur

### 3. Upsell.tsx -- Passar dados ao StepConfirmation

- Adicionar prop `userEmail` ao `StepConfirmation` (valor: `userData.email`)
- No `handlePayment`, antes de invocar `create-payment`, fazer upsert final dos invoice_details (garantia server-side)
- O `handlePayment` ja recebe o `plan` do StepConfirmation; nao muda a logica EuPago

### 4. eupago-webhook/index.ts -- Email automatico pos-pagamento

Apos a linha que marca `paid_at` e regista `payment_confirmed` (linha ~143), adicionar:

```text
// Send invoice notification email
if (matched && matchedRegId) {
  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    // Fetch invoice_details
    const { data: invoice } = await supabase
      .from("invoice_details")
      .select("*")
      .eq("registration_id", matchedRegId)
      .maybeSingle();

    // Fetch registration for context
    const { data: reg } = await supabase
      .from("registrations")
      .select("email, name, plan_selected, eupago_ref")
      .eq("id", matchedRegId)
      .maybeSingle();

    if (invoice && reg && RESEND_API_KEY) {
      const planLabel = { premium: "Premium Pass", masterclass: "Masterclass IA", bundle: "Premium + Masterclass" }[reg.plan_selected] || reg.plan_selected;
      const totalMap = { premium: "18,45", masterclass: "57,81", bundle: "76,26" };
      const total = totalMap[reg.plan_selected] || amount;

      const subject = `FATURA -- ${planLabel} -- ${invoice.invoice_name} -- ${total}EUR`;
      const body = `<h2>Novo pagamento confirmado</h2>
        <p><strong>Cliente:</strong> ${reg.name} (${reg.email})</p>
        <p><strong>Produto:</strong> ${planLabel}</p>
        <p><strong>Total (c/ IVA):</strong> ${total} EUR</p>
        <p><strong>Data/hora:</strong> ${new Date().toISOString()}</p>
        <p><strong>Ref EuPago:</strong> ${transactionID || reference}</p>
        <hr/>
        <h3>Dados de faturacao</h3>
        <p><strong>Nome/Empresa:</strong> ${invoice.invoice_name}</p>
        <p><strong>NIF:</strong> ${invoice.invoice_vat}</p>
        <p><strong>Morada:</strong> ${invoice.invoice_address}</p>
        <p><strong>CP:</strong> ${invoice.invoice_zip} ${invoice.invoice_city}</p>
        <p><strong>Email fatura:</strong> ${invoice.invoice_email}</p>`;

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Webinar IA <noreply@fredericocarvalho.pt>",
          to: ["info@fredericocarvalho.pt"],
          subject,
          html: body,
        }),
      });
      const resendData = await resendRes.json();

      // Log to message_logs
      await supabase.from("message_logs").insert({
        registration_id: matchedRegId,
        channel: "email",
        provider: "resend",
        template_key: "invoice_notification",
        status: resendRes.ok ? "sent" : "failed",
        provider_message_id: resendData.id || null,
        payment_url: null,
        error: resendRes.ok ? null : JSON.stringify(resendData),
      });
    }
  } catch (invoiceErr) {
    console.error("Invoice email error (non-blocking):", invoiceErr);
  }
}
```

Este bloco e nao-bloqueante: se falhar, o webhook continua a devolver 200.

### 5. InscritoModal.tsx -- Seccao "Faturacao" read-only

No separador "Detalhes" (ou no painel direito), adicionar seccao condicional:

- Titulo: "Faturacao"
- Fetch de `invoice_details` pelo `registration_id` (quando modal abre)
- Se existir: mostrar os 6 campos em formato read-only (label + valor)
- Se nao existir: mostrar "Sem dados de faturacao"
- Sem botao "Editar" (simplificacao; os dados sao editados pelo cliente no /upgrade)

### O que NAO muda

- Logica de pagamentos EuPago (create-payment, idempotencia)
- Fluxo de follow-up automatico e manual
- Templates de email existentes
- Valores/precos
- Webhook idempotency (payment_events)

### Fluxo resumido

```text
Step 5 (VariantPayment)
  |
  v
[Formulario faturacao] -- validacao zod + autosave debounce
  |
  v
[CTA "Confirmar e pagar"] -- disabled ate valido
  |
  v
upsert final invoice_details -> create-payment -> EuPago redirect
  |
  v
[Webhook] paid_at = now()
  |
  v
Ler invoice_details -> Enviar email Resend -> info@fredericocarvalho.pt
  |
  v
Registar em message_logs (template_key='invoice_notification')
```

