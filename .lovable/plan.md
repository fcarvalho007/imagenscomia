

# Remover Premium da landing page e uniformizar CTAs verdes

## Resumo

Eliminar todas as referencias ao Premium Pass, blocos de referral e texto associado na landing page. Substituir todos os botoes por um unico estilo verde com "Inscrever-me gratis".

---

## Alteracoes por ficheiro

### 1. `src/components/landing/PricingCardsSection.tsx`

**Remover completamente:**
- O card Premium inteiro (linhas 65-113)
- O texto "O Premium e recomendado..." (linhas 116-120)
- O bloco "Ou ganha Premium gratis" com o referral (linhas 122-140)
- As linhas RGPD/Reembolso (linhas 142-148)
- O aviso "Nota: sem acesso a gravacao apos o webinar" (linhas 49-52)
- Imports nao utilizados: `AlertTriangle`, `Gift`, `premiumFeatures`

**Alterar:**
- Remover o grid de 2 colunas — fica so 1 card centrado (`max-w-[420px] mx-auto`)
- Botao do card gratuito: mudar de gradiente roxo para verde (`bg-green-600 hover:bg-green-700`), texto "Inscrever-me gratis →"
- Sombra do botao: `shadow-[0_4px_14px_0_rgba(22,163,74,0.35)]`
- Manter apenas "Sem compromisso" como nota abaixo do card

### 2. `src/components/landing/CTAFinalSection.tsx`

**Remover:**
- O segundo botao "Garantir Premium €15" (linhas 41-48)
- As linhas RGPD/Reembolso/Spam (linhas 52-58)

**Alterar:**
- Botao unico: mudar de gradiente roxo para verde (`bg-green-600 hover:bg-green-700`), texto "Inscrever-me gratis →"
- Sombra verde: `shadow-[0_4px_14px_0_rgba(22,163,74,0.35)]`
- Centrar o botao (remover flex-row, manter so `flex justify-center`)

### 3. `src/components/landing/StickyTopBar.tsx`

**Alterar:**
- Botao: mudar de gradiente neon para verde (`bg-green-600 hover:bg-green-700`), texto "Inscrever-me gratis →"
- Remover `shadow-neon-purple`, usar sombra verde subtil

---

## Resultado final

Toda a landing page tera apenas um tipo de CTA — botao verde "Inscrever-me gratis →" — sem qualquer mencao a Premium, precos, referrals ou reembolso. A mensagem e clara: o webinar e 100% gratuito.

