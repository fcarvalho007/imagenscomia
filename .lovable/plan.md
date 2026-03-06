

# Melhorar clareza visual nos cards de /comprar

## Alteracoes — `src/pages/Comprar.tsx`

### 1. Card Sessao Pratica (€27) — reforcar "Acesso imediato"
Substituir o pequeno `topTag` pill por um bloco visual mais proeminente: um banner verde com icone de play dentro do card, abaixo do preco. Algo como uma caixa `bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5` com texto "Acesso imediato apos a compra" em bold verde.

### 2. Card Masterclass (€67) — data condicional
Adicionar logica temporal:
- **Antes de 12 Mar 13:30**: mostrar um `DateBox` destacado (fundo violeta claro, border) com:
  - "Quinta-feira, 12 de Março"
  - "10h00 — 13h00 (Portugal)"
  - Icone CalendarDays
- **Apos 12 Mar 13:30**: substituir por badge "Acesso imediato" (igual ao da Sessao Pratica)

Usar `new Date("2026-03-12T13:30:00Z")` como cutoff. Calcular `isMasterclassLive = new Date() >= cutoff`.

### 3. Card Bundle (€107) — destacar Masterclass
Na lista de benefits, a linha "3 horas ao vivo — Masterclass completa" fica com um mini-highlight: fundo `bg-violet-50 border border-violet-100 rounded-lg px-3 py-1.5 -mx-1` para se distinguir dos outros itens. Adicionar tambem a data da masterclass (condicional, mesma logica do ponto 2).

### Ficheiro unico
`src/pages/Comprar.tsx` — adicionar import de `CalendarDays`, logica de data, e ajustar o render do `PlanCard` para suportar um slot de "date box" opcional por plano.

