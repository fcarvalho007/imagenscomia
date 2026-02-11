

# Refinamentos visuais — Steps 3 e 4

## Ficheiros a editar (2)

| Ficheiro | Alteracoes |
|----------|-----------|
| `StepPremium.tsx` | Skip mais escuro, remover "Pagamento unico...", mover frase posicionamento para baixo do botao, microcopy preco mais curta |
| `StepMasterclass.tsx` | Skip mais escuro, tag alinhada, remover "Pagamento unico...", mover "Grupo limitado..." para baixo do botao, reduzir espaco antes do "ou" |

---

## 1. StepPremium.tsx

### Skip link mais escuro (linha 101)
- De: `text-ink-300` para `text-ink-400`

### Remover "Pagamento unico · acesso a gravacao incluido" (linhas 86-88)
- Apagar completamente

### Mover "Upgrade ideal para aplicar o metodo depois do webinar." (linhas 75-77)
- Remover da posicao atual (antes do CTA, dentro do card)
- Colocar abaixo do botao CTA (onde estava "Pagamento unico...")
- Manter `text-[13px] text-ink-400 text-center mt-2`

### Microcopy do preco — evitar quebra de "direto" (linha 50)
- Encurtar de "Para implementar com calma, sem depender do direto." para **"Implementar com calma, sem depender do direto."**
- Isto reduz ~4 caracteres e evita que "direto." caia para linha seguinte

## 2. StepMasterclass.tsx

### Skip link mais escuro (linha 114)
- De: `text-ink-300` para `text-ink-400`

### Tag "IMAGEM → VIDEO" — alinhar a esquerda (linha 42)
- Remover `mb-4` (espaco excessivo antes do preco)
- Usar `mb-3` para aproximar do conteudo

### Remover "Pagamento unico · acesso a gravacao incluido" (linhas 99-101)
- Apagar completamente

### Mover "Grupo limitado para garantir acompanhamento." (linhas 85-87)
- Remover da posicao atual (antes do CTA)
- Colocar abaixo do botao CTA (onde estava "Pagamento unico...")
- Manter `text-[13px] text-ink-400 text-center mt-2`

### Reduzir espaco antes do separador "ou" (linha 105)
- De: `my-4` para `my-3` para aproximar o "ou" e o skip link do card

