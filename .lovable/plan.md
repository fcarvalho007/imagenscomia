

# Correcções: Templates visíveis + Reminder às 09h

## Problema 1 — "Ver email →" não funciona

O array `TEMPLATE_KEYS` em `FollowUpView.tsx` (linha 57-65) não inclui `video_masterclass_reminder`. Por isso, o template não é carregado do banco de dados e o clique mostra "Template não configurado".

**Correcção**: Adicionar `"video_masterclass_reminder"` ao array `TEMPLATE_KEYS`.

## Problema 2 — Horário do Reminder

O node e o template dizem "8h00" / "2h antes". O utilizador quer que seja às **09h00** (1h antes da Masterclass às 10h).

**Correcções**:
- `AutomationFlowTab.tsx`: Alterar subtitle para `"12 de Março · 9h00 · 1h antes da sessão"` e tag para `"12 MAR · 9H00"`
- `send-video-masterclass-reminder/index.ts`: Alterar o HTML do fallback — "Daqui a 1 hora" em vez de "Daqui a 2 horas"
- Actualizar o subject default para `"🎬 Daqui a 1 hora — a Masterclass começa às 10h"`
- Actualizar o template na tabela `email_templates` (subject)

## Ficheiros alterados

| Ficheiro | Alteração |
|----------|-----------|
| `src/components/crm/FollowUpView.tsx` | Adicionar `video_masterclass_reminder` ao `TEMPLATE_KEYS` |
| `src/components/crm/AutomationFlowTab.tsx` | Subtitle e tag: 9h00, 1h antes |
| `supabase/functions/send-video-masterclass-reminder/index.ts` | HTML e subject: "Daqui a 1 hora" |
| DB `email_templates` | Actualizar subject do `video_masterclass_reminder` |

