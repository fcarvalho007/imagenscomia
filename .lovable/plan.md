

# SEO e Social Card para a página /video

## Situacao actual

A pagina `/video` ja define `<title>` e `<meta description>` via `usePageMeta`, mas as meta tags Open Graph (og:title, og:description, og:image) e Twitter Card ficam com os valores hardcoded no `index.html` — que sao do webinar de **Imagens**. Quando alguem partilha o link `/video` no LinkedIn, WhatsApp ou Facebook, aparece o titulo e descricao do webinar errado e sem imagem social.

## O que vamos fazer

### 1. Expandir o hook `usePageMeta` para suportar OG tags

Adicionar suporte para actualizar dinamicamente:
- `og:title` e `twitter:title`
- `og:description` e `twitter:description`
- `og:image` e `twitter:image` (social card)
- `og:url`

O hook vai aceitar parametros opcionais (`ogTitle`, `ogDescription`, `ogImage`, `ogUrl`) e actualizar/criar as meta tags correspondentes no DOM.

### 2. Actualizar a pagina `/video` com os valores correctos

No `VideoPageInner` em `src/pages/Video.tsx`, passar:
- **Titulo**: "Cria Video Profissional com IA — Webinar Gratuito 5 Marco 10h"
- **Descricao**: "Sessao pratica ao vivo: de briefing a clip publicavel em minutos. Para gestores e profissionais de marketing. Gratuito, 5 de Marco, 10h."
- **OG Image**: usar a imagem existente ou um placeholder (o projeto nao tem uma social card especifica para video — sera necessario definir um URL de imagem)
- **OG URL**: "https://imagenscomia.com/video"

### 3. Adicionar meta tags OG por defeito no `index.html`

Adicionar `og:image` e `twitter:image` no `index.html` para que a pagina principal (Imagens) tambem tenha social card definido. Se nao houver imagem de social card carregada para o webinar video, o hook ira partilhar a mesma imagem base.

## Detalhe tecnico

| Ficheiro | Alteracao |
|---|---|
| `src/hooks/usePageMeta.ts` | Aceitar `ogTitle`, `ogDescription`, `ogImage`, `ogUrl` opcionais. Para cada um, criar ou actualizar a meta tag correspondente e restaurar no cleanup. |
| `src/pages/Video.tsx` | Passar valores OG especificos do webinar de video ao `usePageMeta`. |
| `index.html` | Adicionar `og:url` e `og:image` / `twitter:image` com valores por defeito (webinar imagens). |

### Nota sobre og:image

Como o projecto nao tem um ficheiro de social card dedicado ao webinar de video, temos duas opcoes:
- Usar uma imagem ja existente no projecto (ex: `hero-bg.jpeg` ou `frederico-carvalho.jpg`)
- Usar um URL externo se ja existir uma imagem de social card hospedada

A imagem ideal para social card deve ter 1200x630px. Se nao existir, o hook ficara preparado para quando for adicionada.

