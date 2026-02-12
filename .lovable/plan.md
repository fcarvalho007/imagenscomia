
## Aumentar tamanho do nome no CRM

### Resumo

O utilizador quer:
1. **Remover** qualquer símbolo "(ft)" que possa estar abreviando nomes
2. **Aumentar o tamanho/peso visual do nome** em toda a interface do CRM

### Investigação Realizada

Após revisar toda a interface CRM (TableView, PipelineView, DashboardView, InscritoModal, TrashView):
- **Não encontrei** um símbolo literal "(ft)" no código
- Os nomes estão atualmente acompanhados de **emojis de género** (🔵, 🌸, ⚪) que funcionam bem
- Os nomes têm tamanhos variados dependendo da vista:
  - **TableView**: `text-ink-900` (normal)
  - **PipelineView**: `text-[13px]` (pequeno)
  - **DashboardView**: `text-[13px]` (pequeno)
  - **InscritoModal**: `text-[16px]` a `text-[17px]` (maior, apenas aqui)

### Solução

Padronizar e **aumentar o tamanho dos nomes** em todas as vistas do CRM:

| Vista | Antes | Depois | Alteração |
|---|---|---|---|
| TableView | `text-ink-900` + emoji | `text-[15px] font-semibold` | Aumentar para 15px |
| PipelineView | `text-[13px]` + emoji | `text-[14px] font-semibold` | Aumentar para 14px |
| DashboardView | `text-[13px]` + emoji | `text-[14px] font-semibold` | Aumentar para 14px |
| InscritoModal | `text-[16px]` a `text-[17px]` | `text-[18px] font-bold` | Aumentar para 18px |
| TrashView | `text-[13px]` + emoji | `text-[14px] font-semibold` | Aumentar para 14px |

Os **emojis de género** (🔵 🌸 ⚪) são mantidos, pois são úteis para identificação rápida.

### Ficheiros a Modificar

| Ficheiro | Linhas | Alteração |
|---|---|---|
| `src/components/crm/TableView.tsx` | 258 | Aumentar nome para `text-[15px] font-semibold` |
| `src/components/crm/PipelineView.tsx` | 68-69 | Aumentar nome para `text-[14px] font-semibold` |
| `src/components/crm/DashboardView.tsx` | 276, 362 | Aumentar nomes para `text-[14px] font-semibold` |
| `src/components/crm/InscritoModal.tsx` | 211, 262 | Aumentar para `text-[18px] font-bold` |
| `src/components/crm/TrashView.tsx` | 258 | Aumentar nome para `text-[14px] font-semibold` |

