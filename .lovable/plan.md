

# Verificação da integração InvoiceExpress + Teste com rascunhos

## Resultado da verificação

A integração está **correcta** face à API v2 do InvoiceExpress:

- **Criar documento**: `POST /invoice_receipts.json` — payload correcto (client, items, tax, date)
- **Finalizar**: `PUT /invoice_receipts/:id/change-state.json` com `state: "finalized"` — correcto
- **Enviar email**: `PUT /invoice_receipts/:id/email-document.json` — payload `message` correcto
- **Webhook EuPago**: chama `create-invoice` automaticamente após pagamento confirmado — correcto

**Um ponto a melhorar**: os preços no payload são os valores finais (com IVA incluído), mas o `unit_price` deveria ser o valor **sem IVA** se o InvoiceExpress adiciona IVA por cima. Para 23% IVA, `15€ final` → `unit_price = 12.20€`. Preciso confirmar: **os teus preços (15€, 47€, etc.) já são sem IVA ou com IVA incluído?** Isto afecta o valor da fatura.

## Dados actuais

- **37 registos pagos** no total
- **27 sem fatura emitida** (`invoice_sent = false`)
- Alguns têm dados de faturação completos (NIF, morada), outros não (usarão "Consumidor Final" / NIF 999999990)

## Plano para teste com 2 rascunhos

### Alteração na edge function `create-invoice`

Adicionar parâmetro `draft_only: boolean` (default `false`):
- Se `draft_only = true`: cria o documento mas **não finaliza** nem envia email — fica como rascunho no InvoiceExpress para tu validares manualmente
- Se `draft_only = false`: comportamento actual (cria → finaliza → envia)

### Execução do teste

1. Invocar `create-invoice` com `draft_only: true` para **2 registos** com dados de faturação completos:
   - **ANDRE CUNHA** (NIF: 515913359, ACBC UNIPESSOAL LDA) — video-premium, 15€
   - **Andreia Amaral** (NIF: 236923595) — video-premium, 15€

2. Os rascunhos ficam no painel InvoiceExpress em `fomentarsonhos.app.invoicexpress.com` para validação

3. Após confirmação, posso:
   - Apagar os rascunhos via API (`state: "deleted"`)
   - Ou finalizá-los e enviar
   - E depois processar os restantes 25 em lote

### Ficheiro editado
- `supabase/functions/create-invoice/index.ts` — adicionar suporte a `draft_only`

