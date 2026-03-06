

# Fluxo de Automação Pós-Evento para Novas Inscrições

## Contexto

O fluxo actual do webinar de vídeo tem 4 secções (Pré-webinar, Confirmações de Compra, Após o Webinar, Fecho de Leads), mas tudo está numa timeline contínua. Não existe distinção visual clara entre o fluxo para quem se inscreveu **antes** do evento e quem se inscreve **depois**. As 3 inscrições pós-evento (Lúcia, Jéssica, Susana) não têm um fluxo dedicado.

## O que vou construir

### 1. Sub-tabs dentro do tab "Fluxo": Pré-Webinar | Pós-Evento

Adicionar dois sub-tabs no topo do tab Fluxo (apenas no contexto `video`):
- **Pré-Webinar** — mostra o fluxo actual (inscrições antes do evento)
- **Pós-Evento** — mostra o novo fluxo para inscrições após o webinar

### 2. Novo fluxo Pós-Evento com os seguintes nodes

```text
┌─ TRIGGER: Inscrição pós-evento ─────────────────┐
│  Webinar já decorreu · inscrição via /video      │
└──────────────────────────────────────────────────┘
         │
┌─ EMAIL: Confirmação imediata ────────────────────┐
│  Template: video_confirmation                    │
│  Automático · segundos após inscrição            │
│  Inclui link directo para upgrade                │
└──────────────────────────────────────────────────┘
         │
    ── AGUARDA PAGAMENTO ──
         │
┌─ EMAIL: Confirmação de compra (Premium) ─────────┐
│  Template: video_payment_premium                 │
│  Automático · pós-pagamento                      │
└──────────────────────────────────────────────────┘
         │
┌─ EMAIL: Confirmação de compra (Masterclass) ─────┐
│  Template: video_payment_masterclass             │
│  Automático · pós-pagamento                      │
└──────────────────────────────────────────────────┘
         │
    ── ACESSO AOS RECURSOS ──
         │
┌─ EMAIL: Recursos por plano ──────────────────────┐
│  Templates: video_recursos_premium/master/bundle │
│  Manual · após pagamento confirmado              │
└──────────────────────────────────────────────────┘
         │
┌─ SMS: Acesso aos recursos ───────────────────────┐
│  Manual · clientes pagos com telefone            │
└──────────────────────────────────────────────────┘
         │
┌─ END: Conversão concluída ───────────────────────┘
```

### 3. Contador de inscritos pós-evento no trigger

O trigger mostrará quantos inscritos existem com `created_at` posterior à data do webinar (`VIDEO_WEBINAR_DATE`), dando visibilidade imediata.

### 4. Estatísticas por node

Cada node mostrará contadores de enviados/falhas, filtrando apenas para inscritos pós-evento (comparando `registration_id` com inscritos cuja `timestamp` > data do webinar).

## Ficheiro a alterar

- **`src/components/crm/AutomationFlowTab.tsx`**:
  - Adicionar estado `flowSubTab` com valores `"pre"` | `"post"` (só visível quando `webinar === "video"`)
  - Criar função `getPostEventNodes()` com os nodes do fluxo pós-evento
  - Renderizar sub-tabs pill no topo do componente `Timeline`
  - O sub-tab "Pré-Webinar" renderiza os nodes actuais (`getNodes("video")`)
  - O sub-tab "Pós-Evento" renderiza `getPostEventNodes()` com a mesma UI de cards
  - Filtrar `inscritos` no sub-tab pós-evento para mostrar apenas `created_at > VIDEO_WEBINAR_DATE`

