
# Corrigir tratamento formal (voce) na pagina /confirmacao

## Problema

O texto mistura "tu" e "voce":
- "O seu lugar esta reservado!" (voce -- correcto)
- "A **tua** inscricao foi confirmada." (tu -- incorrecto)
- "**Adiciona** ao calendario para nao **te** esqueceres." (tu -- incorrecto)

## Correcao

Alterar as duas frases na linha 99 e 103 de `src/pages/Confirmacao.tsx`:

| Antes | Depois |
|---|---|
| "A tua inscricao foi confirmada." | "A sua inscricao foi confirmada." |
| "Adiciona ao calendario para nao te esqueceres." | "Adicione ao calendario para nao se esquecer." |

Apenas 2 strings a alterar, zero impacto no resto do codigo.
