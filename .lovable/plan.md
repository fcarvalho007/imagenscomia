
# Datas evidentes e countdowns na pagina /live-video

## Resumo

Tornar as datas dos eventos muito claras na sidebar "Upgrade ao conhecimento", adicionando uma caixa dedicada de data com destaque visual em cada OfferCard, e acrescentando um countdown suave ao Premium Pass (para a data do Q&A).

---

## Alteracoes

### `src/components/webinar/VideoWebinarSidebar.tsx`

**1. Caixa de data destacada no OfferCard**

Modificar o componente `OfferCard` para aceitar uma nova prop `dateBox` (ReactNode) que renderiza uma caixa propria com fundo suave, antes dos benefits:

```
// Nova caixa de data — fundo azul claro, rounded, padding, icone calendario
<div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 mb-4">
  <p className="text-[14px] font-semibold text-ink-900 flex items-center gap-2">
    <CalendarDays /> Terca-feira, 10 de Marco
  </p>
  <p className="text-[13px] text-ink-500">14:30h — 15:00h (Portugal)</p>
  {/* countdown inline aqui */}
</div>
```

**2. Premium Pass — caixa de data + countdown**

Adicionar `dateBox` ao Premium Pass com:
- Titulo: "Sessao Q&A em grupo"
- Data: "Terca-feira, 10 de Marco · 14:30h"
- Countdown suave abaixo: "Faltam Xd XXh XXm" em texto azul (mesmo estilo do MasterclassCountdown existente)

**3. Masterclass — caixa de data + countdown**

Mover a `dateLine` actual ("12 de Marco (quinta-feira) . 10h-13h . Online") para dentro de uma caixa de data propria com o mesmo estilo:
- Titulo: "Masterclass ao vivo"
- Data: "Quinta-feira, 12 de Marco · 10h-13h"
- Countdown suave: reutilizar o `MasterclassCountdown` existente, posicionado dentro da caixa

**4. Criar componente PremiumCountdown**

Novo countdown para a data do Q&A (10 Mar 14:30h), com o mesmo estilo suave do `MasterclassCountdown`:
```
const PremiumCountdown = () => {
  const countdown = useCountdown(new Date("2026-03-10T14:30:00Z"));
  // mesmo render que MasterclassCountdown
};
```

---

## Resultado visual esperado

Cada card tera:
1. Titulo + preco (topo, como esta)
2. **Caixa de data destacada** — fundo azul claro com data grande e countdown suave
3. Lista de beneficios
4. Botao CTA
5. Nota de preco

---

## Ficheiros a modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/webinar/VideoWebinarSidebar.tsx` | Nova prop `dateBox` no OfferCard, caixas de data para Premium e Masterclass, componente PremiumCountdown |
