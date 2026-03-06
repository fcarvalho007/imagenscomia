

# Corrigir filtro Pós-webinar no Pipeline e Tabela

## Problema

O filtro "Pós-webinar" no Pipeline usa `registration_source === "gravacao"`, mas **todas as 280 inscrições de vídeo** têm `registration_source: "webinar"` — incluindo as 5 criadas após o webinar (5 Março 11:00 UTC). O filtro devolve 0 resultados.

## Solução

Mudar a lógica de "Pós-webinar" para ser **baseada na data de criação** em vez do campo `registration_source`:
- **Pré-webinar**: `created_at < 2026-03-05T11:00:00Z`
- **Pós-webinar**: `created_at >= 2026-03-05T11:00:00Z`

Usar a constante `VIDEO_WEBINAR_DATE` já existente em `webinarConfig.ts` (`2026-03-05T10:00:00Z` — ajustar para 11:00 se necessário) como cutoff.

Para o webinar de imagens, manter a lógica actual baseada no `startDate` correspondente.

## Ficheiros alterados

### `src/components/crm/PipelineView.tsx`
1. Importar `WEBINAR_CONFIG` e `useWebinarContext`
2. Na lógica de `filtered`, substituir `registration_source === sourceFilter` por comparação de data:
   - `sourceFilter === "webinar"` → `created_at < webinarStartDate`
   - `sourceFilter === "gravacao"` → `created_at >= webinarStartDate`
3. No badge "PÓS-WEBINAR" no card (linha 92), usar a mesma lógica de data em vez de `registration_source === "gravacao"`
4. Ajustar `visibleColumns` — remover colunas "Inscrito"/"Flow Completo" para pós-webinar (manter)

### `src/components/crm/TableView.tsx`
1. Na coluna "Fonte" (linha 551), usar lógica de data para mostrar "Pós-webinar" vs "Pré-webinar"

### `src/config/webinarConfig.ts`
1. Adicionar `postEventCutoff` ao config de cada webinar para clareza (`2026-03-05T11:00:00Z` para vídeo, `2026-02-18T11:00:00Z` para imagens)

