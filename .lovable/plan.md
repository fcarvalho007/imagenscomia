

# Dashboard CRM — Resultados Live + Visitantes fixos + Data de corte

## Resumo das 3 alteracoes

1. **Novo card "Resultados Live · 18 Fev"** com 5 metricas do YouTube
2. **Passo 0 do funil fixado a 2686** com badge explicito "valor fixo · sem API analytics"
3. **Data de corte global (20 Fev 2026)** aplicada a todos os dados do dashboard

Tudo no ficheiro `src/components/crm/DashboardView.tsx`.

---

## A) Card "Resultados Live · 18 Fev"

Inserido logo apos os 4 KPIs existentes (linha ~508) e antes do card "Emails de Follow-up Resend".

Layout: card branco com 5 metricas em grid 3+2 (desktop) / 2+2+1 (mobile):

| Metrica | Valor |
|---|---|
| Visualizacoes | 268 |
| Duracao media | 27:35 |
| Pico de visualizacoes | 109 |
| Total de gostos | 14 |
| Novos subscritores | 11 |

Rodape discreto: "Fonte: YouTube Live Studio · 18 Fev 2026"

Dados hardcoded como constante `LIVE_RESULTS` no topo do componente — valores administrativos, sem input editavel.

---

## B) Passo 0 — Visitantes fixo a 2686

Substituir toda a logica de `fetchVisitantes` / `visitantesState` por uma constante:

```text
const FIXED_VISITORS = 2686;
```

- O valor 2686 e usado directamente no Passo 0 e em todos os calculos de percentagem do funil
- O badge muda de "via Analytics Cache" para: **"Total desde inicio · valor fixo (sem API analytics)"**
- Remove-se o estado `visitantesState`, o `fetchVisitantes`, o `useEffect` e o botao "Re-tentar"
- Remove-se a chamada ao edge function `get-analytics-visitors`

---

## C) Data de corte global — 20 Fev 2026

Adicionar constante no topo:

```text
const CUTOFF_DATE = new Date("2026-02-20T23:59:59");
```

### Onde e aplicada:

1. **`filteredInscritos`** — alem do filtro de periodo, tambem filtra `i.timestamp <= CUTOFF_DATE`
2. **Badge no header** — junto do selector de periodo, aparece: "Dados ate: 20 Fev 2026" (badge cinza discreta)
3. **Queries de email** (resend/falhas 24h e 7d) — adicionar `.lte("created_at", CUTOFF_DATE.toISOString())` (para consistencia)
4. Todos os KPIs, funil, pipeline pendente e "Pendentes ha +6h" ja derivam de `filteredInscritos`, por isso ficam automaticamente filtrados

### Labels de conversao (sem alteracao de logica, apenas clareza):

- KPI card: "Taxa Inscritos → Pago" com sublabel "X de Y inscritos activos pagaram" (ja existe)
- Passo 7 do funil: "X% dos visitantes" calculado sobre 2686 (ja existe, agora com valor fixo correcto)

---

## Ficheiro a alterar

| Ficheiro | Alteracao |
|---|---|
| `src/components/crm/DashboardView.tsx` | Constantes `FIXED_VISITORS` e `CUTOFF_DATE`; novo card Live Results; simplificar Passo 0; badge de data de corte no header; filtro temporal em `filteredInscritos` e queries de email |

Nenhum ficheiro novo. Nenhuma alteracao na base de dados.

