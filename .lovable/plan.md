

# Refinamento cinematico da pagina /live-video

## Resumo

Transformar a pagina `/live-video` de um layout claro (light) para um layout dark cinematico com hero impactante, logos strip, ritmo visual com "ilhas" alternadas e tipografia mais forte. Nao altera `/live`.

---

## Ficheiros a modificar

### 1. `src/pages/WebinarLiveVideo.tsx` (reescrita significativa)

Transformar a estrutura da pagina:

**Header:**
- Dark (bg-slate-950, border rgba white), sticky, backdrop-blur
- Nome "Frederico Carvalho" em branco, metaLine em slate-400
- CTA no header: "Garantir inscricao gratuita" (botao pequeno verde, hidden em mobile)

**Hero (slate-950):**
- Container max-w-7xl (1280px), centrado
- Padding: py-20 md:py-24, px-6 md:px-8
- Badge: "WEBINAR GRATUITO" (pill azul, como no /video hero)
- H1 forcado a 2 linhas no desktop:
  - Linha 1: "Aprende a criar videos com"
  - Linha 2: "Inteligencia Artificial para marketing"
  - Usar `<br className="hidden lg:inline" />` entre as duas partes
  - Desktop: text-5xl lg:text-6xl (48px/60px), font-weight 900, tracking-tight
  - "Inteligencia Artificial" com gradiente verde-ciano (#16a34a to #22d3ee)
  - Mobile: text-3xl (30px), wrap natural
- Subheadline: "Sais com um sistema, ferramentas e templates prontos (briefing -> gerar -> rever -> publicar)"
  - text-lg lg:text-xl, slate-200/80, max-w-[860px], leading-relaxed
- CTA: botao verde "Garantir inscricao gratuita" com ElectricBorder (reutilizar do /video)
- Radial glow sutil atras do headline (pseudo-element ou div com gradient radial, opacity 0.15)
- Grid/noise overlay (mesma tecnica do VideoWebinarVideoArea)

**Logos strip (imediatamente apos hero):**
- Importar e renderizar `<LogoMarquee />` de `@/components/landing/LogoMarquee`
- Ja tem fundo dark (#060D1A) e label "Plataformas a considerar"
- Encaixa perfeitamente no tema dark

**Secoes com ritmo alternado (ilhas):**

Reordenar o conteudo existente em seccoes com backgrounds alternados:

1. **Hero** - slate-950 (dark)
2. **Logo strip** - #060D1A (dark, ja existente)
3. **Video area + Countdown** - slate-900 (dark ligeiramente mais claro)
   - VideoWebinarVideoArea ja e dark por natureza
   - Envolver numa seccao com bg-slate-900, max-w-5xl centrado
4. **"O que vai aprender"** - Light island
   - Card branco/cinza (bg-white, rounded-2xl, border, shadow) sobre fundo slate-950
   - VideoWebinarContent adaptado para texto dark normal dentro do card
5. **Sidebar/Upsells** - slate-900
   - VideoWebinarSidebar com cards adaptados (borders mais claros sobre dark)
6. **Footer** - manter WebinarFooter

**Sticky mobile CTA:**
- Barra fixa no fundo (lg:hidden) com bg-slate-950/95, backdrop-blur
- Botao verde "Garantir inscricao gratuita", full width com padding
- Aparece ao fazer scroll (apos hero sair do viewport)
- z-50

**Anchor links:**
- "Ver o que esta incluido" no hero area -> scroll para seccao "O que vai aprender"
- Usar ids nos sections e smooth scroll

### 2. `src/components/webinar/VideoWebinarVideoArea.tsx` (ajustes menores)

- Sem alteracoes estruturais grandes; o componente ja e dark
- Ajustar para ficar mais largo (remover aspect-video constraint se necessario, ou manter)

### 3. `src/components/webinar/VideoWebinarContent.tsx` (adaptar para light island)

- Manter os bullets existentes
- Ajustar para funcionar tanto em contexto light (island card) como standalone
- Adicionar id="o-que-inclui" para anchor link

### 4. `src/components/webinar/VideoWebinarSidebar.tsx` (dark theme adaptation)

- Adaptar cards para fundo dark:
  - Card accent: bg-gradient dark (from-blue-950/50 to-slate-900), border-blue-500/20
  - Card normal: bg-slate-800/50, border-white/10
  - Textos: branco/slate-200 em vez de ink-900
  - Prices: branco
  - Bullets text: slate-300
  - CTA buttons: manter estilos mas adaptar (botao branco ou azul sobre dark)
  - Price notes: slate-400

### 5. `src/components/webinar/WebinarFooter.tsx` — NAO ALTERAR

Reutilizar como esta. Se necessario, a pagina WebinarLiveVideo pode usar um footer dark inline em vez deste, mas preferencialmente manter o componente existente.

---

## Detalhes tecnicos

### H1 — 2 linhas forcadas

```jsx
<h1 className="font-heading font-black text-3xl lg:text-6xl tracking-tight text-white leading-[1.1]">
  Aprende a criar videos com
  <br className="hidden lg:inline" />
  {" "}<span className="bg-gradient-to-r from-green-500 to-cyan-400 bg-clip-text text-transparent">
    Inteligencia Artificial
  </span>{" "}
  para marketing
</h1>
```

Mobile: wrap natural em 3-4 linhas (ok).
Desktop (lg+): br forca exactamente 2 linhas.

### Radial glow

```jsx
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
```

### Sticky mobile CTA (state-based)

```jsx
const [showSticky, setShowSticky] = useState(false);
// IntersectionObserver no hero -> setShowSticky quando hero sai do viewport
```

Barra: `fixed bottom-0 left-0 right-0 lg:hidden z-50 bg-slate-950/95 backdrop-blur-sm border-t border-white/10 px-4 py-3`

### Ilhas alternadas — estrutura de seccoes

```
<section className="bg-slate-950"> Hero </section>
<LogoMarquee />
<section className="bg-slate-900 py-16"> Video countdown </section>
<section className="bg-slate-950 py-16">
  <div className="bg-white rounded-2xl border shadow-xl p-8 max-w-4xl mx-auto">
    VideoWebinarContent (light island)
  </div>
</section>
<section className="bg-slate-900 py-16"> Sidebar/Upsells (centrado, max-w-4xl) </section>
<WebinarFooter />
```

---

## Tipografia

| Nivel | Font | Weight | Size (mobile) | Size (desktop) | Color |
|---|---|---|---|---|---|
| H1 | Montserrat | 900 | 30px | 60px | white + gradient |
| Sub | Inter | 400 | 16px | 20px | slate-200/80 |
| Badge | Montserrat | 600 | 14px | 14px | blue-300 |
| Body | Inter | 400 | 16px | 17px | slate-300 |
| Card title | Montserrat | 700 | 16px | 16px | white |

---

## Consistencia de componentes

- Badges: mesmo pill style (bg rgba, border rgba, rounded-full, uppercase tracking)
- Buttons: primario verde (CTA), secundario dark/white (cards)
- Cards: rounded-xl, border white/10 ou blue/20, padding p-5
- Icons: w-4 h-4 consistente nos bullets, w-5 h-5 nos badges

---

## Ficheiros — resumo

| Ficheiro | Accao |
|---|---|
| `src/pages/WebinarLiveVideo.tsx` | Reescrever (dark hero + ilhas + sticky CTA) |
| `src/components/webinar/VideoWebinarSidebar.tsx` | Adaptar cores para dark |
| `src/components/webinar/VideoWebinarContent.tsx` | Adicionar id, ajustes menores |
| `src/components/webinar/VideoWebinarVideoArea.tsx` | Ajustes menores de largura |

Ficheiros NAO alterados: `/live`, WebinarSidebar, WebinarVideoArea, WebinarContent, webinarConfig, LogoMarquee (reutilizado as-is).

