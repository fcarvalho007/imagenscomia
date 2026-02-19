
## Substituir placeholder preto pelo player Vimeo

### O que muda

Apenas 1 ficheiro: `src/components/recursos/RecursosConteudo.tsx`

O bloco `<div className="rounded-2xl bg-gray-900 ..." style={{ aspectRatio: "16/9" }}>` (linhas 83–96) é substituído pelo embed Vimeo fornecido.

O import do ícone `Clock` pode ser mantido (ainda é usado no Índice da sessão) — não é removido.

### Código final do bloco do player (linhas 83–96)

```tsx
{/* Player Vimeo — Webinar 18 Fev */}
<div className="rounded-2xl overflow-hidden shadow-lg mb-4" style={{ padding: "56.25% 0 0 0", position: "relative" }}>
  <iframe
    src="https://player.vimeo.com/video/1166335264?badge=0&autopause=0&player_id=0&app_id=58479"
    frameBorder="0"
    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
    referrerPolicy="strict-origin-when-cross-origin"
    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    title="Webinar Gratuito — IA Imagens · 18 Fev · Frederico Carvalho"
  />
</div>
```

O script `https://player.vimeo.com/api/player.js` é carregado adicionando um `useEffect` que insere o script no `<head>` uma única vez (evita duplicados se o componente re-renderizar). Alternativa mais simples: adicionar o script diretamente ao `index.html` — é a abordagem mais limpa e sem side-effects em React.

### Ficheiros a alterar

| Ficheiro | Alteração |
|---|---|
| `src/components/recursos/RecursosConteudo.tsx` | Linhas 83–96: substituir div placeholder pelo iframe Vimeo |
| `index.html` | Adicionar `<script src="https://player.vimeo.com/api/player.js"></script>` antes do `</body>` |
