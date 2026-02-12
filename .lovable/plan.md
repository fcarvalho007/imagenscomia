

## Correcoes Mobile: StickyTopBar e Hero

### Problemas (vistos no screenshot)

1. **Botao da StickyTopBar cortado** - "Inscrever-me gratis" e demasiado longo e fica cortado a direita
2. **Titulo do Hero quebra em 3 linhas** - "IA" fica sozinho na terceira linha porque `text-[32px]` e grande demais para ~375px
3. **Barra sticky ocupa muito espaco horizontal** - o countdown + botao competem pelo espaco

### Alteracoes

#### A) `src/components/landing/StickyTopBar.tsx`
- Mudar texto do botao de "Inscrever-me gratis" para "Inscricao Gratis"
- Reduzir padding do botao em mobile: `px-5` para `max-sm:px-3`
- Reduzir padding geral da barra: `py-2.5` para `max-sm:py-2`
- Reduzir tamanho dos blocos do countdown em mobile: font de `text-[16px]` para `max-sm:text-[14px]`, min-width de `min-w-[34px]` para `max-sm:min-w-[28px]`
- Reduzir gap entre elementos: `gap-3` para `max-sm:gap-2`

#### B) `src/components/landing/HeroSection.tsx`
- Reduzir titulo de `text-[32px]` para `text-[28px]` em mobile para que "Cria Imagens Profissionais com IA" caiba em 2 linhas sem "IA" sozinho

### Resumo

| Ficheiro | Alteracao |
|---|---|
| `StickyTopBar.tsx` | Texto "Inscricao Gratis", countdown e botao mais compactos em mobile |
| `HeroSection.tsx` | Titulo reduzido para `text-[28px]` para evitar 3 linhas |

