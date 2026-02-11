
# CRM v2 — 4 Refinamentos Estratégicos

## Resumo

Aplicar 4 refinamentos ao CRM existente, mantendo toda a lógica e dados intactos. Executar em sequência, começando pelo Refinamento 1 (maior impacto).

---

## REFINAMENTO 1 — Ficha Individual: Modal Grande + Navegação + Timeline

### Estrutura do Novo Modal
- **Substituir**: `InscritoSlideOver.tsx` (slide-over 420px) por novo modal centrado
- **Dimensões**: Largura `min(880px, 95vw)`, altura máxima `90vh`, centrado com `position: absolute; top/left 50%; transform: translate(-50%,-50%)`
- **Design**: 
  - Card branco com `border-radius: 20px`, sombra `0 32px 80px rgba(0,0,0,0.25)`
  - Overlay com `rgba(0,0,0,0.50)` + `backdrop-filter: blur(3px)`
  - Barra de topo sticky (56px) com breadcrumb + navegação anterior/próximo + botão fechar
  - Layout interno: grid 2 colunas (`280px` esquerda escura + `1fr` direita branca)

### Painel Esquerdo (Barra Lateral Escura)
- **Background**: `#0F172A` (--ink-900), sticky, altura `calc(90vh - 56px)`
- **Conteúdo**: Avatar 64px + nome/email + WhatsApp clickable + badge plano + timestamp
- **Progresso em coluna** (5 passos verticais):
  - Ícone de estado (círculo 24px com check/número/border)
  - Nome do passo + estado curto (ex: "Respondeu", "Converteu", "Saltou")
  - Linhas conectoras entre passos (2px rgba(255,255,255,0.08))
- **Acções rápidas** (4 botões em coluna, sempre visíveis):
  - WhatsApp, Email, Follow-up (com toggle visual), Arquivar
  - Hover state: `rgba(255,255,255,0.10)`

### Painel Direito (Conteúdo Branco)
- **Blocos em sequência** (com dividers):
  1. **Detalhes** — Grid 2×2 (Plano, Data Pago, Ref EuPago, Progresso)
  2. **Origem** — Badges dos canais + linha especial para `source_outro` (se existe)
  3. **Maior Dúvida** — Card destacado com aspas decorativas (se `duvida !== ""`)
  4. **Timeline** — Eventos cronológicos com ícones (Inscrição, Pagamento, Notas)
     - Calcular eventos automáticos dos dados: passo atingido, pagamento, cada nota
  5. **Notas** — Lista + form para adicionar nova
     - Counter de caracteres "X / 500"
     - Botão desativado se vazio

### Navegação Anterior/Próximo
- Botões no topo direito: "← Anterior" e "Próximo →"
- Lógica: filtrar lista de inscritos activos, navegar circularmente
- Estado: desativo se é o primeiro/último (ou permitir circular)

### Responsivo (Mobile)
- Stack vertical: painel esquerdo + painel direito
- Sem sticky no painel esquerdo (scroll normal)
- Avatar/info centrado no topo

### Props da Nova Component
```typescript
interface InscritoModalProps {
  inscrito: Inscrito;
  todos: Inscrito[];  // para navegação anterior/próximo
  onClose: () => void;
  onSelectInscrito: (i: Inscrito) => void;  // para navegação
  onAddNota: (id: string, texto: string) => void;
  onRemoveNota: (id: string, notaId: string) => void;
  onToggleFollowUp: (id: string) => void;
  onArchive: (id: string) => void;
}
```

---

## REFINAMENTO 2 — Pipeline: € no Cabeçalho + WhatsApp Hover

### Cabeçalho de Coluna
- **Adicionar linha 2**: Receita total da coluna
- **Cálculo**: Soma de `valor` dos inscritos filtrados por coluna
- **Display**: `"€" + total.toFixed(2)`, Inter 500 12px, cor da coluna com 80% opacity
- **Exemplo**: "Premium Pass — €15 · 4 inscritos" + nova linha "€60,00"

### Botão WhatsApp ao Hover no Cartão
- **Trigger**: Rato sobre o cartão
- **Elemento**: Botão overlay no canto inferior direito
  - Ícone MessageCircle 14px branco
  - Fundo `#25D366` (verde WhatsApp)
  - Padding 5px 8px, `border-radius: 8px`
  - Sombra `0 2px 8px rgba(0,0,0,0.15)`
  - Animação: fade-in 150ms, fade-out 100ms
  - Tooltip: "WhatsApp directo"
- **Ação**: `window.open("https://wa.me/" + numero_limpo)` — NÃO abre ficha
- **Nota**: Botão ExternalLink existente permanece (abre ficha)

---

