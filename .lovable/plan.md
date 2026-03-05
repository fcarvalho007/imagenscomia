

# Testar envio via Brevo e recuperar emails falhados

## Situação actual
- Brevo já integrada como provider primário no `send-email`
- IPs desbloqueados na Brevo
- Remetente `frederico.carvalho@digitalfc.pt` verificado
- `BREVO_API_KEY` configurada

## Passos

1. **Testar envio** — Invocar `test-send-email` para confirmar que a Brevo está a funcionar
2. **Se sucesso** — Executar `resend-failed-emails` para recuperar as confirmações de pagamento falhadas (templates `video_payment_premium` e `video_payment_masterclass`)
3. **Verificar resultados** — Confirmar nos logs quantos emails foram reenviados com sucesso

Nenhuma alteração de código necessária — apenas invocação das funções existentes.

