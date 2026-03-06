

# Fix InvoiceExpress Integration + Reorganize UI

## 1. API Key Error — Root Cause

The error `"Invalid API key"` means the stored `INVOICEEXPRESS_API_KEY` secret doesn't match the current key shown in the screenshot (`895f5e4a32dbdedc11a38bb344fe93fe27f82617`). The secret needs to be updated.

**Action**: Use the `add_secret` tool to update `INVOICEEXPRESS_API_KEY` with the correct value from the screenshot.

## 2. Move "Faturação em lote" from Dashboard to TableView and PipelineView

- Remove `BulkInvoiceButton` import and usage from `DashboardView.tsx`
- Add it to `TableView.tsx` (above the table) and `PipelineView.tsx` (above the pipeline columns)

## 3. Individual invoice button in client modal (InvoiceSection)

The `InvoiceSection.tsx` already has an "Emitir fatura" button that calls `create-invoice`. This works for individual invoicing. No changes needed here — it already exists.

## 4. Auto-create draft on payment

The `eupago-webhook` already calls `create-invoice` automatically on payment (line 464). However, it currently creates a **finalized** invoice (`send_email: true`, no `draft_only`). 

**Change**: Update the webhook to use `draft_only: true` so it creates a draft instead, and also save the `invoice_document_id` on the registration for dedup.

### Files Changed
- **Secret**: Update `INVOICEEXPRESS_API_KEY`
- **Edit**: `src/components/crm/DashboardView.tsx` — remove BulkInvoiceButton
- **Edit**: `src/components/crm/TableView.tsx` — add BulkInvoiceButton
- **Edit**: `src/components/crm/PipelineView.tsx` — add BulkInvoiceButton
- **Edit**: `supabase/functions/eupago-webhook/index.ts` — change to `draft_only: true` and save `invoice_document_id`
- **Edit**: `supabase/functions/create-invoice/index.ts` — save `invoice_document_id` on the registration after creating draft

