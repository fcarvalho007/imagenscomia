
## Trocar imagem de fundo da primeira dobra (Hero) com maior visibilidade

### Situação actual

A imagem de fundo do Hero está configurada com `opacity-[0.35]` e um gradiente radial overlay que deixa o centro muito opaco (branco 92%), tornando a imagem quase invisível. A nova imagem "fundo_frederico_carvalho_webinar.jpeg" é muito mais impactante e profissional, com personagem (Frederico) e elementos visuais claros que merecem maior protagonismo.

### Solução proposta

**1. Substituir a imagem de fundo**
- Guardar a imagem carregada como `src/assets/hero-bg.jpeg` (substituindo a actual)
- Manter a importação ES6 existente: `import heroBg from "@/assets/hero-bg.jpeg"`

**2. Aumentar visibilidade da imagem**
- Aumentar `opacity-[0.35]` para `opacity-[0.55]` ou `opacity-[0.65]` — a imagem fica muito mais visível
- Ajustar o gradiente radial overlay:
  - Centro: reduzir opacidade do branco de `rgba(255,255,255,0.92)` para `rgba(255,255,255,0.75)` ou `0.70`
  - Laterais: manter mais transparentes para que a imagem fique bem visível
  - Novo gradiente: `radial-gradient(ellipse at center, rgba(255,255,255,0.70) 30%, rgba(255,255,255,0.35) 60%, rgba(255,255,255,0.10) 100%)`
- Manter o gradiente vertical (top/bottom fade) para suavidade nas bordas

**3. Resultado final**
- A imagem do "Frederico Carvalho Webinar" com portal e tabela de imagens fica visível e impactante
- O conteúdo textual (título, cards, vídeo, botão) mantém legibilidade total sobre a imagem
- O layout e responsividade não mudam — apenas a visibilidade da imagem

### Ficheiros a alterar

| Ficheiro | Alteração |
|---|---|
| `src/assets/hero-bg.jpeg` | Guardar nova imagem (substituir anterior) |
| `src/components/landing/HeroSection.tsx` | Aumentar `opacity` da imagem e ajustar cores do overlay radial |

