

# Redesign do WebinarSwitcher no CRM

## Resumo

Redesenhar o componente `WebinarSwitcherBar` com o novo estilo visual especificado. O componente ja esta correctamente posicionado no canto superior direito de todas as views — nao esta no sidebar. A alteracao e puramente visual no componente.

---

## 1. Renomear e restylar o componente

**Ficheiro a modificar:** `src/components/crm/WebinarSwitcherBar.tsx`

Renomear o export para `WebinarSwitcher` (opcional, manter o nome actual tambem funciona sem breaking changes).

Novo estilo do container:
- `display: flex`, `gap: 4px`
- `background: rgba(0,0,0,0.04)`
- `padding: 4px`
- `border-radius: 8px`
- `border: 1px solid #e5e7eb`

Novo estilo dos botoes:
- **Activo**: background solido (cor do webinar), cor branca, `border-radius: 6px`, `padding: 5px 12px`, `font-size: 12px`, `font-weight: 600`
- **Inactivo**: background transparente, cor `#888`, hover cor `#333`, sem border

---

## 2. Verificar layout do Pipeline (ja correcto)

O `PipelineView.tsx` ja tem o layout de duas linhas:
- Linha 1: Titulo + WebinarSwitcherBar (direita)
- Linha 2: Tabs de fase (Todos/Pre/Pos) + Search (direita)

Nenhuma alteracao necessaria aqui.

---

## 3. Verificar todas as views (ja correctas)

Todas as 5 views ja importam e renderizam `WebinarSwitcherBar` no canto superior direito do header:
- `DashboardView.tsx` — linha 267
- `PipelineView.tsx` — linha 158
- `TableView.tsx` — linha 264
- `FollowUpView.tsx` — linha 173
- `TrashView.tsx` — linha 99

Nenhuma alteracao de posicionamento necessaria.

---

## Ficheiros a modificar

| Ficheiro | Alteracao |
|---|---|
| `src/components/crm/WebinarSwitcherBar.tsx` | Restylar container e botoes com novo design |

Nenhum outro ficheiro e alterado. Sem mudancas no WebinarContext, filtragem, sidebar, ou qualquer outra logica.

