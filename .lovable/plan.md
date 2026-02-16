

## Confirmacao pos-pagamento: Email ao cliente + Thank You Page

### Resumo

Dois entregaveis: (1) email automatico ao cliente no webhook apos paid_at, com idempotencia; (2) nova pagina /upgrade/sucesso que valida rid+token e mostra estado correcto.

### Ficheiros

| Ficheiro | Accao |
|----------|-------|
| `supabase/functions/eupago-webhook/index.ts` | Adicionar envio de email `payment_confirmed_customer` ao cliente (idempotente) |
| `src/pages/UpgradeSucesso.tsx` | Nova pagina thank you com validacao rid+token |
| `src/App.tsx` | Registar rota `/upgrade/sucesso` |
| `src/pages/Upsell.tsx` | Nenhuma alteracao (o redirect para /upgrade/sucesso vem do retorno EuPago ou e feito manualmente pelo cliente) |

---

### 1. Email ao cliente -- payment_confirmed_customer

No `eupago-webhook/index.ts`, apos o bloco existente de invoice_notification (linha ~245), adicionar novo bloco idempotente:

```text
// ── Email ao cliente: payment_confirmed_customer ──
try {
  const { data: customerEmailSent } = await supabase
    .from("message_logs")
    .select("id")
    .eq("registration_id", matchedRegId)
    .eq("template_key", "payment_confirmed_customer")
    .eq("status", "sent")
    .limit(1);

  if (customerEmailSent && customerEmailSent.length > 0) {
    console.log("📧 Customer confirmation already sent — skipping");
  } else {
    // reg e planLabel ja estao definidos no bloco anterior
    const eupagoRefDisplay = transactionID || reference || reg.eupago_ref || "N/A";
    const primaryAccessUrl = "https://imagenscomia.lovable.app/live";
    const whatsappUrl = "https://wa.me/351915015508?text=Preciso%20de%20ajuda%20com%20a%20minha%20inscri%C3%A7%C3%A3o";

    const customerSubject = "Pagamento confirmado — obrigado pela confiança";
    const customerHtml = `<h2>Pagamento confirmado</h2>
      <p>Agradece-se a confiança. O pagamento foi confirmado e a inscrição está garantida.</p>
      <hr/>
      <p><strong>Resumo</strong></p>
      <ul>
        <li><strong>Plano:</strong> ${planLabel}</li>
        <li><strong>Referência:</strong> ${eupagoRefDisplay}</li>
        <li><strong>Email associado:</strong> ${reg.email}</li>
      </ul>
      <p><strong>Próximo passo</strong></p>
      <p><a href="${primaryAccessUrl}" style="display:inline-block;padding:12px 16px;border-radius:10px;background:#0ea5e9;color:#ffffff;text-decoration:none;">Aceder / Preparar participação</a></p>
      <p style="font-size:13px;color:#64748b;">Se o botão não abrir, usar este link: ${primaryAccessUrl}</p>
      <hr/>
      <p><strong>Faturação</strong></p>
      <p>A fatura será emitida e enviada posteriormente para o email indicado nos dados de faturação.</p>
      <p><strong>Suporte</strong></p>
      <p>Se for necessária ajuda, contacto directo via WhatsApp: <a href="${whatsappUrl}">+351 915 015 508</a></p>
      <p>Com os melhores cumprimentos,<br/>Frederico Carvalho</p>`;

    const customerRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Frederico Carvalho <frederico.carvalho@digitalfc.pt>",
        to: [reg.email],
        subject: customerSubject,
        html: customerHtml,
      }),
    });
    const customerData = await customerRes.json();

    await supabase.from("message_logs").insert({
      registration_id: matchedRegId,
      channel: "email",
      provider: "resend",
      template_key: "payment_confirmed_customer",
      status: customerRes.ok ? "sent" : "failed",
      provider_message_id: customerData.id || null,
      payment_url: null,
      error: customerRes.ok ? null : JSON.stringify(customerData),
    });

    console.log(`📧 Customer confirmation ${customerRes.ok ? "sent" : "FAILED"} to ${reg.email}`);
  }
} catch (custErr) {
  console.error("Customer email error (non-blocking):", custErr);
}
```

