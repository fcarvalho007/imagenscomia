

# Corrigir conteúdo dos emails pós-webinar

## Problemas identificados

### `video_postwebinar` (email imediato pós-webinar)
- **Template DB**: Correcto (€27, sem early bird) — mas o **fallback na edge function** menciona €15 early bird
- **Edge function fallback**: Texto desalinhado com a estratégia actual

### `video_postwebinar_day1` (dia seguinte)
- **Template DB**: Menciona "três horas" (duração da Masterclass, não do webinar de 45-60 min)
- **Template DB**: Menciona €15 early bird — mas o Dia 1 já é o dia seguinte, logo o preço é €27 (conforme pricing: Video Premium = €15+IVA early bird só no dia do webinar)
- **Edge function fallback**: Também tem conteúdo desalinhado

## Correcções a aplicar

### 1. Edge function `send-video-postwebinar/index.ts`
- Actualizar `buildHtml()` fallback: remover referência a €15 early bird (já está no template DB como €27)
- Alinhar com o template DB (que é o que é usado se existir)

### 2. Edge function `send-video-postwebinar-day1/index.ts`  
- Actualizar `buildFallbackHtml()`:
  - Mudar "sessão de 70 minutos" → duração correcta (~60 min)
  - Preço: €27+IVA (sem early bird — o early bird acabou no dia do webinar)

### 3. Template DB `video_postwebinar_day1`
- Corrigir "três horas" → referência correcta ao webinar (~60 min)
- Remover urgência de early bird €15 (preço já é €27 no Dia 1)
- Actualizar link de `/comprar?plan=gravacao` → `/upgrade-video` (consistente com outros templates)

### 4. Template DB `video_postwebinar`
- Já está maioritariamente correcto; verificar que não há menção de duração errada

## Ficheiros alterados
- `supabase/functions/send-video-postwebinar/index.ts` — fallback HTML
- `supabase/functions/send-video-postwebinar-day1/index.ts` — fallback HTML
- Actualização dos templates na tabela `email_templates` via insert tool

