

## Corrigir Erro de Build + Melhorar Legibilidade do Hero

### 1. Corrigir erro de build do Meta Pixel

**Problema:** O Vite nao permite `<img>` dentro de `<noscript>` no `<head>` (erro `disallowed-content-in-noscript-in-head`).

**Solucao:** Mover o bloco `<noscript>` para dentro do `<body>`, logo apos a abertura.

**Ficheiro:** `index.html`
- Remover linhas 55-57 (`<noscript>...</noscript>`) do `<head>`
- Adicionar o mesmo bloco no inicio do `<body>`, antes do `<div id="root">`

### 2. Aumentar radial branco no Hero para melhor legibilidade

Olhando o screenshot, o texto central ainda compete com a imagem de fundo. Vamos aumentar a intensidade do overlay radial.

**Ficheiro:** `src/components/landing/HeroSection.tsx`

| Alteracao | Antes | Depois |
|---|---|---|
| Radial gradient (linha 29) | `0.85 / 0.50 / 0.15` | `0.92 / 0.65 / 0.20` |
| Opacidade da imagem (linha 22) | `opacity-[0.60]` | `opacity-[0.50]` |
| Top/bottom fade (linha 33) | `from-white/60` | `from-white/70` |

Isto vai criar um centro significativamente mais branco, com a imagem a aparecer suavemente nas bordas para manter o visual mas sem comprometer a leitura.

### Resumo

| Ficheiro | Alteracao |
|---|---|
| `index.html` | Mover `<noscript>` do Pixel para o `<body>` |
| `src/components/landing/HeroSection.tsx` | Aumentar overlay radial e reduzir opacidade da imagem |

