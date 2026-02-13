

## Substituir FloatingLines por Beams no Hero

### Resumo

Remover o componente FloatingLines do fundo do hero e substituir pelo componente Beams (feixes de luz 3D com @react-three/fiber). O Beams usa shaders com noise para criar planos verticais animados com iluminacao direccional — mais sofisticado visualmente.

### Dependencias a instalar

| Pacote | Versao | Razao |
|---|---|---|
| `@react-three/fiber` | `^8.18` | Wrapper React para Three.js (obrigatorio v8 para React 18) |
| `@react-three/drei` | `^9.122.0` | Helpers (PerspectiveCamera) — obrigatorio v9 para React 18 |

`three` ja esta instalado (^0.182.0).

### Ficheiros afectados

| Ficheiro | Tipo | Alteracao |
|---|---|---|
| `src/components/landing/Beams.tsx` | Criar | Componente Beams convertido para TypeScript |
| `src/components/landing/Beams.css` | Criar | CSS do container (.beams-container) |
| `src/components/landing/HeroSection.tsx` | Editar | Substituir FloatingLines por Beams |

FloatingLines.tsx NAO e apagado (pode ser usado noutro sitio), apenas deixa de ser importado no hero.

### Detalhes tecnicos

#### A) `src/components/landing/Beams.tsx`

Conversao do codigo fornecido para TypeScript:
- Tipagem de props (BeamsProps interface)
- Tipagem de refs (MergedPlanes, PlaneNoise)
- `extendMaterial` tipado com Record de uniforms
- CanvasWrapper reconstruido (o JSX estava incompleto no codigo fornecido):

```text
const CanvasWrapper = ({ children }) => (
  <div className="beams-container">
    <Canvas>
      {children}
    </Canvas>
  </div>
);
```

Props do componente Beams com defaults adaptados ao hero escuro:
- `lightColor`: "#1E40AF" (azul escuro, coerente com a paleta do hero)
- `beamNumber`: 8
- `beamWidth`: 1.5
- `beamHeight`: 15
- `speed`: 1.5
- `noiseIntensity`: 1.5
- `scale`: 0.2
- `rotation`: 0

#### B) `src/components/landing/Beams.css`

```text
.beams-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}
.beams-container canvas {
  pointer-events: auto;
}
```

#### C) `src/components/landing/HeroSection.tsx`

Alteracoes minimas:
1. Remover `import FloatingLines from "./FloatingLines"`
2. Adicionar `import Beams from "./Beams"`
3. Substituir o bloco FloatingLines (linhas 58-73) por:

```text
{/* Beams background */}
<div className="absolute inset-0 z-0" style={{ mixBlendMode: "screen" }}>
  <Beams
    lightColor="#1E40AF"
    beamNumber={8}
    beamWidth={1.5}
    beamHeight={15}
    speed={1.5}
    noiseIntensity={1.5}
    scale={0.2}
    rotation={0}
  />
</div>
```

O wrapper div com `mixBlendMode: "screen"` mantem o efeito de feixes luminosos sobre o fundo escuro, igual ao que o FloatingLines fazia.

Todo o resto do hero (titulo, badges, CTA, Google Reviews) permanece inalterado.

### O que NAO muda

- Nenhuma outra seccao da landing page
- Nenhuma outra pagina
- FloatingLines.tsx permanece no projecto (nao e apagado)
- Tipografia, espacamentos e conteudo do hero mantidos

