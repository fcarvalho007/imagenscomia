
# Restruturar Fluxo Video com 4 secoes e 12 nodes

## Resumo

Reescrever a funcao `getNodes()` e o componente `Timeline` no ficheiro `AutomationFlowTab.tsx` para que o contexto Video apresente 12 nodes organizados em 4 secoes visuais com divisores, badges dinamicos, e bloco especial para confirmacoes de compra.

**Ficheiro unico a alterar:** `src/components/crm/AutomationFlowTab.tsx`

Nenhuma edge function, template, ou outro tab do CRM e modificado. O fluxo Imagens permanece intacto.

---

## 1. Novo tipo NodeDef expandido

Adicionar campos opcionais ao `NodeDef`:
- `sectionDivider?: string` — label do divisor de seccao (ex: "PRE-WEBINAR")
- `note?: string` — texto pequeno italico abaixo do subtitle
- `customTag?: { label: string; bg: string; color: string }` — badge personalizado (substitui o TagType generico)
- `borderColorOverride?: string` — cor forcada do border-left
- `infoBox?: string` — texto do bloco informativo (usado no node de fecho)
- `isPaymentBlock?: boolean` — agrupa nodes num bloco azul claro
- `iconEmoji?: string` — emoji para substituir o icone Lucide

Adicionar novo TagType: `"ACTIVO"`, `"ENCERRADO"`, `"A ENVIAR"`, `"NAO ENVIADO"` ao union type e TAG_STYLES/TAG_BORDER maps.

---

## 2. Reescrever getNodes() para video

Para `webinar === "video"`, retornar 12 nodes + 1 end node:

