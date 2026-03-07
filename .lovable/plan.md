

# Diagnóstico e Correção — Emissão em Lote

## O que aconteceu

Quando clicaste em "Emitir" com "Imagens IA" seleccionado, a `FaturacaoView` **ainda não estava sincronizada** com o sidebar (a correcção foi aplicada depois). O `activeTab` interno estava em "todos", e a edge function recebeu `webinar: "all"` — processou **todos os webinars**, não só Imagens.

**Não houve duplicação**: cada registo foi emitido exactamente 1 vez (confirmado nos logs). A confusão é que registos de vídeo (Diana, Isabel, etc.) também foram processados nessa execução.

## Estado actual

### Imagens IA — 5 pendentes (SEGURO clicar)

| Email | Plano | Valor | Rascunho | NIF |
|-------|-------|-------|----------|-----|
| Jorge Isabelinho | premium | €18,45 | #252438077 | ❌ |
| Learninghubz Lda | premium | €18,45 | #252437609 | ❌ |
| Maria Soares | bundle | €76,26 | #252437606 | ❌ |
| Pedro Vilarinho | bundle | €76,26 | #252437603 | ❌ |
| Silvana Curado | bundle | €76,26 | #252437611 | ❌ |

Todos já têm rascunho, **nenhum tem NIF**. Se clicares "Emitir" agora → nada muda, ficam como rascunho. Não há grupos no webinar Imagens. **Seguro.**

### Vídeo — 12 pendentes (CUIDADO)

- **Grupo Isabel Martins (6 pessoas)**: `invoice_document_id = null` após reset. Tem NIF (509132774). Se o bulk correr, cria documento NOVO no InvoiceExpress → **duplicado** se o documento antigo não foi anulado.
- **Grupo Diana Ramos (2 pessoas)**: mesma situação. Tem NIF (505980967).
- **4 individuais**: 2 com rascunho, 2 sem.

## Problema a corrigir

A edge function `bulk-emit-invoices` não verifica se um documento já foi **finalizado** no InvoiceExpress antes de tentar finalizar. Além disso, após o reset dos grupos, pode criar documentos duplicados.

## Plano de correcção (1 ficheiro)

**`supabase/functions/bulk-emit-invoices/index.ts`** — adicionar verificação de estado:

1. **Antes de finalizar**, fazer um `GET` ao InvoiceExpress para verificar o estado do documento. Se já está `finalized` ou `settled`, marcar como `invoice_sent = true` no DB e saltar a finalização + envio de email. Isto previne re-emissões.

2. **Antes de criar** um novo documento para um grupo, verificar se algum membro do grupo já teve uma fatura emitida (via `message_logs` com `template_key = 'invoice_emitted'`). Se sim, restaurar o `invoice_document_id` a partir desse log e saltar a criação.

3. **Logging melhorado**: registar no log quando uma fatura é saltada por já estar finalizada, para auditoria.

Isto garante que mesmo com resets ou re-execuções, nunca se criam documentos duplicados no InvoiceExpress.

