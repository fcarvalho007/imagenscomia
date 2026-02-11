

# Refinamento de quebras e consistência (Steps 3-4)

## Ficheiros a editar (2)

| Ficheiro | Alteracoes |
|----------|-----------|
| `StepPremium.tsx` | Preço nowrap, microcopy mais curta, "+ IVA" consistente |
| `StepMasterclass.tsx` | Microcopy mais curta, leading consistente, preço nowrap |

---

## 1. StepPremium.tsx

### Preço grande (linha 49)
- Adicionar `whitespace-nowrap` ao `<p>` do preço para garantir que "€15 + IVA" fica numa só linha
- Atual: `<p className="...">€15 <span className="text-[16px] font-bold">+ IVA</span></p>`
- Novo: adicionar `whitespace-nowrap` à class do `<p>`

### Microcopy do preço (linha 50)
- Encurtar "Para implementar com calma, sem depender do direto." para evitar quebra
- Novo: **"Para implementar com calma, sem depender do direto."** — manter mas garantir que o `<div>` pai tem espaço suficiente (aumentar `flex-1` ou reduzir badge)
- Alternativa mais curta se continuar a quebrar: **"Implementar com calma, sem depender do direto."**

### Badge early bird (linha 52)
- Já tem `min-w-[160px]` e `whitespace-nowrap` — ok, manter

## 2. StepMasterclass.tsx

### Preço grande (linha 52)
- Separar "+ IVA" num `<span>` mais pequeno (como no Premium) para consistência visual
- Atual: `€47 + IVA` (tudo no mesmo tamanho 36px)
- Novo: `€47 <span className="text-[16px] font-bold">+ IVA</span>` (igual ao Premium)
- Adicionar `whitespace-nowrap` ao `<p>`

### Microcopy do preço (linha 53)
- Encurtar para evitar quebra de "(quinta-feira)" para nova linha
- Atual: "Pagamento único · lugares limitados · 5 de Março (quinta-feira)"
- Novo: **"Pagamento único · lugares limitados · 5 de Março"**
- Mover "(quinta-feira)" para o rodapé junto a Online/3h, ou simplesmente remover — a data "5 de Março" já é suficiente

### Bullets micro (linha 71)
- Adicionar `leading-[1.5]` ao microcopy dos bullets (consistência com Premium)
- Atual: `text-[14px] text-ink-500`
- Novo: `text-[14px] text-ink-500 leading-[1.5]`

## Resumo visual esperado

Ambos os cards ficam com:
- Preço: `font-black text-[36px]` + `<span text-[16px]>+ IVA</span>` + `whitespace-nowrap`
- Badge: `whitespace-nowrap min-w-[160px]`
- Bullets micro: `text-[14px] leading-[1.5]`
- Microcopy de preço: 1 linha sem quebra

