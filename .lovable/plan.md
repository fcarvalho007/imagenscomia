

# Emissão em lote de rascunhos InvoiceExpress

## Situação actual
- A Edge Function `create-invoice` já existe e suporta `draft_only: true`
- O secret `INVOICEEXPRESS_API_KEY` já está configurado
- A função já não está no `config.toml` (precisa de `verify_jwt = false`)
- Cada rascunho é criado individualmente — não existe funcionalidade de lote

## Plano

### 1. Criar Edge Function `bulk-create-invoices`
Nova função que:
- Busca todas as registrations com `paid_at IS NOT NULL`
- Filtra por webinar (parâmetro opcional, default "video")
- Para cada uma, chama internamente a lógica de criação de rascunho no InvoiceExpress
- Inclui dedup: salta registos que já têm `invoice_document_id` preenchido (novo campo) para evitar duplicados
- Rate limiting: delay de 1s entre chamadas para não exceder limites da API InvoiceExpress
- Retorna resumo: `{ created: N, skipped: N, errors: [...] }`

### 2. Adicionar coluna `invoice_document_id` à tabela `registrations`
- Campo `text`, nullable, para guardar o ID do documento InvoiceExpress criado
- Serve como flag de dedup e referência para futuras operações (finalizar, enviar)

### 3. Adicionar `config.toml` entry
- `[functions.bulk-create-invoices]` com `verify_jwt = false`

### 4. Botão no CRM (AutomationFlowTab ou InvoiceSection)
- Adicionar um botão "Emitir rascunhos em lote" na área de Faturação do CRM
- Mostra progresso e resultado final

## Preços (já definidos na função existente)
| Plano | Preço s/IVA |
|-------|-------------|
| premium | 15€ |
| masterclass | 47€ |
| bundle | 62€ |
| gravacao | 27€ |
| video-premium | 15€ |
| video-masterclass | 47€ |
| video-bundle | 57€ |

Os rascunhos ficam no InvoiceExpress para revisão antes de finalizar/enviar.

