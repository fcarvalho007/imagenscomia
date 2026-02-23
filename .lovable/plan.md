
# Corrigir links de calendario no email de confirmacao do webinar video

## Problemas encontrados

No ficheiro `supabase/functions/send-video-confirmation/index.ts`:

### 1. Hora de fim errada no Google Calendar URL (linha 13)
- Actual: `20260305T113000Z` (11:30 = 90 minutos)
- Correcto: `20260305T110000Z` (11:00 = 60 minutos, conforme `videoWebinarConfig.ts`)

### 2. Titulo do evento no Google Calendar URL nao corresponde ao titulo oficial
- Actual: `Webinar+Video+com+IA+para+marketing`
- Correcto: `Cria+Video+Profissional+com+IA` (conforme `videoWebinarConfig.ts`)

### 3. Hora de fim errada no ficheiro ICS (linha 19)
- Actual: `DTEND:20260305T113000Z`
- Correcto: `DTEND:20260305T110000Z`

### 4. Titulo do evento no ICS nao corresponde (linha 20)
- Actual: `Webinar Video com IA para marketing`
- Correcto: `Cria Video Profissional com IA`

## Alteracoes

| Linha | Antes | Depois |
|---|---|---|
| 13 | `...text=Webinar+V%C3%ADdeo+com+IA+para+marketing&dates=20260305T100000Z/20260305T113000Z...` | `...text=Cria+V%C3%ADdeo+Profissional+com+IA&dates=20260305T100000Z/20260305T110000Z...` |
| 19 | `DTEND:20260305T113000Z` | `DTEND:20260305T110000Z` |
| 20 | `SUMMARY:Webinar Video com IA para marketing` | `SUMMARY:Cria Video Profissional com IA` |
| 21 | `DESCRIPTION:Link de acesso: https://imagenscomia.com/live-video` | Manter (correcto) |

## Ficheiro afectado

`supabase/functions/send-video-confirmation/index.ts` -- 4 correcoes em 3 linhas.

Os restantes links no email (live-video, convites) estao correctos.
