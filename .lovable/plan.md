

# Background Videos no Hero e na seccao "O video nao e luxo"

## Resumo

Adicionar dois videos MP4 como backgrounds visuais em duas seccoes da pagina /video:
1. **Hero** — video "vidro" como fundo atras dos orbs e do conteudo
2. **"O video nao e luxo"** — video "splash branco" como fundo, com adaptacao das cores do texto/cards para manter legibilidade durante a transicao branco-para-preto

---

## Alteracoes

### Copiar ficheiros para o projecto

Os dois videos MP4 serao copiados para `public/videos/`:
- `public/videos/hero-vidro.mp4`
- `public/videos/splash-branco.mp4`

Usamos `public/` porque videos grandes nao devem ser bundled pelo Vite — sao servidos estaticamente.

---

### 1. Hero — Video de fundo "vidro" (`src/pages/Video.tsx`, linhas 241-249)

Adicionar um elemento `<video>` com autoplay, loop, muted, playsInline, posicionado absolutamente atras dos orbs:

```
position: absolute, inset: 0, z-index: 0
object-fit: cover, width/height 100%
opacity: 0.35 (para nao competir com o texto)
```

Os orbs (z-index 1) e o conteudo (z-index 2) ficam por cima. O noise grain tambem fica por cima.

---

### 2. Seccao "O video nao e luxo" — Video "splash branco" (`src/pages/Video.tsx`, linhas 400-454)

Adicionar `position: relative` e `overflow: hidden` a seccao, e inserir o video como fundo absoluto:

```
position: absolute, inset: 0, z-index: 0
object-fit: cover, width/height 100%
opacity: 0.5
```

**Adaptacao para legibilidade durante a fase branca do video:**

Como o video comeca branco e depois fica preto, os textos brancos ficam invisiveis no inicio. Solucao:

- Adicionar um overlay escuro semi-transparente por cima do video:
  `background: rgba(0,0,0,0.55)`, z-index: 1
  Isto garante que o texto branco se le mesmo quando o fundo do video e branco

- Os cards (SpotlightCard) ja tem background proprio (`rgba(255,255,255,0.03)`) — reforcar para `rgba(0,0,0,0.6)` com `backdrop-filter: blur(8px)` para garantir legibilidade constante

- Todo o conteudo textual fica em `position: relative, z-index: 2`

---

## Detalhes tecnicos

### Ficheiro modificado
`src/pages/Video.tsx`

### Ficheiros criados
- `public/videos/hero-vidro.mp4` (copia de user-uploads)
- `public/videos/splash-branco.mp4` (copia de user-uploads)

### Elemento video (ambas as seccoes)
```html
<video
  autoPlay
  loop
  muted
  playsInline
  className="absolute inset-0 w-full h-full object-cover"
  style={{ zIndex: 0, opacity: X }}
>
  <source src="/videos/nome.mp4" type="video/mp4" />
</video>
```

### Estrutura z-index no hero
- z-index 0: video de fundo
- z-index 1: orbs + noise grain (ja existente)
- z-index 2: conteudo (ja existente)

### Estrutura z-index na seccao "O video nao e luxo"
- z-index 0: video de fundo
- z-index 1: overlay escuro (novo)
- z-index 2: conteudo (todo o conteudo actual envolvido em div relativo)

### Cards reforçados
Os `.pain-card` passam de `background: rgba(255,255,255,0.03)` para `background: rgba(0,0,0,0.6)` com `backdrop-filter: blur(8px)` para manter legibilidade durante a fase branca do video.

