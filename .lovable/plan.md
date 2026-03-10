

# Correcção: CORS headers em falta no `invoice-upsert`

## Problema identificado

### Screenshot 1 — `/comprar` → "Failed to send a request to the Edge Function"
A edge function `invoice-upsert` tem CORS headers incompletos. Faltam os headers `x-supabase-client-platform*` e `x-supabase-client-runtime*` que o SDK Supabase JS envia. Isto causa rejeição do preflight CORS no browser, impedindo o autosave dos dados de faturação.

### Screenshot 2 — `/gravacao` → "Não foi possível concluir"
A `register-free` tem CORS correctos. Este erro é provavelmente transitório (rede instável do cliente) ou causado pelo mesmo problema de CORS se o browser bloquear a request. Contudo, a mensagem genérica (linha 95 do `RegistrationModal.tsx`) não dá informação útil ao utilizador.

## Correcções

### 1. Actualizar CORS no `invoice-upsert`
Ficheiro: `supabase/functions/invoice-upsert/index.ts` (linha 7-8)

Substituir:
```
"authorization, x-client-info, apikey, content-type"
```
Por:
```
"authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version"
```

Redeploy da função.

### 2. (Opcional) Melhorar mensagem de erro no RegistrationModal
A mensagem genérica não ajuda o utilizador. Podemos manter como está — o fix real é garantir que as edge functions respondem.

### Impacto
- Desbloqueia o formulário de faturação no modal de compra `/comprar`
- Resolve o erro "Failed to send a request to the Edge Function" para o Hugo Patrício e futuros utilizadores

