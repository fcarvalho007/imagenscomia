

# Actualização da página /comprar — preços pós-evento

## Problema actual

A página `/comprar` ainda mostra:
- Preços early bird (€15, €47, €57)
- Badge "Early bird — sobe a 5 de Março"
- Header "Webinar Vídeo com IA · 5 de Março · 10h00"
- Referências a datas (Q&A 10 de Março, Masterclass 12 de Março)
- Linguagem de webinar em vez de produto

## Preços actuais (normal, pós-early-bird)

Baseado na configuração do `send-payment-link`:

| Plano | Early bird (antigo) | Normal (actual) | Com IVA 23% |
|-------|-------|--------|-------------|
| Sessão Prática (ex-Gravação) | €15 | **€27** | 33,21€ |
| Masterclass | €47 | **€67** | 82,41€ |
| Bundle | €57 | **€94** | 115,62€ |

> Se os preços normais não forem estes, por favor corrige antes de aprovar.

## Alterações

### 1. `src/pages/Comprar.tsx`
- Actualizar os 3 cards com os novos preços (€27, €67, €94)
- Remover badges "early bird", "sobe após o webinar"
- Remover datas do webinar (header e dateBox)
- Header: reposicionar como produto ("Sessão Prática · Vídeo Profissional com IA")
- Renomear "Gravação HD + Pack de Apoio" → "Sessão Prática + Materiais" (alinhado com o rebranding)
- Actualizar benefícios com os 5 entregáveis correctos
- Remover referências à Q&A de 10 de Março (já passou)
- Bundle: recalcular savings badge ou remover se não há desconto (€27+€67 = €94, sem desconto)

### 2. `src/components/webinar/PurchaseModal.tsx`
- Actualizar `PLAN_PRICES_DISPLAY`: gravacao → "€27 + IVA", masterclass → "€67 + IVA", bundle → "€94 + IVA"
- Actualizar `PLAN_NAMES`: gravacao → "Sessão Prática + Materiais"
- Actualizar preços do pixel fbq

### 3. `supabase/functions/create-payment/index.ts`
- Actualizar `video-premium` value: 18.45 → 33.21
- Actualizar `video-masterclass` value: 57.81 → 82.41
- Actualizar `video-bundle` value: 70.11 → 115.62
- Actualizar descriptions para remover "Webinar"

### Ficheiros alterados
- `src/pages/Comprar.tsx`
- `src/components/webinar/PurchaseModal.tsx`
- `supabase/functions/create-payment/index.ts`

