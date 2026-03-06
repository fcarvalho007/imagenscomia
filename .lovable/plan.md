

# Auditoria de emails + actualização de templates

## 1. Diagnóstico: 12 pessoas sem confirmação

Todas as falhas foram causadas por **quota diária do Resend esgotada** (erro 429). Estes 12 pagantes nunca receberam qualquer email de confirmação:

| Email | Plano | Template a enviar |
|---|---|---|
| anateresa.bras@hotmail.com | video-premium | video_recursos_premium |
| andrecunha@acbc.pt | video-premium | video_recursos_premium |
| business.diogo.nunes@gmail.com | video-premium | video_recursos_premium |
| designer.andreiaamaral@gmail.com | video-premium | video_recursos_premium |
| geral@bellagoma.pt | video-premium | video_recursos_premium |
| jessica@xistoazul.pt | video-premium | video_recursos_premium |
| soraiamarina@gmail.com | video-premium | video_recursos_premium |
| julsilva@protonmail.com | masterclass | video_recursos_masterclass |
| marisajordao.digital@gmail.com | video-masterclass | video_recursos_masterclass |
| teresajuncalpires@essenciacompleta.pt | masterclass | video_recursos_masterclass |
| costta@sapo.pt | video-bundle | video_recursos_bundle |
| hermana.noronha@gmail.com | video-bundle | video_recursos_bundle |

Os 13 restantes já receberam `video_payment_premium`, `video_payment_masterclass` ou `mc_confirm_sent` com sucesso.

## 2. Actualizar templates antes de enviar

Antes de disparar os emails, preciso actualizar os templates **masterclass** e **bundle** na edge function `send-video-recursos-access`:

### a) URL do calendário
Substituir `https://calendar.app.google/LWQVacdqqavvEqSG9` por `https://calendar.app.google/qX6CxAwxafWHNEaYA`

### b) Adicionar link Zoom + nota de login
Nos templates masterclass e bundle, adicionar:
- Link da sessão: `https://us02web.zoom.us/j/83247090160?jst=3`
- Nota: "Para entrar, usa o email com que te registaste."

### c) Estas alterações aplicam-se a `masterclassHtml()` e `bundleHtml()` na edge function.

## 3. Plano de execução

### Passo 1 — Editar `supabase/functions/send-video-recursos-access/index.ts`
- Actualizar `CALENDAR_MASTERCLASS` para o novo URL
- Nos detalhes da sessão (masterclass e bundle), substituir "link enviado na véspera" pelo link Zoom real + botão CTA
- Adicionar nota: "Usa o email de registo para entrar na plataforma"

### Passo 2 — Deploy da edge function (automático)

### Passo 3 — Invocar com `dry_run: true` para fazer upsert dos templates actualizados na BD

### Passo 4 — Invocar com `dry_run: false` para enviar os emails de recursos aos 12 que nunca receberam confirmação

A idempotência já está implementada — só envia a quem não tem registo `sent` na `email_send_logs`.

## Ficheiros alterados

- `supabase/functions/send-video-recursos-access/index.ts` — actualizar URL do calendário, adicionar Zoom link e nota de login nos templates masterclass e bundle

