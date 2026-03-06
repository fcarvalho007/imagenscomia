

# Faturação — Botões visíveis + tracking automático

## Problema actual
- Os botões "Rascunho" e "Emitir e enviar" só aparecem quando existem `invoice_details` (dados de faturação preenchidos pelo cliente). Para clientes sem dados, só aparece "Sem dados de faturação" sem acção possível.
- Após emitir, não fica registado visualmente na secção (nem no histórico/timeline) o que foi feito — o `invoice_document_id` é guardado na BD mas não é mostrado.
- Risco de emissão duplicada porque não há feedback visual de que já foi emitida.

## Alterações

### 1. `InvoiceSection.tsx` — Botões sempre visíveis + estado persistido

- **Mostrar botões mesmo sem dados de faturação** — nesse caso a fatura é emitida como "Consumidor Final" (NIF 999999990), que é o que a Edge Function já faz por defeito
- **Passar `invoice_document_id` e `invoice_sent`** como props para mostrar estado actual:
  - Se `invoice_document_id` existe e `invoice_sent = false` → mostrar "Rascunho #ID criado" com badge discreto
  - Se `invoice_sent = true` → mostrar "Fatura #ID emitida e enviada ✓" a verde
- **Após acção bem-sucedida**, actualizar estado local para reflectir imediatamente (sem precisar de refresh)
- **Desabilitar botão "Emitir e enviar" se já foi enviada** — evitar duplicação

### 2. `mockData.ts` — Adicionar `invoice_document_id` ao tipo `Inscrito`

- Adicionar campo `invoice_document_id: string | null` (já existe na BD)

### 3. `TabLinkPagamento.tsx` — Passar `invoice_document_id`

- Passar `inscrito.invoice_document_id` ao `InvoiceSection`

### 4. `ActivityTimeline.tsx` — Mostrar eventos de faturação no histórico

- Adicionar suporte para renderizar eventos de faturação (rascunho criado / fatura emitida) como items na timeline, baseado nos campos `invoice_document_id` e `invoice_sent` do inscrito

### 5. Onde é carregado o inscrito — garantir que `invoice_document_id` vem na query

- Verificar que o `select()` que carrega registrations inclui `invoice_document_id`

## Ficheiros a editar
- `src/pages/crm/mockData.ts` — adicionar campo ao tipo
- `src/components/crm/modal/InvoiceSection.tsx` — botões sempre visíveis + estado visual
- `src/components/crm/modal/TabLinkPagamento.tsx` — passar nova prop
- `src/components/crm/modal/ActivityTimeline.tsx` — evento de faturação na timeline