## REFINAMENTO 3 — Tabela: Selecção Múltipla + Barra de Acções

### Nova Coluna: Checkbox
- Primeira coluna (antes de Nome)
- **Cabeçalho**: checkbox "seleccionar todos" (com estado indeterminate se parcial)
- **Cada linha**: checkbox 16px individual
- **Checked**: fundo --blue-50 na linha inteira

### Barra de Acções em Massa (Fixed Bottom)
- **Posição**: `position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%)`
- **Design**: Fundo --ink-900, `border-radius: 14px`, padding 12px 20px, sombra `0 8px 32px rgba(0,0,0,0.25)`, z-index 50
- **Animação**: slide-up 200ms ease-out ao aparecer
- **Conteúdo** (flex, gap 16px):
  - Texto: "X seleccionados" Montserrat 600 14px branco
  - Divider vertical: 1px rgba(255,255,255,0.15) height 20px
  - Botão "Exportar seleccionados" — ícone Download
  - Botão "Marcar Follow-up" — ícone Star
  - Botão "Arquivar" — ícone Archive (com confirm modal)
  - Botão X fechar — ícone X 16px rgba(255,255,255,0.40)

### Lógica de Selecção
- `useState<Set<string>>` para track de IDs seleccionados
- "Seleccionar todos" → ativa todos os inscritos da página actual (ou total?)
- Checkboxes persistem quando filtrar? Manter ativo durante a sessão

---

## REFINAMENTO 4 — Dashboard: Novo Bloco "Para Fazer Hoje"

### Novo Bloco (ao fim do Dashboard, após blocos existentes)
- Card branco, border, rounded-xl, p-20px
- Cabeçalho: flex justify-between
  - Título: "Para Fazer Hoje" Montserrat 700 14px --ink-800
  - Badge: "X em follow-up" fundo --amber-50, --amber-600, rounded-full 12px

### Conteúdo Dinâmico
- **Se sem follow-up**: Mensagem centrada
  - Ícone CheckCircle 24px --green-400
  - "Sem pendências. Tudo em ordem." Inter 400 14px --ink-400
- **Se com follow-up**: Lista de cartões (máx 5, "Ver mais..." se > 5)
  - Cada cartão: flex gap 12px, py-12px, border-bottom --border (excepto último)
  - Avatar 32px (iniciais + gradiente)
  - Nome: Inter 600 14px --ink-800
  - Email: Inter 400 12px --ink-400
  - Badge plano
  - Botão "WhatsApp" fundo rgba(37,211,102,0.10), #25D366, 12px rounded-lg

### Cálculo
- Filtrar inscritos com `follow_up === true` E `status === "activo"`
- Mostrar até 5; se > 5, botão "Ver mais X" que navega para Pipeline (coluna Follow-up)

---

## Ficheiros a Alterar/Criar

| Ficheiro | Acção | Detalhes |
|----------|-------|----------|
| `src/pages/CRM.tsx` | **Editar** | Substituir renderização de InscritoSlideOver → InscritoModal, passar `todos: inscritos` + handler de navegação |
| `src/components/crm/InscritoSlideOver.tsx` | **Apagar** | Será substituído por InscritoModal |
| `src/components/crm/InscritoModal.tsx` | **Criar** | Novo componente modal com os 4 refinamentos do painel esquerdo/direito, timeline, navegação |
| `src/components/crm/PipelineView.tsx` | **Editar** | Adicionar receita no cabeçalho de coluna, botão WhatsApp ao hover nos cartões |
| `src/components/crm/TableView.tsx` | **Editar** | Adicionar coluna checkbox, lógica de selecção, barra de acções em massa |
| `src/components/crm/DashboardView.tsx` | **Editar** | Adicionar novo bloco "Para Fazer Hoje" no fim |
| `src/hooks/useInscritos.ts` | **Potencial** | Se necessário, adicionar métodos para acções em massa (arquivar múltiplos, etc.) |

---

## Sequência de Implementação

1. **Refinamento 1** (maior impacto): Criar `InscritoModal.tsx`, atualizar `CRM.tsx`
2. **Refinamento 2**: Atualizar `PipelineView.tsx`
3. **Refinamento 3**: Atualizar `TableView.tsx`
4. **Refinamento 4**: Atualizar `DashboardView.tsx`

---

## Notas Técnicas

- **Estados**: Usar `useState` para seleções, aberturas de modais, contadores de caracteres
- **Cálculos**: Todos derivados dos dados (nenhum hardcode)
- **Acessibilidade**: aria-labels em botões interativos
- **Responsividade**: Tested em mobile (modal stack vertical, tabela adaptativa)
- **Performance**: `useMemo` para cálculos de receita por coluna, filtros