**Seccao 1 — PRE-WEBINAR** (`sectionDivider: "PRE-WEBINAR"`):
1. Trigger: "Inscricao submetida" (purple #8b5cf6)
2. Email: "Confirmacao imediata" (green #10b981), note: "Tem variantes A/B/C/D para participantes do webinar Imagens"
3. Email: "Follow-up upgrade" (amber #f59e0b), customTag dinamico: ACTIVO se hoje <= 3 Mar, ENCERRADO se > 3 Mar
4. Email: "Lembrete 48h" (blue #3b82f6), conditionLabel "48H ANTES DO WEBINAR", sendOffsetHours: -48
5. Email: "Lembrete 24h" (blue), conditionLabel "24H ANTES DO WEBINAR", sendOffsetHours: -24
6. Email: "Comeca em 1 hora" (blue), conditionLabel "1H ANTES DO WEBINAR", sendOffsetHours: -1

**Seccao 2 — CONFIRMACOES DE COMPRA** (`sectionDivider: "CONFIRMACOES DE COMPRA"`):
7. Email: "Confirmacao de compra -- Premium Pass" (green #16a34a), customTag "AUTOMATICO . POS-PAGAMENTO" green pill
8. Email: "Confirmacao de compra -- Masterclass" (purple #7c3aed), customTag "AUTOMATICO . POS-PAGAMENTO" purple pill

Renderizado dentro de um bloco especial com fundo #eff6ff, border #bfdbfe, border-radius 12px.

**Seccao 3 — APOS O WEBINAR** (`sectionDivider: "APOS O WEBINAR"`):
9. Email: "Email pos-webinar" (amber #f59e0b), isPostWebinar: true, note: "So para quem assistiu ao vivo (attended_live_at)"
10. Email: "Email pos-webinar -- Dia 1" (amber), customTag "5 MAR . 13H" amber
11. Email: "Email pos-webinar -- Dia 3" (amber), customTag "8 MAR . 10H" amber

**Seccao 4 — FECHO DE LEADS** (`sectionDivider: "FECHO DE LEADS"`):
12. Email: "Email de fecho" (red #ef4444), customTag "10 MAR . MARCA COMO PERDIDO" red, infoBox com texto explicativo

13. End: "Fluxo concluido"

Para `webinar === "imagens"`: manter a logica actual sem alteracoes.

---

## 3. Logica de badges dinamicos (getTag rewrite)

Nova funcao `getVideoTag()` para nodes do video:

- Reminder nodes (48h/24h/1h): calcula data de envio a partir de sendOffsetHours + startDate
  - Se data > hoje: "AGENDADO" (blue)
  - Se data = hoje: "A ENVIAR" (amber, com animacao pulse)
  - Se data < hoje: "ENVIADO" (green)

- Follow-up pre-webinar:
  - Se hoje <= 3 Mar: "ACTIVO" (amber)
  - Se hoje > 3 Mar: "ENCERRADO" (grey)

- Post-webinar nodes (day1/day3/closing):
  - Se target date > hoje: "AGENDADO" (blue) + texto "Agendado: [data] as [hora]"
  - Se target date < hoje AND sent > 0: "ENVIADO" (green)
  - Se target date < hoje AND sent = 0: "NAO ENVIADO" (red)

- Confirmacao imediata: sempre "IMEDIATO" (green)
- Payment confirmations: usam customTag fixo

---

## 4. Renderizacao de seccoes e divisores

No componente `Timeline`, antes de renderizar cada node, verificar se tem `sectionDivider`. Se sim, renderizar um divisor visual:

```text
---------- PRE-WEBINAR ----------
```

Estilo: linha horizontal com texto centrado, 10px, uppercase, letter-spacing 2px, #9ca3af, margem vertical 16px.

Para a Seccao 2 (CONFIRMACOES DE COMPRA), envolver os nodes 7-8 num bloco com:
- Background: #eff6ff
- Border: 1px solid #bfdbfe
- Border-radius: 12px
- Padding: 16px
- Label interno: "ENVIADO APOS PAGAMENTO CONFIRMADO" — 9px, #3b82f6

---

## 5. Info box no node de fecho

Apos o card do node 12, renderizar um bloco informativo:
- Background: #fef2f2
- Border: 1px solid #fecaca
- Border-radius: 8px
- Padding: 10px 12px
- Texto: "Apos envio deste email, o lead e marcado como 'perdido' no CRM com a data de fecho registada."
- Font: 12px, #991b1b

---

## 6. Notas (note field)

Renderizadas abaixo do subtitle em cada node:
- Font: 11px, #9ca3af, italic
- Margin-top: 4px

Nodes com notas:
- Node 2: "Tem variantes A/B/C/D para participantes do webinar Imagens"
- Node 9: "So para quem assistiu ao vivo (attended_live_at)"
- Node 10: "Inclui quem nao assistiu ao vivo"

---

## 7. Stats e interaccoes (sem alteracao)

Manter toda a logica existente de:
- emailStats lookup por template_key
- Contadores de enviados/falhas
- Click em "enviados" abre EmailRecipientsDrawer
- "Ver email" abre editor
- Botao "Enviar agora" no node pos-webinar
- Pending indicator para nodes com sendOffsetHours
- StatusBar intacto

---

## Alteracoes tecnicas

| Zona do ficheiro | Alteracao |
|---|---|
| Tipo TagType (linha 31) | Adicionar "ACTIVO", "ENCERRADO", "A ENVIAR", "NAO ENVIADO" |
| TAG_STYLES (linha 33) | Adicionar estilos para novos tags |
| TAG_BORDER (linha 41) | Adicionar borders para novos tags |
| NodeDef (linha 49) | Adicionar campos: sectionDivider, note, customTag, borderColorOverride, infoBox, isPaymentBlock |
| getNodes() (linha 60) | Reescrever ramo video com 12 nodes + seccoes |
| getTag() (linha 182) | Substituir por logica dinamica baseada em datas |
| Timeline render (linha 375) | Adicionar renderizacao de divisores, payment block, notes, info box, custom tags |

## O que NAO muda

- Fluxo Imagens (getNodes com webinar="imagens" inalterado)
- StatusBar
- EmailRecipientsDrawer
- Componente principal AutomationFlowTab (consolidado/single view)
- Qualquer outro ficheiro do projecto
