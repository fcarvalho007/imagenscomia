

# Emissão Inteligente: Rascunho vs Completa

## Alteração

Modificar `bulk-emit-invoices` para detectar automaticamente se o registo tem `invoice_details` preenchido:

- **COM invoice_details** (têm NIF): fluxo completo — criar → finalizar → enviar email
- **SEM invoice_details** (os 9 sem NIF): apenas criar rascunho no InvoiceExpress e guardar o `invoice_document_id` na BD. **Não finaliza, não envia email.**

## Implementação (1 ficheiro)

### `supabase/functions/bulk-emit-invoices/index.ts`

Após a linha 96 (`const invoice = invoiceMap.get(reg.id)`), adicionar flag:

```typescript
const hasInvoiceDetails = !!invoice; // true = tem NIF, false = só rascunho
```

Após criar o rascunho (linha 184), se `!hasInvoiceDetails`:
- Log: `📋 ${reg.email}: draft only (no invoice details)`
- Incrementar contador `draftsOnly++`
- `continue` — saltar Steps 2, 3, 4, 5

O response final incluirá `{ emitted, draftsOnly, errors, total }` para que saibas exactamente quantas foram emitidas e quantas ficaram como rascunho.

## Resultado esperado

- ~21 faturas emitidas e enviadas automaticamente
- 9 rascunhos criados no InvoiceExpress, prontos para actualizar com NIF e finalizar depois

