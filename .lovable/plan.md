

## Inserir logo 3D entre Hero e "Este Webinar e Para Quem"

### Conceito visual

Colocar a imagem do logo 3D (aperture cromada) como elemento de transicao visual entre o Hero e a seccao MirrorCopy. A imagem fica centrada, com tamanho contido (120-140px), com uma animacao suave de scroll reveal (fade-in + ligeiro scale-up) que a torna elegante sem distrair.

### Abordagem escolhida

**Elemento centrado com scroll reveal** (em vez de parallax de fundo). Motivo:
- A imagem tem fundo transparente (PNG), funciona melhor como elemento isolado
- Parallax de fundo com imagens pequenas e detalhadas perde definicao
- Um logo centrado com animacao suave cria uma separacao premium entre seccoes
- Adiciona um toque de leveza com `drop-shadow` subtil para reforcar o efeito 3D cromado

### Implementacao

**1. Copiar a imagem para o projeto**
- Destino: `src/assets/logo-imagens-com-ia.png`

**2. Criar componente separador (inline no Index.tsx ou mini-componente)**
- Inserir entre `HeroSection` e `MirrorCopySection` no `Index.tsx`
- Estrutura: div centrado com padding vertical reduzido (py-6 md:py-10), fundo branco (bg-background), imagem com `w-[120px] md:w-[140px]`, `drop-shadow` subtil
- Animacao: ScrollReveal com opacity 0 para 1 e scale 0.9 para 1 (framer-motion)

**3. Sem parallax** — a opcao mais elegante para este tipo de logo e transparente. O efeito de scroll reveal com scale ja cria profundidade visual suficiente.

### Ficheiros alterados

| Ficheiro | Alteracao |
|---|---|
| `src/assets/logo-imagens-com-ia.png` | Novo ficheiro (copia da imagem) |
| `src/pages/Index.tsx` | Inserir bloco visual entre Hero e MirrorCopy |

### Resultado esperado

O logo cromado aparece centrado entre as duas seccoes, com uma entrada suave ao scroll, criando uma transicao visual premium que reforça a identidade do webinar.
