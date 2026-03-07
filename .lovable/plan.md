

# Refinamentos identificados

Após análise completa do fluxo (`/fatura`, `InvoiceForm`, `send-invoice-request`, `invoice-upsert`), aqui estão os pontos a melhorar:

---

## 1. Página `/fatura` — copy inconsistente com o email

O email usa tom pessoal do Frederico e evita "tu/você" quando possível, mas a página `/fatura` ainda usa "tua fatura", "preencheres", "encontras". Deve alinhar o copy:

- **Sem parâmetros (linha 22):** `"preencheres os dados necessários para a emissão da tua fatura"` → reformular de forma neutra
- **Sem parâmetros (linha 27):** `"Se não o encontras"` → `"Caso não encontre o email"`
- **Com parâmetros (linha 41):** `"Preenche os dados abaixo para podermos emitir a tua fatura."` → reformular
- **Mensagem de sucesso (linha 52):** `"Podes fechar esta página"` → `"Pode fechar esta página"` ou impessoal

## 2. `InvoiceForm` — subtítulo desajustado para `/fatura`

A linha 242 diz `"Preencher antes de confirmar o pagamento."` — isto faz sentido no contexto de checkout, mas na página `/fatura` o pagamento já foi feito. Deve ser condicional ou removido quando usado no contexto `/fatura`.

**Solução:** Aceitar uma prop `context?: "checkout" | "standalone"` no `InvoiceForm` e esconder o subtítulo quando `standalone`.

## 3. Sem notificação ao Frederico

Quando alguém preenche os dados na `/fatura`, o `invoice-upsert` guarda e emite a fatura automaticamente, mas o Frederico não recebe nenhuma notificação. Útil para acompanhar quem já preencheu.

**Solução:** No final do `invoice-upsert`, após upsert bem-sucedido, enviar um email curto de notificação para `fredericodigital@gmail.com` com o nome, NIF e se a fatura foi auto-emitida.

## 4. Sem log de `invoice_request_sent` na timeline

O `send-invoice-request` envia o email mas não regista na tabela `email_logs` (ou equivalente), pelo que não aparece na timeline do CRM. Deveria registar com `template_key: "invoice_request"`.

**Solução:** Após cada envio bem-sucedido, inserir um registo em `email_logs` com o `registration_id` e `template_key`.

---

## Resumo de ficheiros a alterar

| Ficheiro | Alteração |
|---|---|
| `src/pages/Fatura.tsx` | Alinhar copy com tom neutro/pessoal do email |
| `src/components/upgrade/InvoiceForm.tsx` | Prop `context` para esconder subtítulo "antes de confirmar pagamento" |
| `supabase/functions/invoice-upsert/index.ts` | Enviar notificação ao Frederico após preenchimento |
| `supabase/functions/send-invoice-request/index.ts` | Registar envio em `email_logs` |
| `src/components/crm/templateLabels.ts` | Adicionar label `invoice_request` |

