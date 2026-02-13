

## Correcoes ao Hero: H1 em 2 linhas + Background visivel

### Ficheiro afectado

`src/components/landing/HeroSection.tsx`

### 1. H1 em 2 linhas

O problema: o container tem `maxWidth: 760px` mas "Aprende a Criar Imagens Profissionais" a 46px precisa de ~820px para caber numa linha. A solucao e aumentar o `maxWidth` do container de conteudo para 860px e aumentar o `maxWidth` do H1 para 860px tambem. Assim a primeira linha cabe e o `<br />` forca a segunda linha com "com Inteligencia Artificial".

Alteracoes:
- Linha 80: `maxWidth: 760` passa a `maxWidth: 860`
- Linha 103: `maxWidth: 820` passa a `maxWidth: 860`

### 2. Background ColorBends visivel

Aumentar a opacidade do wrapper de `0.4` para `0.65` para tornar o efeito claramente visivel sobre o fundo escuro.

- Linha 61: `opacity: 0.4` passa a `opacity: 0.65`

### O que NAO muda

Tudo o resto: badges, CTA, subheadline, Google Reviews, LogoMarquee.
