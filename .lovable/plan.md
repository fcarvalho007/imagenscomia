

# Reajuste "Venda MC" — Audiência: Inscritos Gratuitos (nunca compraram)

## Problema actual

Os 3 touchpoints da "Venda MC" estão escritos para Premium Pass holders fazerem upgrade para Bundle. O utilizador quer que este fluxo se dirija a **inscritos gratuitos que nunca compraram nada** — o segmento de conversão principal.

## Alterações

### 1. `AutomationFlowTab.tsx` — Corrigir audiência e textos dos nodes

| Node | Antes | Depois |
|------|-------|--------|
| Trigger subtitle | "Premium Pass pagos · sem MC/Bundle" | "Inscritos gratuitos · sem compra" |
| Email 1 audienceFilter | `planFilter: ["premium"], requirePaid: true` | `planFilter: ["free"], excludePaid: true` |
| Email 1 note | "…quem já tem o Premium Pass" | "Apresenta o Premium Pass e a Masterclass como oportunidade" |
| SMS planFilter | `["premium"]` | `["free"]` |
| SMS requirePaid | `true` | removido |
| SMS text | "…já tens o Premium Pass, podes fazer upgrade…" | "Ola! A Masterclass Video com IA e na quinta 12 Mar as 10h. Sessao ao vivo de 3h + Premium Pass incluido no Bundle em imagenscomia.com/comprar — Frederico" |
| Email 2 audienceFilter | `planFilter: ["premium"], requirePaid: true` | `planFilter: ["free"], excludePaid: true` |

### 2. Email templates (database UPDATE via insert tool)

**`video_mc_sales_invite`** — Reescrita completa:
- Assunto: `{{nome}}, na quinta faço uma sessão ao vivo que não quero que percas`
- Corpo: tom pessoal, convite para a Masterclass como primeiro passo (não upgrade). Explica o que é a Masterclass, o que inclui o Bundle (Premium Pass + MC), preço acessível. CTA para `/comprar`.

**`video_mc_sales_closing`** — Reescrita completa:
- Assunto: `{{nome}}, amanhã às 10h — última oportunidade para a Masterclass`
- Corpo: urgência honesta, recap do que perde se não participar, checklist Bundle, fecho empático.

Ambos removem todas as referências a "já tens o Premium Pass" / "upgrade" e focam-se em vender o pacote completo a quem nunca comprou.

### Ficheiros alterados
- `src/components/crm/AutomationFlowTab.tsx` — audiência + subtitles dos nodes
- Database: UPDATE dos 2 templates via insert tool

