

# Auditoria do Fluxo de Faturação InvoiceExpress

## Estado actual dos dados

| Métrica | Valor |
|---------|-------|
| Total pagos | 45 |
| Faturas enviadas (`invoice_sent = true`) | 28 |
| Rascunhos criados mas **não enviados** | 8 |
| **Sem qualquer documento** | 9 |

## Problema principal: O webhook NÃO emite faturas automaticamente

No `eupago-webhook/index.ts` (linha 612), quando um pagamento é confirmado, o sistema chama `create-invoice` com `draft_only: true`. Isto significa que:

- Cria um **rascunho** no InvoiceExpress
- **NÃO finaliza** o documento
- **NÃO envia** email ao cliente

O fluxo actual requer intervenção manual: primeiro `bulk-create-invoices` (rascunhos), depois `bulk-emit-invoices` (finalizar + enviar).

## Os 9 registos sem documento (sem rascunho sequer)

São todos recentes (6-7 Março) — 7 deles são de um **grupo** (pagamento conjunto de 6 pessoas a €52.03 cada + 1 Carla Marques a €76.26) + 2 da Sinmetro (Diana Ramos + Rita). O webhook provavelmente falhou ao chamar `create-invoice` para estes, ou o grupo foi registado manualmente sem passar pelo webhook.

## Os 8 rascunhos não enviados

Têm `invoice_document_id` mas `invoice_sent = false`. São inscritos **sem NIF** (5 deles) ou do webinar "imagens" cujo `bulk-emit-invoices` não terá sido corrido. O `bulk-emit-invoices` correctamente só finaliza+envia se houver `invoice_details`; caso contrário, mantém como rascunho.

## Resposta à pergunta: "Se alguém pagar hoje, o sistema emite e envia fatura automaticamente?"

**NÃO.** O webhook apenas cria um rascunho. Para emissão automática completa (criar → finalizar → enviar por email), o webhook teria de chamar `create-invoice` com `draft_only: false` **quando o inscrito tem dados de faturação (NIF)**.

## Plano de correcção

Alterar o webhook para emissão automática condicional:

### Ficheiro: `supabase/functions/eupago-webhook/index.ts`

Na secção pós-match (linhas 603-623), substituir a lógica actual por:

1. Verificar se o inscrito tem `invoice_details` preenchidos
2. Se **sim** → chamar `create-invoice` com `draft_only: false` (cria, finaliza e envia)
3. Se **não** → manter `draft_only: true` (apenas rascunho, para tratamento manual posterior)

```text
Fluxo proposto:

Pagamento confirmado
  ↓
Lookup invoice_details para matchedRegId
  ↓
  ├── TEM NIF → create-invoice(draft_only: false) → fatura emitida + email enviado
  └── SEM NIF → create-invoice(draft_only: true) → rascunho para tratamento manual
```

Isto resolve o problema sem alterar mais nenhum ficheiro. Os 9 registos sem documento e os 8 rascunhos pendentes podem ser tratados correndo o `bulk-emit-invoices` existente no CRM.

