

# Auditoria de Faturas + Estratégia para Dados em Falta

## 1. Estado actual das faturas

### Webinar Imagens com IA
| Estado | Qtd | Detalhe |
|--------|-----|---------|
| ✅ Com NIF → fatura emitida e enviada | 10 | Tudo correcto |
| ⚠️ Sem NIF → rascunho criado, não enviado | 5 | Silvana Curado, Maria Soares, Learninghubz, Jorge Isabelinho, Pedro Vilarinho |

**Conclusão: Todos os que têm NIF no webinar Imagens receberam fatura correctamente.**

### Webinar Vídeo com IA
| Estado | Qtd | Detalhe |
|--------|-----|---------|
| ✅ Com NIF → fatura emitida e enviada | 18 | Tudo correcto |
| ❌ Com NIF → **sem documento criado** | 3 | Isabel Martins, Carla Marques, Diana Ramos |
| ⚠️ Sem NIF → sem fatura | 9 | Grupo Essência (4), ProComunicação (2), Sinmetro (Rita), Marisa Jordão, Susana Vieira, Bruno Costa |

**Problema encontrado:** 3 registos do webinar Vídeo **têm NIF preenchido** mas não têm qualquer documento InvoiceExpress — nem rascunho. Isto aconteceu provavelmente porque foram pagamentos de grupo recentes que não passaram pelo `bulk-create-invoices`. Precisam de ter faturas criadas e enviadas.

---

## 2. Estratégia para recolher dados de faturação em falta

### O que já existe e funciona bem

A página `/fatura` já está operacional:
- Recebe `?rid=<id>&t=<token>` como parâmetros
- Mostra o `InvoiceForm` para o cliente preencher NIF, morada, etc.
- Grava via edge function `invoice-upsert` com validação do `edit_token`
- Mostra confirmação após sucesso

A edge function `send-invoice-request` também já existe:
- Envia email com link para `/fatura?rid=...&t=...`
- Template profissional em PT-PT
- Usa o sistema `send-email` com fallback
- **Limitação actual:** filtra apenas `webinar = 'video'`

### Plano de implementação

#### A. Corrigir as 3 faturas em falta (Isabel, Carla, Diana)
Correr o `bulk-create-invoices` seguido de `bulk-emit-invoices` no CRM para criar e enviar estas 3 faturas (já têm NIF).

#### B. Actualizar `send-invoice-request` para ambos os webinars
Adicionar parâmetro `webinar` ao body da função para poder enviar para inscritos de qualquer webinar (ou "all" para ambos). Ajustar o template do email para ser genérico (sem mencionar "Vídeo" especificamente).

#### C. Adicionar botão "Solicitar NIF" na secção Faturação do CRM
No `InvoiceTable.tsx`, adicionar um botão que invoca `send-invoice-request` para os inscritos seleccionados sem NIF. Isto permite ao admin:
1. Filtrar por "Sem fatura" na tabela
2. Seleccionar os inscritos sem NIF
3. Clicar "Solicitar NIF" → envia email com link para `/fatura`

#### D. Auto-emissão após preenchimento do NIF
No `invoice-upsert` (edge function), após o cliente preencher os dados com sucesso, chamar automaticamente `create-invoice` com `draft_only: false` para emitir e enviar a fatura de imediato — sem necessidade de intervenção manual.

### Ficheiros a alterar

1. **`supabase/functions/send-invoice-request/index.ts`** — aceitar parâmetro `webinar`, template genérico
2. **`src/components/crm/faturacao/InvoiceTable.tsx`** — botão "Solicitar NIF" para envio em lote
3. **`supabase/functions/invoice-upsert/index.ts`** — após upsert com sucesso, invocar `create-invoice(draft_only: false)` para auto-emissão

