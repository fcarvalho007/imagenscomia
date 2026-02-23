
# Correcao de 4 Problemas no CRM e /live-video

## Problemas identificados e solucoes

---

## PROBLEMA 1 — Dashboard: visitors do webinar video = 0

**Causa raiz:** `WEBINAR_DASHBOARD_CONFIG.video.visitors` esta hardcoded como `0` em `src/config/webinarConfig.ts`. Ao contrario do webinar imagens (valor fixo 2686), o video ainda nao tem dados.

**Solucao:** Criar uma nova row na tabela `analytics_cache` com key `landing_visitors_video` para contar visitantes da landing /video. Alterar o Dashboard para buscar este valor dinamicamente da tabela `analytics_cache`, tal como ja existe para o webinar imagens (`landing_visitors` = 2226 actualmente).

### Ficheiros a modificar:

| Ficheiro | Alteracao |
|---|---|
| `src/config/webinarConfig.ts` | Remover `visitors: 0` do video config e tornar o campo opcional |
| `src/components/crm/DashboardView.tsx` | Buscar visitors de `analytics_cache` com key `landing_visitors_video` para o contexto video; manter 2686 fixo para imagens (valor administrativo historico) |

### Detalhes:
- INSERT na tabela `analytics_cache`: key=`landing_visitors_video`, value=`0`, source=`manual`
- No DashboardView, adicionar `useEffect` para fetch de `analytics_cache` onde `key = 'landing_visitors_video'`
- Quando webinarContext = "video": usar o valor da cache (comecar em 0)
- Quando webinarContext = "imagens": manter 2686 fixo
- Quando webinarContext = "consolidado": somar 2686 + valor da cache video
- Na badge do Passo 0, quando video: mostrar "Total desde inicio" (sem "valor fixo")

---

## PROBLEMA 2 — Pipeline: inscrito video nao aparece

**Causa raiz:** O subscriber de video tem `plan_selected = "video-free"`. A funcao `mapRegistration` em `useInscritos.ts` nao traduz `"video-free"` para `"free"`. O pipeline filtra por `plan === "free"` para a coluna "Inscrito", mas o plan mapeado e `"video-free"` que nao corresponde a nenhuma coluna.

**Solucao:** Normalizar o plan no `mapRegistration`: se `plan_selected` comeca com `"video-"`, remover o prefixo. Ou seja, `"video-free"` torna-se `"free"`.

### Ficheiro a modificar:

| Ficheiro | Alteracao |
|---|---|
| `src/hooks/useInscritos.ts` | Na funcao `mapRegistration`, normalizar plan: `plan_selected?.replace(/^video-/, "")` antes de usar |

### Detalhe:
```typescript
// Antes
const plan = r.paid_at ? (r.plan_selected || "free") : (r.plan_selected || "free");

// Depois
const rawPlan = r.plan_selected || "free";
const plan = rawPlan.replace(/^video-/, ""); // "video-free" -> "free"
```

Isto garante que inscritos do webinar video com plan "video-free", "video-premium", etc. sao correctamente mapeados para os plans existentes ("free", "premium", etc.) e aparecem nas colunas correctas do pipeline.

---

## PROBLEMA 3 — Automacoes: "26 enviados" clicavel nao mostra dados

**Causa raiz:** Dois problemas independentes:

**3a)** A tabela `email_send_logs` esta VAZIA. As estatisticas "26 enviados" vem do fallback para `message_logs`, mas o drawer (`EmailRecipientsDrawer`) consulta `email_send_logs`, que nao tem dados.

**3b)** O fallback para `message_logs` nao filtra por webinar — conta TODOS os logs que contenham "confirmation" ou "stage_0" no template_key, resultando em 25 (16 followup_stage_0 internal + 9 followup_stage_0 resend = 25, nao 26 — mas inclui video_confirmation = 1). Estes nao sao emails de confirmacao de inscricao, sao emails de follow-up stage 0 que tambem fazem match com "stage_0".

**Solucao:**

1. O drawer deve ter fallback para `message_logs` quando `email_send_logs` esta vazio, para mostrar dados disponiveis
2. Corrigir o `templateKeyMatch` dos nodes para ser mais especifico — "confirmation" nao deve fazer match com "followup_stage_0" via "stage_0"
3. Separar melhor os matches: o node "Confirmacao imediata" so deve corresponder a template_keys que contenham exactamente "confirmation" (ex: `video_confirmation`, `imagens_confirmation`), NAO a "stage_0" que pertence ao follow-up

### Ficheiros a modificar:

