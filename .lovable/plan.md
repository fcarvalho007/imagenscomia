

## Ajustar opacidade do fundo do Hero — visivel nas laterais, opaco no centro

### Problema actual

A imagem de fundo tem opacidade uniforme (15%) em toda a area, o que a torna quase invisivel e nao acrescenta impacto visual.

### Solucao proposta

Substituir o overlay linear uniforme por um **gradiente radial** que deixa o centro mais opaco (branco) para proteger o texto, e as laterais mais transparentes para que a imagem de fundo seja visivel e crie profundidade.

### Alteracoes tecnicas

**Ficheiro:** `src/components/landing/HeroSection.tsx`

1. **Aumentar a opacidade da imagem** de `opacity-[0.15]` para `opacity-[0.35]` — a imagem fica mais visivel globalmente

2. **Substituir o overlay por um gradiente radial** usando inline style:
   - Centro: branco a ~90% opacidade (protege o texto e conteudo)
   - Laterais: branco a ~20-30% opacidade (deixa a imagem visivel nos cantos e bordas)
   - Formato: `radial-gradient(ellipse at center, rgba(255,255,255,0.92) 30%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0.25) 100%)`

3. Manter o gradiente vertical adicional (top/bottom) para suavizar as transicoes superior e inferior

### Resultado esperado

A imagem futurista com tons azuis fica visivel nas laterais e cantos, criando um efeito de "vinheta inversa" elegante. O centro permanece limpo e legivel, com todo o texto, cards, video e botao verde a manter contraste total.

