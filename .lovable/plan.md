

## Substituir imagem de fundo do Hero

### O que muda

1. **Nova imagem** — Copiar a imagem carregada para `src/assets/hero-bg.jpeg` (substituindo a actual)

2. **Ajustar o overlay radial** — Como esta imagem e mais escura (fundo quase preto com tons azuis), o gradiente radial precisa de ser recalibrado:
   - Centro: branco a ~85% opacidade (proteger texto)
   - Zona intermédia: branco a ~40% (transicao suave)
   - Laterais: branco a ~15% (deixar a imagem bem visivel nos cantos)
   - Aumentar a opacidade da imagem de `0.35` para `0.45-0.5` para dar mais vida

3. **Manter tudo o resto** — Gradiente vertical top/bottom, animacoes diretas, responsividade

### Alteracoes tecnicas

| Ficheiro | Alteracao |
|---|---|
| `src/assets/hero-bg.jpeg` | Substituir pela nova imagem (PNG convertido) |
| `src/components/landing/HeroSection.tsx` | Ajustar opacidade da imagem para ~0.45 e recalibrar valores do gradiente radial |

### Resultado esperado

A imagem escura com o portal azul e a grelha de imagens fica visivel nas laterais, criando um efeito cinematografico. O centro mantém-se limpo e legivel com todo o conteudo bem contrastado.

