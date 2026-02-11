

# Adicionar botao de remover (lixo) nas linhas pagas do painel esquerdo

## Resumo

Adicionar um icone de caixote de lixo nas linhas do Premium Pass e Masterclass no painel lateral esquerdo, permitindo ao utilizador remover opcoes pagas directamente do resumo do pedido.

---

## Alteracoes

### 1. `src/components/upgrade/SummaryPanel.tsx`

**Props**: Adicionar callback `onRemove: (item: "premium" | "masterclass") => void` na interface Props.

**Linha Premium (linha 2)**: Adicionar um icone `Trash2` (lucide-react) ao lado direito, entre o preco e a borda. Ao clicar, chama `onRemove("premium")`.

**Linha Masterclass (linha 3)**: Mesmo icone `Trash2`, chama `onRemove("masterclass")`.

**Estilo do icone**:
- `w-4 h-4`, cor `--ink-400`, hover `--red-500`
- `cursor-pointer`, `transition-colors 150ms`
- Posicionado a direita do preco com `ml-2`
- O layout da direita passa a ser `flex items-center gap-2` para alinhar preco + icone

**Mobile bar**: Sem alteracao (nao ha espaco para lixo na barra compacta).

### 2. `src/pages/Upsell.tsx`

**Passar `onRemove` ao SummaryPanel**: Criar handler que faz `setOrderState(s => ({ ...s, [item]: false }))`.

Nao altera o step actual — o utilizador pode estar no passo 5 e remover uma opcao, o resumo e total actualizam sem mudar de passo.

---

## Ficheiros a editar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/upgrade/SummaryPanel.tsx` | Adicionar icone Trash2 nas linhas Premium e Masterclass com callback onRemove |
| `src/pages/Upsell.tsx` | Passar prop onRemove ao SummaryPanel |

Sem dependencias novas (Trash2 ja existe no lucide-react).

