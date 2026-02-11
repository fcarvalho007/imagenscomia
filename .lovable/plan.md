

# Fix: quebra de "direto." no Premium Pass

## Ficheiro: `StepPremium.tsx`

### Problema
A microcopy "Implementar com calma, sem depender do direto." quebra a palavra "direto." para a linha seguinte porque o badge early bird (com `min-w-[160px]`) ocupa demasiado espaco horizontal.

### Solucao (2 alteracoes na mesma zona)

1. **Encurtar a microcopy** (linha 50)
   - De: `"Implementar com calma, sem depender do direto."`
   - Para: `"Sem depender do direto. Ao teu ritmo."`
   - Alternativa ainda mais curta: `"Aplica ao teu ritmo, sem depender do direto."`

2. **Adicionar `shrink-0` ao left div e `gap-3`** (linha 44)
   - Alterar o flex container de `flex justify-between items-start mb-4` para `flex justify-between items-start mb-4 gap-3`
   - Isto garante espaco minimo entre o preco e o badge, evitando sobreposicao

3. **Reduzir badge min-width** (linha 52)
   - De: `min-w-[160px]` para `min-w-[150px]`
   - O badge ja tem `whitespace-nowrap`, portanto nao precisa de min-width tao largo — o nowrap ja protege contra quebras internas

### Resultado esperado
A frase da microcopy fica toda numa unica linha, e o badge mantem o texto intacto sem "+" IVA" a quebrar.

