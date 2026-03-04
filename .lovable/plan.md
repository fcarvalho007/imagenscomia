

# Auditoria Completa de Emails + Plano de Reenvio

## Estado actual dos emails (227 inscritos video)

| Template | Enviados | Falhados (sem reenvio) | Causa |
|---|---|---|---|
| confirmation | 50 | **6** | Resend rate_limit |
| followup_prewebinar | 14 | **17** | Resend rate_limit |
| reminder_48h | 202 | 0 | Reenviados anteriormente |
| reminder_24h | 57 | **142** | Resend daily_quota_exceeded |
| reminder_1h | — | — | Amanha 08:30-09:30 UTC |
| postwebinar | — | — | Amanha ~12:30 UTC |

**Total de emails por entregar hoje: 166** (142 + 17 + 6 + 1 group_confirmation)

## Estado da infraestrutura

- `send-email` esta deployed e responde (confirmei: 401 = auth OK, nao 404)
- Todas as 8 funcoes ja chamam `send-email` com service role key internamente
- `resend-failed-emails` esta deployed e pronta a usar
- **Problema**: nao consigo testar `send-email` directamente porque a ferramenta de curl usa a anon key, mas a funcao exige a service role key

## Plano de accao (2 passos)

### 1. Permitir teste directo via `send-email`

Adicionar `x-cron-secret` como metodo de auth alternativo em `send-email` (alem do service role key). Isto permite:
- Testar envio para `fredericodigital@gmail.com` directamente
- Validar se a E-goi responde correctamente antes de reenviar os 166 emails

Alteracao minima em `send-email/index.ts`:
```typescript
// Auth: service role OR cron secret
const cronSecret = req.headers.get("x-cron-secret");
const isCron = cronSecret === Deno.env.get("CRON_SECRET");
const isServiceRole = authHeader.includes(serviceRoleKey);
if (!isCron && !isServiceRole) { return 401; }
```

### 2. Reenviar os 166 emails falhados

Apos confirmar que o teste chega ao teu email, invocar `resend-failed-emails` para cada template:
- `video_reminder_24h` (142 emails)
- `video_followup_prewebinar` (17 emails)
- `video_confirmation` (6 emails)
- `video_group_confirmation_payer` (1 email)

A funcao `resend-failed-emails` ja faz deduplicacao automatica (exclui quem ja recebeu com sucesso).

## Ficheiros a alterar

| Ficheiro | Alteracao |
|---|---|
| `supabase/functions/send-email/index.ts` | Adicionar cron-secret como auth alternativo |

Apos o deploy, executo o teste + reenvio na mesma sessao.

