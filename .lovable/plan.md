

# Upgrades visuais para /video — Alinhamento com /inicial

## Resumo

Aplicar upgrades visuais na pagina /video para alinhar com o estilo premium da pagina /inicial. Inclui sticky bar com countdown, iconografia Lucide, botao CTA com ElectricBorder, logo marquee, redesign de seccoes e upgrades tipograficos no hero.

Todas as alteracoes sao feitas exclusivamente em `src/pages/Video.tsx`. Nenhum texto, routing ou estrutura e alterado.

---

## Ficheiro unico a modificar

`src/pages/Video.tsx`

---

## Alteracoes detalhadas

### 1. Sticky Top Bar com Countdown

Substituir a barra fixa actual por uma versao com countdown igual a /inicial:
- Importar `useCountdown` de `@/hooks/useCountdown`
- Adicionar countdown com blocos (dias, horas, min, seg) ao centro
- Target date: `2026-03-02T10:00:00`
- Label a esquerda: "AO VIVO . 2 MAR . A DEFINIR HORA"
- Botao CTA a direita: "Quero inscrever-me!"
- Gradient background: `from-ink-900 via-[hsl(262,83%,58%)]/20 to-blue-700`
- Adicionar `pt-[52px]` ao wrapper principal para compensar a barra fixa

### 2. Info Boxes com icones Lucide

Substituir emojis por icones Lucide nas 4 info boxes do hero (ja importados: Calendar, Clock, Timer, GraduationCap):
- Estilo das caixas: fundo `rgba(6,9,26,0.75)`, backdrop-blur, border `rgba(37,99,235,0.20)`
- Icone com cor `#60A5FA`
- Label: `font-size 9px`, `letter-spacing 2px`, `color rgba(255,255,255,0.45)`, `font-weight 700`
- Value: `font-size 16px`, `font-weight 700`, `color #fff`

### 3. Botao CTA com ElectricBorder

Substituir `ShimmerButton` no hero pelo componente `ElectricBorder`:
- Importar `ElectricBorder` de `@/components/landing/ElectricBorder`
- Cor: `#22C55E`, speed: 0.8, chaos: 0.08, borderRadius: 10
- Botao interior: background `#16A34A`, font-weight 700, padding 16px 32px, border-radius 10, width 100%, max-width 400px
- Manter texto "Garantir inscricao gratuita"

### 4. Logo Marquee abaixo do Hero

Substituir a marquee de texto actual (ferramentas) por uma marquee de logos identica a /inicial:
- Importar os mesmos 8 logos do projecto (google, chatgpt, claude, freepik, bytedance, gemini, llama, runcomfy)
- Label: "PLATAFORMAS A CONSIDERAR" (uppercase, tracking widest, cor rgba(255,255,255,0.4))
- Logos monocromaticos (filter: brightness(0) invert(1)), opacidade 0.5, h-7
- Mascara de gradiente lateral para fade suave
- Animacao: 30s linear infinite loop
- Background: `#060D1A`, border-top: `1px solid rgba(255,255,255,0.06)`

### 5. Pain Points — Redesign

- Background da seccao: `#0d0d14`
- Cada card: position relative, overflow hidden
- Ghost number absoluto: font-size 80px, font-weight 900, color rgba(255,255,255,0.04), bottom -10px, right 10px
- Numeros: "01", "02", "03", "04"
- Titulo do card: font-weight 600, color #ddd
- Hover: border-color rgba(22,163,74,0.35), background rgba(22,163,74,0.05), translateY(-2px)
- Manter SpotlightCard para efeito de cursor
- Scroll entrance: stagger 0.12s

### 6. Agenda — Estilo editorial

- Remover bordas de caixa dos rows, usar apenas bottom border (1px solid rgba(255,255,255,0.06))
- Cada row: flex, padding 14px 0
- Esquerda: label numerica "001", "002"... (font-size 11px, color #333, font-weight 700, width 40px)
- Centro: titulo (color #888, font-size 13px, flex 1)
- Tags inline: item 2 "CORE", item 3 "AO VIVO" (background rgba(22,163,74,0.12), color #16a34a, font-size 8px)
- Direita: duracao (font-size 11px, color #555)
- Hover: numero -> #16a34a, titulo -> #fff
- Scroll: slide x:-20px, stagger 0.1s

### 7. Speaker — Igual a /inicial

Replicar o layout do `PresenterSection` da /inicial:
- Layout: flex col/row, foto a esquerda (380px), texto a direita
- Foto: rounded-[20px], h-[320px] md:h-[460px], object-cover object-top
- Badge sobreposto na foto: fundo branco 95%, "5,0 . 1 194 avaliacoes no Google"
- Eyebrow: "QUEM APRESENTA" em azul (#2563EB)
- Nome: font-extrabold 24-34px
- Subtitulo: "20 anos de experiencia..."
- Grid 2x2 de credenciais com emojis (Professor, Autor, Host RFM, CEO DIGITALFC)
- Background: branco (#ffffff), texto escuro
- Manter a mesma data de credenciais

### 8. Testimonials — Redesign

- Manter fundo escuro
- Layout: 1 card featured (full width) + 2-3 cards normais
- Featured: quote mark 48px rgba(22,163,74,0.25), italic text 14px, border rgba(22,163,74,0.2)
- Cards normais: quote mark 28px, mesmo avatar/nome/stars
- Stats bar: "5,0 media" | "1.194 avaliacoes" | "Google Reviews verificadas" (11px, cor #555)
- Animacao: featured primeiro, depois stagger 0.15s

### 9. Background Alternation

- Pain points: `#0d0d14`
- Transformation: `#050709`
- Agenda: `#f8f9fa` (light) — todos os textos invertidos para dark
- Speaker: branco (`#ffffff`)
- Testimonials: `#050709`
- FAQ: `#f8f9fa` (light) — textos invertidos
- Final CTA: `#050709`

### 10. Hero Typography Upgrades

- Headline: font-size 72px desktop / 52px tablet / 38px mobile, font-weight 900, letter-spacing -2px, line-height 1.05
- Quebra forcada com `<br />` apos "com"
- "Inteligencia Artificial" em span com gradient text: `linear-gradient(135deg, #16a34a 0%, #4ade80 40%, #22d3ee 100%)`, background-clip text
- Text-shadow nas partes brancas: `0 0 80px rgba(22,163,74,0.15)`
- Subtitle: 22px desktop / 18px mobile, font-weight 500, color rgba(255,255,255,0.75)
- Sub-subtitle: 14px, font-weight 400, color rgba(255,255,255,0.4)
- Badge: texto actualizado para "WEBINAR GRATUITO . AO VIVO . 2 MARCO"
- Hero max-width: 780px, padding vertical 80px
- Orbs mais visiveis: green 0.12, blue 0.09, violet 0.07

---

## Dependencias / Imports a adicionar

- `useCountdown` de `@/hooks/useCountdown`
- `ElectricBorder` de `@/components/landing/ElectricBorder`
- `Calendar, Clock, Timer, GraduationCap` de `lucide-react` (Calendar e GraduationCap a adicionar ao import existente)
- Logos: google, chatgpt, claude, freepik, bytedance, gemini, llama, runcomfy de `@/assets/logos/`

Nenhum package novo. Nenhum ficheiro criado. Apenas `src/pages/Video.tsx` e modificado.

