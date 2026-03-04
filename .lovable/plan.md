

# Auditoria de Emails — Resultados e Correcoes Necessarias

## Caso luisfmenezes@gmail.com

O Luis tem 2 registos (imagens + video). O historico de emails do registo **video** e:

| Email | Data | Estado |
|---|---|---|
| video_confirmation | 27 Fev 17:06 | **Enviado** (Resend ID: 751e2a84) |
| video_followup_prewebinar | 1 Mar 10:00 | **Enviado** (Resend ID: 7aeed7db) |
| reminder_48h | 3 Mar 10:00 | **Falhou** (rate_limit_exceeded 429) |

**O Luis recebeu a confirmacao e o follow-up pre-webinar**, mas o lembrete de 48h falhou por rate limiting do Resend.

---

## Problema Critico: Rate Limiting do Resend

O `reminder_48h` tentou enviar ~165 emails sequencialmente sem qualquer delay. O Resend tem um limite de **2 requests/segundo**. Resultado:

- **76 enviados** (os primeiros ~76 passaram)
- **89 falharam** (429 rate_limit_exceeded) — incluindo o Luis

Este mesmo problema vai afectar o `reminder_24h` (amanha) e o `reminder_1h` (quinta) porque usam exactamente o mesmo padrao de envio sem throttling.

---

## Correcao: Adicionar Throttling a Todas as Funcoes de Envio em Massa

Adicionar um `await new Promise(r => setTimeout(r, 600))` entre cada envio (maximo ~1.6 req/s, abaixo do limite de 2/s) nas seguintes funcoes:

1. `send-video-reminder-48h/index.ts`
2. `send-video-reminder-24h/index.ts`
3. `send-video-reminder-1h/index.ts`
4. `send-video-postwebinar/index.ts`
5. `send-video-postwebinar-day1/index.ts`
6. `send-video-postwebinar-day3/index.ts`
7. `send-video-postwebinar-closing/index.ts`
8. `send-video-followup-prewebinar/index.ts`

Em cada uma, dentro do `for` loop, antes ou depois do `fetch` ao Resend, adicionar:

```typescript
await new Promise(r => setTimeout(r, 600));
```

---

## Correcao 2: Reenviar os 89 Emails Falhados do reminder_48h

O reminder_48h so executa dentro da janela 47-49h antes do webinar (ja passou). E necessario reenviar manualmente. Duas opcoes:

**Opcao A (recomendada)**: Alargar temporariamente a janela do reminder_48h (remover o time-window check), redeployar, invocar manualmente uma vez, e depois repor o check original.

**Opcao B**: Criar uma funcao one-shot `retry-failed-reminders` que busca os 89 emails falhados do `email_send_logs` e reenvia com throttling.

Recomendo **Opcao A** por ser mais simples e rapida.

---

## Correcao 3: Idempotencia Robusta

A idempotencia actual verifica `message_logs` com `status = "sent"`. Os 89 falhados foram registados como `status = "failed"`, portanto um reenvio NAO os vai duplicar — isto esta correcto.

---

## Estado das Automacoes Futuras

Os cron jobs estao todos configurados correctamente:

| Cron | Funcao | Schedule | Estado |
|---|---|---|---|
| reminder_24h | send-video-reminder-24h | 4 Mar 10:00 | **Vai falhar sem throttling** |
| reminder_1h | send-video-reminder-1h | 5 Mar 09:00-09:30 | **Vai falhar sem throttling** |
| postwebinar | send-video-postwebinar | 5 Mar 12:30 | **Vai falhar sem throttling** |
| postwebinar_day1 | send-video-postwebinar-day1 | 5 Mar 13:00 | Vai falhar |
| postwebinar_day3 | send-video-postwebinar-day3 | 8 Mar 10:00 | Vai falhar |
| postwebinar_closing | send-video-postwebinar-closing | 10 Mar 10:00 | Vai falhar |

**Urgencia**: O reminder_24h dispara amanha as 10h. Sem o throttling, vai ter o mesmo problema.

---

## Resumo das Alteracoes

| Ficheiro | Alteracao |
|---|---|
| 8 Edge Functions de envio em massa | Adicionar `await sleep(600)` no loop de envio |
| `send-video-reminder-48h/index.ts` | Remover temporariamente time-window para reenvio |
| Deploy | Redeployar todas as 8 funcoes |
| Invocacao manual | Invocar `send-video-reminder-48h` uma vez para reenviar os falhados |
| Restaurar | Repor time-window no reminder_48h apos reenvio |

