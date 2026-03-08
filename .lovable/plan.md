

# Refinamentos ao fluxo Masterclass + Copywriting dos 3 templates

## Estado actual

### Templates na DB (3 activos)
| Template | Subject | Qualidade do copy |
|---|---|---|
| `video_masterclass_thankyou` | "Obrigado por participares, {{fname}}" | Bom — mas subject genérico, falta Google Calendar link |
| `video_masterclass_day1` | "Recursos da Masterclass prontos, {{fname}}" | Bom — falta link explícito de avaliação Google |
| `video_masterclass_day3` | "O que vem a seguir, {{fname}}" | Razoável — links newsletter/podcast placeholder |

### Edge Functions
- `send-video-masterclass-day3` — existe e funciona ✓
- `send-video-masterclass-thankyou` — **NÃO EXISTE**
- `send-video-masterclass-day1` — **NÃO EXISTE**

### Fluxo CRM (AutomationFlowTab)
O fluxo Masterclass tem 6 nodes e está visualmente correcto (ver screenshot). Sem refinamentos necessários na estrutura.

---

## Plano — 2 partes

### Parte 1 — Reescrever o copy dos 3 templates (SQL UPDATE)

Actualizar `subject`, `html_body` e `text_body` dos 3 templates, incrementando `version` para 2. Copy profissional na voz do Frederico, seguindo o padrão verde Masterclass.

**Template 1 — `video_masterclass_thankyou`**
- Subject: `Estás dentro, {{fname}}. Masterclass confirmada.`
- Corpo: Confirmação calorosa, detalhes da sessão (12 Mar, 10h–13h, Zoom), o que esperar (sistema completo de vídeo com IA), CTA para área de recursos, tom pessoal 1ª pessoa
- Acrescentar: link para adicionar ao Google Calendar

**Template 2 — `video_masterclass_day1`**
- Subject: `{{fname}}, a gravação e os recursos estão prontos`
- Corpo: Agradecimento pela presença, lista de recursos disponíveis (gravação 3h, prompts, fluxos, ferramentas), conselho prático ("escolhe um fluxo, faz um vídeo de 30s"), CTA verde para recursos
- Acrescentar: Bloco de pedido de avaliação Google com link real (`https://g.page/r/...`) — usar placeholder até ter o link real
- Tom: encorajador, prático, sem pressão

**Template 3 — `video_masterclass_day3`**  
- Subject: `O que vem a seguir, {{fname}}`
- Corpo: Check-in 3 dias depois, normalizar quem ainda não experimentou ("o acesso não tem prazo"), CTA recursos, secção de ecossistema (newsletter Digital Sprint, podcast Marketing por Idiotas), convite a partilhar
- Corrigir: URL do podcast Spotify (actualmente placeholder)
- Tom: despedida calorosa, porta aberta

### Parte 2 — Criar 2 edge functions em falta

**`send-video-masterclass-thankyou`** — Clonar padrão do `day3`:
- Filtra `registrations` por `webinar=video`, `plan IN (masterclass, bundle)`, `paid_at OR premium_granted_at`
- Dedup via `email_send_logs` com `email_key=video_masterclass_thankyou`
- Fetch template da DB, fallback inline
- Log em `message_logs` + `email_send_logs`

**`send-video-masterclass-day1`** — Mesmo padrão:
- `email_key=video_masterclass_day1`
- Mesma lógica de filtragem e dedup

Ambas seguem exactamente a estrutura da `send-video-masterclass-day3` existente.

---

## Ficheiros alterados
1. **SQL migration** — UPDATE dos 3 templates (version bump + novo copy HTML)
2. **`supabase/functions/send-video-masterclass-thankyou/index.ts`** — nova edge function
3. **`supabase/functions/send-video-masterclass-day1/index.ts`** — nova edge function

