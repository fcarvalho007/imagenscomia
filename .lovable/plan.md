

# 3 Melhorias: Warning StepQualification + Ficha Mobile + Pipeline Mobile

## 1. Corrigir warning do StepQualification (forwardRef)

O Framer Motion passa uma `ref` ao componente `StepQualification` via `motion.div`, mas como e um componente funcional simples, gera um warning na consola. A correcao e envolver o componente com `React.forwardRef`.

**Ficheiro:** `src/components/upgrade/StepQualification.tsx`
- Importar `forwardRef` do React
- Envolver o componente com `forwardRef<HTMLDivElement, Props>`
- Adicionar a `ref` ao `<div>` raiz

---

## 2. Ficha de Cliente (InscritoModal) — adaptacao mobile

Problemas actuais (visiveis no screenshot):
- Em mobile, o modal usa `width: min(880px, 95vw)` e `grid-cols-1 md:grid-cols-[280px_1fr]` — o painel esquerdo escuro e o direito ficam empilhados mas o modal fica demasiado alto e com scroll confuso
- Informacao cortada (textos truncados sem necessidade)
- Botoes de navegacao "Anterior/Proximo" podem ficar apertados

**Ficheiro:** `src/components/crm/InscritoModal.tsx`

Alteracoes:
- **Mobile layout**: Em mobile (`< md`), o modal ocupa `inset-0` (fullscreen) em vez de centrado com 95vw. Isto elimina o problema de scroll e informacao cortada
- **Top bar mobile**: Simplificar — botao fechar a direita, navegacao anterior/proximo mais compactos
- **Painel esquerdo mobile**: Reduzir padding, tornar horizontal compacto (avatar + nome + plano numa linha). Colapsar a seccao "Progresso" e "Accoes" para que o utilizador veja logo os detalhes
- **Painel direito**: Garantir que os cards de detalhes usam `grid-cols-1` em mobile (em vez de `grid-cols-2` que corta informacao)
- **Notas truncadas**: Remover truncamento nos textos de notas e duvidas para que nao fique informacao cortada

---

## 3. Pipeline — adaptacao mobile

Problemas actuais:
- As 6 colunas Kanban com `min-w-[220px]` fazem scroll horizontal extenso em mobile — experiencia ma
- Em mobile, o utilizador deveria ver uma lista vertical em vez de Kanban

**Ficheiro:** `src/components/crm/PipelineView.tsx`

Alteracoes:
- **Mobile (< md)**: Transformar o Kanban num layout de acordeao/lista vertical
  - Cada coluna torna-se uma seccao colapsavel com o header (titulo + contagem + receita)
  - Ao clicar no header, expande para mostrar os cards dessa coluna
  - Os cards manteem o mesmo design mas ocupam 100% da largura
- **Desktop (>= md)**: Manter o Kanban horizontal actual sem alteracoes
- Usar o hook `useIsMobile()` ja existente para alternar entre os dois layouts

---

## Ficheiros a editar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/upgrade/StepQualification.tsx` | Envolver com `forwardRef` |
| `src/components/crm/InscritoModal.tsx` | Modal fullscreen em mobile, grid-cols-1 nos detalhes, remover truncamento |
| `src/components/crm/PipelineView.tsx` | Layout acordeao vertical em mobile, Kanban horizontal em desktop |

