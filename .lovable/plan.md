

# Refinamentos visuais e UX da pagina /video

## Resumo

Ajustes puramente visuais/tipograficos em `src/pages/Video.tsx` — sem alterar textos, CTAs, estrutura ou ordem de seccoes.

---

## 1. Seccao "Para quem e" — titulos separados alinhados aos cards

Substituir o titulo unico centrado por dois titulos separados, cada um alinhado ao seu card dentro do grid:

- Remover o `<h2>` centrado e o eyebrow "PUBLICO-ALVO" centrado
- Dentro do grid `md:grid-cols-2`, cada card passa a ter o seu proprio titulo acima:
  - Card esquerdo: **"Para quem e"** (branco, alinhado a esquerda, `text-[22px] sm:text-[26px]`)
  - Card direito: **"Para quem nao e"** (branco mais suave, alinhado a esquerda, mesmo tamanho)
- Manter eyebrow "PUBLICO-ALVO" discreto acima do grid (centrado, cor `rgba(255,255,255,0.3)`, `text-[11px]`)
- Remover qualquer travessao ou "e" entre os dois

## 2. Fundo da seccao "Para quem e"

- Mudar de `#1e293b` para `DARK_950` (`#020617`) com noise grain overlay (reutilizar o mesmo SVG do hero)
- Adicionar degradee vertical subtil (de `#020617` para `#0f172a` no fundo)
- Cards: fundo `rgba(255,255,255,0.04)` com `border: 1px solid rgba(255,255,255,0.08)` — igual aos pain-cards
- Remover `borderTop` colorido dos cards (verde/cinza) para uniformizar

## 3. Consistencia de cards (border-radius, border, padding, sombra)

Uniformizar em todas as seccoes dark:
- `border-radius: 16px` (rounded-2xl) — ja esta nos audience cards, aplicar tambem aos testimonial cards
- `border: 1px solid rgba(255,255,255,0.08)` uniforme
- `padding: 24px` desktop / `20px` mobile
- Pain cards (seccao 1): ja estao OK, manter
- Testimonial cards: ja usam `rounded-2xl` e `p-6`, manter

## 4. Ritmo de backgrounds (alternancia subtil)

Sequencia actual e ajuste:
1. Hero — `#020617` (slate-950) -- manter
2. Logo marquee — manter
3. "Video e o formato" (rosa) — `#0a0a0f` -- manter (tem video)
4. "Para quem e" — mudar de `#1e293b` para `#020617` com grain (diferencia-se pelo grain + degradee)
5. Agenda — `bg-off-white` (claro) -- manter como "ilha clara"
6. Speaker — `#ffffff` -- manter
7. Testemunhos — `#0f172a` (slate-900) -- manter
8. FAQ — `#f8f9fa` -- manter
9. Final CTA — `#050709` -- manter

A alternancia dark/claro/dark fica: dark > dark-rosa > dark-grain > claro > branco > dark > claro > dark

## 5. Tipografia — ajustes subtis

- H2s em seccoes dark: aumentar de `text-[26px] sm:text-[32px]` para `text-[28px] sm:text-[34px]` e adicionar `tracking-[-0.5px]`
- Micro-labels (eyebrows): uniformizar para `text-[11px] tracking-[0.14em]` com cor mais suave (`rgba(255,255,255,0.35)` no dark, mantendo azul no claro)
- Texto corrido em seccoes dark: garantir `rgba(255,255,255,0.70)` como cor base (cinzento quente)
- Agenda subtitle: actualizar para "3 blocos praticos..." (eram 2, agora sao 3)

## 6. CTAs/Botoes — consistencia

- Uniformizar `rounded-xl` em todos os botoes CTA
- Agenda CTA: manter gradient purple-to-blue existente
- Hover focus: adicionar `focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2` aos botoes principais
- Mobile sticky CTA: ja existe, manter sem alteracoes

---

## Detalhes tecnicos

### Ficheiro: `src/pages/Video.tsx`

1. **Linhas 586-638** (seccao "Para quem e"): Reestruturar — fundo para `#020617` com grain, remover titulo centrado, colocar titulos individuais dentro do grid acima de cada card, remover borderTop dos cards
2. **Linha 652**: Mudar subtitulo agenda para "3 blocos praticos..."
3. **Linhas 589, 777**: Uniformizar eyebrows para `text-[11px]` com cor mais subtil
4. **Linhas 592, 780, 875**: H2s — aumentar +2px e adicionar tracking negativo
5. **Linhas 239-243, 694, 883-889**: Adicionar `focus-visible` ring aos botoes CTA

