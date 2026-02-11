

# Alteracoes na seccao Hero da landing page

## Alteracao 1 — Headline principal (H1)

No ficheiro `src/components/landing/HeroSection.tsx`, substituir o H1 actual por duas linhas com pesos e tamanhos diferentes:

- **Linha 1**: "Cria Imagens Profissionais com IA" — `font-extrabold` (800), tamanho actual (32/40/48px), cor `text-ink-900`
- **Linha 2**: "para a Tua Empresa" — `font-bold` (700), 65% do tamanho (21/26/31px), cor `text-ink-500`

A linha 2 fica num `span` ou `div` separado dentro do mesmo `h1`, com classes de tamanho e cor proprias.

## Alteracao 2 — Badge Google Reviews

Adicionar um novo bloco entre os 4 cards de info e o video placeholder, com:

- Container `inline-flex` centrado, fundo branco, border, border-radius 12px, padding 10px 18px, sombra subtil
- Logo Google: SVG inline colorido (20x20px)
- Separador vertical: 1px, 18px altura, cor border
- Bloco de texto: "5,0" (Montserrat 700, 14px) + 5 estrelas amarelas (#FBBC05, 13px) na primeira linha; "1 194 avaliacoes no Google" (Inter 400, 11px, ink-400) na segunda linha
- Margem: `mt-6 mb-6` (24px top/bottom)
- Nao clicavel, sem hover state

O SVG do logo Google sera copiado do ficheiro uploaded para `src/assets/google_g_icon.svg` e importado no componente.

## Ordem visual resultante

1. Label — WEBINAR GRATUITO 18 FEVEREIRO 10H00
2. H1 linha 1 — Cria Imagens Profissionais com IA
3. H1 linha 2 (menor) — para a Tua Empresa
4. Tagline — Sem equipa criativa...
5. Sub — De briefing a imagem profissional...
6. 4 cards — Ao vivo / 10h00 / 75 min / Gratuito
7. **Badge Google Reviews** (novo)
8. Video placeholder
9. Botao CTA — Inscrever-me gratis

## Ficheiro a editar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/landing/HeroSection.tsx` | Headline em duas linhas com hierarquia visual, badge Google Reviews |
| `src/assets/google_g_icon.svg` | Copiar SVG do upload |

Sem dependencias novas.

