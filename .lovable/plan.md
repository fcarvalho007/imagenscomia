
# Redesign Completo da Pagina /upgrade

Substituir toda a estrutura actual da pagina /upgrade por um layout focado em recomendacao, seguindo as melhores praticas de checkout (Stripe, Linear, Notion).

---

## Resumo das alteracoes

A pagina actual tem 3 colunas iguais (Skip, Masterclass, Workshop) com seleccao + resumo flutuante. A nova versao elimina essa abordagem e substitui por:

1. **Barra de progresso** sticky com indicador visual "Passo 2 de 3"
2. **Bloco ancora** compacto mostrando o que o utilizador ja tem (Premium Pass €15)
3. **2 cards assimetricos** -- Masterclass (58%, destacado, "RECOMENDADO") e Workshop (42%, secundario)
4. **Skip como link de texto** com linhas decorativas (nao como card)
5. **Bloco bundle estatico** sempre visivel abaixo dos cards
6. **Rodape com garantias**

Cada botao de pagamento e directo -- sem pre-seleccao, sem resumo flutuante, sem CTA fixo mobile.

---

## Componentes removidos

- `SkipCard` (card completo com referral block)
- `DesktopSummary` (sticky bottom summary)
- `MobileCTA` (fixed bottom CTA)
- `HeroShort` (hero generico de 4 linhas)
- `ReferralInfoModal` (referral ja nao vive nesta pagina)
- Estado `selectedOption` e tipo `SelectedOption`
- Logica de seleccao de cards

## Componentes novos/reescritos

### ProgressBar (substitui ConfirmationBar)
- Sticky top-0, z-50
- Fundo green-50, border-bottom green-100
- Esquerda: icone check verde + "Premium Pass confirmado" (Montserrat 600, 13px, green-700)
- Direita: "Passo 2 de 3 -- personalizar acesso" (Inter 400, 12px, ink-400)
- Barra fina 2px: 66% preenchida em green-500

### AnchorBlock (substitui CurrentPlanBlock)
- Max-width 560px, centralizado
- Border-left 4px green-500, fundo branco, sombra verde subtil
- Label "JA NO TEU PEDIDO", titulo "Premium Pass - Webinar 18 Fev", detalhe, preco €15

### RecommendationSection (novo, substitui HeroShort + cards grid)
- Headline: "O webinar cobre o metodo."
- Subheadline: "A Masterclass implementa-o na tua empresa."
- Grid 2 colunas desktop (58%/42%), stack mobile

### MasterclassCard (reescrito)
- Border 2px blue-600, shadow forte, badge "RECOMENDADO"
- Header: "MASTERCLASS ONLINE" / "Implementacao Completa" / "3 horas - Online - Max. 30 participantes"
- Bloco preco: "+€37" em 40px, "Total: €52 - inclui IVA", "Normal separado: €64" riscado, "Poupa €12"
- 3 bullets com titulo + sub-texto (prompts testados, casos reais, gravacao + certificado)
- Urgencia: "Preco sobe para €47 depois do webinar (18 Fev)"
- Botao: "Adicionar Masterclass -- pagar €52" com shadow blue
- Micro-garantia: "Reembolso completo ate 14 dias"

### WorkshopCard (reescrito)
- Border-top 3px amber-600, badge "PRESENCIAL"
- Header: "WORKSHOP 1 DIA" / "Implementacao Hands-On" / "Sabado - Abril - Lisboa - Max. 15"
- Preco: "+€497", "Total: €512 - inclui IVA", "Founder pricing"
- 3 bullets simples (8h implementacao, sistema completo, n8n workflows)
- Nota vagas: "So 15 vagas -- 4 ja reservadas"
- Botao: "Reservar Workshop -- €512"
- Link bundle: "Quer os dois por €524? Poupa €25"

### SkipLine (novo, substitui SkipCard)
- Nao e card -- e uma linha de texto centrada com linhas decorativas
- Texto: "Nao, obrigado -- confirmar so o Premium"
- onClick: chama pagamento directo €15 via EuPago
- Nota desktop: "Podes sempre adicionar a Masterclass depois (mas custara €47)"

### BundleBlock (novo, estatico)
- Max-width 600px, centralizado
- Fundo off-white, border, rounded
- Flex: "Quer tudo junto?" + "Masterclass + Workshop por €524 -- poupa €25" + botao outline "Bundle €524"
- onClick do botao: abre BundleModal existente

### BundleModal (manter, sem alteracao)

### MicroFooter (manter, sem alteracao)

---

## Logica de pagamento

Cada botao chama `handlePayment(plan)` directamente:
- Masterclass: plan="masterclass" (€52)
- Workshop: plan="workshop" (€512)
- Skip: plan="premium" (€15)
- Bundle: plan="bundle" (€524)

Todos usam a edge function `create-payment` existente. Loading state: botao clicado mostra spinner + "A preparar pagamento...", restantes ficam desactivados.

---

## Responsividade

- Mobile: cards em stack vertical (Masterclass em cima), skip link sem linhas laterais, bundle stack vertical com botao full-width
- Desktop: grid 2 colunas (58%/42%), ambos os cards com mesma altura (items-stretch)

---

## Ficheiros alterados

| Ficheiro | Alteracao |
|----------|-----------|
| `src/pages/Upsell.tsx` | Reescrita completa -- novos componentes, remocao de SkipCard/DesktopSummary/MobileCTA/HeroShort/ReferralInfoModal, logica de pagamento directa |

Nenhum ficheiro novo. Nenhuma dependencia nova. Apenas `src/pages/Upsell.tsx` e reescrito.
