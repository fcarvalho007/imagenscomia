

## Ajustes ao Hero Section — FloatingLines, Headline, Badges e Espacamento

### Ficheiro unico afectado

`src/components/landing/HeroSection.tsx`

Nenhum outro ficheiro e alterado.

---

### Mudanca 1 — FloatingLines: reduzir intensidade (linhas 60-75)

Substituir os props do FloatingLines por:

```text
<FloatingLines
  linesGradient={["#0F2A4A", "#1A3A6B", "#2563EB", "#1A3A6B"]}
  enabledWaves={["bottom"]}
  lineCount={[6]}
  lineDistance={[5]}
  animationSpeed={0.25}
  interactive={true}
  bendRadius={3.0}
  bendStrength={-0.2}
  mouseDamping={0.03}
  parallax={true}
  parallaxStrength={0.05}
  mixBlendMode="screen"
  bottomWavePosition={{ x: 1.0, y: -1.2, rotate: -0.5 }}
/>
```

Remove `middleWavePosition` prop (ja nao e necessario com apenas "bottom").

### Mudanca 2 — Headline: forcar 2 linhas (linhas 103-117)

- Texto passa a: `Aprende a Criar Imagens<br />Profissionais com IA`
- `font-size`: `clamp(36px, 5.5vw, 52px)` (36px mobile, 42px tablet, 52px desktop)
- `max-width`: 700px
- Manter `text-align: center`, `margin: 0 auto`

### Mudanca 3 — Badges de especificacoes (linhas 141-148)

Substituir o estilo de cada badge card por:

```text
background: "rgba(6, 9, 26, 0.75)"
backdropFilter: "blur(8px)"
border: "1px solid rgba(37,99,235,0.20)"
```

### Mudanca 5 — Espacamento interno do hero

**Section** (linha 54-57):
- `paddingTop`: responsive via className — nao e possivel com style inline para responsive, entao usar style com valores fixos desktop e aceitar mobile via padding do container interno

Abordagem: o container interno (linha 78-81) controla o padding. Substituir por:
- `padding: "48px 24px 56px"` base (mobile)
- Adicionar classe `md:py-0` e usar style com `padding: "72px 40px 80px"` para desktop via media query inline nao e possivel — usar abordagem simplificada com `padding: "60px 24px 64px"` como compromisso, ou usar classes Tailwind `pt-12 pb-14 md:pt-[72px] md:pb-[80px] px-6 md:px-10`

Espacamento entre elementos:
- Badge "WEBINAR GRATUITO" container: `mb-4` (16px) em vez de `mb-5`
- H1 wrapper: `marginTop: 0` (ja encostado ao badge acima)
- Subheadline: `marginTop: 16px`, `marginBottom: 28px` (ja esta 12/28, ajustar marginTop para 16)
- Badges specs container: manter `mb-7` (28px antes do CTA)
- CTA microcopy: `marginTop: 10px` (ja esta)
- Google Reviews: `mt-4` (16px, ja esta)

### Resumo de alteracoes no ficheiro

| Linha(s) | O que muda |
|---|---|
| 54-57 | paddingBottom 80 desktop, paddingTop adicionado |
| 60-75 | FloatingLines props substituidos (menos intensidade) |
| 78-81 | Padding do container interno ajustado com Tailwind classes |
| 84 | mb-5 passa a mb-4 |
| 103 | maxWidth 700, fontSize clamp(36px, 5.5vw, 52px) |
| 115 | Texto H1 com `<br />` |
| 122 | marginTop 16 |
| 132 | gap e margin do flex de badges |
| 144-148 | Estilos dos badge cards (glass escuro) |

