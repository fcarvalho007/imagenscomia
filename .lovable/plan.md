
## Refinamento do Funil de Inscrição no Dashboard

### Diagnóstico factual — como os passos realmente mapeiam

O funil de upgrade tem 5 passos reais:
- **Passo 1** → Origem (onde ouviu falar)
- **Passo 2** → Dúvida (dificuldade principal)
- **Passo 3** → Oferta Premium
- **Passo 4** → Oferta Masterclass ← está a faltar no dashboard actual
- **Passo 5** → Confirmação/Checkout (dados de faturação + pagamento)

O `step_reached` na base de dados é atualizado à entrada de cada passo:
- `step_reached >= 4` = chegou ao Passo 3 (viu Premium)
- `step_reached >= 5` = chegou ao Passo 4 (viu Masterclass) — actualmente rotulado erroneamente como "Flow completo"

O "Flow completo" actual no dashboard (184 pessoas) corresponde na realidade a quem viu a Masterclass, não a quem completou o checkout.

### Dados reais da base de dados (factual, sem invenção)

```
0. Visitaram a landing page        2 500  (editável)
1. Submeteram inscrição              234  (100% dos inscritos activos)
2. Chegou Passo 1 (Origem)           229  → drop de 5 (2%)
3. Chegou Passo 2 (Dúvida)           227  → drop de 2 (1%)
4. Viu oferta Premium (Passo 3)      193  → drop de 34 (15%)
5. Viu oferta Masterclass (Passo 4)  184  → drop de 9 (5%)
6. Clicou em pagar (upgrade_clicked)  18  → drop de 166 (90%)  ← MAIOR DROP-OFF
7. Pagamento confirmado (paid_at)     12  → drop de 6 (33%)
```

**Passo 6 e 7 não existem actualmente no funil do dashboard.** São calculados diretamente de `upgrade_clicked_at IS NOT NULL` e `paid_at IS NOT NULL` — campos já existentes no `inscritos` array.

O maior drop-off real é entre "Viu Masterclass" (184) e "Clicou para pagar" (18) — 90% de abandono. Este é o insight mais valioso e está completamente escondido do dashboard actual.

### Alterações no código

**Ficheiro:** `src/components/crm/DashboardView.tsx`

**1. Adicionar dois novos valores ao `stats` useMemo:**
```ts
const clickedToPay = active.filter((i) => i.upgrade_clicked_at !== null).length;
const paidConfirmed = active.filter((i) => i.paid_at !== null).length;
```

**2. Actualizar o array `funnelSteps` de 5 para 7 passos:**

```ts
const funnelSteps = [
  { label: "Submeteu inscrição",              value: stats.step1,         color: "hsl(var(--blue-600))",   note: null },
  { label: "Chegou ao Passo 1 — Origem",      value: stats.step2,         color: "hsl(var(--blue-600))",   note: null },
  { label: "Chegou ao Passo 2 — Dúvida",      value: stats.step3,         color: "#0891B2",                note: null },
  { label: "Viu oferta Premium (Passo 3)",    value: stats.step4,         color: "hsl(var(--amber-500))",  note: null },
  { label: "Viu oferta Masterclass (Passo 4)", value: stats.step5,        color: "#7C3AED",                note: null },
  { label: "Clicou para pagar",               value: stats.clickedToPay,  color: "hsl(var(--amber-500))",  note: "upgrade_clicked_at" },
  { label: "Pagamento confirmado",             value: stats.paidConfirmed, color: "hsl(var(--green-600))", note: "paid_at" },
];
```

**3. Actualizar `dropOffs` para 6 transições** (actualmente calcula apenas 4):

O cálculo de `dropOffs` já usa `funnelValues` dinâmicamente — basta adicionar os valores ao array `funnelValues`:

```ts
const funnelValues = [step1, step2, step3, step4, step5, clickedToPay, paidConfirmed];
```

**4. Legenda de contexto em dois passos especiais:**

Para os passos 6 e 7 (clicar para pagar e confirmação), adicionar uma sub-label descritiva pequena que contextualiza o que acontece nessa fase — informar que entre o clique e o pagamento há o preenchimento de dados de faturação:

Junto ao passo "Clicou para pagar" mostrar uma nota `· preenche dados de faturação ·` em tom mais suave (text-ink-400, 11px).

**5. Actualizar `maxDropIdx`** — já é calculado automaticamente pelo `reduce` sobre `dropOffs`, logo vai identificar automaticamente o maior drop como sendo entre o passo 5 (Masterclass) e passo 6 (clicou para pagar), que é o correto factualmente (drop de 166 pessoas, ~90%).

**6. UX melhorada: separador visual entre "funil de interesse" e "funil de pagamento":**

Entre o passo 5 (Masterclass) e o passo 6 (Clicou para pagar) adicionar um separador horizontal subtil com a label `— Intenção de compra →` para distinguir visualmente os dois momentos do funil.

### Ficheiro alterado

| Ficheiro | Alteração |
|---|---|
| `src/components/crm/DashboardView.tsx` | Adicionar `clickedToPay` e `paidConfirmed` ao `stats`; expandir `funnelSteps` de 5 para 7; actualizar `funnelValues` para 7 entradas; adicionar separador visual e nota contextual nos passos de pagamento |

### O que NÃO muda
- Nenhum dado é inventado — todos os valores vêm de campos existentes no array `inscritos`
- A lógica de visitantes editável mantém-se
- O formato visual das barras, drop indicators e highlight do maior drop-off mantém-se
- Todas as outras secções do dashboard ficam intactas
