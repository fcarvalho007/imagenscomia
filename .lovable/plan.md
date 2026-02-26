
# Corrigir Social Card: actualizar index.html raiz para Video

## Problema confirmado

O LinkedIn Post Inspector mostra claramente que para `imagenscomia.com/video`:
- Canonical URL: `https://imagenscomia.com` (raiz, nao /video)
- Title: "Criar Imagens com IA para Empresas" (webinar antigo)
- Image: guia-essencial-seo.png (imagem errada)

O hosting serve SEMPRE o `index.html` raiz para todas as rotas (SPA fallback). O ficheiro `video/index.html` configurado via Vite MPA nao e usado pelo servidor em producao.

## Solucao

Actualizar o `index.html` raiz com os meta tags do webinar de Video, ja que o webinar de Imagens (18 Fev) ja terminou e o activo agora e o de Video (5 Marco).

## Alteracoes no ficheiro `index.html`

| Meta tag | Valor actual (Imagens) | Novo valor (Video) |
|---|---|---|
| `<title>` | Criar Imagens com IA para Empresas -- Webinar Gratuito 18 Fev 10h | Cria Video Profissional com IA -- Webinar Gratuito 5 Marco 10h |
| `og:title` | (Imagens) | Cria Video Profissional com IA -- Webinar Gratuito 5 Marco 10h |
| `og:description` | Aprende a criar imagens... | Sessao pratica ao vivo: de briefing a clip publicavel em minutos. Gratuito, 5 de Marco, 10h. |
| `og:url` | https://imagenscomia.com | https://imagenscomia.com/video |
| `og:image` | guia-essencial-seo.png | video-social-card.jpg |
| `twitter:title` | (Imagens) | (Video) |
| `twitter:description` | (Imagens) | (Video) |
| `twitter:image` | guia-essencial-seo.png | video-social-card.jpg |
| `description` | Aprende a criar imagens... | Sessao pratica ao vivo: de briefing a clip publicavel em minutos. Para gestores e profissionais de marketing. Gratuito, 5 de Marco, 10h. |
| `keywords` | criar imagens ia, midjourney... | criar video ia, video ia, gerador video ia, video marketing, webinar ia gratuito |
| `canonical` | fredericocarvalho.pt/webinar-ia | https://imagenscomia.com/video |
| JSON-LD Schema | Evento Imagens (18 Fev) | Evento Video (5 Marco), com imagem video-social-card.jpg |

O ficheiro `video/index.html` permanece como backup/referencia mas nao necessita de alteracoes.

## Resultado esperado

Apos publicacao e re-scrape no LinkedIn Post Inspector, `imagenscomia.com/video` mostrara:
- Titulo: "Cria Video Profissional com IA..."
- Imagem: o poster do Frederico com o telemovel
- Descricao: sobre o webinar de video
