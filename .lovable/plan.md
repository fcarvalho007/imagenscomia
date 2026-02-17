## Implementacao Completa — Dominio, Logging, Seguranca, UX Premium

### Estado: ✅ IMPLEMENTADO E TESTADO

---

### Alteracoes efectuadas

| Ficheiro | Accao |
|----------|-------|
| `supabase/functions/resolve-payment/index.ts` | Dominio via PUBLIC_SITE_URL + logging resolve_attempt em message_logs |
| `supabase/functions/followup-abandoned/index.ts` | Dominio via PUBLIC_SITE_URL (2 locais) |
| `supabase/functions/eupago-webhook/index.ts` | Dominio via PUBLIC_SITE_URL |
| `supabase/functions/generate-reminder/index.ts` | Dominio via PUBLIC_SITE_URL |
| `supabase/functions/create-payment/index.ts` | Dominio via PUBLIC_SITE_URL |
| `supabase/functions/delete-registration/index.ts` | NOVO — delete seguro via CRM_ADMIN_SECRET |
| `src/pages/Pagar.tsx` | Rewrite UX premium: loading/timeout/paid/error states |
| `src/components/landing/ConfirmacaoExtras.tsx` | Dominio via VITE_PUBLIC_SITE_URL |
| `src/hooks/useInscritos.ts` | Delete via edge function com x-crm-secret |
| `src/components/crm/CRMLogin.tsx` | Campo "Chave CRM" para guardar secret em localStorage |
| `supabase/config.toml` | Adicionado delete-registration |
| Migracao SQL | DROP allow_anon_delete (registrations) + INSERT/UPDATE (email_templates) |
| Secrets | PUBLIC_SITE_URL + CRM_ADMIN_SECRET adicionados |

### Testes QA

| Teste | Resultado |
|-------|-----------|
| order_id invalido → "Pedido nao localizado" + WhatsApp | ✅ OK |
| Ja pago → "Pagamento ja confirmado" + CTA webinar | ✅ OK |
| resolve-payment logging em message_logs | ✅ OK |
| delete-registration sem secret → 401 | ✅ OK |
| Edge functions deployed | ✅ OK |

### Avisos RLS restantes (4)

Sao pre-existentes e necessarios para o CRM funcionar sem Supabase Auth:
- message_logs: INSERT/UPDATE (always true) — usado por edge functions
- payment_events: INSERT (always true) — usado por edge functions
- registrations: UPDATE (always true) — usado pelo CRM

Correcao definitiva: migrar CRM para Supabase Auth (fora de scope).
