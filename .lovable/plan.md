
# Implementacao do fluxo de emails automatizados para o Webinar Video

## Resumo

Criar 5 edge functions para envio de emails via Resend para o webinar de Video IA, com templates HTML inline, cron jobs para lembretes automaticos, e botao manual no CRM para o email pos-webinar.

---

## Constantes e configuracao

### `src/config/webinarConfig.ts`

Adicionar ao ficheiro existente (sem alterar constantes de Imagens):

```
VIDEO_WEBINAR_DATE = new Date("2026-03-05T10:00:00Z")
VIDEO_QA_DATE = new Date("2026-03-10T14:30:00Z")
VIDEO_MASTERCLASS_DATE = new Date("2026-03-12T10:00:00Z")
LIVE_URL_VIDEO = "https://imagenscomia.com/live-video"
UPGRADE_URL_VIDEO = "https://imagenscomia.com/upgrade-video"
INVITES_URL = "https://imagenscomia.com/convites"
```

---

## Edge Functions a criar (5 ficheiros)

Todas seguem o padrao existente: `serve()` do Deno, CORS headers, Resend API com `from: "Frederico Carvalho <frederico.carvalho@digitalfc.pt>"`, try/catch com resposta estruturada.

### 1. `supabase/functions/send-video-confirmation/index.ts`

- **Trigger**: chamada directa apos registo com `webinar: "video"`
- **Input**: `{ email, fname }`
- **Logica**: envia EMAIL 1 (confirmacao) via Resend com HTML inline
- **HTML**: template completo com evento dia 5 Mar 10h, botao Google Calendar, link .ics (data URI), link de acesso, programa de convites
- **Logging**: insere em `message_logs` com `template_key: "video_confirmation"`
- **Resposta**: `{ success, error? }`

### 2. `supabase/functions/send-video-reminder-48h/index.ts`

- **Trigger**: cron diario as 08:00 UTC
- **Logica**:
  1. Verifica se `now` esta dentro da janela 47h-49h antes de `VIDEO_WEBINAR_DATE` (relevante em 2026-03-03)
  2. Se fora da janela: retorna `{ skipped: true }`
  3. Query: registrations WHERE `webinar = 'video'` AND `paid_at IS NULL` AND `do_not_contact = false`
  4. Verifica se ja foi enviado (idempotencia via `message_logs` com `template_key: "video_reminder_48h"`)
  5. Envia EMAIL 2 a cada inscrito
- **HTML**: template com agenda, botao de acesso, upsell Premium Pass 15 EUR+IVA com Q&A 10 Mar
- **Auth**: valida `x-cron-secret` header contra `CRON_SECRET` env var

### 3. `supabase/functions/send-video-reminder-24h/index.ts`

- **Trigger**: cron diario as 10:00 UTC
- **Logica**: mesma estrutura que 48h mas janela 23h-25h antes (relevante em 2026-03-04)
- **HTML**: EMAIL 3 — urgencia, ultimo dia para early bird 15 EUR+IVA antes de passar a 27 EUR+IVA

### 4. `supabase/functions/send-video-reminder-1h/index.ts`

- **Trigger**: cron horario (`0 * * * *`)
- **Logica**: janela 30min-90min antes. Guard adicional: se data actual != 2026-03-05, skip imediato
- **HTML**: EMAIL 4 — minimalista, link de acesso directo

### 5. `supabase/functions/send-video-postwebinar/index.ts`

- **Trigger**: botao manual no CRM ou cron `0 13 5 3 *`
- **Input**: `{ manual: true }` (do CRM) ou `{}` (do cron)
- **Auth**: aceita `x-cron-secret` OU Bearer token (mesmo padrao do `followup-abandoned`)
- **Logica**: query todos os inscritos video activos, envia EMAIL 5 com resumo, upsell gravacao 27 EUR+IVA, masterclass 97 EUR+IVA
- **Resposta**: `{ sent, errors }`

---

## Config TOML

### `supabase/config.toml`

Adicionar 5 entradas `verify_jwt = false`:

