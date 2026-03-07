

# Investigação: Emissão de Faturas em Lote

## Como funciona actualmente

O sistema usa **InvoiceExpress** (não Brevo) para criar e enviar faturas. O email da fatura é enviado directamente pelo InvoiceExpress com o PDF em anexo.

Existem 3 funções:

| Função | O que faz |
|--------|-----------|
| `create-invoice` | Cria + finaliza + envia email (individual). **Usa `paid_amount` correctamente.** |
| `bulk-create-invoices` | Cria rascunhos em lote. **BUG: usa preços estáticos, ignora `paid_amount`.** |
| `bulk-finalize-invoices` | Finaliza rascunhos + envia email. Funciona correctamente. |

## BUG CRÍTICO encontrado

A função `bulk-create-invoices` (linha 106) usa `PRICES[planKey]` em vez de `paid_amount` da BD. Isto significa que:
- Grupos com desconto (€52.03/pessoa) receberiam fatura de €47.00 (preço base errado)
- Preços antigos (€18.45 → base €15.00) seriam cobrados ao preço actual
- O valor na fatura **não corresponderia** ao que foi realmente pago

A função individual `create-invoice` já faz isto correctamente — usa `paid_amount / 1.23` como fonte de verdade.

## Plano de correcção

### 1. Corrigir `bulk-create-invoices` — usar `paid_amount`
- Adicionar `paid_amount` ao SELECT (linha 62)
- Substituir `PRICES[planKey]` pela mesma lógica do `create-invoice`: `paid_amount / 1.23` para NIFs portugueses
- Manter fallback para `PRICES` apenas se `paid_amount` for null

### 2. Alternativa simplificada: função única `bulk-emit-invoices`
Em vez do fluxo de 2 passos (rascunho → finalizar), criar uma função que faz tudo de uma vez:
1. Cria a fatura-recibo no InvoiceExpress
2. Finaliza imediatamente
3. Envia o email com PDF pelo InvoiceExpress
4. Actualiza `invoice_sent = true` e `invoice_document_id` na BD
5. Regista em `message_logs`

Isto elimina a necessidade de seleccionar manualmente e clicar "Enviar" — basta um botão "Emitir e Enviar Todas".

### 3. Actualizar UI na InvoiceTable
- Adicionar botão "Emitir e Enviar Todas" que chama a nova função
- Manter os botões individuais existentes para casos pontuais

## Recomendação

A opção mais segura e simples: **corrigir o `bulk-create-invoices` para usar `paid_amount`** e manter o fluxo de 2 passos (rascunho → verificar no InvoiceExpress → finalizar em lote). Isto permite-te validar visualmente os rascunhos antes de os enviar.

Se preferires automatizar tudo num só clique (sem verificação prévia), posso criar a função unificada.

