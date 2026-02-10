

# Refinamento Visual da Landing Page -- Tipografia Maior, Meta Row Destacado, Botoes Neon/HUD

Objectivo: aumentar a legibilidade geral (fontes maiores), tornar a linha de data/horario mais perceptivel e visualmente distinta, e introduzir uma linguagem visual mais elegante nos botoes (tons neon azul/roxo/ciano, estilo "Tron HUD") mantendo o fundo editorial clean (branco + off-white).

---

## 1. Novas variaveis de cor -- Neon/HUD (index.css)

Adicionar ao `:root` as seguintes variaveis para os tons neon que serao usados nos botoes e acentos:

```
--neon-blue: 217 100% 65%;       /* #4D8EFF - azul neon */
--neon-cyan: 187 100% 50%;       /* #00E5FF - ciano neon */
--neon-purple: 262 83% 58%;      /* #7C3AED - roxo/violet */
--neon-purple-light: 262 83% 68%; /* hover mais claro */
```

Adicionar tambem novas utility shadows neon:

```css
.shadow-neon-blue {
  box-shadow: 0 0 20px rgba(77,142,255,0.35), 0 0 60px rgba(77,142,255,0.10);
}
.shadow-neon-purple {
  box-shadow: 0 0 20px rgba(124,58,237,0.35), 0 0 60px rgba(124,58,237,0.10);
}
.shadow-neon-cyan {
  box-shadow: 0 0 20px rgba(0,229,255,0.30), 0 0 60px rgba(0,229,255,0.08);
}
```

Registar as cores no `tailwind.config.ts` para ficarem disponiveis como classes.

---

## 2. Tipografia maior em toda a pagina

### HeroSection.tsx
- Label: `text-[11px]` passa para `text-[13px]`
- H1: `text-[28px] sm:text-[36px] md:text-[40px]` passa para `text-[32px] sm:text-[40px] md:text-[48px]`
- Tagline: `text-[20px] md:text-[26px]` passa para `text-[22px] md:text-[28px]`
- Subheadline: `text-xl` passa para `text-[19px] md:text-[21px]`

### MirrorCopySection.tsx
- Bullets: `text-[15px]` passa para `text-[16px]`

### ChallengesSection.tsx
- Titulos dos cards: `text-base` passa para `text-[17px]`
- Texto de fecho: `text-[17px]` passa para `text-[18px]`

### ProgramSection.tsx
- Desc dos cards: `text-[15px]` passa para `text-[16px]`

### AudienceSection.tsx
- Items: `text-[15px]` passa para `text-[16px]`

### PricingCardsSection.tsx
- Feature items: `text-[15px]` passa para `text-[16px]`

### FAQSection.tsx
- Respostas: `text-[15px]` passa para `text-[16px]`

### CTAFinalSection.tsx
- Subtitulo: `text-[17px]` passa para `text-[18px]`

---

## 3. Meta row destacado no Hero (data/horario/duracao)

A linha "Quarta 18 Fev / 10h00 / 75 min / Gratuito" passa de texto simples a um bloco visual com fundo e icones, mais perceptivel:

**Antes:** `<p className="text-sm text-ink-500 ...">` -- texto pequeno e discreto

**Depois:** Um container com fundo `bg-ink-900` (escuro), `rounded-xl`, `px-6 py-3`, `max-w-fit mx-auto`, com 4 items em flex-wrap:

Cada item tera:
- Icone Lucide (Calendar, Clock, Timer, GraduationCap) em `text-neon-cyan` (ciano neon)
- Texto em branco `text-[14px] font-medium`
- Separadores visuais `|` em `text-white/20`

Isto cria um "chip" escuro que contrasta com o fundo branco do hero e torna a informacao impossivel de ignorar.

---

## 4. Botoes com estilo neon/HUD

Substituir as cores solidas dos botoes principais por gradientes neon, mantendo a forma (rounded-xl, py-4, font-heading font-bold).

### Botao "Inscrever gratis" (Hero + PricingCards + CTA Final)
- **Antes:** `bg-green-600`
- **Depois:** `bg-gradient-to-r from-[#7C3AED] to-[#2563EB]` (roxo para azul) com `shadow-neon-purple`
- Hover: ligeiramente mais brilhante (opacity ou scale)
- Texto: branco

### Botao "Premium Pass €15" (Hero + PricingCards + CTA Final)
- **Antes:** `bg-amber-500` / `bg-blue-600`
- **Depois:** `bg-gradient-to-r from-[#2563EB] to-[#00E5FF]` (azul para ciano) com `shadow-neon-cyan`
- Hover: ligeiramente mais brilhante
- Texto: branco

### Botao da StickyTopBar
- **Antes:** `bg-white text-blue-600`
- **Depois:** `bg-gradient-to-r from-[#7C3AED] to-[#00E5FF] text-white` com sombra neon sutil
- Mantém `rounded-full`

### Botao "Reservar lugar gratuito" (ProgramSection)
- Mesmo gradiente roxo-azul do botao "Inscrever gratis"

### Botoes do CTA Final (fundo escuro)
- "Garantir lugar gratis": gradiente roxo-azul com `shadow-neon-purple`
- "Premium Pass €15": gradiente azul-ciano com `shadow-neon-cyan`

### Botao "Inscrever e receber link de convite" (PricingCardsSection referral box)
- Gradiente roxo-azul para coerencia

---

## 5. Barra topo -- gradiente actualizado

A StickyTopBar ja tem `bg-gradient-to-r from-ink-900 to-blue-700`. Manter mas adicionar um toque de roxo:
- `bg-gradient-to-r from-ink-900 via-[#7C3AED]/20 to-blue-700`

Isto cria coerencia com os novos botoes neon sem alterar drasticamente a barra.

---

## 6. Micro-acentos neon para coesao

Para criar coerencia entre seccoes sem alterar fundos:

- **MirrorCopySection:** a linha decorativa azul (`w-8 h-0.5 bg-blue-600`) passa para um gradiente: `bg-gradient-to-r from-[#7C3AED] to-[#00E5FF]` e `h-[2px] w-10`
- **ProgramSection:** os numeros grandes dos cards (`text-ink-300/30`) passam para `text-[#7C3AED]/15` (roxo muito subtil)
- **ChallengesSection:** os numeros dos cards (`text-ink-300`) passam para `text-[#7C3AED]/40`

---

## Ficheiros alterados

| Ficheiro | Alteracao |
|----------|-----------|
| `src/index.css` | 4 novas variaveis neon + 3 shadow utilities |
| `tailwind.config.ts` | Registar cores neon-blue, neon-cyan, neon-purple |
| `src/components/landing/HeroSection.tsx` | Fontes maiores + meta row destacado escuro com icones |
| `src/components/landing/StickyTopBar.tsx` | Botao neon gradient + barra com toque roxo |
| `src/components/landing/MirrorCopySection.tsx` | Fonte maior + linha decorativa gradient |
| `src/components/landing/ChallengesSection.tsx` | Fontes maiores + numeros roxo subtil |
| `src/components/landing/ProgramSection.tsx` | Fontes maiores + numeros roxo + botao neon |
| `src/components/landing/AudienceSection.tsx` | Fontes maiores |
| `src/components/landing/PricingCardsSection.tsx` | Fontes maiores + botoes neon |
| `src/components/landing/FAQSection.tsx` | Fontes maiores |
| `src/components/landing/CTAFinalSection.tsx` | Fontes maiores + botoes neon |

Nenhum ficheiro novo. Nenhuma dependencia nova. Layout e estrutura das seccoes inalterados.

