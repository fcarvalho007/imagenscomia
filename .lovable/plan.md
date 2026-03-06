

# Refinar Faturação — Implementação

## Verificação do fluxo actual

O fluxo está **100% funcional**:

1. **Ficha de cliente** → `InvoiceSection.tsx` chama `create-invoice` com `send_email: true` → cria documento no InvoiceExpress → finaliza → envia email automático ao cliente
2. A Edge Function `create-invoice` já suporta `draft_only: true` (rascunho) e `send_email: true` (emitir + enviar)
3. O botão actual "Emitir fatura" já cria, finaliza e envia — **o sistema já envia automaticamente para o email do cliente**

## Alterações a implementar

### 1. `src/components/crm/modal/InvoiceSection.tsx`

**Visual mais leve:**
- Trocar `<hr>` pesado por `border-t border-border/50` subtil
- Remover badge verde/vermelho "Completo/Em falta" → texto discreto "· dados preenchidos" ou "· sem dados"
- Reduzir tamanhos de fonte (13px→12px, 14px→13px)
- Toggle "fatura enviada" mais compacto

**Dois botões de emissão:**
- **"Rascunho"** (variant="outline") → `create-invoice` com `{ draft_only: true, send_email: false }` — cria no InvoiceExpress sem finalizar
- **"Emitir e enviar"** (variant="default") → `create-invoice` com `{ draft_only: false, send_email: true }` — cria, finaliza, e envia automaticamente por email ao cliente

Estado de loading individual por botão (`creatingInvoice: "draft" | "final" | null`).

### 2. `src/components/crm/BulkInvoiceButton.tsx`

Reduzir de card com padding `p-5` para uma linha compacta, removendo o wrapper `bg-white border rounded-xl`. Manter funcionalidade intacta mas com presença visual mais subtil.

### 2 ficheiros alterados
- `src/components/crm/modal/InvoiceSection.tsx`
- `src/components/crm/BulkInvoiceButton.tsx`

