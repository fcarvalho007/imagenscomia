
# 3 Targeted Fixes for Automacoes

## FIX 1 — Register missing template keys

**Ficheiro:** `src/components/crm/FollowUpView.tsx`

O array `TEMPLATE_KEYS` (linha 54-58) ja inclui a maioria dos keys de video, mas faltam 2:
- `"video_payment_premium"`
- `"video_payment_masterclass"`

Adicionar esses 2 keys ao array. Os restantes (`video_postwebinar_day1`, `video_postwebinar_day3`, `video_postwebinar_closing`, `video_followup_prewebinar`) ja estao presentes.

Alem disso, no `AutomationFlowTab.tsx` (linha 642-653), o botao "Ver email" nao tem fallback quando o template nao e encontrado. Adicionar logica no `FollowUpView.handleOpenEditor` para mostrar `toast.error("Template nao configurado")` se o template nao for encontrado no array carregado da BD.

---

## FIX 2 — Novo componente FollowUpPessoasVideo

**Novo ficheiro:** `src/components/crm/FollowUpPessoasVideo.tsx`

Componente dedicado ao contexto Video que mostra historico de emails por pessoa.

### Dados
- Usa `inscritos` (ja filtrados para video pelo parent) + query directa a `email_send_logs` filtrando `webinar = 'video'`
- Join client-side por `recipient_email`

### Colunas da tabela
1. **Nome** — nome + email (12px grey) + badge de plano (green=gratuito, blue=premium, purple=masterclass) + badge vermelho "perdido" se `lost_at` existir
2. **Emails Recebidos** — dots inline coloridos por template:
   - `video_confirmation` → verde
   - `video_reminder_*` → azul
   - `video_followup_prewebinar` → amber
   - `video_payment_*` → roxo
   - `video_postwebinar` / `_day1` / `_day3` → laranja
   - `video_postwebinar_closing` → vermelho
   - Falha: X vermelho
   - Tooltip com nome do template (via `templateLabels.ts`), data, e status
3. **Ultimo Envio** — data/hora do email mais recente + label do template
4. **Proximo Agendado** — calculo baseado na data de registo e datas dos crons (5 Mar, 8 Mar, 10 Mar) vs emails ja enviados. "Ciclo completo" se todos enviados, "Fecho enviado" se perdido
5. **Accoes** — mesmos icones actuais (ficha, WhatsApp)

### Filtros
`"Todos"` | `"So gratuitos"` | `"Compraram"` | `"Sem emails"` | `"Perdidos"`

### Empty state
"Ainda sem inscritos no Webinar Video."

---

## FIX 3 — Condicional no FollowUpView

**Ficheiro:** `src/components/crm/FollowUpView.tsx`

Na tab "Pessoas" (sub-tab "Pessoas"), verificar `webinarContext`:
- Se `"video"` ou `"consolidado"` com sub-filtro video: renderizar `FollowUpPessoasVideo`
- Se `"imagens"`: renderizar `FollowUpPessoas` existente (zero alteracoes)

O componente `FollowUpPessoas.tsx` nao e modificado.

---

## Ficheiros alterados

| Ficheiro | Alteracao |
|---|---|
| `src/components/crm/FollowUpView.tsx` | +2 template keys, fallback toast no handleOpenEditor, condicional video/imagens na tab Pessoas |
| `src/components/crm/FollowUpPessoasVideo.tsx` | Novo componente — historico de emails por pessoa para Video |
| `src/components/crm/AutomationFlowTab.tsx` | Nenhuma alteracao |

## O que NAO muda
- `FollowUpPessoas.tsx` (Imagens intacto)
- `AutomationFlowTab.tsx`
- Edge functions
- Templates de email
- Logica de pagamento
- Qualquer outra seccao do CRM
