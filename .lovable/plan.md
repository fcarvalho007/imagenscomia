

# Garantir segmentação correcta + agendar envio automático

## 1. Problema na filtragem actual

A edge function `send-video-postwebinar-day1` filtra apenas `.is("paid_at", null)` — exclui quem pagou. **Mas não exclui** quem recebeu acesso Premium manualmente via `premium_granted_at`. Alguém com acesso gratuito concedido (oferta) receberia um email a vender o que já tem.

**Correcção:** Adicionar `.is("premium_granted_at", null)` à query, garantindo que **nenhum inscrito com acesso activo** (pago ou oferecido) receba o email de upsell.

## 2. Agendamento via pg_cron

Criar dois cron jobs one-time via migração SQL:

| Hora (UTC) | Acção |
|---|---|
| **12:30** | Disparar `send-video-postwebinar-day1` (email) |
| **12:45** | Disparar `send-sms` em lote para inscritos gratuitos com telefone |

Como são envios únicos (não recorrentes), os cron jobs serão configurados com a data exacta de hoje (6 de Março 2026) e auto-desactivados após execução via trigger.

### Detalhe técnico

```sql
-- Email às 12:30 UTC
SELECT cron.schedule(
  'video-postwebinar-day1-email',
  '30 12 6 3 *',
  $$SELECT net.http_post(
    url := current_setting('app.settings.service_url') || '/functions/v1/send-video-postwebinar-day1',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
    body := '{}'::jsonb
  )$$
);

-- SMS às 12:45 UTC  
SELECT cron.schedule(
  'video-postwebinar-day1-sms',
  '45 12 6 3 *',
  $$ ... bulk SMS logic ... $$
);
```

Para o SMS, a edge function `send-sms` já existe — o cron job fará query dos elegíveis (webinar=video, paid_at IS NULL, premium_granted_at IS NULL, phone IS NOT NULL, do_not_contact=false) e chamará `send-sms` para cada um, com o texto definido.

## 3. Ficheiros alterados

- **`supabase/functions/send-video-postwebinar-day1/index.ts`** — adicionar filtro `premium_granted_at`
- **Nova migração SQL** — criar os 2 cron jobs agendados + edge function auxiliar para SMS em lote
- **`supabase/functions/send-video-postwebinar-day1-sms/index.ts`** — nova edge function para envio SMS em lote (reutiliza lógica de `send-sms`)

## Resumo da audiência final

**Recebe o email/SMS:** Inscritos no webinar `video` onde:
- `paid_at IS NULL` (não pagou)
- `premium_granted_at IS NULL` (não recebeu acesso gratuito)
- `do_not_contact = false`
- Ainda não recebeu este email (dedup via `email_send_logs`)
- Para SMS: `phone IS NOT NULL`

**Excluídos:** Premium, Masterclass, Bundle (pagos) + Premium oferecido

