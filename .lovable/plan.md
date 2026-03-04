
# Email Provider: E-goi Transactional (primário) + Resend (fallback)

## Estado: ✅ IMPLEMENTADO (4 Mar 2026)

## Arquitectura

Todas as Edge Functions de envio de email passam pela função utilitária centralizada `send-email/index.ts`:

1. **Tenta E-goi Transactional** (POST slingshot.egoiapp.com/api/v2/email/messages/action/send/single)
   - Sender ID: 2
   - Domain: digitalfc.pt
   - Auth: ApiKey (EGOI_API_KEY)
2. **Se falhar → fallback Resend** (POST api.resend.com/emails)
3. Retorna `{ success, provider, messageId }`

## Funções refactorizadas (9 ficheiros)

| Ficheiro | Tipo |
|---|---|
| `supabase/functions/send-email/index.ts` | **Novo** — utilitária centralizada |
| `send-video-confirmation` | Confirmação de inscrição |
| `send-video-reminder-48h` | Lembrete 48h |
| `send-video-reminder-24h` | Lembrete 24h |
| `send-video-reminder-1h` | Lembrete 1h |
| `send-video-followup-prewebinar` | Follow-up pré-webinar |
| `send-video-postwebinar` | Pós-webinar imediato |
| `send-video-postwebinar-day1` | Pós-webinar dia 1 |
| `send-video-postwebinar-day3` | Pós-webinar dia 3 |
| `send-video-postwebinar-closing` | Pós-webinar closing |

## Logging

O campo `provider` nos `message_logs` agora regista "egoi" ou "resend" conforme o provider usado.
