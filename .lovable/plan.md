

# Actualizar emails postwebinar com conteúdos correctos

## Problema

Os emails `video_postwebinar_day1` e `video_postwebinar_closing` ainda referem "Guia de prompts para vídeo" no Premium Pass. Os conteúdos actuais são:

- ✓ Sessão completa em HD (~70 min)
- ✓ Workbook Resumo da Sessão (PDF)
- ✓ Guia técnico de GEMs para vídeo
- ✓ Sessão Q&A ao vivo (10 Março, 14h30)

## Alterações

### 1. `supabase/functions/send-video-postwebinar-day1/index.ts`

No `buildFallbackHtml`, substituir a lista do Premium Pass (linhas 25-27):

```
✓ Sessão completa (70 min, sem cortes)
✓ Sessão Q&A ao vivo (10 Março, 14h30)
✓ Guia de prompts para vídeo (PDF)
```

Por:

```
✓ Sessão completa em HD (~70 min, sem cortes)
✓ Workbook Resumo da Sessão (PDF)
✓ Guia técnico de GEMs para vídeo
✓ Sessão Q&A ao vivo (10 Março, 14h30)
```

### 2. `supabase/functions/send-video-postwebinar-closing/index.ts`

Na linha 24, substituir "gravação, Q&A e guia de prompts" por "gravação, workbook, guia GEMs e Q&A".

### 3. Upsert dos templates na BD

Após deploy, invocar ambas as edge functions (ou a `send-video-recursos-access` se centralizada) — mas como estes templates têm upsert independente, basta que o fallback HTML esteja correcto. Se já existem na tabela `email_templates`, actualizar directamente via query.

## Ficheiros alterados

- `supabase/functions/send-video-postwebinar-day1/index.ts` — actualizar lista de conteúdos do Premium Pass
- `supabase/functions/send-video-postwebinar-closing/index.ts` — actualizar menção aos conteúdos

