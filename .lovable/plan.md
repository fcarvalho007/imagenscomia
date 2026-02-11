
# Refinamento: Breakdown claro de IVA no Checkout (Step 5)

## Problema Actual
- Na caixa de resumo, os itens mostram "€15 + IVA" e "€47 + IVA", mas não fica claro qual é o valor final sem IVA
- O TOTAL mostra apenas "(c/ IVA)" numa nota pequenininha
- Utilizador não consegue ver claramente: quanto paga em base + quanto é IVA

## Valores Actuais (segundo `getTotal` em Upsell.tsx)
- Premium: €15 base → €18.45 com IVA (23%)
- Masterclass: €47 base → €57.81 com IVA (23%)
- Combo: €62 base → €76.26 com IVA (23%)

## Solução: Adicionar breakdown de subtotal + IVA

### Zona 1: Caixa de Resumo (Order Summary)
Manter a ordem actual de itens, mas adicionar **linhas intermediárias**:
- Cada item: "€15 + IVA" (manter como está)
- Após o divider: 2 novas linhas em vez de 1
  - Linha "Subtotal" (sem IVA): €62.00 (Inter 500, 13px, --ink-700)
  - Linha "IVA (23%)" em cor --amber-500: €14.26
  - Divider
  - Linha "TOTAL (c/ IVA)": €76.26 (mantém o bold)

### Implementação Técnica
- Criar função helper `calculateSubtotal(orderState)` que calcula a soma SEM IVA
  - Premium: 15€, Masterclass: 47€
- Calcular IVA como `total - subtotal` (não hardcoded)
- Mostrar 3 linhas no footer do resumo em vez de 1

### Ficheiro a alterar
`src/components/upgrade/StepConfirmation.tsx` — VariantPayment component, secção "Order summary"

### Design das novas linhas
```
Subtotal (sem IVA)    €62,00   [Inter 500, 13px, --ink-700]
IVA (23%)             €14,26   [Inter 500, 13px, --amber-600, bold]
─────────────────────────────
TOTAL (c/ IVA)        €76,26   [Montserrat 700, 16px, --ink-900, bold]
```

### Vantagens
- Transparência total: utilizador vê exatamente quanto paga sem imposto vs. com imposto
- Cumpre regulamentações (transparência fiscal)
- Não afeta o fluxo — apenas adiciona linhas informativas
- Mantém a lógica de preços intacta

