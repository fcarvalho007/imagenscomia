

## Substituir imagem de fundo do Hero e dar mais cor

### O que muda

1. **Nova imagem** — Substituir `src/assets/hero-bg.jpeg` pela imagem carregada (presenter com portal azul e grelha de imagens)

2. **Mais cor/vida** — Aumentar a opacidade da imagem de `0.48` para `0.55` e reduzir ligeiramente a opacidade do overlay radial nas laterais (de 0.15 para 0.10) para deixar passar mais cor dos tons azuis e laranjas

3. **Manter radial no centro** — O gradiente radial continua a proteger o centro para legibilidade do texto

### Alteracoes tecnicas

| Ficheiro | Alteracao |
|---|---|
| `src/assets/hero-bg.jpeg` | Substituir pela nova imagem |
| `src/components/landing/HeroSection.tsx` | Opacidade da imagem: `0.48` para `0.55`. Radial gradient: centro mantém 85%, laterais passam de 15% para 10% |

### Valores do gradiente radial actualizados

`radial-gradient(ellipse at center, rgba(255,255,255,0.85) 25%, rgba(255,255,255,0.35) 55%, rgba(255,255,255,0.10) 100%)`

### Resultado esperado

A imagem do presenter com o portal azul e tons quentes fica mais visivel nas laterais, com mais cor e vida. O centro continua limpo e legivel.

