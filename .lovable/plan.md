

# Refinamento: Padronizar CORS em todas as Edge Functions

## Diagnóstico

Existem **46 edge functions** no projecto. O CORS header que causou o problema (`x-supabase-client-platform*`) está em falta em **15 funções**:

### Grupo 1 — Chamadas pelo browser (CRM) — risco real
| Função | Headers actuais |
|--------|----------------|
| `get-analytics-visitors` | ❌ Sem x-supabase-client-* |
| `check-referrals` | ❌ Sem x-supabase-client-* |
| `bulk-tag-egoi` | ❌ Sem x-supabase-client-* |
| `bulk-sync-egoi` | ❌ Sem x-supabase-client-* |
| `grant-premium-egoi` | ❌ Sem x-supabase-client-* |
| `cleanup-egoi-tags` | ❌ Sem x-supabase-client-* |
| `resend-failed-emails` | ❌ Sem x-supabase-client-* |

### Grupo 2 — Chamadas server-to-server/cron — risco baixo mas inconsistente
| Função | Headers actuais |
|--------|----------------|
| `followup-abandoned` | ❌ Faltam x-supabase-client-* |
| `send-video-postwebinar-day1` | ❌ |
| `send-video-postwebinar-day1-sms` | ❌ |
| `send-video-postwebinar-day3` | ❌ |
| `send-video-postwebinar-closing` | ❌ |
| `send-video-masterclass-day1` | ❌ |
| `send-video-masterclass-day3` | ❌ |
| `send-video-masterclass-thankyou` | ❌ |

## Plano de correcção

### 1. Actualizar CORS em todas as 15 funções
Substituir o header incompleto pelo padrão completo em cada ficheiro:
```
"authorization, x-client-info, apikey, content-type, x-cron-secret, x-crm-admin-email, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version"
```

### 2. Redeploy de todas as funções alteradas
Deploy em batch das 15 funções.

### Impacto
- Previne que qualquer actualização futura do SDK Supabase JS volte a causar CORS failures
- As funções do Grupo 1 (CRM) ficam imediatamente protegidas — actualmente funcionam por sorte (versão do SDK, cache do browser)
- Zero impacto funcional — apenas adiciona headers permitidos ao preflight

