

# Configurar Template Q&A com Link Zoom + Criar Edge Function de Envio

## O que muda

1. **Actualizar o template `video_qa_reminder`** na DB — incluir o link Zoom directo como CTA principal
2. **Actualizar o SMS** no `AutomationFlowTab.tsx` — incluir o link Zoom no texto
3. **Criar edge function `send-video-qa-reminder`** — envia email + SMS em lote aos clientes pagos (premium/masterclass/bundle), seguindo o padrão existente (ex: `send-video-reminder-1h`)

## Alterações

### 1. Database — UPDATE template `video_qa_reminder`

- CTA principal passa de "Aceder aos Recursos" para **"Entrar na sessão Q&A →"** com href `https://us02web.zoom.us/j/88370994509?jst=3`
- Adicionar o link Zoom em texto visível no corpo do email
- Remover a frase "O link de acesso já foi enviado anteriormente" (agora está incluído directamente)

### 2. `AutomationFlowTab.tsx` — SMS com link Zoom

Actualizar o `smsText` do node `sms_reminder_qa_post`:
```
"Lembrete: a sessao Q&A comeca as 14:30. Entra aqui: https://us02web.zoom.us/j/88370994509?jst=3 — Frederico"
```

### 3. Nova edge function `send-video-qa-reminder/index.ts`

Seguindo o padrão de `send-video-reminder-1h`:
- Filtra `registrations` onde `webinar = 'video'` e `(paid_at IS NOT NULL OR premium_granted_at IS NOT NULL)` e `do_not_contact = false`
- Verifica duplicados via `message_logs` (template_key = `video_qa_reminder`)
- Busca template da DB, substitui `{{nome}}` pelo `first_name`
- Envia email via `send-email` function
- Envia SMS via `send-sms` function aos que têm telefone (template_key = `sms_reminder_qa_post`)
- Regista em `message_logs` e `email_send_logs`
- Sem guarda de data/hora (invocação manual via CRM)

### Ficheiros

- `supabase/functions/send-video-qa-reminder/index.ts` (novo)
- `src/components/crm/AutomationFlowTab.tsx` (SMS text update)
- Database: UPDATE `email_templates` WHERE `template_key = 'video_qa_reminder'`

