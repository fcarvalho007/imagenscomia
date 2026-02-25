

# Corrigir Social Card do /video para LinkedIn e crawlers sociais

## Problema raiz

Os crawlers sociais (LinkedIn, Facebook, WhatsApp) **nao executam JavaScript**. Leem apenas o HTML inicial. Como a app e uma SPA, todas as rotas servem o mesmo `index.html` com os meta tags do webinar de **Imagens**. O hook `usePageMeta` funciona no browser mas e invisivel para crawlers.

## Solucao proposta

Criar uma **backend function** (`og-meta`) que funciona como proxy inteligente:

1. Quando um crawler social (LinkedIn, Facebook, Twitter, WhatsApp) acede a `/video`, a function devolve um HTML minimo com as meta tags correctas do webinar de video
2. Quando e um utilizador normal, faz redirect para a pagina real

No entanto, esta abordagem requer que o dominio `imagenscomia.com` encaminhe pedidos para a function — o que pode nao ser possivel directamente com a arquitectura actual.

### Alternativa mais simples e imediata

Como o site tem apenas 2 paginas principais e o `/video` e a pagina que precisa de correcao urgente, a abordagem mais pratica e:

**Criar um ficheiro `public/video/index.html`** que serve como entry point alternativo para a rota `/video`. O Vite serve ficheiros estaticos do `public/` directamente, e se existir `public/video/index.html`, ele sera servido quando o path `/video` for acedido — antes de qualquer JavaScript executar.

Este ficheiro tera:
- As meta tags OG correctas para o webinar de video (titulo, descricao, imagem, url)
- O mesmo `<div id="root">` e script para carregar a SPA normalmente
- Os crawlers leem as meta tags e param; os utilizadores carregam a app React normalmente

## Detalhe tecnico

### Ficheiro: `public/video/index.html`

Copia do `index.html` principal mas com as meta tags alteradas para o webinar de video:

| Meta tag | Valor |
|---|---|
| `<title>` | Cria Video Profissional com IA — Webinar Gratuito 5 Marco 10h |
| `og:title` | Cria Video Profissional com IA — Webinar Gratuito 5 Marco 10h |
| `og:description` | Sessao pratica ao vivo: de briefing a clip publicavel em minutos. Gratuito, 5 de Marco, 10h. |
| `og:url` | https://imagenscomia.com/video |
| `og:image` | https://imagenscomia.com/guia-essencial-seo.png (ou imagem dedicada quando disponivel) |
| `og:type` | website |
| `twitter:title` | (mesmo que og:title) |
| `twitter:description` | (mesmo que og:description) |
| `twitter:image` | (mesmo que og:image) |
| `description` | Sessao pratica ao vivo: de briefing a clip publicavel em minutos. Para gestores e profissionais de marketing. Gratuito, 5 de Marco, 10h. |
| Schema.org JSON-LD | Evento actualizado para o webinar de video (5 Marco 2026) |
| `canonical` | https://imagenscomia.com/video |

O ficheiro incluira o mesmo `<script type="module" src="/src/main.tsx">` para que a SPA carregue normalmente para utilizadores reais.

### Ficheiro: `index.html` (principal)

Sem alteracoes — continua a servir os meta tags do webinar de Imagens para a rota raiz `/`.

### Nota importante

O `usePageMeta` no `Video.tsx` continua a funcionar e a actualizar as tags no browser — nao ha conflito. Os crawlers leem o HTML estatico; os utilizadores reais veem as tags actualizadas pelo React.

