
# Otimizacao Mobile — Pagina /upgrade

---

## Problemas atuais em mobile

1. **Cards empilhados com padding excessivo** — p-6/p-8 ocupa demasiado espaco em ecras pequenos
2. **Precos com font-size demasiado grande** — 34px/40px em mobile desperdicam espaco vertical
3. **Sticky bar sobrepoe conteudo** — o h-20 de padding nao e suficiente e a footer fica tapada
4. **Separadores (dividers) redundantes** — os `h-px my-5` criam demasiado espaco vazio em mobile
5. **Section header ocupa espaco sem necessidade** — margens grandes antes dos cards
6. **Bundle block nao e compacto o suficiente** em mobile
7. **Bundle modal** — padding p-7 excessivo em ecras pequenos
8. **SkipLine** — texto "Nao, obrigado" podia ser mais compacto em mobile
9. **MicroFooter** — gap-5 entre trust badges forca wrap desnecessario

---

## Alteracoes

### 1. MasterclassCard — Compactar em mobile

- Padding: `p-4 md:p-8` (era `p-6 md:p-8`)
- Preco: `text-[28px] md:text-[40px]` (era `text-[34px] md:text-[40px]`)
- Reduzir `my-5` dos dividers para `my-3 md:my-5`
- Reduzir `mb-5` dos blocos para `mb-3 md:mb-5`
- CTA button: `py-3.5 md:py-4` e `text-[15px] md:text-[16px]`

### 2. WorkshopCard — Compactar em mobile

- Padding: `p-4 md:p-6` (era `p-6`)
- Preco: `text-[26px] md:text-[32px]` (era `text-[32px]`)
- Reduzir espacamentos internos (`my-3 md:my-4`, `mb-3 md:mb-4`)

### 3. AnchorBlock — Menos espaco superior

- `pt-5 md:pt-9` (era `pt-7 md:pt-9`)

### 4. Section header — Menos margem

- `pt-6 md:pt-10` (era `pt-8 md:pt-10`)
- `mb-5 md:mb-8` (era `mb-8`)

### 5. Sticky checkout bar — Safe area

- Adicionar `pb-[env(safe-area-inset-bottom)]` para iPhones com home indicator
- Aumentar padding inferior da pagina para `h-24` (era `h-20`)

### 6. BundleBlock — Mais compacto

- `pt-4 pb-6 md:pt-6 md:pb-8` (era `pt-6 pb-8`)
- Padding interno: `p-4 md:p-5` (era `p-5`)

### 7. BundleModal — Mobile friendly

- Padding: `p-5 md:p-7` (era `p-7`)
- Adicionar `max-h-[90vh] overflow-y-auto` para ecras muito pequenos

### 8. MicroFooter — Trust badges em coluna em mobile

- Mudar de `flex-wrap` para `flex-col sm:flex-row` nos trust badges
- Reduzir `gap-5` para `gap-2 sm:gap-5`

### 9. ProgressBar — Texto mais compacto

- Padding: `px-3 py-2 md:px-5 md:py-2.5` (era `px-5 py-2.5`)

---

## Ficheiro a editar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/pages/Upsell.tsx` | Todos os ajustes de spacing, font-size e safe-area para mobile |

Nenhuma dependencia nova. Apenas refinamento de classes CSS responsivas.
