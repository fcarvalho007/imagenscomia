

# Relatório: Envio Q&A Reminder — O que aconteceu

## Situação actual

O envio **já foi executado** (provavelmente quando invocámos a edge function `send-video-qa-reminder` para testar). Eis os números reais da base de dados:

| Canal | Status | Total |
|-------|--------|-------|
| Email | sent | **33** |
| SMS | failed | **25** |

## Problema: Audiência demasiado ampla

A edge function `send-video-qa-reminder` filtra apenas por `paid_at OR premium_granted_at` — **não filtra por plano**. Resultado:

| Plano | Emails enviados | Deviam receber? |
|-------|----------------|-----------------|
| **video-premium** | 12 | ✅ Sim |
| **video-bundle** | 9 | ✅ Sim |
| **video-masterclass** | 11 | ❌ **Não** |
| sem plano (admin) | 1 | ❌ Não |

**Total correcto**: 21 (premium + bundle)
**Enviados a mais**: 12 (11 masterclass + 1 admin)

Os 16 que aparecem no UI são provavelmente o contador do node da automação (que tem `planFilter: ["premium", "masterclass", "bundle"]`), não o total real de envios.

## SMS: 25 falhas, 0 sucessos

Todos os SMS falharam. Isto pode dever-se a formato de número inválido ou erro do provider E-goi. Nenhum SMS foi entregue.

## Correções necessárias

### 1. Edge function `send-video-qa-reminder` — Filtrar por plano
Adicionar filtro `plan_selected IN ('video-premium', 'premium', 'video-bundle', 'bundle')` para excluir masterclass-only.

### 2. Automation node — Corrigir planFilter
O node de email Q&A tem `planFilter: ["premium", "masterclass", "bundle"]`. Remover `"masterclass"` para ficar `["premium", "bundle"]`.

### 3. Node SMS Q&A — Mesmo ajuste
Remover `"masterclass"` do planFilter do SMS.

### Impacto
O email já foi enviado aos 11 masterclass-only. Não é possível "desfazer" — mas o conteúdo (lembrete Q&A com link Zoom) não é prejudicial, apenas não era necessário para quem comprou só Masterclass.

### Ficheiros a alterar
- `supabase/functions/send-video-qa-reminder/index.ts` — adicionar filtro de plano
- `src/components/crm/AutomationFlowTab.tsx` — remover `"masterclass"` dos planFilter dos 2 nodes Q&A