**Notas tecnicas:**
- Reutiliza `reg`, `planLabel` e `RESEND_API_KEY` ja disponiveis no scope
- From: `Frederico Carvalho <frederico.carvalho@digitalfc.pt>` (identidade existente)
- Nao-bloqueante: falha nao afecta resposta 200 do webhook
- Idempotencia via message_logs (template_key + status='sent')

### 2. Thank You Page -- /upgrade/sucesso

Nova pagina `src/pages/UpgradeSucesso.tsx`.

**Parametros URL:** `?rid={registration_id}&t={edit_token}`

**Logica ao montar:**
1. Ler `rid` e `t` da querystring
2. Se faltarem: mostrar estado "invalido" com link suporte
3. Fazer SELECT de registrations WHERE id = rid AND edit_token = t
4. Se nao encontrar: mostrar "Nao foi possivel validar a inscricao" + WhatsApp
5. Se encontrar mas `paid_at` for null: mostrar "A confirmar pagamento..." com botao "Recarregar" + polling a cada 5s (maximo 12 tentativas = 60s)
6. Se `paid_at` existe: mostrar pagina completa

**UI (estado confirmado):**
- Card centrado (mesmo estilo da pagina /confirmacao existente)
- Icone check animado (verde, framer-motion scale)
- Titulo: "Pagamento confirmado"
- Subtitulo: "Inscricao garantida."
- Seccao "O que acontece agora" (3 itens):
  1. "Foi enviado um email de confirmacao para: {email}."
  2. "Recomenda-se adicionar ao calendario."
  3. "Suporte directo via WhatsApp: +351 915 015 508"
- CTA principal: componente WebinarCalendarButton (ja existente)
- Texto faturacao: "A fatura sera emitida e enviada posteriormente para o email indicado nos dados de faturacao."
- Fallback: "Se nao receber o email nos proximos minutos, verificar Spam/Promocoes."
- Link "Voltar ao site" (para /)
- Contacto: frederico@digitalfc.pt

**UI (estado "a confirmar"):**
- Mesmo card mas com Loader2 animado
- Titulo: "A confirmar pagamento..."
- Subtitulo: "O pagamento esta a ser processado. Esta pagina actualiza-se automaticamente."
- Botao "Recarregar" manual
- Link WhatsApp para suporte

**UI (estado invalido):**
- Card simples com icone XCircle
- "Nao foi possivel validar a inscricao."
- Link WhatsApp para suporte

### 3. Rota no App.tsx

Adicionar antes do catch-all:

```text
import UpgradeSucesso from "./pages/UpgradeSucesso";
// ...
<Route path="/upgrade/sucesso" element={<UpgradeSucesso />} />
```

### 4. Ligacao de fluxo

O redirect para /upgrade/sucesso acontece de duas formas:

**A) Callback EuPago (backurl):** A funcao `create-payment` ja envia `backurl` a EuPago. Actualmente aponta para `/confirmacao`. Alterar para `/upgrade/sucesso?rid={regId}&t={editToken}`.

Para isto, no `create-payment/index.ts`, o backurl precisa incluir rid e token. Verificar se a funcao ja tem acesso ao registration_id e edit_token -- se sim, incluir na URL. Se nao, adicionar lookup.

**B) Acesso directo:** O utilizador pode aceder manualmente a /upgrade/sucesso?rid=...&t=... (link no email de confirmacao).

**Nota:** Para manter o plano simples e nao alterar o create-payment (que e critico), a pagina /upgrade/sucesso tambem aceita `?email={email}` como fallback -- faz lookup por email, valida edit_token, e mostra o estado.

### O que NAO muda

- Logica de precos, create-payment, EuPago redirect
- Webhook idempotency de payment_events
- Invoice notification (staff email) -- ja implementado
- Follow-up automatico
- Pagina /confirmacao existente (continua a funcionar como fallback)

### Fluxo resumido

```text
EuPago webhook (paid_at)
  |
  +-- Invoice email para staff (ja existe)
  |
  +-- Email ao CLIENTE (NOVO)
  |     template_key: payment_confirmed_customer
  |     idempotente via message_logs
  |
  v
Cliente regressa ao site (backurl ou link no email)
  |
  v
/upgrade/sucesso?rid=...&t=...
  |
  +-- Valida rid + edit_token
  +-- Se paid_at: mostra confirmacao + calendario + faturacao
  +-- Se !paid_at: mostra "A confirmar..." + polling 5s
  +-- Se invalido: mostra erro + WhatsApp
```

