

# Alinhamento da Landing Page com a Spec Completa

## Resumo
A landing page ja esta maioritariamente implementada e alinhada com a spec. Este plano cobre os ajustes finais de copy, precos (+IVA) e pequenas correcoes de conteudo para garantir correspondencia exata com o documento fornecido.

## Alteracoes por Ficheiro

### 1. PresenterSection.tsx
- Corrigir credencial "Professor Universitario": sub deve ser "FEUC . Univ. Europeia . Univ. Autonoma"
- Corrigir credencial "Fundador e CEO": sub deve ser "DIGITALFC . SMSonline.pt"
- Manter as restantes credenciais como estao

### 2. PricingCardsSection.tsx
- Botao Premium: alterar de "GARANTIR PREMIUM EUR15" para "GARANTIR PREMIUM EUR15+iva"
- Texto urgencia: remover referencia a EUR27 na linha do preco sobe (manter apenas "Preco sobe apos 18 Fev")

### 3. RegistrationModal.tsx
- Botao Premium no upsell: alterar para "SIM, QUERO PREMIUM EUR15+iva"
- Texto na caixa de alerta: atualizar para mencionar "EUR15+iva" e "EUR27"

### 4. CTAFinalSection.tsx
- Botao Premium: alterar para "PREMIUM PASS EUR15+iva"

### 5. MirrorCopySection.tsx
- Botao Premium: manter "PREMIUM PASS EUR15" (sem +iva, conforme spec desta seccao)

### 6. FAQSection.tsx
- Resposta sobre gravacao: alterar "EUR15" para "EUR15+iva"

### 7. StickyTopBar.tsx
- Texto mobile: alterar de "GRATIS" para "GRATUITO" para consistencia com desktop

## Notas
- Nao ha alteracoes estruturais ou de layout
- Todas as seccoes ja existem na ordem correta
- O design system (cores, tipografia, efeitos) ja esta implementado corretamente
- Responsividade ja esta aplicada em todos os componentes

