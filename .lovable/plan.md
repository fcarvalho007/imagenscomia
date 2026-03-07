

# Adicionar placeholder {{nome}} ao email da fatura-recibo

## Garantia de segurança

A substituição é feita **server-side nas edge functions**, antes de enviar ao InvoiceExpress. Com fallback para string vazia se o nome não existir — impossível aparecer `{{nome}}` em bruto.

```
// Lógica no servidor (edge function):
const finalBody = body.replace("{{plano}}", itemDescription).replace("{{nome}}", reg.name || "");
// InvoiceExpress recebe: "Olá João," — nunca vê {{nome}}
```

## Alterações

### 1. Frontend — `InvoiceTable.tsx`
- `DEFAULT_EMAIL_BODY`: mudar `"Olá,"` para `"Olá {{nome}},"`
- Adicionar nota informativa: `{{nome}}` = nome do cliente, `{{plano}}` = nome do plano

### 2. Edge Functions (3 ficheiros)
Em `create-invoice`, `bulk-finalize-invoices`, `bulk-emit-invoices`:
- Adicionar `.replace(/\{\{nome\}\}/g, clientName || "")` ao subject e body, junto ao replace de `{{plano}}` já existente
- Usar regex global para cobrir múltiplas ocorrências

## Ficheiros alterados (4)
- `src/components/crm/faturacao/InvoiceTable.tsx`
- `supabase/functions/create-invoice/index.ts`
- `supabase/functions/bulk-finalize-invoices/index.ts`
- `supabase/functions/bulk-emit-invoices/index.ts`

