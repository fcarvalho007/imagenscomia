

## Inserir SMS de follow-up após o email pós-webinar Dia 1

### Alteração

Adicionar um novo node SMS no array `preWebinarNodes` em `src/components/crm/AutomationFlowTab.tsx`, imediatamente após o node `video_postwebinar_day1` (linha 311), com:

- **type**: `"email"` (padrão usado para todos os nodes, incluindo SMS)
- **channel**: `"sms"`
- **title**: `"SMS follow-up — Dia 1"`
- **subtitle**: `"Envio manual · inscritos gratuitos com telefone"`
- **templateKeyMatch**: `["sms_followup_day1"]`
- **iconEmoji**: `"📱"`
- **borderColorOverride**: `"#f59e0b"`
- **customTag**: `{ label: "MANUAL · SMS", bg: "#fef3c7", color: "#d97706" }`
- **smsSendConfig**:
  - `planFilter: ["free"]`
  - `webinarFilter: "current"`
  - `smsText`: `"Bom dia. O documento resumo do webinar Video com IA foi enviado agora por email. Acesso premium + Sessao completa video em: imagenscomia.com/comprar"`
  - `requirePhone: true`
- **audienceFilter**: `{ planFilter: ["free"], excludePaid: true }`

Também adicionar `"sms_followup_day1"` ao `templateLabels.ts` com label `"SMS follow-up — Dia 1"`.

### Ficheiros alterados
- `src/components/crm/AutomationFlowTab.tsx`
- `src/components/crm/templateLabels.ts`

