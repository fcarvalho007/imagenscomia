

# Auditoria Faturação Imagens — Dados Corrompidos

## Diagnóstico

Cruzei o CSV da EuPago com a base de dados e encontrei o problema raiz:

### Dos 15 pagantes do webinar Imagens:

| Estado | Quantidade | Detalhe |
|--------|-----------|---------|
| **Fatura real emitida** | 1 | Hericka Santos (doc #252397471) |
| **Falsamente marcados como emitidos** | 10 | `invoice_sent = true` mas `invoice_document_id = NULL` |
| **Pendentes (corretos)** | 4 | Graça, Jorge, Maria, Pedro |

### Os 10 registos corrompidos:
Dário Ramos, Rita Pinto, Ana Olívia, Learninghubz Lda, Silvana Curado, Joana Sousa, Maria João, Sofia Albinski, Ana Pinto, Margarida Pregueiro.

Estes foram marcados como `invoice_sent = true` **sem nunca ter sido criada uma fatura no InvoiceExpress**. Provavelmente resultado de um processo anterior que marcou o flag sem completar a emissão.

### Consequência no CRM:
O botão "Emitir e Enviar Todas" na aba Imagens **funciona correctamente** — mas só encontra 4 registos elegíveis porque os outros 10 estão falsamente marcados como já emitidos.

---

## Plano de Correção

### 1. Corrigir os dados (UPDATE via insert tool)
Resetar `invoice_sent = false` nos 10 registos que têm `invoice_sent = true` E `invoice_document_id IS NULL` no webinar imagens.

```sql
UPDATE registrations 
SET invoice_sent = false 
WHERE webinar = 'imagens' 
  AND paid_at IS NOT NULL 
  AND invoice_sent = true 
  AND invoice_document_id IS NULL;
```

Após esta correção, os 14 registos (todos excepto Hericka Santos que já tem fatura real) aparecerão como pendentes na tabela de faturas.

### 2. Nenhuma alteração de código necessária
A função `bulk-emit-invoices` já:
- Filtra correctamente por `webinar = 'imagens'` quando recebe `{ webinar: "imagens" }`
- Cria rascunho para registos sem NIF (Jorge, Maria, Pedro) e emite+envia para registos com NIF (Graça)
- Reutiliza drafts existentes se houver crash a meio
- Os `plan_selected` (`premium`, `bundle`) estão mapeados correctamente no PRICES/LABELS

### Resultado esperado após correção:
- Aba Imagens mostra **14 pagantes pendentes** (em vez de 4)
- Clicar "Emitir e Enviar Todas" processa todos os 14
- 1 com NIF (Graça): emissão completa + email
- 13 sem NIF: rascunho criado (para completar dados de faturação depois)

