

# Fluxo de Venda Masterclass — Push Comercial para Não-Compradores

## Contexto

O fluxo actual da Masterclass (`getMasterclassNodes()`) apenas cobre o **pós-compra**: agradecimento, recursos, avaliação e fecho. Falta uma sequência de venda direccionada a quem tem Premium Pass mas **não** comprou Masterclass/Bundle — o segmento com maior probabilidade de conversão.

## Estratégia proposta

Criar uma nova sub-tab **"Venda MC"** no fluxo de automações (ao lado de "Pré-Webinar", "Pós-Evento" e "MC"), com uma sequência de 3 touchpoints focada em converter clientes Premium em Masterclass/Bundle:

```text
┌─────────────────────────────────────────────────┐
│  AUDIÊNCIA: Premium Pass pagos SEM Masterclass  │
│  (plan = premium, paid_at != null)              │
└─────────────────────────────────────────────────┘
        │
        ▼
  ┌──────────────────────────────────┐
  │ Email 1 — Convite Masterclass    │  9 Mar · 10h
  │ Valor da sessão + early bird     │  
  └──────────────────────────────────┘
        │  +24h
        ▼
  ┌──────────────────────────────────┐
  │ SMS — Lembrete curto             │  10 Mar · 11h
  │ "Ainda há vagas — link directo"  │  MANUAL
  └──────────────────────────────────┘
        │  +48h
        ▼
  ┌──────────────────────────────────┐
  │ Email 2 — Última oportunidade    │  11 Mar · 10h
  │ Urgência + prova social          │  
  └──────────────────────────────────┘
        │
        ▼
  ┌──────────────────────────────────┐
  │ Masterclass 12 Mar · 10h         │  FIM
  └──────────────────────────────────┘
```

## Plano de implementação

| # | Ficheiro | Alteração |
|---|---|---|
| 1 | `AutomationFlowTab.tsx` | Criar `getMasterclassSalesNodes(): NodeDef[]` com 3 nodes (2 emails + 1 SMS) + trigger + end, todos com `audienceFilter: { planFilter: ["premium"], requirePaid: true }` |
| 2 | `AutomationFlowTab.tsx` | Adicionar day groups: `mc_sell_invite` ("CONVITE · 9 MARÇO"), `mc_sell_push` ("PUSH · 10-11 MARÇO"), `mc_sell_close` ("VÉSPERA · 11 MARÇO") ao `DAY_GROUP_CONFIG` |
| 3 | `AutomationFlowTab.tsx` | Adicionar sub-tab "Venda MC" na lógica de tabs do webinar vídeo (junto a "mc"), renderizando `getMasterclassSalesNodes()` |
| 4 | `AutomationFlowTab.tsx` | SMS node com `smsSendConfig` pré-preenchido para Premium sem MC |

### Template keys propostas
- `video_mc_sales_invite` — Email 1 convite
- `sms_mc_sales_reminder` — SMS lembrete
- `video_mc_sales_closing` — Email 2 última oportunidade

### Audiência
Todos os nodes filtram por `planFilter: ["premium"]` + `requirePaid: true`, excluindo automaticamente quem já tem Masterclass ou Bundle.

Sem alterações de lógica de envio — apenas definição dos nodes visuais no fluxo de automação do CRM. Os emails/SMS são enviados manualmente ou via a tab de Comunicação existente.

