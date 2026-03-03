
# Correcao URGENTE: Precos errados na pagina /comprar

## Problema

O `PurchaseModal` envia os nomes de plano sem o prefixo `video-` ao `create-payment`, fazendo com que sejam usados os produtos do webinar de imagens em vez dos produtos de video.

### Impacto concreto

| Plano | Preco na UI | Valor enviado ao EuPago | Valor correcto |
|---|---|---|---|
| Gravacao (15 + IVA) | 18,45 EUR | 33,21 EUR (gravacao) | 18,45 EUR (video-premium) |
| Masterclass (47 + IVA) | 57,81 EUR | 57,81 EUR (masterclass) | 57,81 EUR (video-masterclass) -- mesmo valor, produto errado |
| Bundle (57 + IVA) | 70,11 EUR | 76,26 EUR (bundle) | Precisa de novo produto |

### Causa raiz

Em `PurchaseModal.tsx` linha 86, o `plan` e enviado directamente ("gravacao", "masterclass", "bundle") sem mapear para o equivalente video.

## Decisao necessaria sobre o Bundle

O video-bundle actual no create-payment tem valor 76,26 EUR (62 + IVA). Mas a UI mostra 57 + IVA = 70,11 EUR. Ha duas opcoes:

**Opcao A**: O preco correcto e 57 + IVA. Nesse caso, preciso criar um novo produto `video-bundle` com valor 70,11 EUR.

**Opcao B**: O preco correcto e 62 + IVA (47+15). Nesse caso, a UI precisa de ser corrigida para mostrar 62 EUR.

O plano assume **Opcao A** (57 + IVA = 70,11 EUR) dado que e o que a UI promete.

## Correcoes

### 1. PurchaseModal.tsx -- Mapear planos para video

Adicionar mapeamento quando `webinar === "video"`:

```text
// Antes de chamar create-payment:
const paymentPlan = webinar === "video"
  ? { gravacao: "video-premium", masterclass: "video-masterclass", bundle: "video-bundle" }[plan] || plan
  : plan;
```

Usar `paymentPlan` em vez de `plan` na chamada a `create-payment`.

Tambem corrigir o objecto `prices` na linha 99 para usar os valores correctos do video.

### 2. create-payment/index.ts -- Corrigir valor do video-bundle

Alterar o valor de `video-bundle` de 76,26 para 70,11 EUR (57 + 23% IVA).

Actualizar a descricao para reflectir o produto correcto.

### 3. PurchaseModal.tsx -- Corrigir display de preco do gravacao

Linha 23: `gravacao: "EUR15"` deveria ser `"EUR15 + IVA"` para consistencia, dado que todos os precos sao + IVA.

### 4. Deploy

Redeployar a funcao `create-payment` apos a correcao.

## Ficheiros alterados

| Ficheiro | Alteracao |
|---|---|
| `src/components/webinar/PurchaseModal.tsx` | Mapear plano para prefixo video- quando webinar=video; corrigir prices e display |
| `supabase/functions/create-payment/index.ts` | Corrigir valor de video-bundle para 70,11 EUR |

## Verificacao pos-fix

Testar cada plano na pagina /comprar e confirmar que o valor enviado ao EuPago corresponde ao preco exibido na UI.