| Ficheiro | Alteracao |
|---|---|
| `src/components/crm/AutomationFlowTab.tsx` | Corrigir templateKeyMatch do node "Confirmacao" para `["confirmation"]` (remover "stage_0"); corrigir `matchTemplate` ou `nodeCounts` para ser mais preciso |
| `src/components/crm/modal/EmailRecipientsDrawer.tsx` | Adicionar fallback para `message_logs` quando `email_send_logs` retorna vazio |

### Detalhe do match fix:
```typescript
// Node "Confirmação imediata" — ANTES:
templateKeyMatch: ["confirmation", "stage_0"]

// DEPOIS:
templateKeyMatch: ["confirmation"]
```

### Detalhe do drawer fallback:
Quando `email_send_logs` retorna 0 resultados, fazer query secundaria a `message_logs`:
```sql
SELECT registration_id, template_key, provider, status, error, created_at
FROM message_logs
WHERE template_key LIKE '%[emailKey]%'
  AND provider = 'resend'
ORDER BY created_at DESC
```
E depois fazer join com `registrations` para obter nome e email dos destinatarios.

---

## PROBLEMA 4 — /live-video: gate de email + tracking de presenca

**Causa raiz:** A pagina `/live-video` esta aberta a qualquer pessoa. Nao verifica se o visitante esta inscrito, nao regista presenca, e o email pos-webinar seria enviado a todos os inscritos em vez de apenas aos que assistiram.

**Solucao:** Adicionar um "email gate" a pagina `/live-video`:

### Componentes:

1. **Gate de email**: Antes de mostrar o conteudo, pedir o email. Verificar se existe em `registrations` com `webinar = 'video'`. Se sim, guardar em localStorage e mostrar o conteudo. Se nao, mostrar opcao de se inscrever.

2. **Tracking de presenca**: Quando o utilizador entra com email valido, marcar presenca na tabela `registrations` com uma nova coluna `attended_live_at` (timestamp).

3. **Botao de inscricao**: Se o email nao esta registado, mostrar um formulario de inscricao (reutilizar o RegistrationModal ja existente ou formulario inline).

4. **Email pos-webinar**: A edge function `send-video-postwebinar` deve filtrar apenas registos com `attended_live_at IS NOT NULL`.

### Ficheiros a criar/modificar:

| Ficheiro | Accao |
|---|---|
| Migration SQL | Adicionar coluna `attended_live_at timestamptz` a tabela `registrations` |
| `src/pages/WebinarLiveVideo.tsx` | Adicionar logica de gate: estado `verified` com email, se nao verificado mostra form de email |
| `src/components/webinar/LiveVideoGate.tsx` | **Novo** — componente do gate com input email, verificacao, e botao de inscricao para novos |
| `supabase/functions/send-video-postwebinar/index.ts` | Filtrar por `attended_live_at IS NOT NULL` |

### Fluxo do gate:

```
Utilizador abre /live-video
  |
  v
Tem email em localStorage?
  |-- Sim --> verificar se ainda existe em registrations
  |     |-- Sim --> mostrar conteudo + marcar attended_live_at
  |     |-- Nao --> mostrar form de email
  |-- Nao --> mostrar form de email
       |
       v
  Utilizador insere email
       |
       v
  Email existe em registrations?
  |-- Sim --> guardar localStorage + marcar attended_live_at + mostrar conteudo
  |-- Nao --> "Ainda nao estas inscrito" + botao "Inscrever-me" (abre RegistrationModal)
```

### Detalhe do form:
- Estetica limpa, centrado, fundo #FAFBFC
- Input: "Insere o email que usaste na inscricao"
- Botao: "Entrar na sessao"
- Se email nao encontrado: mensagem + botao "Inscrever-me agora" que abre o RegistrationModal
- Apos inscricao via modal: auto-verificar e entrar

### Detalhe do tracking:
```sql
UPDATE registrations 
SET attended_live_at = NOW() 
WHERE email = [email] AND webinar = 'video' AND attended_live_at IS NULL
```

---

## Ordem de implementacao

1. Migration: adicionar coluna `attended_live_at`
2. Fix `useInscritos.ts`: normalizar plan "video-free" -> "free"
3. Insert `analytics_cache`: row para `landing_visitors_video`
4. Fix `DashboardView.tsx`: buscar visitors video da cache
5. Fix `AutomationFlowTab.tsx`: corrigir templateKeyMatch
6. Fix `EmailRecipientsDrawer.tsx`: fallback para message_logs
7. Criar `LiveVideoGate.tsx` e integrar em `WebinarLiveVideo.tsx`
8. Actualizar `send-video-postwebinar` para filtrar por presenca
