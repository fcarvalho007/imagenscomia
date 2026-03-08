

# Landing Page Masterclass Vídeo com IA — `/masterclass-video`

## Resumo

Criar uma nova página pública em `src/pages/MasterclassVideo.tsx` com 10 secções, seguindo o padrão visual dark da `/video` (single-file, ~800 linhas). CTA aponta para `/comprar?plan=masterclass`. Flag `MASTERCLASS_LIVE` controla copy pré/pós-evento.

## Abordagem

A página segue a mesma arquitectura da `/video` (página monolítica com dados inline, framer-motion, ScrollReveal, ElectricBorder). Cor primária verde (#16a34a) em vez de púrpura. Sem RegistrationModal — os CTAs fazem `navigate('/comprar?plan=masterclass')` directamente.

## Estrutura — 10 secções

1. **Hero** — Badge verde, título "O sistema completo de produção de vídeo com IA", subtítulo, CTA verde, GoogleBadge, indicador data (condicional `MASTERCLASS_LIVE`)
2. **Problema** — 3 SpotlightCards horizontais (Ferramentas sem método / Consistência impossível / Velocidade que não escala)
3. **O que é** — 3 blocos práticos com bullets e deliverables (Agentes IA / Fluxos Montagem / Edição Linguagem Natural)
4. **Para quem é** — Grid 2 colunas (✓ certo / ✗ não é para), mesmo layout da `/video`
5. **O que recebes** — 7 items com ícones, preço €67, CTA
6. **Upgrade Pack IA Completo** — Secção destaque subtil, €107 vs €121, CTA secundário → `/comprar?plan=bundle`
7. **Apresentador** — Reutilizar bloco foto+credentials da `/video`
8. **Testemunhos** — Mesmos 6 testemunhos, grid 3 colunas dark
9. **FAQ** — 6 perguntas, accordion light
10. **CTA Final** — Título + CTA verde + footer

### Elementos fixos
- **Sticky top bar** verde com "Masterclass · 12 Mar" + CTA
- **Sticky mobile CTA** bottom
- Footer + WhatsAppSupportButton

## Flag Evergreen

```typescript
const MASTERCLASS_LIVE = true; // false após 12 de Março
```

Afecta: badge, subtítulo hero, indicador data, secção 5 item 1, texto CTA.

## Ficheiros

| Ficheiro | Acção |
|---|---|
| `src/pages/MasterclassVideo.tsx` | Novo (~750 linhas) |
| `src/App.tsx` | +1 rota `/masterclass-video` |

## Navegação CTA

- CTA principal: `window.location.href = '/comprar?plan=masterclass'`
- CTA Pack Completo: `window.location.href = '/comprar?plan=bundle'`
- Sem RegistrationModal (é página de venda directa, não de registo)

