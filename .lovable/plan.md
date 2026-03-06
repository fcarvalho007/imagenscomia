

# Faturação — Redesign Visual

## Problemas actuais

1. **KPIs todos do mesmo tamanho** — 6 cards iguais numa grelha 6-col, tudo pequeno, nenhum número "cinematográfico"
2. **Gráficos enterrados no fundo** — o P&L visual com bar/pie charts está na última secção, pouco visível
3. **Hierarquia visual plana** — todas as secções (KPIs, planos, custos, faturas, P&L) têm o mesmo peso visual
4. **Números pequenos** — valores em `text-lg/text-xl`, sem impacto

## Redesign proposto

### 1. `FaturacaoKPIs.tsx` — Hero financeiro com números grandes

Substituir a grelha uniforme de 6 cards por um layout com **hierarquia clara**:

- **Linha 1 (hero row)**: 3 cards grandes lado-a-lado
  - **Receita Confirmada** — número em `text-4xl font-black` verde, com animated count-up
  - **Margem Operacional** — número em `text-4xl font-black`, cor condicional (verde/vermelho), com glow subtil
  - **ROAS** — número enorme `text-5xl` com sufixo "×", cor condicional
- **Linha 2**: 4 cards secundários menores (Pipeline, Ticket Médio, Nº Pagamentos, CAC)
  - Estilo mais compacto, `text-xl`
- Adicionar ROAS e CAC como props (movê-los dos CostsSection para cá como KPIs de topo)

### 2. `FaturacaoView.tsx` — Reordenar layout para gráficos visíveis

Nova ordem das secções:
1. Header + botões
2. **KPIs hero** (redesenhados)
3. **Gráficos lado-a-lado** (promover do PLSummary para posição 3)
   - Bar chart receita vs custos (maior, `height={280}`)
   - Donut chart distribuição por plano (maior)
   - Novo: **Gauge visual da margem** — semicírculo ou barra horizontal grande que mostra receita vs custos
4. Plan Breakdown (tabela)
5. Custos de Aquisição
6. Invoice Table
7. P&L texto (versão simplificada, só o texto sem gráficos duplicados)

### 3. `PLSummary.tsx` — Separar gráficos do texto P&L

- Extrair os gráficos (bar + pie) para um novo componente `FaturacaoCharts.tsx` que fica na posição 3
- Manter `PLSummary` apenas como o mapa de contas textual no final
- Adicionar um **stacked bar chart horizontal** para visualizar receita por plano (premium/masterclass/bundle empilhados)
- Aumentar tamanhos dos gráficos: `height={280}` em vez de 200

### 4. Novo `FaturacaoCharts.tsx` — Secção visual dedicada

Grelha `lg:grid-cols-2` com:
- **Bar chart vertical** — Receita Confirmada vs Pipeline vs Custos (barras grandes, cores vibrantes)
- **Donut chart** — Distribuição de vendas por plano (com labels e valores em €)
- **Stacked horizontal bar** — Receita por fonte (pré-webinar vs pós-webinar)
- **Margem visual** — Barra de progresso grande que mostra custos como proporção da receita

### 5. Melhorias visuais gerais

- Cards hero com `backdrop-blur` e gradientes subtis (estilo glassmorphism)
- Margem positiva com `box-shadow: 0 0 20px rgba(34,197,94,0.15)` (glow verde)
- Margem negativa com glow vermelho
- Animated count-up nos números hero (reutilizar padrão do `useCountUp` existente, adaptado para valores decimais)
- Recharts tooltips com estilo consistente dark

## Ficheiros a criar/editar

| Ficheiro | Acção |
|----------|-------|
| `src/components/crm/faturacao/FaturacaoKPIs.tsx` | Reescrever — layout hero 3+4 com números grandes |
| `src/components/crm/faturacao/FaturacaoCharts.tsx` | **Novo** — secção de gráficos dedicada |
| `src/components/crm/faturacao/PLSummary.tsx` | Simplificar — remover gráficos (ficam no Charts), manter só P&L texto |
| `src/components/crm/FaturacaoView.tsx` | Reordenar secções, passar ROAS/CAC aos KPIs, inserir Charts |

