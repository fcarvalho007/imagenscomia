

## Correcoes definitivas: H1 em 2 linhas + Background mais visivel

### Ficheiro afectado

`src/components/landing/HeroSection.tsx`

### 1. H1 em 2 linhas (solucao definitiva)

O problema real: a 46px bold (Montserrat 800), "Aprende a Criar Imagens Profissionais" ocupa ~920px de largura, mais do que os 860px do container. Mesmo com `<br />`, a primeira parte ainda quebra.

**Solucao**: reduzir o font-size maximo de `clamp(32px, 5vw, 46px)` para `clamp(28px, 4.5vw, 40px)`. A 40px, "Aprende a Criar Imagens Profissionais" cabe em ~800px — dentro dos 860px do container. O `<br />` antes de "com Inteligencia Artificial" forca a segunda linha.

Resultado visual (desktop):
```text
Aprende a Criar Imagens Profissionais
com Inteligência Artificial
```

### 2. Background ColorBends mais visivel

O efeito JA esta a funcionar (visivel na screenshot como o gradiente azul/roxo no topo). Mas e demasiado subtil. Alteracoes:

- Aumentar opacidade de `0.65` para `0.85`
- Aumentar `warpStrength` de `0.8` para `1.2` (curvas mais pronunciadas)
- Aumentar `speed` de `0.15` para `0.25` (movimento mais perceptivel)
- Adicionar mais uma cor `#10B981` (verde esmeralda) para mais contraste visual

### Detalhes tecnicos

Linha 61: `opacity: 0.65` passa a `opacity: 0.85`
Linha 65: `speed={0.15}` passa a `speed={0.25}`
Linha 63: `colors` adiciona `"#10B981"`
Linha 68: `warpStrength={0.8}` passa a `warpStrength={1.2}`
Linha 109: `fontSize: "clamp(32px, 5vw, 46px)"` passa a `fontSize: "clamp(28px, 4.5vw, 40px)"`

### O que NAO muda

Badges, CTA, subheadline, Google Reviews, LogoMarquee — tudo intacto.
