

# Template video_masterclass_day3 + SMS + Dashboard KPIs

## Resumo

3 blocos de trabalho: (1) inserir o template `video_masterclass_day3` na DB + criar edge function de envio, (2) actualizar SMS text no AutomationFlowTab, (3) adicionar bloco KPIs Masterclass no Dashboard.

## 1. Templates na Base de Dados

Inserir 3 templates na tabela `email_templates` (via insert tool — RLS bloqueia INSERT, precisarei de migration para adicionar política ou usar edge function):

- `video_masterclass_thankyou` — placeholder (já referenciado nos nodes)
- `video_masterclass_day1` — placeholder
- `video_masterclass_day3` — com o HTML completo fornecido pelo utilizador

**Problema**: A tabela `email_templates` não permite INSERT via cliente (RLS bloqueia). Vou criar uma migration que insere os 3 templates directamente via SQL.

## 2. Edge Function `send-video-masterclass-day3`

Criar edge function seguindo o padrão exacto de `send-video-postwebinar-day1`:
- Filtra `registrations` onde `webinar = 'video'`, plano IN (`video-masterclass`, `video-bundle`, `masterclass`, `bundle`), `paid_at IS NOT NULL OR premium_granted_at IS NOT NULL`
- Dedup via `email_send_logs` com `email_key = 'video_masterclass_day3'`
- Busca template da DB, fallback para HTML hardcoded (o conteúdo fornecido pelo utilizador)
- Substitui `{{fname}}` pelo `first_name`
- Regista em `message_logs` + `email_send_logs`
- Auth: `x-cron-secret` ou `service_role`
- Adicionar ao `config.toml`: `verify_jwt = false`

## 3. Actualizar SMS text no AutomationFlowTab

O SMS no `getMasterclassNodes()` (linha ~617) já tem texto. Actualizar para o texto fornecido:
> "FC: A gravação da Masterclass já está disponível. Acede em imagenscomia.com/recursos-video — Frederico"

(101 caracteres, 1 SMS)

## 4. Dashboard — Bloco KPIs Masterclass

Adicionar no `DashboardView.tsx`, visível apenas quando `webinarContext === "video"`, um novo widget entre os blocos existentes (após "Email Follow-up Status"):

**Widget "📽 Masterclass Vídeo"** com 3 KPIs:
- **Participantes confirmados**: `inscritos.filter(i => ['masterclass','bundle'].includes(i.plan) && i.paid_at)`
- **Emails entregues (3 steps)**: query a `message_logs` com `template_key IN ('video_masterclass_thankyou','video_masterclass_day1','video_masterclass_day3')` e `status = 'sent'`

**Nota**: O campo `review_sent` não existe na tabela `registrations`. Não vou adicionar o KPI "Avaliações submetidas" nem "Gravação acedida" (não há tracking de acesso a `/recursos-video`). Estes podem ser adicionados numa fase posterior.

## Ficheiros a criar/editar

| Ficheiro | Acção |
|----------|-------|
| Migration SQL | INSERT 3 templates em `email_templates` |
| `supabase/functions/send-video-masterclass-day3/index.ts` | Nova edge function |
| `supabase/config.toml` | Adicionar entry (automático) |
| `src/components/crm/AutomationFlowTab.tsx` | Actualizar SMS text (~linha 617) |
| `src/components/crm/DashboardView.tsx` | Novo widget KPIs Masterclass |

