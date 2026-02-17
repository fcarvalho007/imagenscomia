

## Implementacao: Dominio, Logging, Seguranca, UX Premium e QA

---

### Ajuste 1: PUBLIC_SITE_URL em vez de hardcode

**Abordagem:** Usar `Deno.env.get("PUBLIC_SITE_URL")` nas edge functions e `import.meta.env.VITE_PUBLIC_SITE_URL` no frontend, com fallback para `https://imagenscomia.com`.

**Ficheiros a alterar (7):**

| Ficheiro | Linha(s) | De | Para |
|----------|----------|----|------|
| `.env` | (nova var) | -- | `VITE_PUBLIC_SITE_URL="https://imagenscomia.com"` |
| `resolve-payment/index.ts` | 86 | `"https://imagenscomia.lovable.app"` | `Deno.env.get("PUBLIC_SITE_URL") \|\| "https://imagenscomia.com"` |
| `followup-abandoned/index.ts` | 95 | `"https://imagenscomia.lovable.app"` | `Deno.env.get("PUBLIC_SITE_URL") \|\| "https://imagenscomia.com"` |
| `followup-abandoned/index.ts` | 184 | `"https://imagenscomia.lovable.app/pagar?o=..."` | Usar variavel `siteUrl` |
| `eupago-webhook/index.ts` | 294 | `"https://imagenscomia.lovable.app/live"` | `\`${siteUrl}/live\`` |
| `generate-reminder/index.ts` | 45 | `"https://imagenscomia.lovable.app"` | `Deno.env.get("PUBLIC_SITE_URL") \|\| "https://imagenscomia.com"` |
| `create-payment/index.ts` | 84 | Fallback `preview URL` | `Deno.env.get("PUBLIC_SITE_URL") \|\| "https://imagenscomia.com"` |
| `ConfirmacaoExtras.tsx` | 6 | `"https://imagenscomia.lovable.app"` | `import.meta.env.VITE_PUBLIC_SITE_URL \|\| "https://imagenscomia.com"` |

Adicionar o secret `PUBLIC_SITE_URL=https://imagenscomia.com` via ferramenta de secrets para as edge functions.

---

### Ajuste 2: Logging via message_logs (sem nova tabela)

Em vez de `payment_events`, usar `message_logs` com `template_key = "resolve_attempt"` e `provider = "system"`.

**Alteracao em `resolve-payment/index.ts`:**

Inserir um registo `message_logs` em TODOS os caminhos de saida:

```text
await supabase.from("message_logs").insert({
  registration_id: reg?.id || null,
  channel: "system",
  provider: "system",
  template_key: "resolve_attempt",
  status: resolveStatus,  // "ok_redirect" | "regenerated" | "already_paid" | "not_found" | "error"
  payment_url: redirectUrl || null,
  error: errorDetail || null,
});
```

Cenarios:
- `already_paid`: status="already_paid", payment_url=null
- Link valido existente: status="ok_redirect", payment_url=link
- Link regenerado: status="regenerated", payment_url=newLink
- `not_found`: status="not_found" (sem registration_id, usar insert sem FK)
- Erro EuPago/rede: status="error", error=mensagem

**Nota:** `message_logs.registration_id` e NOT NULL. Para o caso `not_found`, o insert falhara silenciosamente (non-blocking). Alternativa: fazer o insert apenas quando `reg` existe e logar `not_found` apenas via `console.log`.

---

### Ajuste 3: delete-registration com CRM_ADMIN_SECRET

**Novo secret:** `CRM_ADMIN_SECRET` (pedir ao utilizador via ferramenta de secrets).

**Nova edge function `delete-registration/index.ts`:**

```text
- Recebe: { registration_id }
- Valida header: X-CRM-Secret === Deno.env.get("CRM_ADMIN_SECRET")
- Se invalido: 401
- Se valido: delete com service_role
- Responde: { deleted: true }
```

**Config:** `[functions.delete-registration] verify_jwt = false`

**CORS headers:** Incluir `x-crm-secret` no `Access-Control-Allow-Headers`.

**Alteracao em `useInscritos.ts` (linha 129-140):**

Substituir `supabase.from("registrations").delete()` por:

```text
const CRM_SECRET = localStorage.getItem("crm_admin_secret") || "";
const res = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-registration`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CRM-Secret": CRM_SECRET,
    },
    body: JSON.stringify({ registration_id: inscritoId }),
  }
);
```

**CRM Login:** Guardar o secret no localStorage quando o admin faz login no CRM. Preciso verificar como funciona o login actual do CRM.

**Migracao SQL:**

```text
DROP POLICY IF EXISTS "allow_anon_delete" ON public.registrations;
DROP POLICY IF EXISTS "allow_anon_insert_email_templates" ON public.email_templates;
DROP POLICY IF EXISTS "allow_anon_update_email_templates" ON public.email_templates;
```

---

### Rewrite do Pagar.tsx (UX Premium)

**Estados:**

1. **loading** (0-12s): Icone Shield animado + "A terminar o pagamento..." + barra de progresso indeterminate + subtexto "A validar o link e a abrir o checkout seguro."

2. **redirecting**: Shield + "Pagamento seguro -- a redirecionar..."

3. **timeout** (apos 12s sem redirect): Mostra fallback com:
   - Botao primario "Continuar para pagamento" (abre `redirectUrl` guardado)
   - Link "Tentar novamente" (re-invoca resolve-payment)
   - Link WhatsApp suporte

4. **paid**: CheckCircle verde + "Pagamento ja confirmado" + CTA "Aceder ao webinar"

5. **error** (por cenario):
   - `not_found`: "Nao foi possivel localizar este pedido."
   - `network`: "Ocorreu um problema temporario."
   - generico: "Nao foi possivel processar."
   - Todos com CTA WhatsApp + "Tentar novamente"

**Tecnico:**
- `useRef` para timeout de 12s
- Guardar `redirectUrl` em state para fallback
- Layout mobile-first, max-w-md centrado
- WhatsApp URL: `https://api.whatsapp.com/send?phone=351915015508&text=WebinarAI%20Pagamento`

---

### Resumo de ficheiros a alterar/criar

| Ficheiro | Accao |
|----------|-------|
| Secret `PUBLIC_SITE_URL` | Adicionar via ferramenta |
| Secret `CRM_ADMIN_SECRET` | Pedir ao utilizador |
| `.env` | Adicionar `VITE_PUBLIC_SITE_URL` |
| `resolve-payment/index.ts` | Dominio + logging message_logs |
| `followup-abandoned/index.ts` | Dominio (2 locais) |
| `eupago-webhook/index.ts` | Dominio |
| `generate-reminder/index.ts` | Dominio |
| `create-payment/index.ts` | Dominio |
| `ConfirmacaoExtras.tsx` | Dominio |
| `src/pages/Pagar.tsx` | Rewrite UX premium |
| `supabase/functions/delete-registration/index.ts` | Novo |
| `supabase/config.toml` | Adicionar delete-registration |
| `src/hooks/useInscritos.ts` | Usar edge function para delete |
| Migracao SQL | Drop 3 policies perigosas |

### Ordem de execucao

1. Pedir secrets (PUBLIC_SITE_URL + CRM_ADMIN_SECRET)
2. Migracao SQL (drop policies)
3. Edge functions (dominio + logging + delete-registration)
4. Frontend (Pagar.tsx + ConfirmacaoExtras + useInscritos)
5. Deploy + testes QA

