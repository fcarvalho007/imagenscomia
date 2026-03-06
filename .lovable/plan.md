

# Actualizar fluxo Pós-Evento: títulos, templates e conteúdos

## Problemas detectados

### No `AutomationFlowTab.tsx` (post-event nodes):
1. **Subtítulos genéricos** — "Gravação HD · Pack · Q&A 10 Mar" está desactualizado (Q&A já passou)
2. **SMS text** refere "acesso a gravacao e materiais" de forma genérica, sem mencionar os 5 itens do Premium Pass
3. **Títulos** corretos mas subtítulos não reflectem o conteúdo actualizado dos emails

### No `send-video-postwebinar-closing/index.ts`:
1. **Design básico** — sem header Navy-Indigo (inconsistente com Day 1 e Day 3 já redesenhados)
2. **Copy genérica** — "workbook, guia GEMs e Q&A" desactualizado (Q&A já decorreu; falta Ficheiro GEM e Áudio)
3. **Sem secção Masterclass** — os Day 1 e Day 3 incluem upsell para Masterclass, mas o closing não

## Alterações

### 1. `src/components/crm/AutomationFlowTab.tsx` — post-event nodes

Actualizar subtítulos e SMS text em `getPostEventNodes()`:

| Node | Subtítulo actual | Novo subtítulo |
|------|-----------------|----------------|
| Confirmação Premium | "Gravação HD · Pack · Q&A 10 Mar · link calendário" | "Sessão 70min · Workbook · GEMs · Áudio · link calendário" |
| Confirmação Masterclass | "Masterclass 12 Mar · 10h00 · link calendário" | "Masterclass 12 Mar · 10h–13h · gravação incluída" |
| Recursos Premium | "Acesso gravação + materiais · upsell Masterclass" | "Gravação + Workbook + GEMs + Áudio · upsell Masterclass" |
| Recursos Masterclass | "Confirmação Masterclass 12 Mar · upsell gravação" | "Masterclass 12 Mar · 10h–13h · upsell Premium Pass" |
| Recursos Bundle | "Acesso completo · gravação + Masterclass 12 Mar" | "Acesso completo · 5 recursos + Masterclass 12 Mar" |
| SMS Recursos | smsText genérico | "Ola! Ja tens acesso a gravacao completa (70min), workbook, guia GEMs e audio em imagenscomia.com/recursos-video — usa o email de registo. Ate ja! — Frederico" |

### 2. `supabase/functions/send-video-postwebinar-closing/index.ts` — redesign

Redesenhar `buildFallbackHtml()` com:
- Header Navy-Indigo gradient (igual ao Day 1 e Day 3)
- Copy de fecho respeitosa ("Este é o último email")
- Box Premium Pass com os 5 itens (Sessão, Workbook, GEMs, Ficheiro GEM, Áudio) — €27+IVA
- Box Masterclass (12 Mar, 10h–13h, €47+IVA)
- Footer com WhatsApp + assinatura
- Subject: `"Último email, {{fname}} — Premium Pass e Masterclass"`

### 3. `src/components/crm/templateLabels.ts`

Actualizar labels:
- `video_postwebinar_closing`: "Email de fecho — última oportunidade"
- `sms_recursos_post`: "SMS Recursos — Clientes pagos"

