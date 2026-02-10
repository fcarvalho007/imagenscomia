

# Integracao EuPago PayByLink — Lovable Cloud

## Resumo

Implementar pagamentos via EuPago PayByLink usando uma edge function no Lovable Cloud. Inclui os 4 produtos (Premium, Masterclass, Workshop, Bundle), pagina de upsell apos inscricao gratuita, pagina de confirmacao, e webhook de callback.

---

## Arquitectura

```text
Utilizador clica "Pagar"
        |
        v
React Frontend
(chama edge function)
        |
        v
Edge Function: create-payment
(API key segura como secret)
        |
        v
EuPago API PayByLink
POST /api/v1.02/paybylink/create
        |
        v
Devolve { paymentLink }
        |
        v
Frontend redireciona para paymentLink
        |
        v
Utilizador paga na pagina EuPago
        |
        v
EuPago redireciona para /confirmacao?plan=xxx
        |
        v
EuPago envia webhook POST
        |
        v
Edge Function: eupago-webhook
(processa confirmacao)
```

---

## 1. Configuracao Lovable Cloud

### Activar Cloud
- Necessario para criar edge functions e guardar secrets

### Secret
- Guardar `EUPAGO_API_KEY` como secret (API key de producao)

---

## 2. Edge Function: create-payment

Ficheiro: `supabase/functions/create-payment/index.ts`

- Recebe POST com `{ plan, email, nome }`
- Mapeia plan para produto (valor, identifier, descricao)
- Chama EuPago PayByLink API
- Devolve `{ paymentLink }` ao frontend
- Base URL producao: `https://clientes.eupago.pt/api`

Mapa de produtos:
| Plan | Valor | Identifier |
|------|-------|------------|
| premium | 15.00 | WEBINAR-PREMIUM |
| masterclass | 52.00 | WEBINAR-MASTERCLASS |
| workshop | 512.00 | WEBINAR-WORKSHOP |
| bundle | 524.00 | WEBINAR-BUNDLE |

---

## 3. Edge Function: eupago-webhook

Ficheiro: `supabase/functions/eupago-webhook/index.ts`

- Recebe POST da EuPago quando pagamento e confirmado
- Verifica `transactionStatus === "Success"`
- Log da transacao (por agora apenas log, sem DB)
- Responde 200 OK

---

## 4. Fluxo do Modal — Alteracoes

### Fluxo atual:
1. Upsell (mostra o que perde) → 2. Formulario gratuito → 3. Confirmacao

### Novo fluxo (Premium):
Quando clica "Garantir Premium" no pricing ou "Sim, quero Premium" no upsell:
1. Formulario de dados (nome + email) com titulo "Premium Pass"
2. Ao submeter → chama edge function → redireciona para EuPago
3. Apos pagamento → EuPago redireciona para `/confirmacao?plan=premium`

### Novo fluxo (Gratuito):
Mantém-se como está (upsell → formulario → confirmacao inline no modal)

### Alteracoes no useRegistrationModal:
- Adicionar `variant: "free" | "premium"` ao contexto
- `open("free")` abre com upsell primeiro
- `open("premium")` abre directo no formulario com titulo "Premium Pass"

### Alteracoes no RegistrationModal:
- Quando variant = "premium":
  - Mostrar formulario com titulo "Premium Pass — €15"
  - Botao submit: "Confirmar e pagar €15"
  - Ao submeter: chama `create-payment` edge function, redireciona para link EuPago
- Quando variant = "free":
  - Fluxo atual mantém-se (upsell → form → confirmacao)
- Botao "Sim, quero Premium" no upsell → muda variant para "premium" e mostra formulario premium

---

## 5. Pagina de Upsell Pos-Inscricao

Nova pagina: `src/pages/Upsell.tsx`
Rota: `/upgrade`

Mostrada apos inscricao gratuita (botao no modal de confirmacao ou redirect).
Apresenta 3 cartoes de upgrade:

| Cartao | Valor | Descricao |
|--------|-------|-----------|
| Premium Pass | €15 | Gravacao + Q&A + Guia + Apps |
| Premium + Masterclass | €52 | Tudo do premium + 3h masterclass online |
| Premium + Workshop | €512 | Tudo do premium + 8h workshop presencial Lisboa |

Cada cartao tem botao que:
1. Recolhe email (se nao tiver) ou usa o ja capturado
2. Chama edge function create-payment
3. Redireciona para EuPago

---

## 6. Pagina de Confirmacao

Nova pagina: `src/pages/Confirmacao.tsx`
Rota: `/confirmacao?plan=xxx`

- Le parametro `plan` da URL
- Mostra mensagem de confirmacao conforme o plano
- Inclui: icone, titulo, lista do que inclui, proximo passo, link WhatsApp
- Botao "Voltar ao site"
- Design consistente com o resto da landing page

---

## 7. Ficheiros a criar/alterar

### Novos ficheiros:
- `supabase/functions/create-payment/index.ts` — edge function pagamento
- `supabase/functions/eupago-webhook/index.ts` — edge function webhook
- `src/pages/Confirmacao.tsx` — pagina de confirmacao
- `src/pages/Upsell.tsx` — pagina de upsell pos-inscricao

### Ficheiros alterados:
- `supabase/config.toml` — registar as 2 edge functions (verify_jwt = false)
- `src/App.tsx` — adicionar rotas /confirmacao e /upgrade
- `src/hooks/useRegistrationModal.tsx` — adicionar variant (free/premium)
- `src/components/landing/RegistrationModal.tsx` — fluxo premium com chamada a edge function
- `src/components/landing/PricingCardsSection.tsx` — botao premium chama open("premium")
- `src/components/landing/HeroSection.tsx` — botao premium chama open("premium")
- `src/components/landing/CTAFinalSection.tsx` — botao premium chama open("premium")

### Dependencias:
- Nenhuma nova (usa supabase client ja disponivel via Cloud)

---

## 8. Sequencia de implementacao

1. Activar Lovable Cloud
2. Guardar secret EUPAGO_API_KEY
3. Criar edge function `create-payment`
4. Criar edge function `eupago-webhook`
5. Actualizar modal e contexto para suportar variant premium
6. Criar pagina `/confirmacao`
7. Criar pagina `/upgrade` (upsell)
8. Actualizar rotas no App.tsx
9. Actualizar botoes premium no pricing/hero/CTA

