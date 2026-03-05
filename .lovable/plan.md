

# Corrigir conteúdo dos emails pós-webinar

## ✅ Correcções aplicadas (5 Março 2026)

### 1. Edge function `send-video-postwebinar/index.ts` — fallback HTML
- Removida referência a €15 early bird → agora €27+IVA
- Removida menção de "(70 min)" na gravação
- Alinhado com template DB

### 2. Edge function `send-video-postwebinar-day1/index.ts` — fallback HTML
- Corrigido "sessão de 70 minutos" → "sessão sobre vídeo com IA"

### 3. Template DB `video_postwebinar_day1`
- Removido "três horas" (era duração da Masterclass, não do webinar)
- Removido early bird €15 → preço fixo €27+IVA
- Link actualizado de `/comprar?plan=gravacao` → `/upgrade-video`
- Subject actualizado para "A gravação do webinar, {{fname}}"

### 4. Template DB `video_postwebinar`
- Já estava correcto (€27, sem early bird) — sem alterações
