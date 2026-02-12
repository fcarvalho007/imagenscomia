
## Remover Indicador Visual e Alterar Texto do Botão no StickyTopBar

### Problemas Identificados
1. **Luz vermelha piscante**: O StickyTopBar tem dois elementos `<span>` com `bg-red-500 animate-pulse` que piscam
   - Uma versão para desktop (hidden em mobile) na linha 26
   - Uma versão para mobile (hidden em desktop) na linha 31
2. **Texto do botão**: Precisa mudar de "Inscrição Grátis →" para "Quero inscrever-me!"

### Solução

#### `src/components/landing/StickyTopBar.tsx`
- **Remover linha 26**: O `<span>` com `bg-red-500 animate-pulse` que aparece antes de "AO VIVO · 18 FEV · 10H00"
- **Remover linha 31**: O `<span>` com `bg-red-500 animate-pulse mr-1` que aparece antes do countdown em mobile
- **Alterar linha 45**: Mudar texto do botão de `"Inscrição Grátis →"` para `"Quero inscrever-me!"`

### Resultado Final
O StickyTopBar terá:
- ✅ Sem indicadores visuais vermelhos piscantes (em desktop e mobile)
- ✅ Botão com novo texto "Quero inscrever-me!" sem seta
- ✅ Countdown timer mantém-se intacto
- ✅ Texto "AO VIVO · 18 FEV · 10H00" mantém-se em desktop

| Ficheiro | Alteração |
|---|---|
| `src/components/landing/StickyTopBar.tsx` | Remover 2 spans vermelhos piscantes, alterar texto botão |

