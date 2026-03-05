

# Reenviar confirmação ao Júlio (único caso pendente)

## Diagnóstico

Após auditoria completa, **apenas 1 cliente pagante** tem um email de confirmação falhado sem reenvio:

| Cliente | Email | Template | Plano | Pagou em |
|---------|-------|----------|-------|----------|
| Júlio | julsilva@protonmail.com | video_group_confirmation_payer | masterclass | 5 Mar, 10:50 |

**Jorge** (jorge.isabelinho@brandenergy.pt) já recebeu `video_payment_premium` e `video_payment_masterclass` com sucesso — está resolvido.

Os restantes 12 falhas são `invoice_notification` (notificações internas para ti, fredericodigital@gmail.com) — não afectam clientes.

## Problema com o template actual

O template `video_group_confirmation_payer` usa placeholders `{{plan_label}}`, `{{total}}` e `{{attendee_list}}` que a função `resend-failed-emails` genérica **não preenche** (só substitui `{{fname}}`). 

Por isso, a melhor abordagem é criar uma edge function temporária `one-time-resend-julio` que:
1. Constrói o HTML com os dados reais do Júlio (Masterclass, grupo de 1 pessoa)
2. Envia via `send-email` centralizado (Brevo → Resend → E-goi)
3. Adapta o assunto para reconhecer o atraso: algo como **"Confirmação de pagamento — Masterclass ✅"** com uma nota no corpo a pedir desculpa pelo atraso no envio

## Conteúdo adaptado (23:52h)

Dado o horário tardio, o email será directo e profissional:
- Assunto: `Confirmação de pagamento — Masterclass ✅`
- Corpo: Reconhece o atraso ("Peço desculpa pelo atraso no envio desta confirmação"), confirma o pagamento, inclui detalhes do plano e link de suporte WhatsApp

## Plano de acção

1. **Criar** `supabase/functions/one-time-resend-julio/index.ts` — envia email personalizado ao Júlio com o HTML do template preenchido e nota de atraso
2. **Configurar** `supabase/config.toml` com `verify_jwt = false`
3. **Invocar** a função para enviar
4. **Limpar** — apagar a função temporária após confirmação de envio
5. **Opcionalmente** reenviar as 12 `invoice_notification` internas

### Ficheiros
- `supabase/functions/one-time-resend-julio/index.ts` (criar → apagar)
- `supabase/config.toml` (adicionar temporariamente → remover)

