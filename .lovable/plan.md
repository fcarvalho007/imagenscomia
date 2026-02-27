

# Edge Function: send-video-followup-prewebinar

## 1. Nova Edge Function

**Ficheiro:** `supabase/functions/send-video-followup-prewebinar/index.ts`

- Padrão idêntico ao `send-video-reminder-1h`: CRON_SECRET guard, Resend send, dual logging (message_logs + email_send_logs)
- DATE GUARD: só executa entre 2026-02-27 e 2026-03-03 (UTC). Fora desse intervalo retorna `{ skipped: true, reason: "past_deadline" }`
- QUERY: `registrations` WHERE `webinar='video'`, `plan_selected='gratuito'`, `do_not_contact=false`, `created_at < NOW() - 48h`
- IDEMPOTENCY: skip se já existe em `email_send_logs` com `email_key='video_followup_prewebinar'` AND `status='sent'`
- Template DB: lê de `email_templates` com `template_key='video_followup_prewebinar'`, fallback para HTML hardcoded
- Subject: `"[fname], ainda dá tempo"`
- Logging: `email_send_logs` com `webinar='video'`, `email_key='video_followup_prewebinar'`

**HTML do email (fallback):**
Tom amigável, português, incentiva upgrade antes do webinar. Menciona early bird até 3 Mar, link para upgrade (`imagenscomia.com/upgrade-video`), assinatura Frederico Carvalho.

## 2. config.toml

Adicionar entrada:
```text
[functions.send-video-followup-prewebinar]
verify_jwt = false
```

## 3. Template na BD (email_templates)

INSERT via insert tool:
- `template_key`: `video_followup_prewebinar`
- `name`: `Follow-up pré-webinar — upgrade`
- `subject`: `{{fname}}, ainda dá tempo`
- `html_body`: HTML do email com `{{fname}}` placeholder

## 4. CRM: templateLabels.ts

Adicionar:
```text
video_followup_prewebinar: "Follow-up pré-webinar — upgrade"
```

## 5. CRM: AutomationFlowTab.tsx

Na função `getNodes()`, para ambos os webinars (mas o node só aparece no video), inserir um novo node **entre "Confirmação imediata" (index 1) e "Lembrete 48h" (index 2)**:

```text
{
  type: "email",
  title: "Follow-up upgrade pré-webinar",
  subtitle: "48h após inscrição · só gratuitos · até 3 Mar",
  templateKeyMatch: ["video_followup_prewebinar"],
  conditionLabel: "CRON · ATÉ 3 MAR",
  sendOffsetHours: null,
}
```

Abordagem: condicionar a inclusão deste node apenas quando `webinar === "video"` dentro de `getNodes()`.

Estilo: o `borderColor` será amber (#f59e0b) — adicionado via lógica especial para este templateKey, dado que não é AGENDADO nem IMEDIATO. Usar verificação: se `templateKeyMatch` inclui `"video_followup_prewebinar"`, forçar borderColor amber.

## 6. TEMPLATE_KEYS no FollowUpView.tsx

Adicionar `"video_followup_prewebinar"` ao array `TEMPLATE_KEYS` (linha ~57) para que o template seja carregado para edição no CRM.

## 7. Cron Job (manual SQL insert)

```sql
SELECT cron.schedule(
  'send-video-followup-prewebinar-daily',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url:='https://gwphpsehcnhwjiypyolg.supabase.co/functions/v1/send-video-followup-prewebinar',
    headers:='{"Content-Type":"application/json","x-cron-secret":"..."}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

Nota: o CRON_SECRET será referenciado a partir dos secrets já configurados. O date guard na function garante que mesmo que o cron continue a correr após 3 Mar, nada é enviado.

## Ficheiros alterados

| Ficheiro | Alteração |
|---|---|
| `supabase/functions/send-video-followup-prewebinar/index.ts` | NOVO — edge function completa |
| `supabase/config.toml` | Adicionar `verify_jwt = false` |
| `src/components/crm/templateLabels.ts` | Adicionar label |
| `src/components/crm/AutomationFlowTab.tsx` | Novo node condicional (video only) |
| `src/components/crm/FollowUpView.tsx` | Adicionar template_key ao array |
| BD: `email_templates` | INSERT do template |
| BD: cron job | Schedule diário às 10h UTC |

## O que NAO muda

- `followup-abandoned` (imagens only)
- Todas as outras edge functions de video
- Lógica de pagamento, registrations, upgrade flow
- Nenhum schema change necessário

