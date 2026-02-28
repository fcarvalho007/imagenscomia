

# Correcao critica: filtro plan_selected errado em 4 edge functions

## Problema

Quatro edge functions filtram por `plan_selected = 'gratuito'`, mas na base de dados nenhum registo do webinar de video tem esse valor. Os valores reais sao:

- `video-free`: 76 registos
- `NULL`: 42 registos (inscritos sem plano definido — tambem sao gratuitos)
- `video-masterclass`: 3 (pagos)
- `video-premium`: 2 (pagos)

Resultado: os emails de follow-up pre-webinar, pos-webinar day 1, day 3 e closing **nunca vao ser enviados**.

## Funcoes afectadas

| Funcao | Quando dispara | O que faz |
|---|---|---|
| `send-video-followup-prewebinar` | Diario 10h (27 Fev - 3 Mar) | Upsell pre-webinar para quem nao pagou |
| `send-video-postwebinar-day1` | 5 Mar 13h | Resumo + upsell Premium Pass |
| `send-video-postwebinar-day3` | 8 Mar 10h | Lembrete antes do fecho |
| `send-video-postwebinar-closing` | 10 Mar 10h | Ultimo email + marca como lost |

## Funcoes que estao correctas (sem alteracao)

- `send-video-reminder-48h` — filtra por `paid_at IS NULL` (OK)
- `send-video-reminder-24h` — filtra por `paid_at IS NULL` (OK)
- `send-video-reminder-1h` — sem filtro de plano, todos os inscritos (OK)
- `send-video-postwebinar` (day 0) — filtra por `attended_live_at IS NOT NULL` (OK)

## Correcao

Em cada uma das 4 funcoes, substituir:

```text
.eq("plan_selected", "gratuito")
```

Por logica equivalente que apanhe registos gratuitos (video-free ou NULL) e exclua pagos:

```text
.is("paid_at", null)
```

Este filtro e mais robusto porque:
- Apanha `video-free` (76 registos) e `NULL` (42 registos)
- Exclui automaticamente quem ja pagou (`video-premium`, `video-masterclass`)
- Nao depende do valor exacto de `plan_selected`
- E consistente com o que as funcoes de reminder ja usam

O mesmo ajuste aplica-se a linha de "mark as lost" no `postwebinar-closing` (linha 166), que tambem filtra por `plan_selected = 'gratuito'`.

## Ficheiros alterados

| Ficheiro | Linha(s) | Alteracao |
|---|---|---|
| `supabase/functions/send-video-followup-prewebinar/index.ts` | ~90 | `.eq("plan_selected", "gratuito")` → `.is("paid_at", null)` |
| `supabase/functions/send-video-postwebinar-day1/index.ts` | ~89 | `.eq("plan_selected", "gratuito")` → `.is("paid_at", null)` |
| `supabase/functions/send-video-postwebinar-day3/index.ts` | ~linha equivalente | `.eq("plan_selected", "gratuito")` → `.is("paid_at", null)` |
| `supabase/functions/send-video-postwebinar-closing/index.ts` | ~82 e ~166 | `.eq("plan_selected", "gratuito")` → `.is("paid_at", null)` (query + mark as lost) |

## Urgencia

O `followup-prewebinar` ja esta activo (janela 27 Fev - 3 Mar) e nao esta a enviar nada. Sem esta correcao, nenhum dos 118 inscritos gratuitos recebera emails de upsell nem de follow-up pos-webinar.

## Verificacao pos-correcao

Invocar manualmente o `followup-prewebinar` para confirmar que detecta destinatarios e envia (ou verificar nos logs que o proximo cron as 10h apanha registos).

