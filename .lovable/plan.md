

# Agendar envio automático do Masterclass Reminder às 09h00 de hoje

## Situação actual

A edge function `send-video-masterclass-reminder` existe e está funcional, mas **não tem cron job**. Só pode ser invocada manualmente (via CRM ou chamada directa). Isto significa que se ninguém a invocar manualmente às 9h, os emails não saem.

A função já tem idempotência (verifica `message_logs` antes de enviar), por isso é segura para agendar via cron.

## Plano

### 1. Criar cron job para 12 de Março às 09h00 (hora de Portugal = UTC)

Portugal continental em Março está em UTC (WET, antes da mudança para horário de verão a 29 de Março). Portanto, 09h00 PT = 09:00 UTC.

Criar o cron job via SQL:

```sql
SELECT cron.schedule(
  'video-masterclass-reminder-20260312',
  '0 9 12 3 *',
  $$
  SELECT net.http_post(
    url := 'https://gwphpsehcnhwjiypyolg.supabase.co/functions/v1/send-video-masterclass-reminder',
    headers := '{"Content-Type": "application/json", "x-cron-secret": "..."}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

Usa `x-cron-secret` para autenticação, consistente com os outros cron jobs existentes.

### 2. Sem alterações de código

A edge function já:
- Filtra `plan_selected IN ('masterclass', 'bundle')` ✅
- Verifica `paid_at` ou `premium_granted_at` ✅
- Tem idempotência via `message_logs` ✅
- Respeita `do_not_contact` ✅

Não precisa de nenhuma alteração.

### Ficheiros / acções

| Acção | Detalhe |
|-------|---------|
| SQL (insert, não migration) | Criar cron job `video-masterclass-reminder-20260312` para `0 9 12 3 *` |

