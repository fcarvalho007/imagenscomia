

# Mostrar contagem de faturas elegíveis no botão "Emitir"

## Problema identificado

A lista de participantes na secção "Faturação · InvoiceExpress" **já muda** quando se troca de tab (Imagens/Vídeo/Todos) — os `inscritos` passados ao `InvoiceTable` são filtrados pelo `activeTab` do `FaturacaoView`. Confirmado no código: `paid` é recalculado via `useMemo` sempre que `activeTab` muda.

O que falta é **visibilidade**: o botão "Emitir Fatura-Recibo e Enviar a Todos" não mostra quantos registos serão processados. Sem essa informação, não há confiança antes de clicar.

## Alteração

No `InvoiceTable.tsx`:

1. **Calcular contagem de elegíveis** — inscritos com `invoice_sent === false` (sem fatura emitida)
2. **Mostrar no botão verde** — ex: `Emitir Fatura-Recibo e Enviar a Todos (4)` com a contagem entre parênteses
3. **Desactivar o botão** quando elegíveis = 0 (todas as faturas já emitidas)
4. **Adicionar resumo por estado** sob o título "Faturação · InvoiceExpress" — ex: `3 emitidas · 4 por emitir · 2 sem NIF`

## Ficheiro alterado (1)
- `src/components/crm/faturacao/InvoiceTable.tsx`

