

# Actualizar Social Card do /video com imagem e dados correctos

## Problema

O LinkedIn Post Inspector ainda mostra a imagem do guia SEO ("guia-essencial-seo.png") e os dados do webinar de Imagens. O ficheiro `public/video/index.html` ja tem o titulo e descricao correctos, mas a imagem OG ainda aponta para a imagem errada.

## Alteracoes

### 1. Copiar a imagem de social card para o projecto

Copiar a imagem carregada pelo utilizador (o poster do webinar de video com o Frederico e o telemovel) para `public/video-social-card.jpg`. Esta imagem sera usada como `og:image` e `twitter:image`.

### 2. Actualizar `public/video/index.html`

Substituir as referencias a `guia-essencial-seo.png` pela nova imagem:

| Tag | Valor anterior | Valor novo |
|---|---|---|
| `og:image` | `https://imagenscomia.com/guia-essencial-seo.png` | `https://imagenscomia.com/video-social-card.jpg` |
| `twitter:image` | `https://imagenscomia.com/guia-essencial-seo.png` | `https://imagenscomia.com/video-social-card.jpg` |

Tambem actualizar o JSON-LD para incluir a imagem do evento.

### 3. Actualizar `src/pages/Video.tsx`

Actualizar o `ogImage` no hook `usePageMeta` para apontar para a nova imagem, mantendo consistencia entre o HTML estatico e o React.

### Nota

Apos publicacao, sera necessario limpar a cache do LinkedIn Post Inspector (re-scrape) para ver as alteracoes, pois o LinkedIn guarda em cache os metadados anteriores.

