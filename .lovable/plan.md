

# Correcao de timing: lembrete de 48h nunca vai disparar

## Problema critico encontrado

O cron do lembrete de 48h esta agendado para as **08:00 UTC**, mas a janela de disparo no codigo so abre entre **09:00 e 11:00 UTC** do dia 3 de Marco.

Calculo:
- Webinar: 5 Mar 10:00 UTC
- 49h antes = 3 Mar 09:00 UTC (inicio da janela)
- 47h antes = 3 Mar 11:00 UTC (fim da janela)
- Cron dispara as 08:00 UTC = **50h antes = FORA da janela**
- Proximo disparo: 4 Mar 08:00 = 26h antes = tambem fora

Resultado: o lembrete de 48h **nunca sera enviado** aos 122 inscritos gratuitos.

## Todas as outras automacoes estao correctas

| Automacao | Cron | Janela no codigo | Dispara? |
|---|---|---|---|
| followup-prewebinar | 10:00 diario | 27 Fev - 3 Mar | OK (proximo: 1 Mar 10h) |
| **reminder-48h** | **08:00 diario** | **09:00-11:00 do 3 Mar** | **FALHA** |
| reminder-24h | 10:00 diario | 09:00-11:00 do 4 Mar | OK (10:00 esta dentro) |
| reminder-1h | cada hora | 08:30-09:30 do 5 Mar | OK (09:00 esta dentro) |
| postwebinar (day 0) | 12:30 do 5 Mar | sem janela | OK |
| postwebinar-day1 | 13:00 do 5 Mar | sem janela | OK |
| postwebinar-day3 | 10:00 do 8 Mar | depende de day1 | OK |
| postwebinar-closing | 10:00 do 10 Mar | depende de day3 | OK |

## Verificacoes adicionais concluidas

- Templates na BD: nenhum tem "3 horas" (correcao anterior aplicada com sucesso)
- Confirmacoes de email: 128 enviados, sistema a funcionar
- Filtros de pagamento: todos usam `.is("paid_at", null)` (correcao anterior OK)
- Cadeia de dependencias day1 → day3 → closing: email_keys coincidem
- Idempotencia: todas as funcoes verificam envios anteriores
- Seguranca: todos validam CRON_SECRET

## Correcao

Alterar o cron job `video-reminder-48h` de `0 8 * * *` para `0 10 * * *`.

Isto faz com que dispare as 10:00 UTC do dia 3 de Marco, que esta dentro da janela de 09:00-11:00.

```sql
SELECT cron.unschedule('video-reminder-48h');

SELECT cron.schedule(
  'video-reminder-48h',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url:='https://gwphpsehcnhwjiypyolg.supabase.co/functions/v1/send-video-reminder-48h',
    headers:='{"Content-Type":"application/json","x-cron-secret":"Yx7Kp2mQ9vD4nL8sR3tA6hJ1cW5zB0uE7iO2pS9"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

Nenhum ficheiro de codigo e alterado — apenas o agendamento do cron na base de dados.

