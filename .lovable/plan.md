

# Corrigir URL do Google Calendar em todos os ficheiros

## Problema

O URL do Google Calendar usado no email de confirmação e em várias páginas é o antigo link TEMPLATE. O URL correto é o link curto: `https://calendar.app.google/kyhFPoficXByZf5S8`

## Ficheiros a alterar

| Ficheiro | Linha | Contexto |
|---|---|---|
| `supabase/functions/send-video-confirmation/index.ts` | 10-11 | Hardcoded no email de confirmação |
| `src/components/webinar/VideoWebinarVideoArea.tsx` | 14-15 | Página /live-video (sala de espera) |
| `src/components/landing/ConfirmacaoExtras.tsx` | 45 | Página /confirmacao (passo 2 calendário) |
| `src/pages/UpgradeSucesso.tsx` | 150 | Página de sucesso pós-pagamento |

Todos os 4 ficheiros: substituir o URL longo `https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=...` por `https://calendar.app.google/kyhFPoficXByZf5S8`.

A Edge Function `send-video-confirmation` será redeployed automaticamente.

