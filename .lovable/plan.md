

## Melhorias Visuais e Limpeza do Dashboard

### 1. Cores mais impactantes nos badges de estado (Pipeline + Tabela)

Actualmente:
- "Seleccionou" = azul claro suave (bg-blue-50, text-blue-600)
- "Aguarda pgto" = ambar suave (bg-amber-100, text-amber-700)

Novo:
- **"Seleccionou e saiu"** = laranja forte (bg-orange-100, text-orange-700, border orange) — remete para alerta, precisa de accao
- **"Aguarda pgto"** = vermelho/rosa (bg-red-100, text-red-700) — urgencia maxima, ja tem referencia gerada

Aplicar em 3 ficheiros:
- `PipelineView.tsx` (cards kanban)
- `TableView.tsx` (badges na tabela)
- `InscritoModal.tsx` (ficha do inscrito, se existir badge)

Tambem mudar o texto "Seleccionou" para "Seleccionou e saiu" para maior clareza.

### 2. Acrescentar "Inscricao a:" na data dos cards Pipeline

No `PipelineCard` dentro de `PipelineView.tsx`, a ultima linha mostra apenas a data. Alterar de:

`13 Fev · 19:25`

Para:

`Inscrição a: 13 Fev · 19:25`

### 3. Remover bloco "Receita confirmada / Pipeline pendente" da caixa "Distribuicao por Plano"

No `DashboardView.tsx`, linhas 441-452 contem um `border-t` com receita confirmada e pipeline pendente dentro do card de Distribuicao por Plano. Remover esse bloco inteiro — a informacao ja existe nos KPIs e no card Pipeline Pendente.

### 4. Refinamentos adicionais no Dashboard

Apos avaliar o dashboard completo:

- **Corrigir preco do Bundle no Pipeline kanban**: `PipelineView.tsx` linha 46 mostra "Bundle -- EUR72,81" em vez de "EUR76,26"
- **Corrigir VALOR_COLORS na Tabela**: `TableView.tsx` linha 32 tem `72.81` em vez de `76.26` para o verde do Bundle

### Ficheiros afectados

| Ficheiro | Alteracao |
|---|---|
| `src/components/crm/PipelineView.tsx` | Cores impactantes nos badges; prefixo "Inscricao a:" na data; corrigir preco Bundle na coluna |
| `src/components/crm/TableView.tsx` | Cores impactantes nos badges; corrigir VALOR_COLORS |
| `src/components/crm/InscritoModal.tsx` | Cores impactantes nos badges de estado (se existentes) |
| `src/components/crm/DashboardView.tsx` | Remover bloco receita/pipeline do card Distribuicao por Plano |

