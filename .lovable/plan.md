
# Substituir video de fundo do Hero na pagina /video

## Resumo

Substituir o ficheiro de video de fundo na seccao Hero ("O mercado exige Video.") pelo novo video enviado pelo utilizador. Cortar ligeiramente a parte inferior do video para esconder a marca "veo" no canto inferior direito.

---

## Alteracoes

### 1. Copiar o novo video para o projecto

Copiar `user-uploads://Animar_em_loop_202602231226_6c6lv.mp4` para `public/videos/hero-vidro.mp4`, substituindo o ficheiro existente. Isto evita qualquer alteracao de codigo — o componente ja referencia este caminho.

### 2. Esconder a marca "veo" no canto inferior direito

Em `src/pages/Video.tsx` (linha 268), ajustar o estilo do elemento `<video>` para cortar ligeiramente a parte inferior:

- Remover `object-cover` e substituir por estilos inline que ampliam o video ~5% para esconder o rodape
- Usar `object-fit: cover` com `object-position: center top` para empurrar o fundo (onde esta "veo") para fora da area visivel
- Alternativa mais robusta: escalar o video com `transform: scale(1.08)` para que os ~4% inferiores fiquem fora do overflow hidden do container

Implementacao concreta na tag video (linha 268):

```
<video
  autoPlay loop muted playsInline
  className="absolute inset-0 w-full h-full"
  style={{
    zIndex: 0,
    opacity: 0.35,
    objectFit: "cover",
    objectPosition: "center 40%",
    transform: "scale(1.06)",
  }}
>
```

O `scale(1.06)` amplia ligeiramente o video e o `objectPosition: "center 40%"` desloca o ponto focal para cima, escondendo o rodape com "veo" fora do `overflow-hidden` do container pai.

---

## Ficheiros afectados

| Ficheiro | Alteracao |
|----------|-----------|
| `public/videos/hero-vidro.mp4` | Substituido pelo novo video |
| `src/pages/Video.tsx` | Ajuste de estilo no elemento video (linha 268) para cortar rodape |
