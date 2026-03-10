

# Resultado da auditoria: CORS headers

## Estado actual

Das 46 edge functions, **45 estão correctas** com os headers `x-supabase-client-platform*` completos.

**1 função ficou por actualizar:**

| Função | Headers actuais |
|--------|----------------|
| `backfill-sms-logs` | ❌ Falta `x-supabase-client-platform*` — tem apenas `"authorization, x-client-info, apikey, content-type, x-crm-admin-email"` |

## Risco

Baixo — esta função é chamada manualmente do CRM (não por utilizadores finais), mas deve ser padronizada por consistência.

## Correcção

Actualizar `supabase/functions/backfill-sms-logs/index.ts` linha 7 para incluir o header completo:

```
"authorization, x-client-info, apikey, content-type, x-cron-secret, x-crm-admin-email, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version"
```

Redeploy da função.

