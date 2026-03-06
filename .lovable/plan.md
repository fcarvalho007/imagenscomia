

# Actualizar links do Q&A (calendário + Zoom) nos emails

## Contexto

A sessão Q&A a 10 de Março às 14h30 tem links próprios:
- **Calendário**: `https://calendar.app.google/mmuW5XuzRzRLm2qVA`
- **Zoom**: `https://us02web.zoom.us/j/88370994509?jst=3`

Estes links são distintos dos da Masterclass (12 Março). Vários templates de email ainda usam links antigos ou não incluem os links do Q&A.

## Ficheiros a alterar

### 1. `supabase/functions/eupago-webhook/index.ts`
- **Linha ~721** (premiumHtml): substituir `calendar.app.google/Mczyo7DFx7xazgXD6` pelo link Q&A correcto + adicionar botão Zoom do Q&A
- **Linha ~723** (masterclassHtml): substituir `calendar.app.google/LWQVacdqqavvEqSG9` pelo link Masterclass correcto (`qX6CxAwxafWHNEaYA`) — já actualizado noutros sítios mas não aqui
- **Linha ~182** (masterclassHtml inline): mesma correcção do link de calendário da Masterclass

### 2. `supabase/functions/send-video-recursos-access/index.ts`
- No template **premium** (~linha 59-73): adicionar bloco Q&A com calendário + Zoom, semelhante ao que já existe para a Masterclass

### 3. `supabase/functions/send-video-postwebinar-day3/index.ts`
- Actualizar lista de conteúdos (ainda tem "Guia de prompts" em vez de Workbook + GEMs — mesmo problema que foi corrigido no day1)

### 4. `supabase/functions/send-video-postwebinar/index.ts`
- Actualizar lista de conteúdos (mesmo problema — "Guia de prompts")
- Menção ao Q&A já existe mas sem link

### 5. Base de dados — `email_templates`
- Após deploy, actualizar os templates na BD via migration para que o CRM reflicta as alterações

## Resumo das substituições

| Ficheiro | O quê | De → Para |
|---|---|---|
| eupago-webhook (premium) | Calendar Q&A | `Mczyo7DFx7xazgXD6` → `mmuW5XuzRzRLm2qVA` |
| eupago-webhook (masterclass ×2) | Calendar MC | `LWQVacdqqavvEqSG9` → `qX6CxAwxafWHNEaYA` |
| recursos-access (premium) | Adicionar bloco Q&A | — → calendário + Zoom Q&A |
| postwebinar-day3 | Conteúdos Premium | "Guia de prompts" → Workbook + GEMs |
| postwebinar | Conteúdos Premium | "Guia de prompts" → Workbook + GEMs |

