

# Refinamentos Hero + Pricing

---

## 1. HeroSection.tsx -- Tagline que não parte

O problema: "Sem equipa criativa. Sem agência. Sem meses de tentativa e erro." está a partir em 2 linhas no desktop porque o font-size é demasiado grande (22px/28px).

Solução:
- Reduzir o font-size da tagline de `text-[22px] md:text-[28px]` para `text-[18px] md:text-[22px]`
- Adicionar `whitespace-nowrap` em desktop para evitar quebra (com fallback para wrap em mobile)
- Alternativamente, aumentar o `max-w` do container ou usar `text-[20px] md:text-[24px]` que caiba numa linha a 960px

Ajuste fino recomendado: `text-[17px] sm:text-[20px] md:text-[24px]` -- cabe numa linha em desktop (960px) e faz wrap natural em mobile.

---

## 2. PricingCardsSection.tsx -- Remover "€27+IVA depois do webinar"

Remover a linha 47:
```
<p className="text-sm text-ink-400 line-through mb-1">€27+IVA depois do webinar</p>
```

---

## 3. PricingCardsSection.tsx -- Remover "em early access" do Premium

Alterar o item no array `premiumFeatures` (linha 19):
- De: `{ main: "App Gerador de Prompts em early access", sub: "acesso antes de todos os participantes" }`
- Para: `{ main: "App Gerador de Prompts", sub: "" }`

Isto remove tanto "em early access" do titulo como "acesso antes de todos os participantes" do subtitulo.

---

## Ficheiros a editar

| Ficheiro | Alteração |
|----------|-----------|
| `src/components/landing/HeroSection.tsx` | Reduzir font-size da tagline para caber numa linha |
| `src/components/landing/PricingCardsSection.tsx` | Remover preço riscado e "early access" |

