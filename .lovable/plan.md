

# Refinar secção de Faturação na ficha de cliente

## Problema
A secção de faturação no modal do inscrito está visualmente pesada e só tem um botão "Emitir fatura" (que cria + finaliza + envia). Falta a opção de criar apenas rascunho. Além disso, o banner de "Faturação em lote" no Pipeline é demasiado proeminente.

## Alterações

### 1. InvoiceSection.tsx — Redesign mais leve + dois modos de emissão

- **Visual mais suave**: reduzir o separador `<hr>` para algo mais subtil, usar cores mais leves, remover o badge "Completo/Em falta" agressivo (verde/vermelho) e substituir por texto discreto
- **Dois botões de ação** (quando há dados de faturação):
  - **"Rascunho"** — chama `create-invoice` com `draft_only: true` (cria no InvoiceExpress sem finalizar nem enviar)
  - **"Emitir e enviar"** — chama `create-invoice` com `send_email: true, draft_only: false` (cria, finaliza, e envia automaticamente por email ao cliente)
- **Manter**: botão de copiar dados e toggle de "fatura enviada"
- **Dados de faturação**: manter a grelha compacta mas com estilo mais leve

### 2. PipelineView.tsx — Reduzir destaque do banner de faturação em lote

- Tornar o `BulkInvoiceButton` mais discreto: remover o banner card grande, usar apenas um botão simples no header, ao lado do título ou da barra de filtros

## Ficheiros alterados
- `src/components/crm/modal/InvoiceSection.tsx` — redesign visual + split em 2 ações (rascunho vs emitir+enviar)
- `src/components/crm/PipelineView.tsx` — reduzir proeminência do bulk invoice banner

