

# Actualização da página /comprar — Pack IA Completo

## Alterações

### 1. `src/pages/Comprar.tsx`

- **Eliminar** o plano `bundle` actual (€94 Masterclass + Sessão Prática)
- **Substituir** por novo plano `bundle` = **Pack IA Completo** a €107 + IVA, com:
  - `priceStrike: "€121"`, `savingsBadge: "Poupas €14"`
  - Benefits divididos em duas secções visuais (Vídeo + Imagens) com emojis 📹 e 🖼️ como separadores inline
  - Badge "MAIS POPULAR" mantido
- **Actualizar** plano `gravacao` — adicionar tag visual "Acesso imediato" no card
- **Actualizar** plano `masterclass` — manter como está, apenas ajustar CTA text
- **Ordem desktop**: `gravacao | bundle | masterclass`
- **Ordem mobile**: `bundle | gravacao | masterclass` (bundle primeiro)
- **Adicionar rodapé** após os cards: "Já tens o pack de Imagens com IA? Contacta-nos para upgrade com desconto" com link WhatsApp
- No `PlanCard`, renderizar secções de benefícios com suporte a separadores (detectar linhas que começam com emoji 📹/🖼️ para renderizar como subtítulo bold com divisor)

### 2. `src/components/webinar/PurchaseModal.tsx`

- Actualizar `PLAN_PRICES_DISPLAY.bundle` para `"€107 + IVA"`
- Actualizar `PLAN_NAMES.bundle` para `"Pack IA Completo"`
- Actualizar `planLabel` correspondente

### 3. Backend — `create-payment` edge function

Verificar se o preço do bundle é definido no edge function e actualizar de €94 → €107. Se o preço vier do frontend via `planLabel`, pode não precisar de alteração no backend.

## Sem alterações

- Header da página, fundo escuro, tipografia, paleta
- Rodapé de confiança (EuPago, métodos de pagamento)
- Botão WhatsApp
- Lógica do PurchaseModal (fluxo register-free → create-payment)

