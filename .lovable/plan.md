

## Atualizar /live com embed YouTube e fallback UX

Duas alteracoes simples: config e componente de video.

---

### Ficheiros a alterar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/webinar/webinarConfig.ts` | Colocar `isLive: true` e preencher `EMBED_IFRAME_HTML` com o iframe do YouTube |
| `src/components/webinar/WebinarVideoArea.tsx` | Redesenhar o estado "live": adicionar titulo/subtitulo/nota acima do player, botao fallback + texto abaixo |

---

### Detalhes

**1. webinarConfig.ts**

- `isLive: true` — forca o estado live independentemente da hora
- `EMBED_IFRAME_HTML`: iframe embed do YouTube com o video `hYsTZA9bcPA`:
  ```
  <iframe src="https://www.youtube.com/embed/hYsTZA9bcPA" ... />
  ```

**2. WebinarVideoArea.tsx — estado live redesenhado**

Estrutura do bloco live (de cima para baixo):

- **Acima do player:**
  - Titulo: "Transmissao ao vivo" (h2, font-heading, bold)
  - Subtitulo: "Quarta-feira, 18 de Fevereiro . 10h00 (Portugal)" (texto ink-500)
  - Nota: "Se aparecer 'offline', e normal — a transmissao abre alguns minutos antes." (texto pequeno ink-400)

- **Player:**
  - Container com `width: 100%`, `aspect-ratio: 16 / 9`, `border-radius`, overflow hidden
  - iframe YouTube embed com `allow="autoplay; encrypted-media; picture-in-picture"` e `allowFullScreen`
  - Nao usar `dangerouslySetInnerHTML` — renderizar o iframe directamente em JSX para controlo total dos atributos

- **Abaixo do player:**
  - Botao secundario (variant="outline", tamanho normal): "Abrir no YouTube" — link para `https://youtube.com/live/hYsTZA9bcPA`, target `_blank`, rel `noopener noreferrer`
  - Texto pequeno (13px, ink-400): "Se o player nao carregar, abrir no YouTube resolve quase sempre."

**Mobile:** O player fica full-width naturalmente com `w-full` + `aspect-ratio: 16/9`. O botao e texto de fallback ficam centrados e visiveis sem scroll.

### Sem alteracoes noutros ficheiros

A pagina `WebinarLive.tsx` ja consome o `WebinarVideoArea` e passa `isLive` — nao precisa de ser tocada.