```
[functions.send-video-confirmation]
verify_jwt = false

[functions.send-video-reminder-48h]
verify_jwt = false

[functions.send-video-reminder-24h]
verify_jwt = false

[functions.send-video-reminder-1h]
verify_jwt = false

[functions.send-video-postwebinar]
verify_jwt = false
```

---

## Cron Jobs (SQL directo via query tool, nao migration)

4 cron jobs via `pg_cron` + `pg_net`:

```text
video-reminder-48h  : 0 8 * * *     -> send-video-reminder-48h
video-reminder-24h  : 0 10 * * *    -> send-video-reminder-24h
video-reminder-1h   : 0 * * * *     -> send-video-reminder-1h
video-postwebinar   : 0 13 5 3 *    -> send-video-postwebinar
```

Cada job usa `net.http_post` com URL completo do projecto e headers `Authorization: Bearer ANON_KEY` + `x-cron-secret`.

---

## Integracao no frontend

### `register-free/index.ts`

Apos o insert bem-sucedido de um registo com `webinar: "video"`, adicionar chamada non-blocking:

```typescript
if ((webinar || "imagens") === "video") {
  fetch(`${supabaseUrl}/functions/v1/send-video-confirmation`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseKey}` },
    body: JSON.stringify({ email: email.toLowerCase().trim(), fname: firstName.trim() }),
  }).catch(err => console.error("Video confirmation email failed (non-blocking):", err));
}
```

### `DashboardView.tsx`

Adicionar seccao "Accoes Manuais" visivel apenas quando:
- `webinarContext === "video"`
- `VIDEO_WEBINAR_DATE` ja passou

Conteudo:
- Card "Email Pos-Webinar" com botao outlined verde
- Confirmation dialog antes de enviar
- Chama `supabase.functions.invoke('send-video-postwebinar', { body: { manual: true } })`
- Toast de sucesso/erro

---

## Design dos emails HTML

Todos os 5 emails partilham:
- `max-width: 600px`, centrado, fundo branco `#ffffff`
- Font: `system-ui, -apple-system, sans-serif`
- Texto: `#333333`, `16px`, `line-height: 1.6`
- Botao: `background: #16a34a`, `color: #fff`, `padding: 13px 28px`, `border-radius: 8px`, `font-weight: 700`
- Footer: `color: #999`, `font-size: 12px`, `border-top: 1px solid #eee`, assinatura "Frederico Carvalho . DIGITALFC"
- Precos sempre com "+IVA"

---

## Error handling (todas as funcoes)

1. Try/catch global
2. `fname` vazio: usa string vazia (email le "Ola ,")
3. Erro Resend por destinatario: log + continua para proximo
4. Resposta estruturada: `{ success, sent, errors }`
5. Sem excepcoes nao tratadas

---

## Ficheiros a criar

| Ficheiro | Descricao |
|----------|-----------|
| `supabase/functions/send-video-confirmation/index.ts` | Email 1 — confirmacao |
| `supabase/functions/send-video-reminder-48h/index.ts` | Email 2 — lembrete 48h |
| `supabase/functions/send-video-reminder-24h/index.ts` | Email 3 — lembrete 24h |
| `supabase/functions/send-video-reminder-1h/index.ts` | Email 4 — lembrete 1h |
| `supabase/functions/send-video-postwebinar/index.ts` | Email 5 — pos-webinar |

## Ficheiros a modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `supabase/config.toml` | 5 novas entradas verify_jwt = false |
| `src/config/webinarConfig.ts` | Constantes de datas e URLs do video |
| `supabase/functions/register-free/index.ts` | Chamada non-blocking ao send-video-confirmation |
| `src/components/crm/DashboardView.tsx` | Seccao "Accoes Manuais" com botao pos-webinar |

## Sem alteracoes

- Funcoes de email existentes (Imagens)
- RESEND_API_KEY (reutilizado)
- Views CRM (pipeline, tabela, follow-up, lixo)
- Routing, autenticacao, landing pages
