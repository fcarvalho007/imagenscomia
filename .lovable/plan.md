

## Redesenho do Hero — FloatingLines + Layout Centrado

### Resumo

Substituir o layout de duas colunas com CardSwap e prismas por um layout de coluna unica centrada com o componente FloatingLines (shader WebGL via three.js) como fundo animado. Simplificar o background e corrigir a barra branca causada pelo separador de fade.

### Dependencias

| Pacote | Versao | Razao |
|---|---|---|
| `three` | `>=0.133` | Necessario para FloatingLines (WebGLRenderer, ShaderMaterial) |

Nota: `@react-three/fiber` NAO e necessario — o FloatingLines usa three.js directamente sem o wrapper React.

### Ficheiros afectados

| Ficheiro | Tipo | Alteracao |
|---|---|---|
| `src/components/landing/FloatingLines.tsx` | Criar | Componente FloatingLines (shader WebGL) portado do reactbits, convertido para TypeScript |
| `src/components/landing/HeroSection.tsx` | Editar | Remover CardSwap/prismas/spotlight/separador, layout coluna unica, adicionar FloatingLines, ajustar tipografia |
| `src/index.css` | Editar | Remover CSS dos prismas (.hero-prism-bg, .prism-*, keyframes), adicionar .floating-lines-container |

### Alteracoes detalhadas

#### A) `src/components/landing/FloatingLines.tsx` — Criar

Portar o componente FloatingLines do reactbits para TypeScript:
- Usa three.js directamente (Scene, OrthographicCamera, WebGLRenderer, ShaderMaterial)
- Fragment shader com ondas animadas e interaccao com o rato
- Props: linesGradient, enabledWaves, lineCount, lineDistance, animationSpeed, interactive, bendRadius, bendStrength, mouseDamping, parallax, parallaxStrength, mixBlendMode, middleWavePosition, bottomWavePosition
- CSS inline: position absolute, inset 0, overflow hidden, pointer-events none (no container), pointer-events auto no canvas para interaccao

#### B) `src/index.css` — Limpar prismas, adicionar floating-lines

Remover (linhas 137-229):
- `.hero-prism-bg`, `.prism`, `.prism::before`
- `.prism-1` a `.prism-5`
- `@keyframes prism-rotate`, `@keyframes prism-glow`
- `@media (prefers-reduced-motion: reduce)` para prismas

Adicionar:
```text
.floating-lines-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  pointer-events: none;
}

.floating-lines-container canvas {
  pointer-events: auto;
}
```

#### C) `src/components/landing/HeroSection.tsx` — Reestruturar

1. **Remover imports**: CardSwap, Card, imagens da galeria (imgPorto, imgBolsa, imgSapatos, imgCappucino)
2. **Adicionar import**: FloatingLines
3. **Remover do JSX**:
   - Div `.hero-prism-bg` com 5 prismas
   - Div radial gradient spotlight
   - Div separador (linear-gradient to bottom #F8FAFC)
   - Toda a coluna direita (CardSwap + label "Criadas com IA")
   - Tag `<style>` inline com media queries do hero-grid e hero-cardswap-col
4. **Background**: mudar para `linear-gradient(160deg, #06091A 0%, #0B1230 50%, #080E22 100%)`
5. **Adicionar FloatingLines** como primeiro filho do section:
   ```text
   <FloatingLines
     linesGradient={["#1E3A5F", "#2563EB", "#3B82F6", "#60A5FA", "#2563EB"]}
     enabledWaves={["middle", "bottom"]}
     lineCount={[8, 5]}
     lineDistance={[4, 6]}
     animationSpeed={0.4}
     interactive={true}
     bendRadius={4.0}
     bendStrength={-0.3}
     mouseDamping={0.04}
     parallax={true}
     parallaxStrength={0.08}
     mixBlendMode="screen"
     middleWavePosition={{ x: 4.0, y: 0.0, rotate: 0.15 }}
     bottomWavePosition={{ x: 1.5, y: -0.8, rotate: -0.8 }}
   />
   ```
6. **Layout**: coluna unica centrada
   - Container: `max-width: 680px`, `margin: 0 auto`, `text-align: center`
   - Padding: `60px 24px` mobile, `80px 40px` desktop
   - `padding-bottom: 60px` no section
   - Todo o conteudo com `position: relative; z-index: 10`
7. **H1**: `max-width: 620px`, `margin: 0 auto`, `font-size: clamp(34px, 5vw, 48px)`, `line-height: 1.12`, `letter-spacing: -0.025em`
8. **Badges de especificacoes**: mudar de `grid grid-cols-2` para `flex flex-wrap justify-center gap-3`, cada badge com `min-width: 130px`
9. **CTA e Google Reviews**: centrados (ja estavam via text-align center)

### O que NAO e alterado

- Nenhuma outra seccao da landing page
- Nenhuma outra pagina (/upgrade, /confirmacao, /crm)
- ChallengesSection mantem `py-16 md:py-24 bg-off-white` sem alteracoes
- Texto do hero mantido exactamente como esta (headline, subheadline, CTA, microcopy, GradientText)
- ElectricBorder no CTA mantido
- Google Reviews badge mantido

