

# Fase 3: Sequencia Pos-Webinar Video (3 emails + lost status + CRM)

## 1. Schema: adicionar colunas lost_at e lost_reason

Migracao SQL:
```sql
ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS lost_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lost_reason text DEFAULT NULL;
```

## 2. Tipo Inscrito: adicionar campos

Em `src/pages/crm/mockData.ts`, adicionar ao tipo `Inscrito`:
```text
lost_at: string | null;
lost_reason: string | null;
```

Em `src/hooks/useInscritos.ts`, mapear os novos campos no `mapRegistration`:
```text
lost_at: (r as any).lost_at || null,
lost_reason: (r as any).lost_reason || null,
```

## 3. Tres novas Edge Functions

Todas seguem o padrao do `send-video-postwebinar` existente: CRON_SECRET guard, Resend, dual logging (message_logs + email_send_logs).

### A: `send-video-postwebinar-day1`

- Cron: `0 13 5 3 *` (5 Mar 13h UTC, uma vez)
- Recipients: `webinar='video' AND plan_selected='gratuito' AND do_not_contact=false`
- NAO filtra por `attended_live_at` (YouTube publico)
- Idempotency: check `email_send_logs` para `email_key='video_postwebinar_day1'`
- Template key: `video_postwebinar_day1`
- Subject: `O webinar de hoje, {{fname}}`
- Fallback HTML: resumo do webinar + CTA upgrade (tom quente, "acabou de acontecer")

### B: `send-video-postwebinar-day3`

- Cron: `0 10 8 3 *` (8 Mar 10h UTC, uma vez)
- Recipients: mesma base + APENAS quem recebeu day1 (inner join com email_send_logs day1 status=sent) + re-verifica `plan_selected='gratuito'` (exclui quem comprou entretanto)
- Template key: `video_postwebinar_day3`
- Subject: `Antes que feche, {{fname}}`
- Fallback HTML: urgencia moderada, "faltam 2 dias"

### C: `send-video-postwebinar-closing`

- Cron: `0 10 10 3 *` (10 Mar 10h UTC, uma vez)
- Recipients: mesma logica, quem recebeu day3
- Template key: `video_postwebinar_closing`
- Subject: `Um ultimo email, {{fname}}`
- Fallback HTML: email de despedida, ultimo CTA
- **APOS ENVIO**: para cada email enviado com sucesso, executa:
  ```sql
  UPDATE registrations
  SET lost_at = NOW(), lost_reason = 'no_purchase_post_webinar'
  WHERE email = recipient_email AND webinar = 'video' AND plan_selected = 'gratuito'
  ```

## 4. config.toml

Adicionar 3 entradas:
```text
[functions.send-video-postwebinar-day1]
verify_jwt = false

[functions.send-video-postwebinar-day3]
verify_jwt = false

[functions.send-video-postwebinar-closing]
verify_jwt = false
```

## 5. Templates na BD

Inserir 3 registos em `email_templates` com template_key, name, subject e html_body para cada funcao.

## 6. Cron Jobs

3 cron jobs via `cron.schedule()` com as datas especificas (one-shot: 5 Mar, 8 Mar, 10 Mar).

## 7. CRM: templateLabels.ts

Adicionar:
```text
video_postwebinar_day1: "Email pos-webinar -- Dia 1"
video_postwebinar_day3: "Email pos-webinar -- Dia 3"
video_postwebinar_closing: "Email de fecho -- sem compra"
```

## 8. CRM: FollowUpView.tsx

Adicionar os 3 template keys ao array `TEMPLATE_KEYS`.

## 9. CRM: AutomationFlowTab.tsx

Na funcao `getNodes()`, para `webinar === "video"`, apos o node "Email pos-webinar" existente e antes do "end" node:

1. Separador visual: `"── POS-WEBINAR: SEQUENCIA ──"` (estilo: 10px, #9ca3af, letter-spacing 2px) -- implementado como um node de tipo `"separator"` (novo tipo) ou via `conditionLabel` especial.

2. Node A: "Email pos-webinar Dia 1" -- border amber, tag "5 MAR . 13H00", subtitle "Todos os inscritos gratuitos"
3. Node B: "Email pos-webinar Dia 3" -- border amber, tag "8 MAR . 10H00"
4. Node C: "Email de fecho" -- border red (#ef4444), tag "10 MAR . 10H00 . MARCA COMO PERDIDO", subtitle "Apos envio: lead marcado como perdido"

Implementacao: usar `conditionLabel` para os separadores e adicionar logica de `borderColor` para os template keys `video_postwebinar_day*` (amber) e `video_postwebinar_closing` (red).

## 10. CRM: PipelineView.tsx -- coluna "Sem interesse"

Adicionar nova coluna ao array `COLUMNS`:
```text
{
  title: "Sem interesse",
  color: "#ef4444",
  filter: (i) => i.lost_at !== null
}
```

Posicao: ultima coluna. Os cards mostram nome, email, badge "Fecho enviado [data]". As outras colunas devem excluir inscritos com `lost_at !== null` (adicionar `&& !i.lost_at` aos filtros existentes).

## 11. CRM: ActivityTimeline.tsx -- evento lost

Na construcao da timeline, se `inscrito.lost_at` existe, injectar um evento sintetico:
```text
{
  type: "system",
  title: "Lead marcado como perdido",
  subtitle: "Apos sequencia de follow-up sem resposta",
  date: inscrito.lost_at,
  icon: red circle
}
```

## Ficheiros alterados

| Ficheiro | Alteracao |
|---|---|
| BD: registrations | +lost_at, +lost_reason |
| `supabase/functions/send-video-postwebinar-day1/index.ts` | NOVO |
| `supabase/functions/send-video-postwebinar-day3/index.ts` | NOVO |
| `supabase/functions/send-video-postwebinar-closing/index.ts` | NOVO |
| `supabase/config.toml` | 3 novas entradas |
| BD: email_templates | 3 INSERTs |
| BD: cron jobs | 3 schedules |
| `src/pages/crm/mockData.ts` | +lost_at, +lost_reason no tipo |
| `src/hooks/useInscritos.ts` | mapear lost_at, lost_reason |
| `src/components/crm/templateLabels.ts` | 3 labels |
| `src/components/crm/FollowUpView.tsx` | 3 keys no array |
| `src/components/crm/AutomationFlowTab.tsx` | 3 nodes + separador (video only) |
| `src/components/crm/PipelineView.tsx` | coluna "Sem interesse" + exclusao nos filtros |
| `src/components/crm/modal/ActivityTimeline.tsx` | evento sintetico lost |

## O que NAO muda

- `send-video-postwebinar` (existente -- envia a attendees, intocavel)
- `followup-abandoned` (imagens only)
- Todas as outras edge functions
- Logica de pagamento, registration, upgrade flow

