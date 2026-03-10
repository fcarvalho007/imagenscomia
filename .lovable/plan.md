

# Auditoria: Bundle (Pack IA Completo) — Cobertura de Comunicações

## Estado actual do Pedro (pedromarquesdesign.cmcr@gmail.com)

- **Registo vídeo:** `plan_selected = video-bundle`, `paid_at = 3 Mar`, normalizado para `plan: bundle` no CRM
- **Registo imagens:** `plan_selected = video-premium`, sem pagamento

### Emails já recebidos

| Template | Canal | Status | Data |
|----------|-------|--------|------|
| `video_confirmation_returning` | email | ✅ sent | 3 Mar |
| `video_payment_premium` | email | ✅ sent | 3 Mar |
| `video_recursos_premium` | email | ✅ sent | 6 Mar |
| `sms_recursos_post` | sms | ✅ sent | 6 Mar |
| `invoice_emitted` | email | ✅ sent | 7 Mar |
| `video_qa_reminder` | email | ✅ sent | 10 Mar |
| `sms_reminder_qa_post` | sms | ❌ failed | 10 Mar |

### Problemas identificados

1. **Recebeu `video_payment_premium` em vez de confirmação Bundle** — o pagamento foi processado como Premium antes do upgrade
2. **Recebeu `video_recursos_premium` em vez de `video_recursos_bundle`** — idem, enviado antes do upgrade
3. **Não recebeu emails da Masterclass** (`video_masterclass_thankyou`, `video_masterclass_day1`, `video_masterclass_day3`) — a Masterclass é dia 12 Mar, estes emails ainda não foram disparados
4. **SMS Q&A falhou** — possivelmente número inválido ou erro do provider

## Verificação da arquitectura de automações

### Fluxo Pós-Evento — Nodes correctamente separados por plano

Os nodes de **Recursos** e **Confirmação de compra** estão correctamente separados em 3 variantes (Premium / Masterclass / Bundle), cada um com o seu `planFilter`. Isto é **by design** — o Bundle tem template próprio com conteúdo diferente.

### Nodes que já incluem Bundle ✅

- Confirmação MC: `planFilter: ["masterclass", "bundle"]`
- Q&A email: `planFilter: ["premium", "masterclass", "bundle"]`
- Q&A SMS: `planFilter: ["premium", "masterclass", "bundle"]`
- Masterclass flow (thankyou, day1, day3): todos com `["masterclass", "bundle"]`
- Edge functions (`send-video-masterclass-*`): filtram por `plan_selected IN ('masterclass', 'bundle', 'video-masterclass', 'video-bundle')`
- Edge function `send-video-qa-reminder`: filtra por `paid_at OR premium_granted_at` (sem filtro de plano — inclui todos os pagos)
- `send-video-recursos-access`: template Bundle separado com `plans: ["video-bundle", "bundle"]`

### Node com potencial gap (imagens)

- SMS lembrete Q&A no fluxo **imagens** (linha 535): `planFilter: ["premium"]` — deveria incluir `"bundle"` se houver bundles cross-webinar

## Acções recomendadas

### 1. Reenviar email de recursos Bundle ao Pedro
Invocar a edge function `send-video-recursos-access` com `dry_run: false` — como ele já recebeu `video_recursos_premium`, a função vai verificar duplicados por `template_key`. O template `video_recursos_bundle` ainda não foi enviado, então será enviado.

### 2. Corrigir SMS lembrete Q&A (fluxo imagens)
Actualizar `planFilter` de `["premium"]` para `["premium", "bundle"]` no node SMS Q&A do fluxo imagens (linha 535 de `AutomationFlowTab.tsx`).

### 3. Nenhuma alteração necessária nos restantes fluxos
A arquitectura já garante que Bundle recebe:
- Emails da Masterclass (thankyou + day1 + day3) — serão enviados a partir de 12 Mar
- Q&A reminder (já enviado com sucesso)
- Recursos Bundle (template próprio)

### Ficheiros a alterar
- `src/components/crm/AutomationFlowTab.tsx` — linha 535: adicionar `"bundle"` ao planFilter do SMS Q&A imagens
- Invocação manual: `send-video-recursos-access` com `dry_run: false` para enviar o email Bundle ao Pedro

