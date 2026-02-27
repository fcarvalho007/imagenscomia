
# Redesign Steps 3 e 4 do /upgrade-video

## Resumo

Redesign visual dos componentes `StepMasterclass.tsx` (Step 3) e `StepVideoPremium.tsx` (Step 4) para alinhar com o novo design system do upgrade flow. Sem alteracoes a logica de pagamento, Supabase, ou outros componentes.

## Alteracoes

### 1. `src/components/upgrade/StepMasterclass.tsx`

Rewrite completo do JSX mantendo as mesmas props (`onAddMasterclass`, `onSkip`) e o AlertDialog de confirmacao.

Mudancas visuais:
- Step label centrado: "Passo 3 de 5 -- Masterclass Video" (12px, #9ca3af)
- Headline centrado: "Vais gostar desta opcao" (28px, 700, #111827)
- Subheadline centrado: "Aprofunda o sistema completo em 3 horas ao vivo." (15px, #6b7280)
- Pricing card com border #7c3aed, border-radius 20px, shadow purple, padding 28px 24px
- Badges: esquerdo com fundo #7c3aed e texto branco; direito com fundo #f5f3ff e texto #7c3aed
- Label "MASTERCLASS ONLINE" em 11px, 700, uppercase, letter-spacing 1.5px
- Preco: "euro47" em 48px/800 (mobile 40px) + "+ IVA" inline 16px/400
- Early bird badge: fundo #fefce8, border #fde047, texto #854d0e
- Date box: fundo #f5f3ff, texto #7c3aed
- Benefits: check icon 20px purple circle com tick branco, gap 14px entre items, sub em 13px (mobile 12px)
- Meta row centrado com middots: "calendario 12 de Marco . laptop Online . relogio 3 horas" (12px, #9ca3af)
- CTA primario: fundo #7c3aed, hover #6d28d9, rounded-[28px], h-[52px], 16px/700
- Social proof: "Grupo limitado para garantir acompanhamento." (12px, #9ca3af)
- Separador "ou" com linhas #e5e7eb
- CTA secundario: border 1.5px #e5e7eb, rounded-[28px], h-[48px], 15px/500, hover bg #f9fafb
- Reassurance note: italico, 12px, #9ca3af

### 2. `src/components/upgrade/StepVideoPremium.tsx`

Rewrite completo do JSX mantendo as mesmas props (`onAddPremium`, `onSkip`, `userName`) e o AlertDialog.

Nova prop adicionada: `masterclassSelected?: boolean` — para mostrar nota verde no topo se Masterclass foi seleccionada no Step 3.

Mudancas visuais:
- Se `masterclassSelected` = true: nota verde no topo "checkmark Masterclass garantida." (14px, 600, #16a34a, fundo #f0fdf4, border #bbf7d0, rounded-lg, padding 10px 14px)
- Step label centrado: "Passo 4 de 5 -- Gravacao Video" (12px, #9ca3af)
- Headline: "Gravacao do Webinar Video" (28px, 700) + "(opcional)" inline (28px, 400, #9ca3af)
- Subheadline centrado (15px, #6b7280)
- Pricing card com border #1e40af, border-radius 20px, shadow blue, padding 28px 24px
- Badges: esquerdo fundo #1e40af texto branco; direito fundo #eff6ff texto #1e40af
- Preco: "euro15" em 48px/800 (mobile 40px)
- Early bird badge: mesma cor amber do Step 3
- Date box: fundo #eff6ff, texto #1e40af
- Benefits: check icon blue #1e40af, sub em 13px (mobile 12px)
- CTA primario: fundo #1e40af, hover #1e3a8a, rounded-[28px], h-[52px]
- Social proof: "Recomendado para quem quer rever e aplicar sem pressa."
- Separador + CTA secundario + reassurance note: mesmo estilo do Step 3

### 3. `src/pages/UpgradeVideo.tsx`

Unica alteracao: passar `masterclassSelected={orderState.masterclass}` como prop ao `StepVideoPremium` (linha ~334). Tudo o resto fica inalterado.

## O que NAO muda

- Props de callback (`onAddMasterclass`, `onSkip`, `onAddPremium`)
- AlertDialog de confirmacao (mantido identico, so actualiza cor do botao para match)
- Logica de pagamento EuPago
- Supabase reads/writes
- Steps 1, 2, 5, 6
- UpgradeVideo.tsx (excepto a nova prop)
- Qualquer outro ficheiro

## Mobile (< 640px)

- Pricing card padding: 20px 16px
- Preco: 40px em vez de 48px
- Sub-text benefits: 12px
- Badges: flex-wrap para empilhar
- CTAs: sempre full-width, 16px, 52px/48px height mantidos
