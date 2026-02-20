

# Fix: Headline a 2 linhas no hero /video

## Problema

Com `max-w-[920px]` e `font-size: 72px`, o texto "Aprende a criar videos com" nao cabe numa unica linha. Resultado: 4 linhas em vez de 2.

## Solucao

Alargar o `max-width` do H1 para que "Aprende a criar videos com" caiba inteiramente na linha 1 a 72px.

## Alteracao unica em `src/pages/Video.tsx`

**Linha 265** — Alterar `max-w-[920px]` para `max-w-[1100px]`:

```
// Antes
className="... max-w-[920px] mx-auto ..."

// Depois
className="... max-w-[1100px] mx-auto ..."
```

Isto garante que a 72px com tracking -2px, toda a frase "Aprende a criar videos com" cabe numa linha, e o `<br className="hidden lg:block" />` forca a quebra exactamente ali.

Resultado no desktop:
- Linha 1: "Aprende a criar videos com"
- Linha 2: "Inteligencia Artificial para marketing"

Nenhuma outra alteracao necessaria. O container pai ja tem `maxWidth: 1040` mas o H1 e o elemento que precisa de mais espaco.

## Ficheiro

`src/pages/Video.tsx` — linha 265, apenas trocar `920px` por `1100px`.

