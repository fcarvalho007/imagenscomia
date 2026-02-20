

# Redesign do Webinar Context Switcher

## Resumo

Mover o switcher de contexto (Imagens / Video / Todos) do sidebar para o header de cada view, alinhado a direita na mesma linha do titulo. Manter o subtitle dinamico no sidebar.

---

## Alteracoes

### 1. Novo componente: `src/components/crm/WebinarSwitcherBar.tsx`

Componente reutilizavel com 3 botoes pill-style (mesmo estilo dos filtros do Pipeline):
- Fundo branco, grupo com `border border-border rounded-lg overflow-hidden`
- Botao activo: fundo colorido (azul/verde/roxo), texto branco
- Botao inactivo: texto `ink-600`, hover `bg-off-white`
- Altura ~36px, `text-[13px] font-medium`
- Consome `useWebinarContext()` internamente (sem props necessarios)

### 2. Sidebar (`CRMSidebar.tsx`)

- Remover a funcao `WebinarSwitcher` e a sua invocacao na linha 73
- Manter o subtitle dinamico (`getSidebarSubtitle`) no bloco do logo
- Remover o `borderBottom` extra que vinha do switcher bar

### 3. Adicionar switcher ao header de cada view

Cada view ja tem um header com titulo (esquerda) e controlos (direita). Inserir `<WebinarSwitcherBar />` no lado direito de cada header:

**DashboardView.tsx** (linha ~260-292):
- Header row ja tem period selector + refresh + date
- Adicionar `<WebinarSwitcherBar />` como primeiro elemento do grupo direito

**PipelineView.tsx** (linha ~151-178):
- Layout em 2 linhas:
  - Linha 1: Titulo "Pipeline" (esquerda) + `<WebinarSwitcherBar />` (direita)
  - Linha 2: Filtros Pre/Pos-webinar (esquerda) + Search (direita) -- sem alteracao

**TableView.tsx**:
- Header com titulo + search + export
- Adicionar `<WebinarSwitcherBar />` na linha do titulo, alinhado a direita

**FollowUpView.tsx** (linha ~102-105):
- Header com titulo
- Adicionar `<WebinarSwitcherBar />` alinhado a direita na mesma linha

**TrashView.tsx**:
- Header com titulo + search
- Adicionar `<WebinarSwitcherBar />` na linha do titulo

---

## Detalhes tecnicos

### Ficheiros a criar
- `src/components/crm/WebinarSwitcherBar.tsx`

### Ficheiros a modificar
- `src/components/crm/CRMSidebar.tsx` -- remover WebinarSwitcher, manter subtitle
- `src/components/crm/DashboardView.tsx` -- adicionar WebinarSwitcherBar no header
- `src/components/crm/PipelineView.tsx` -- reorganizar header em 2 linhas, adicionar switcher
- `src/components/crm/TableView.tsx` -- adicionar switcher no header
- `src/components/crm/FollowUpView.tsx` -- adicionar switcher no header
- `src/components/crm/TrashView.tsx` -- adicionar switcher no header

### Sem alteracoes
- WebinarContext, useWebinarContext(), filterByWebinar() -- inalterados
- Nenhuma alteracao de BD ou edge functions
- Logica de filtragem e dados mantida

