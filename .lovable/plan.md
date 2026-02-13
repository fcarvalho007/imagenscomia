

## Redesenho do Hero Section — Fundo Dark com Prism Animado

### Resumo

Transformar o hero de fundo claro com imagem para um fundo escuro elegante com prismas geometricos animados em CSS puro, adaptando toda a tipografia para contraste sobre fundo escuro.

### Ficheiros afectados

| Ficheiro | Tipo | Alteracao |
|---|---|---|
| `src/components/landing/HeroSection.tsx` | Editar | Remover imagem de fundo, adicionar prismas, luz central, separador, adaptar cores de texto |
| `src/index.css` | Editar | Adicionar CSS dos prismas (.hero-prism-bg, .prism, .prism-1 a .prism-5, keyframes, prefers-reduced-motion) |

### Alteracoes detalhadas

#### A) `src/index.css` — Adicionar estilos dos prismas

Adicionar no final do ficheiro (fora das layers) todo o CSS dos prismas:
- `.hero-prism-bg` — container absoluto
- `.prism` — base com border subtil e backdrop-filter
- `.prism::before` — glow com gradiente azul/roxo
- `.prism-1` a `.prism-5` — posicoes, tamanhos e delays diferentes
- `@keyframes prism-rotate` — rotacao lenta com ligeira escala
- `@keyframes prism-glow` — variacao de opacidade e hue
- `@media (prefers-reduced-motion: reduce)` — desactivar animacoes

#### B) `src/components/landing/HeroSection.tsx` — Reestruturar hero

1. **Remover** import de `heroBg` e a tag `<img>` do fundo
2. **Remover** os dois overlays brancos (radial-gradient e from-white/70)
3. **Mudar** background do `<section>` para o gradiente escuro: `linear-gradient(135deg, #080c14 0%, #0d1525 60%, #0a1020 100%)`
4. **Adicionar** como primeiro filho do section:
   - Div `.hero-prism-bg` com 5 divs `.prism .prism-1` a `.prism-5`
   - Div de luz central (radial-gradient azul subtil)
   - Div separador no fundo (gradiente de transparente para #F8FAFC)
5. **Adaptar cores do texto** (tudo inline ou com classes):
   - Badge: `bg-[rgba(37,99,235,0.15)]`, `border-[rgba(37,99,235,0.30)]`, `text-[#93C5FD]`
   - H1: `text-[#F8FAFC]`, text-shadow escuro
   - Subheadline: `text-[#60A5FA]`
   - Cards de specs: `bg-[rgba(255,255,255,0.05)]`, `border-[rgba(255,255,255,0.10)]`, texto `text-[#CBD5E1]`, icones `text-[#60A5FA]`, labels `text-[#94A3B8]`
   - Microcopy: `text-[rgba(255,255,255,0.40)]`
   - Google badge: `bg-[rgba(255,255,255,0.06)]`, `border-[rgba(255,255,255,0.10)]`, score `text-[#F8FAFC]`, avaliacoes `text-[rgba(255,255,255,0.50)]`
   - Botao CTA verde: sem alteracoes
6. **Padding**: manter `py-16 md:py-24`, nao forcar min-height em desktop

### Nao alterar

- Nenhuma outra seccao da landing page
- Nenhuma outra pagina (/upgrade, /confirmacao, /crm)
- Texto do hero (headline, subheadline, CTA, microcopy) mantido exactamente como esta
- StickyTopBar mantida como esta (ja tem fundo escuro proprio)

