

# Reescrever todos os templates pós-evento como produto unico

## Problemas encontrados

Após auditoria completa, identifico **3 camadas de problemas** que ainda persistem:

### 1. Template DB `video_postwebinar` (email imediato pós-webinar)
O pior caso. Ainda diz:
- "Obrigado por estares presente hoje" (referencia evento ao vivo)
- "Gravação HD da sessão completa" (usa "gravação")
- "Sessão Q&A em grupo — 10 de Março às 14h30" (Q&A obsoleta)
- "Guia de prompts para vídeo" (deliverable antigo)
- Subject: "Obrigado por estares presente 🙏"

### 2. Edge function fallbacks (HTML hardcoded)
Cada edge function tem um `buildFallbackHtml()` / `buildPostEventHtml()` com conteúdo desactualizado. Se o template DB for apagado ou falhar, o fallback envia conteúdo errado:
- **send-video-confirmation** (`buildPostEventHtml`): "gravação", "Q&A 10 Mar", "early bird"
- **send-video-postwebinar** (`buildHtml`): "gravação", "Q&A", "guia de prompts"
- **send-video-postwebinar-day1** (`buildFallbackHtml`): "rever a sessão de ontem" (framing webinar)
- **send-video-postwebinar-day3** (`buildFallbackHtml`): header diz "Webinar", OK no resto
- **send-video-postwebinar-closing** (`buildFallbackHtml`): header diz "Webinar", OK no resto

### 3. Texto SMS e subtitles no CRM
- Linha 554: SMS diz "gravacao do webinar"
- Linha 600: subtitle diz "Gravação + Workbook..."
- Linha 644: SMS diz "gravacao completa"

## Plano de execucao

### A. Migracão SQL — reescrever `video_postwebinar` na DB
UPDATE do template `video_postwebinar` com conteúdo alinhado: posiciona como produto directo, sem referências a evento passado. Lista os 5 deliverables (Sessão HD, Workbook, Guia GEMs, Ficheiro GEM, Áudio MP3). Remove Q&A 10 Mar e "gravação".

### B. Actualizar fallbacks das 5 edge functions
Reescrever o HTML hardcoded em cada função para alinhar com o posicionamento de produto unico. Remover:
- Todas as referências a "webinar", "gravação", "evento"
- Q&A 10 de Março
- Early bird / datas de corte
- Substituir por linguagem de produto: "sessão prática", "70 min sem cortes"

Ficheiros:
1. `supabase/functions/send-video-confirmation/index.ts` — `buildPostEventHtml()`
2. `supabase/functions/send-video-postwebinar/index.ts` — `buildHtml()`
3. `supabase/functions/send-video-postwebinar-day1/index.ts` — `buildFallbackHtml()`
4. `supabase/functions/send-video-postwebinar-day3/index.ts` — `buildFallbackHtml()`
5. `supabase/functions/send-video-postwebinar-closing/index.ts` — `buildFallbackHtml()`

### C. Corrigir SMS e subtitles no CRM
- Linha 554: SMS → "Ola! Tens uma sessao pratica de 70min sobre video com IA a tua espera em imagenscomia.com/video — Frederico"
- Linha 600: subtitle → "Sessão 70min · Workbook · GEMs · Áudio"
- Linha 644: SMS → "Ola! Ja tens acesso a sessao completa (70min), workbook, guia GEMs e audio em imagenscomia.com/recursos-video — usa o email de registo. Ate ja! — Frederico"

### Entregaveis padronizados (5 itens, consistentes em todos os templates)
1. Sessão prática completa em HD (70 min, sem cortes)
2. Workbook Resumo da Sessão (PDF)
3. Guia técnico de GEMs para vídeo
4. Ficheiro GEM pronto a importar para o Gemini
5. Áudio da sessão em MP3

