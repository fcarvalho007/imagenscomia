

# Hero Section — Refinamento visual dos info cards e texto

---

## Estado actual

Os cards estao visiveis mas ainda parecem "flat" e pouco destacados. O texto descritivo esta melhor mas pode ter mais respiro. Os cards precisam de mais presenca visual.

---

## Alteracoes

### 1. Info Cards — Mais presenca visual

- Aumentar padding vertical: de `py-4` para `py-5`
- Adicionar fundo com gradiente subtil: `bg-gradient-to-b from-white to-surface` em vez de `bg-surface` simples
- Aumentar sombra: de `shadow-sm` para `shadow-card`
- Icones maiores em mobile: `w-6 h-6` (era `w-5 h-5`)
- Texto: `text-[15px] sm:text-[16px]` com `font-semibold` (era `text-[14px] sm:text-[15px]` com `font-medium`)
- Cor do icone: manter `text-blue-600`
- Layout interno: mudar para `flex-col items-center gap-1.5` para empilhar icone sobre texto (mais apelativo visualmente, especialmente em mobile)
- Aumentar `max-w` do grid para `680px` para dar mais espaco a cada card

### 2. Texto descritivo — Mais respiro

- Aumentar `max-w` de `600px` para `640px`
- Aumentar `mb-4` para `mb-6` para separar melhor dos cards
- Manter o texto actual ("De briefing a imagem profissional em menos de 3 minutos — demonstrado ao vivo.")

### 3. Espacamento entre cards e video

- Aumentar `mb-10` para `mb-12` para dar mais respiro antes do video placeholder

---

## Ficheiro a editar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/landing/HeroSection.tsx` | Cards com layout vertical (icone em cima, texto em baixo), maiores, com gradiente e sombra reforçada; espacamento ajustado |

Sem dependencias novas.

