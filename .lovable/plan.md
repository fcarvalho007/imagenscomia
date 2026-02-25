

# Refinamentos para prevenir race conditions em todas as Edge Functions

## Problemas encontrados

Apos a correccao no `create-payment`, restam **3 Edge Functions** que fazem UPDATE/SELECT na tabela `registrations` usando apenas `.eq("email", email)` sem filtro de webinar. Com utilizadores inscritos em ambos os webinars (imagens + video), isto pode causar o mesmo tipo de problema.

## 1. eupago-webhook — Strategy 3 (CRITICO)

**Ficheiro:** `supabase/functions/eupago-webhook/index.ts` (linhas 144-152)

A Strategy 3 (legacy fallback) faz `.update({ paid_at: ... }).eq("email", email)` sem filtro de webinar. Se activada, marca **todas** as registrations desse email como pagas — potencialmente marcando como pago um webinar que nao foi.

**Correccao:** Adicionar `.eq("webinar", webinar)` ao update. Como a Strategy 3 extrai o email do identifier (formato antigo sem webinar), e necessario tambem extrair o webinar do identifier ou, em alternativa, limitar o update a apenas 1 linha usando o `id` em vez do `email`. A abordagem mais segura: fazer primeiro um SELECT para encontrar a registration correcta (a mais recente sem `paid_at`), e so depois fazer o UPDATE por `id`.

## 2. generate-reminder (MEDIO)

**Ficheiro:** `supabase/functions/generate-reminder/index.ts` (linhas 86-104)

Esta funcao faz dois acessos sem filtro de webinar:
- Linha 89: SELECT `.eq("email", email)` para lookup do registo
- Linha 104: UPDATE `.eq("email", email)` para guardar eupago_ref e payment link

O PRODUCTS map so tem planos "imagens" (sem prefixo `video-`), mas o UPDATE sem filtro pode sobrescrever o `eupago_ref` de uma registration "video".

**Correccao:** Aceitar um parametro `webinar` no body (default `"imagens"`) e adicionar `.eq("webinar", webinar)` a ambas as queries.

## 3. send-video-confirmation — message_logs lookup (BAIXO)

**Ficheiro:** `supabase/functions/send-video-confirmation/index.ts` (linha 172)

Faz `.eq("email", email)` sem `.eq("webinar", "video")` para encontrar o registration_id para message_logs. Se o utilizador tem inscricoes em ambos os webinars, pode associar o log ao registo errado.

**Correccao:** Adicionar `.eq("webinar", "video")` ao SELECT.

## Resumo tecnico

| Ficheiro | Risco | Alteracao |
|---|---|---|
| `eupago-webhook/index.ts` Strategy 3 | Alto | UPDATE por `id` em vez de `email`, apos SELECT com filtro |
| `generate-reminder/index.ts` | Medio | Adicionar `.eq("webinar", webinar)` a SELECT e UPDATE |
| `send-video-confirmation/index.ts` | Baixo | Adicionar `.eq("webinar", "video")` ao lookup |

Todas as funcoes serao re-deployed automaticamente apos as alteracoes.

