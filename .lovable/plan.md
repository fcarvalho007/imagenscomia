

# Plano: Clareza nos botões de faturação + avaliação do sistema

## Auditoria realizada

### 1. Tipo de documento: Fatura-Recibo
O sistema **já está configurado para emitir Faturas-Recibo** (endpoint `invoice_receipts` do InvoiceExpress). Isto é o tipo correcto: documento que combina fatura + recibo de pagamento, adequado para vendas já pagas.

### 2. Email de envio
O InvoiceExpress envia automaticamente o **PDF da fatura-recibo em anexo** quando se usa o endpoint `email-document`. O assunto e corpo da mensagem estão **hardcoded** em 3 edge functions:
- `create-invoice` (individual)
- `bulk-finalize-invoices` (envio por selecção)
- `bulk-emit-invoices` (envio em massa)

Todos usam o mesmo texto fixo:
```
Subject: "Fatura-Recibo — {Plano}"
Body: "Segue em anexo a fatura-recibo referente à sua compra.\n\nObrigado pela confiança.\nFrederico Carvalho"
```

### 3. Personalização da mensagem
Actualmente **não é possível personalizar** a mensagem pelo CRM — está hardcoded nas edge functions. Posso adicionar um campo editável no UI que é enviado como parâmetro para as edge functions.

---

## Alterações propostas

### A. Botões com labels claras (InvoiceTable.tsx)

| Actual | Novo |
|--------|------|
| `Gerar Rascunhos` | `Criar Rascunhos Fatura-Recibo` |
| `Enviar (N)` | `Finalizar e Enviar (N)` |
| `Emitir e Enviar Todas` | `Emitir Fatura-Recibo e Enviar a Todos` |
| Botão individual `Rascunho` | `Rascunho` (sem alteração, já claro) |
| Botão individual `Emitir` | `Emitir e Enviar` |

Adicionarei tooltips explicativos em cada botão para reforçar o que faz:
- "Cria rascunhos no InvoiceExpress sem finalizar nem enviar"
- "Finaliza as faturas-recibo seleccionadas e envia o PDF por email ao cliente"
- "Cria, finaliza e envia a fatura-recibo por email a todos os pagantes"

### B. Mensagem de email personalizável (InvoiceTable.tsx + edge functions)

Adicionar um campo colapsável acima da tabela com:
- **Assunto** (pre-filled: `Fatura-Recibo — {{plano}}`)
- **Corpo** (textarea, pre-filled com o texto actual)
- Estes valores são passados como `email_subject` e `email_body` nos body params das edge functions

Alterar as 3 edge functions para aceitar `email_subject` e `email_body` opcionais, usando os valores actuais como fallback.

## Ficheiros alterados (4)
- `src/components/crm/faturacao/InvoiceTable.tsx` — labels, tooltips, campo de mensagem
- `supabase/functions/create-invoice/index.ts` — aceitar `email_subject`/`email_body` opcionais
- `supabase/functions/bulk-finalize-invoices/index.ts` — idem
- `supabase/functions/bulk-emit-invoices/index.ts` — idem

