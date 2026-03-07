

# Converter Faturação para tema claro + melhorar gráficos e tabelas

## Problema

A secção Faturação usa fundo escuro (`#0F172A`) com `rgba(255,255,255,...)` — inconsistente com as outras secções do CRM que já foram convertidas para tema claro. Os tooltips dos gráficos Recharts não aparecem correctamente no hover e a legibilidade geral é fraca.

## Ficheiros a alterar (7)

### 1. `FaturacaoView.tsx` — Container principal
- Fundo: `#0F172A` → `#F8FAFC`
- Título/subtítulo: branco → `slate-900` / `slate-500`
- Tabs: `rgba(255,255,255,...)` → `bg-white`, borders `slate-200`, active `blue-600`

### 2. `FaturacaoKPIs.tsx` — KPI cards
- Cards hero: manter gradientes de cor mas adaptar para fundo claro (bordas mais suaves, texto principal mantém cor, labels `slate-500`)
- Cards secundários: `rgba(255,255,255,0.02)` → `bg-white` com `border-slate-200`
- Labels: `rgba(255,255,255,0.4)` → `text-slate-500`

### 3. `FaturacaoCharts.tsx` — Gráficos (problema principal dos tooltips)
- `TOOLTIP_STYLE`: dark bg → `bg-white`, `color: "#0F172A"`, `border: slate-200`, `boxShadow`
- Titulo secção: branco → `slate-900`
- Card containers: → `bg-white border-slate-200`
- XAxis/YAxis tick fill: → `#64748B`
- Cursor bar fill: → `rgba(0,0,0,0.04)`
- Pie label lines: → `stroke: #CBD5E1`
- Gauge bars bg: → `#E2E8F0`
- Gauge labels: → `slate-500` / `slate-400`

### 4. `PlanBreakdown.tsx` — Tabela de planos
- Container: → `bg-white border-slate-200`
- Headers: → `text-slate-500`
- Cell text: → `text-slate-900` (nomes), `text-slate-600` (valores)
- Borders: → `border-slate-100`
- Progress bars bg: → `#E2E8F0`

### 5. `CostsSection.tsx` — Tabela de custos
- Mesma conversão: containers, headers, cell text, hover states
- KPI mini-cards: → `bg-white border-slate-200`
- Labels: → `text-slate-500`

### 6. `InvoiceTable.tsx` — Tabela de faturas
- Container, headers, cells: dark → light
- Badges (Sem NIF, Grupo): adaptar para fundo claro
- Email customization collapsible: → `bg-slate-50 border-slate-200`
- Inputs: → `bg-white border-slate-200 text-slate-900`

### 7. `PLSummary.tsx` — Mapa de contas
- Container: → `bg-white border-slate-200`
- Section labels: → `text-slate-400`
- Values: → `text-slate-900` (bold), `text-slate-600` (normal)
- Dividers: → `border-slate-100`

## Padrão de cores (consistente com Comunicação já convertida)

| Elemento | Dark (antes) | Light (depois) |
|----------|-------------|----------------|
| Fundo página | `#0F172A` | `#F8FAFC` |
| Cards | `white/2%` | `#FFFFFF` |
| Borders | `white/6%` | `#E2E8F0` |
| Títulos | `white/85%` | `#0F172A` |
| Labels | `white/40%` | `#64748B` |
| Tooltip bg | `rgba(15,23,42,0.95)` | `#FFFFFF` com shadow |
| Tooltip text | `#fff` | `#0F172A` |
| Gauge bg | `white/6%` | `#E2E8F0` |

As cores de dados (verde receita, amarelo pipeline, vermelho custos, azul planos) mantêm-se iguais.

