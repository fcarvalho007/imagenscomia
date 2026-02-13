

## Substituir Beams por ColorBends no Hero

### Resumo

Remover o componente Beams do fundo do hero e substituir pelo componente ColorBends — um efeito de shader 2D (sem @react-three/fiber) com curvas de cor animadas, interacao com o rato e parallax. Mais leve e visualmente mais rico.

### Ficheiros afectados

| Ficheiro | Tipo | Alteracao |
|---|---|---|
| `src/components/landing/ColorBends.tsx` | Criar | Componente ColorBends convertido para TypeScript |
| `src/components/landing/ColorBends.css` | Criar | CSS do container |
| `src/components/landing/HeroSection.tsx` | Editar | Substituir Beams por ColorBends |

O Beams.tsx e Beams.css permanecem no projecto (nao sao apagados).

### Detalhes tecnicos

#### A) `src/components/landing/ColorBends.css`

```text
.color-bends-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
```

#### B) `src/components/landing/ColorBends.tsx`

Conversao do codigo fornecido para TypeScript com tipagem de props. O componente usa Three.js directamente (WebGLRenderer + ShaderMaterial) sem React Three Fiber — mais leve. Inclui:
- Fragment shader com noise, warp, cores customizaveis
- Vertex shader simples (fullscreen quad)
- Interacao com ponteiro do rato (parallax + influence)
- ResizeObserver para responsividade
- Cleanup completo no unmount

#### C) `src/components/landing/HeroSection.tsx`

Alteracoes minimas:
1. Remover `import Beams from "./Beams"` e `import "./Beams.css"`
2. Adicionar `import ColorBends from "./ColorBends"`
3. Substituir o bloco Beams por:

```text
<div className="absolute inset-0 z-0" style={{ opacity: 0.4 }}>
  <ColorBends
    colors={["#1E40AF", "#7C3AED", "#0EA5E9"]}
    rotation={0}
    speed={0.15}
    scale={1.2}
    frequency={0.8}
    warpStrength={0.8}
    mouseInfluence={0.3}
    parallax={0.3}
    noise={0.05}
    transparent
    autoRotate={2}
  />
</div>
```

Cores escolhidas para a paleta escura do hero:
- `#1E40AF` — azul escuro (coerente com o blue-700 do design system)
- `#7C3AED` — roxo (neon-purple da paleta)
- `#0EA5E9` — ciano/azul claro (contraste luminoso)

Parametros ajustados para subtileza:
- `speed: 0.15` — movimento lento e elegante
- `opacity: 0.4` — fundo subtil, nao compete com o texto
- `mouseInfluence: 0.3` e `parallax: 0.3` — interactividade suave
- `autoRotate: 2` — rotacao lenta para dinamismo constante
- `noise: 0.05` — granulado minimo para textura

O `mixBlendMode: "screen"` e removido porque o ColorBends ja usa transparencia nativa (premultiplied alpha). A opacidade no wrapper controla a intensidade.

### Vantagem tecnica

ColorBends usa Three.js puro (WebGLRenderer + ShaderMaterial) sem o overhead do React Three Fiber / Drei. Menos dependencias no render path, melhor performance em dispositivos moveis.

### O que NAO muda

- Nenhuma outra seccao da landing page
- Titulo, badges, CTA, Google Reviews — tudo intacto
- LogoMarquee permanece abaixo do hero

