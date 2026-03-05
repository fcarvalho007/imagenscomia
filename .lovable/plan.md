

# Adicionar dados de faturação ao /comprar + estratégia para quem já pagou sem dados

## Problema
A página `/comprar` (via `PurchaseModal`) envia o utilizador directamente para o EuPago sem recolher dados de faturação. O fluxo `/upgrade-video` já usa o componente `InvoiceForm` no step de checkout.

## Passo 1 — Integrar InvoiceForm no PurchaseModal

**Ficheiro:** `src/components/webinar/PurchaseModal.tsx`

Alterações:
- Após o utilizador preencher nome/email e antes do botão "Confirmar e pagar", inserir o componente `<InvoiceForm>` (já existente em `src/components/upgrade/InvoiceForm.tsx`)
- O `InvoiceForm` faz auto-save via edge function `invoice-upsert` com debounce de 600ms
- Desabilitar o botão "Confirmar e pagar" até `InvoiceForm` reportar `onValidChange(true)`
- Passar `userEmail={email}` para o InvoiceForm fazer lookup automático do `registration_id` + `edit_token`
- Ajuste: como o `register-free` é chamado no submit, precisamos chamá-lo primeiro (on blur do email ou ao abrir o invoice form) para que exista um `registration_id` antes do InvoiceForm tentar guardar. Solução: chamar `register-free` assim que nome+email estejam válidos (com debounce), para criar o registo antes do pagamento.

Fluxo revisado no PurchaseModal:
1. Utilizador preenche nome + email
2. Ao sair do campo email (com dados válidos), chamar `register-free` silenciosamente para criar/obter o registo
3. Mostrar `InvoiceForm` com `userEmail={email}` — faz lookup do `registration_id` e `edit_token` automaticamente
4. Botão "Confirmar e pagar" só fica activo quando `invoiceValid === true`
5. No submit, chamar `create-payment` (o `register-free` já correu)

## Passo 2 — Estratégia para quem já pagou sem dados de faturação

Para os 14 pagamentos já realizados via `/comprar` sem invoice_details:

**Criar edge function `send-invoice-request`** que:
1. Busca registos com `paid_at IS NOT NULL` e `webinar = 'video'` que **não têm** entrada na tabela `invoice_details`
2. Envia email personalizado a cada um com link para preencher os dados: `{origin}/pagar?o={order_id}` (página que já existe e permite acesso via `order_id` + `edit_token`)
3. Alternativa mais simples: enviar link directo para um formulário standalone

**Criar página `/fatura`** (rota leve):
- Recebe `?rid={id}&t={token}` nos query params
- Mostra apenas o `InvoiceForm` com os dados pré-preenchidos
- Permite ao utilizador preencher/actualizar os dados de faturação sem necessidade de login
- Após guardar com sucesso, mostra confirmação "Dados guardados ✓"

**Email template `video_invoice_request`:**
- Assunto: "Precisamos dos teus dados para a fatura, {{fname}}"
- Corpo: explicar que para emitir a fatura precisa de preencher NIF, morada, etc.
- CTA: link para `/fatura?rid={id}&t={token}`

## Resumo técnico

| Acção | Ficheiro |
|---|---|
| Integrar InvoiceForm no PurchaseModal | `src/components/webinar/PurchaseModal.tsx` |
| Chamar register-free antes do pagamento (on blur) | `src/components/webinar/PurchaseModal.tsx` |
| Criar página /fatura standalone | `src/pages/Fatura.tsx` + rota em `App.tsx` |
| Criar edge function send-invoice-request | `supabase/functions/send-invoice-request/index.ts` |
| Invocar send-invoice-request para os 14 pagos | Manual, após deploy |

