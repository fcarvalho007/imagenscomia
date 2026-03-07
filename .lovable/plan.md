

# Personalizar mensagem do email da Fatura-Recibo

## Viabilidade — Confirmada ✅

O InvoiceExpress suporta corpo de email personalizado no endpoint `email-document`. O sistema já envia o **subject** e **body** como parâmetros — o PDF da fatura vai automaticamente em anexo. Não é enviado nenhum email separado; a mensagem acompanha directamente o documento via InvoiceExpress.

## Alteração

Actualizar o texto default do corpo do email em **2 locais**:

### 1. `src/components/crm/faturacao/InvoiceTable.tsx` (linha 44)

Alterar o `DEFAULT_EMAIL_BODY` para uma mensagem calorosa em PT-PT que contextualiza o pagamento e identifica a empresa:

```
Olá,

Segue em anexo a sua fatura-recibo referente ao serviço subscrito.

Muito obrigado pela confiança! Este documento foi emitido pela Fomentar Sonhos, Lda. — a empresa por detrás das formações do Frederico Carvalho.

Se tiver qualquer questão, não hesite em responder a este email.

Com os melhores cumprimentos,
Frederico Carvalho
Fomentar Sonhos
```

### 2. `supabase/functions/create-invoice/index.ts` (linha 222)

Actualizar o fallback hardcoded com o mesmo texto, para que a edge function use esta mensagem quando não recebe `email_body` do frontend.

### 3. `supabase/functions/bulk-finalize-invoices/index.ts` e `bulk-emit-invoices/index.ts`

Actualizar o mesmo fallback nestas duas functions para consistência.

O campo continua editável no CRM antes do envio — esta alteração muda apenas o texto pré-preenchido.

## Ficheiros alterados (4)
- `src/components/crm/faturacao/InvoiceTable.tsx` — novo default body
- `supabase/functions/create-invoice/index.ts` — fallback body
- `supabase/functions/bulk-finalize-invoices/index.ts` — fallback body
- `supabase/functions/bulk-emit-invoices/index.ts` — fallback body

