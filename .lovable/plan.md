

# Corrigir emissão de faturas para compras em grupo

## Problema identificado

O sistema emite faturas individuais por participante, mas em compras de grupo a fatura deveria ser **uma só, consolidada, emitida ao comprador** pelo valor total do grupo.

### Grupos afetados

| Grupo | Comprador | Membros | Total pago | Estado |
|-------|-----------|---------|------------|--------|
| efbe2724... | Isabel Martins (Essência Completa, NIF 509132774) | 6 | €312,18 | ❌ Fatura emitida a Isabel com €42,30+IVA (apenas a sua quota individual). 5 rascunhos individuais criados para os outros membros. |
| 698019e6... | Diana Ramos (SINMETRO, NIF 505980967) | 2 | €115,62 | ❌ Fatura emitida a Diana com €57,81 (metade). 1 rascunho criado para Rita. |

**Resumo**: 2 faturas já enviadas com valores errados. 6 rascunhos pendentes que não deviam existir (serão substituídos pela fatura consolidada).

## Solução

### Parte 1 — Corrigir os 2 casos existentes (manual via InvoiceExpress)

Os documentos já finalizados e enviados (#252438082 e #252400592) terão de ser anulados manualmente no InvoiceExpress e substituídos por faturas-recibo com o valor total do grupo. Isto não pode ser feito por código porque o InvoiceExpress não permite anular documentos finalizados via API sem uma nota de crédito.

**Acção recomendada**: Ir ao InvoiceExpress, anular os documentos errados, e usar o botão de emissão individual no CRM para re-emitir com o valor correcto após a correcção do código.

### Parte 2 — Corrigir `bulk-emit-invoices` para grupos

Alterar a Edge Function para detectar `group_payment_ref` e consolidar:

1. **Agrupar registos** por `group_payment_ref` antes de emitir
2. **Para cada grupo**: criar UMA ÚNICA fatura-recibo no nome do comprador (o membro que tem `invoice_details`), com:
   - `quantity` = número de membros
   - `unit_price` = preço por pessoa (sem IVA)
   - Total = soma de todos os `paid_amount`
3. **Marcar todos os membros** do grupo como `invoice_sent = true` e guardar o mesmo `invoice_document_id`
4. **Enviar email** apenas ao comprador
5. **Registos individuais** (sem `group_payment_ref`) continuam com o fluxo actual

### Parte 3 — Limpar rascunhos órfãos

Os 6 rascunhos criados para membros não-compradores (IDs: 252437614, 252437620, 252437623, 252437624, 252437627, 252437652) devem ser eliminados do InvoiceExpress. Posso adicionar lógica na edge function para os apagar via API antes de criar a fatura consolidada.

## Ficheiro alterado (1)
- `supabase/functions/bulk-emit-invoices/index.ts` — adicionar lógica de consolidação de grupos

## Dados para reset (após aprovação)
Vou também fazer reset dos campos `invoice_document_id` e `invoice_sent` nos registos dos 2 grupos afectados para que possam ser re-processados correctamente pelo novo código.

