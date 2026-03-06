

# Adicionar 3 nodes de email diferenciado para clientes na secção "Após o Webinar"

## Objectivo
Inserir 3 novos nodes no fluxo de automações do webinar Vídeo, na secção **APÓS O WEBINAR**, para os emails diferenciados por segmento de compra:
- **Recursos — Premium Pass** (10 pessoas)
- **Recursos — Masterclass** (2 pessoas)  
- **Recursos — Bundle** (5 pessoas)

## Localização
Na função `getNodes()` em `AutomationFlowTab.tsx`, após o node "Email pós-webinar — Dia 1" (linha ~256) e antes do "Email pós-webinar — Dia 3" (linha ~258). Isto coloca os emails de recursos para clientes pagantes no meio da sequência pós-evento.

## Nodes a adicionar

```text
┌─────────────────────────────────────────────┐
│  📧 Email pós-webinar — Dia 1              │  (existente)
├─────────────────────────────────────────────┤
│  🎬 Recursos — Premium Pass                │  NOVO
│  "Acesso à gravação + materiais · upsell   │
│   Masterclass"                              │
│  Tag: MANUAL · CLIENTES PREMIUM            │
│  Border: #16a34a (verde)                    │
├─────────────────────────────────────────────┤
│  🎓 Recursos — Masterclass                 │  NOVO
│  "Confirmação Masterclass 12 Mar · upsell  │
│   gravação"                                 │
│  Tag: MANUAL · CLIENTES MASTERCLASS         │
│  Border: #7c3aed (roxo)                     │
├─────────────────────────────────────────────┤
│  ⭐ Recursos — Bundle                      │  NOVO
│  "Acesso completo · gravação +             │
│   Masterclass 12 Mar"                       │
│  Tag: MANUAL · CLIENTES BUNDLE              │
│  Border: #0ea5e9 (azul claro)               │
├─────────────────────────────────────────────┤
│  📧 Email pós-webinar — Dia 3              │  (existente)
└─────────────────────────────────────────────┘
```

## Implementação

**Ficheiro:** `src/components/crm/AutomationFlowTab.tsx`

Adicionar 3 `NodeDef` entries após a linha 256, com:
- `templateKeyMatch`: `["video_recursos_premium"]`, `["video_recursos_masterclass"]`, `["video_recursos_bundle"]`
- `customTag` com label MANUAL e cores do segmento
- `note` com a descrição do conteúdo (recursos incluídos, upsell)
- Sem `smsSendConfig` nem `sendOffsetHours` (envio manual)

Também adicionar os 3 novos template keys ao array `TEMPLATE_KEYS` em `FollowUpView.tsx` (linha ~72).

