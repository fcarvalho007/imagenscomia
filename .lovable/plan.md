

# Reminder pré-Masterclass — 12 de Março às 10h

## Situação actual

O fluxo de Masterclass no CRM (`getMasterclassNodes`) começa apenas com o email **pós**-Masterclass (obrigado às 14h). Não existe nenhum reminder **antes** da sessão para lembrar os participantes que a Masterclass acontece hoje.

## Plano

### 1. Criar edge function `send-video-masterclass-reminder`

Baseada no padrão do `send-video-reminder-1h`, mas adaptada para a Masterclass:

- **Audiência**: `registrations` com `webinar = 'video'`, plano `IN ('masterclass', 'bundle')`, com `paid_at` ou `premium_granted_at` preenchido, `do_not_contact = false`
- **Template key**: `video_masterclass_reminder`
- **Idempotência**: verificar `message_logs` para não re-enviar
- **Conteúdo do email**: "A Masterclass começa hoje às 10h00 — link de acesso ao Zoom"
  - Incluir link do Zoom para a sessão
  - Tom: breve, directo, entusiasta
- **Sem restrição de janela temporal** (ao contrário do reminder-1h que valida a hora) — a sessão é hoje e o envio deve ser imediato via invocação manual no CRM
- **Dual logging**: `message_logs` + `email_send_logs`

### 2. Adicionar node no fluxo de automação

Inserir um novo node **antes** do "Email pós-Masterclass — Obrigado" no `getMasterclassNodes()`:

- **title**: `"Email Reminder — Masterclass hoje às 10h"`
- **subtitle**: `"12 de Março · 8h30 · participantes pagos"`
- **templateKeyMatch**: `["video_masterclass_reminder"]`
- **customTag**: `{ label: "12 MAR · 8H30", bg: "#dbeafe", color: "#1d4ed8" }`
- **audienceFilter**: `{ planFilter: ["masterclass", "bundle"], requirePaid: true }`
- **dayGroup**: `"mc_reminder"`

Também adicionar um SMS reminder:

- **title**: `"SMS Reminder — Masterclass hoje"`
- **templateKeyMatch**: `["sms_masterclass_reminder"]`
- **smsSendConfig** com texto: `"Bom dia! A Masterclass Video com IA comeca hoje as 10h. Link de acesso enviado por email. Ate ja! — Frederico"`

### 3. Adicionar labels ao `templateLabels.ts`

- `video_masterclass_reminder`: `"Reminder Masterclass — Dia do evento"`
- `sms_masterclass_reminder`: `"SMS Reminder Masterclass — Dia do evento"`

### Ficheiros alterados

| Ficheiro | Alteração |
|----------|-----------|
| `supabase/functions/send-video-masterclass-reminder/index.ts` | **Nova** edge function de reminder |
| `src/components/crm/AutomationFlowTab.tsx` | Adicionar 2 nodes (email + SMS) antes do thank-you |
| `src/components/crm/templateLabels.ts` | Adicionar 2 labels |

