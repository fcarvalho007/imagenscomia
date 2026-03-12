
Validação feita ao código e backend (estado atual):

1) O fix principal já está no código:
- `src/components/crm/FollowUpView.tsx` já inclui `video_masterclass_reminder` em `TEMPLATE_KEYS`.
- `src/components/crm/AutomationFlowTab.tsx` já mostra Masterclass Reminder às `9h00` (não 8h00).

2) O template existe no backend:
- `email_templates.video_masterclass_reminder` existe, com subject atualizado para “Daqui a 1 hora…”.

3) O agendamento existe:
- Job `video-masterclass-reminder-20260312` ativo com cron `0 9 12 3 *`.
- Ainda não havia execução no momento da verificação (hora atual ~08:57 UTC/Lisboa), e sem envios antes da hora.

Diagnóstico provável do “Ver email não abre”:
- O problema não é ausência de template nem key em falta.
- Mais provável: falha silenciosa de carregamento/lista em memória (estado local), sem fallback por key e sem erro visível.

Plano de implementação (correções):

1) Tornar abertura de template à prova de falhas
- Em `FollowUpView.tsx`, no `handleOpenEditor`:
  - Se não encontrar no estado local, fazer fetch direto por `template_key` (`.eq(...).maybeSingle()`).
  - Se encontrar, abrir painel.
  - Se falhar, mostrar erro explícito com motivo.
- Adicionar estado `templatesLoading/templatesError` para não ficar “sem feedback”.

2) Evitar regressão de “key em falta”
- Remover lista estática frágil de keys e passar a derivar keys de uma fonte única (config de fluxo), ou no mínimo manter lista central exportada e reutilizada.
- Isto elimina o risco de “Ver email” quebrar quando se adicionam novos nodes.

3) Corrigir bugs de fluxo identificados
- `AutomationFlowTab.tsx`: adicionar `isMcSellTab` nas dependências do `useMemo` de `filteredInscritos` (há risco de contagens/audiência desatualizadas ao trocar subtabs).
- Adicionar config visual do grupo `mc_reminder` em `DAY_GROUP_CONFIG` para consistência de agrupamento no fluxo Masterclass.

4) Reforço para garantir envio às 09h e não antes
- Em `send-video-masterclass-reminder`:
  - Adicionar guard de janela temporal (Lisboa) para só permitir envio automático no intervalo esperado (ex.: 09:00–09:15 do dia da sessão), exceto chamada manual explícita com flag/admin.
- Mantém idempotência atual e evita disparo antecipado por engano.

5) Validação final (E2E)
- Hard refresh no preview.
- Abrir CRM > Automações > Masterclass > clicar “Ver email” no reminder e confirmar painel abre.
- Confirmar texto do node: 9h00 / 1h antes.
- Confirmar ausência de logs antes das 09h.
- Após 09h, confirmar execução do job e contagem de envios/falhas para `masterclass + bundle`.
