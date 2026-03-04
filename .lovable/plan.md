

# Análise dos emails falhados e plano de reenvio

## Situação actual (4 de Março, 16:15 — webinar amanhã às 10:00)

231 inscritos no webinar de vídeo. O sistema de email só começou a funcionar correctamente hoje (domínio E-goi corrigido para `mkt.digitalfc.pt`). Resultado: muitos emails falharam antes da correcção.

### Emails pendentes (falhados sem reenvio bem-sucedido)

| Template | Pendentes | Relevância agora | Acção |
|---|---|---|---|
| `video_reminder_24h` | 141 | **Muito relevante** — webinar é amanhã. Este é o email mais importante. | **Reenviar já** |
| `video_followup_prewebinar` | 17 | **Relevante** — upsell pré-webinar, ainda há tempo para converter. | **Reenviar já** |
| `video_confirmation` | 7 | Moderada — o webinar é amanhã, a confirmação em si é menos urgente, mas reforça a presença. | **Reenviar** |
| `video_confirmation_returning` | 2 | Idem. | **Reenviar** |
| `video_payment_masterclass` | 5 | **Crítico** — são clientes que pagaram e não receberam confirmação de compra. | **Reenviar** |
| `video_group_confirmation_payer` | 1 | **Crítico** — pagador de grupo sem confirmação. | **Reenviar** |

### Automações agendadas que ainda vão correr

- **Lembrete 1h** (`video_reminder_1h`): Cron `0 * * * *` — dispara a cada hora. Janela activa: 08:30-09:30 UTC amanhã (5 de Março). Está correctamente configurado e agora o E-goi funciona, portanto vai enviar sem problemas.
- **Pós-webinar**: Todos agendados para 5, 8 e 10 de Março. Sem acção necessária.

### Conclusão: o `video_reminder_48h` não precisa de reenvio

Tinha 88 falhas mas 0 pendentes — todos já foram cobertos pelo envio bem-sucedido do reminder_48h (201 enviados). Nada a fazer.

## Plano de execução

Invocar a função `resend-failed-emails` sequencialmente para cada template, por ordem de prioridade:

1. **`video_reminder_24h`** (141 pessoas) — prioridade máxima
2. **`video_payment_masterclass`** (5 pessoas) — clientes pagantes sem confirmação
3. **`video_group_confirmation_payer`** (1 pessoa) — pagante de grupo
4. **`video_followup_prewebinar`** (17 pessoas) — upsell
5. **`video_confirmation`** (7 pessoas) — confirmação de inscrição
6. **`video_confirmation_returning`** (2 pessoas) — confirmação returning

Total: ~173 emails a reenviar. Com o delay de 600ms por email, isto leva ~2 minutos.

### Detalhe técnico

A função `resend-failed-emails` já faz exactamente o que é necessário:
- Busca `message_logs` com `status=failed` para o `template_key`
- Exclui quem já recebeu com sucesso (deduplicação)
- Exclui `do_not_contact=true`
- Lê o template da tabela `email_templates`
- Envia via `send-email` (agora a usar E-goi com domínio correcto)
- Regista em `message_logs` e `email_send_logs`

Cada invocação usa os parâmetros `template_key` e `email_key`. Não é necessária nenhuma alteração de código — apenas invocar a função 6 vezes com os parâmetros correctos.

