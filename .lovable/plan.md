

# Refinamentos Mobile — Landing Page Principal (/)

## Avaliação

A landing page está bem construída com boa responsividade base. Refinamentos identificados:

### Alta prioridade

1. **Hero H1 — `<br />` fixo quebra mal em 375px** — O `<br />` entre "Profissionais" e "com Inteligência Artificial" força uma quebra fixa que em 375px pode criar linhas desbalanceadas. Melhor usar `<br className="hidden sm:inline" />` para só quebrar em desktop, deixando o texto fluir naturalmente em mobile.

2. **Hero spec badges — `minWidth: 130` causa overflow horizontal em 375px** — 4 badges com `minWidth: 130px` + gap 12px = ~544px mínimo. Em 375px com `px-6`, o espaço útil é ~327px. Os badges fazem wrap mas ficam com espaçamento irregular. Reduzir `minWidth` para `110` e usar `flex-1` com `min-w-[calc(50%-6px)]` para forçar grid 2x2 em mobile.

3. **StickyTopBar — botão CTA pode truncar em 320px** — "Quero inscrever-me!" com `px-3` em max-sm fica justo. Adicionar `text-[12px] max-sm:text-[11px]` ou encurtar para "Inscrever-me" em mobile.

### Média prioridade

4. **ProgramSection — cards com `p-7` excessivo em 375px** — O padding `p-7` (28px) nos cards de programa consome espaço. Reduzir para `p-5 sm:p-7`.

5. **PricingCardsSection — card com `p-8 sm:p-10`** — Em 375px, `p-8` (32px) é generoso. Reduzir para `p-6 sm:p-10`.

6. **RegistrationModal — `p-8` fixo no container** — Em 375px, 32px de padding lateral comprime os inputs. Reduzir para `p-5 sm:p-8`.

7. **TestimonialsSection — Google badge text wraps awkwardly** — O texto "· 1 194 avaliações verificadas no Google" pode quebrar em mobile. Adicionar `whitespace-nowrap` ou simplificar para "1 194 avaliações" em mobile.

### Baixa prioridade

8. **GallerySection — 2 colunas em mobile é adequado** — Já tem media query correcta. Sem alteração necessária.

9. **CTAFinalSection — CTA button `w-full sm:w-auto`** — Já está correcto. Sem alteração.

10. **FooterSection — links wrap naturalmente** — Em 375px os 5 links fazem wrap para 2-3 linhas. Aceitável dado o contexto.

## Plano de implementação

| # | Ficheiro | Alteração |
|---|---|---|
| 1 | `HeroSection.tsx` | `<br />` → `<br className="hidden sm:inline" />` no H1 |
| 2 | `HeroSection.tsx` | Spec badges: `minWidth: 130` → remover, adicionar classes `min-w-[calc(50%-6px)] sm:min-w-[130px]` para grid 2x2 em mobile |
| 3 | `StickyTopBar.tsx` | Botão CTA: usar texto curto em mobile via `<span className="sm:hidden">Inscrever-me</span><span className="hidden sm:inline">Quero inscrever-me!</span>` |
| 4 | `ProgramSection.tsx` | Cards padding: `p-7` → `p-5 sm:p-7` |
| 5 | `PricingCardsSection.tsx` | Card padding: `p-8 sm:p-10` → `p-6 sm:p-10` |
| 6 | `RegistrationModal.tsx` | Container padding: `p-8` → `p-5 sm:p-8` |
| 7 | `TestimonialsSection.tsx` | Google badge: esconder "verificadas no Google" em mobile via `<span className="hidden sm:inline">verificadas no Google</span>` |

Todas as alterações são CSS/atributos — sem mudanças de lógica.

