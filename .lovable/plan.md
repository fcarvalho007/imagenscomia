

# Refinamento UX/UI — Passo 5 (Confirmacao Gratuita)

## O que muda

Reordenar e destacar os blocos do passo 5 da variante gratuita (`StepConfirmation.tsx` / `VariantFree`) para melhor hierarquia visual.

## Nova ordem dos blocos

1. **Titulo** — "Estas inscrito! Ate dia 18" (sem alteracao)
2. **Caixa verde** — confirmacao com os 3 itens (sem alteracao)
3. **Botao calendario** — move para logo abaixo da caixa verde (antes estava depois do referral)
4. **Bloco referral** (destaque reforçado) — maior visibilidade:
   - Aumentar padding (p-6)
   - Titulo maior (16px em vez de 15px)
   - Adicionar borda mais visivel (border-amber-300 em vez de amber-200)
   - Adicionar sombra subtil (`shadow-sm`)
   - Botao "Copiar link" com fundo solido amber-100 em vez de transparente
5. **Botao Instagram** — no fim (sem alteracao relevante)

## Ficheiro a editar

`src/components/upgrade/StepConfirmation.tsx` — apenas a `VariantFree`, reordenar JSX e ajustar classes do bloco referral.

