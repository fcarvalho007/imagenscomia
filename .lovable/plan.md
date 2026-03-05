

# Integrar Brevo como provider de email transacional

## Contexto
E-goi tem saldo negativo e Resend atingiu quota diária. Precisamos de um provider funcional para enviar os emails em falha.

## Alteração

**Ficheiro**: `supabase/functions/send-email/index.ts`

- Adicionar função `sendViaBrevo` que usa a API SMTP transacional da Brevo (`https://api.brevo.com/v3/smtp/email`)
- Requer header `api-key` com a chave da Brevo
- Remetente: `Frederico Carvalho <frederico.carvalho@digitalfc.pt>` (domínio já verificado na Brevo ou a verificar)
- Inserir Brevo como **provider primário** na cadeia: Brevo → E-goi → Resend
- Actualizar o tipo `SendEmailResponse` para incluir `"brevo"` como provider

## Secret necessário

- `BREVO_API_KEY` — chave de API da Brevo (obtida em app.brevo.com → SMTP & API → API Keys)
- Será pedida via ferramenta de secrets antes de implementar

## Passos

1. Pedir o secret `BREVO_API_KEY`
2. Adicionar `sendViaBrevo()` ao `send-email/index.ts`
3. Alterar a cadeia de fallback: Brevo primeiro, depois E-goi, depois Resend
4. Deploy da função
5. Testar com `test-send-email`
6. Executar `resend-failed-emails` para recuperar os emails em falha

## Nota sobre domínio
O remetente `frederico.carvalho@digitalfc.pt` precisa estar verificado na Brevo (domínio `digitalfc.pt`). Se ainda não estiver, será necessário adicionar os registos DNS (DKIM/SPF) na Brevo antes de enviar.

