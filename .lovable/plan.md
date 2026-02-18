
## Diagnóstico Completo — Estado Actual vs. Requisitos

### O que está a funcionar
- `send-payment-link` edge function existe e tem: validação `X-CRM-Secret`, guard-rail `paid_at`, URL estável, logging em `message_logs`
- `SendPaymentModal` existe com cooldown de 6h (via `messageLogs`) e UI de sucesso
- `updateStepReached` no hook funciona correctamente
- `ActivityTimeline` tem estrutura correcta de filters e timeline

### Problemas reais identificados

**1. Actividade mostra "Sem registos" — BUG CRÍTICO DE UX**

A causa é dupla:
- `fetchMessageLogs` limita a 10 registos mas isso está correcto
- O problema real: `isManual` no `ActivityTimeline` só considera `reminder_manual` e `followup_backlog_checkin`. O `manual_payment_link_sent` **não está incluído** — filtrando por "Manual" não aparece.
- O filtro "Emails" não inclui `manual_payment_link_sent`
- O `TEMPLATE_LABELS` não tem label para `manual_payment_link_sent`, `payment_confirmed_customer`, `crm_step_changed`, etc. — aparece a chave raw

**2. Segurança: `VITE_CRM_ADMIN_SECRET` exposto no browser**

Em `SendPaymentModal.tsx` linha 63:
```ts
const crmSecret = import.meta.env.VITE_CRM_ADMIN_SECRET || "";
```
`VITE_` prefixo vai directamente para o bundle JS público — qualquer utilizador pode inspecionar e obter o segredo. Isto invalida completamente a protecção da edge function.

**Solução correcta:** Usar `verify_jwt = true` + validar JWT na edge function para confirmar que é admin. O `X-CRM-Secret` passa a ser desnecessário — substitui-se por autenticação JWT com verificação de role admin.

**3. `paid_at` não é seleccionado no fetch da registration**

Em `send-payment-link/index.ts` linha 83:
```ts
.select("id, email, name, first_name, order_id")
```
`paid_at` **não está na query select** mas é verificado em `if (reg.paid_at)` na linha 95 — logo `reg.paid_at` é sempre `undefined` e o guard-rail nunca actua.

**4. Cooldown server-side em falta na edge function**

A edge function não verifica o `message_logs` para impor cooldown 6h server-side. Apenas o frontend verifica, mas o frontend pode ser contornado. O spec exige verificação também no backend.

**5. `ActivityTimeline` — filtro "Manual" incompleto e labels em falta**

- `isManual` não cobre `manual_payment_link_sent`, `crm_step_changed`, `crm_note_saved`
- Empty state mostra "Sem registos" — devia mostrar mensagem útil

---

## Plano de Implementação

### Ficheiro 1: `supabase/functions/send-payment-link/index.ts`

**3 correcções:**

**a) Adicionar `paid_at` à query select:**
```ts
.select("id, email, name, first_name, order_id, paid_at")
```

**b) Cooldown server-side — antes de criar o link EuPago:**
```ts
// Check 6h cooldown in message_logs
const since6h = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
const { data: recentLog } = await supabase
  .from("message_logs")
  .select("created_at")
  .eq("registration_id", registrationId)
  .eq("template_key", "manual_payment_link_sent")
  .gte("created_at", since6h)
  .limit(1)
  .maybeSingle();

if (recentLog) {
  const retryAfterMs = 6 * 60 * 60 * 1000 - (Date.now() - new Date(recentLog.created_at).getTime());
  return new Response(
    JSON.stringify({ status: "cooldown", retryAfterMs }),
    { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

**c) Substituir `X-CRM-Secret` por JWT + role admin:**

Remover validação por `X-CRM-Secret`. Passar para autenticação por JWT:
```ts
// verify_jwt = true no config.toml para esta função
// OR: verificar manualmente o JWT e confirmar role admin
const authHeader = req.headers.get("Authorization");
const token = authHeader?.replace("Bearer ", "") || "";
const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
if (authErr || !user) return 401;
// Check admin role
const { data: roleData } = await supabase
  .from("user_roles")
  .select("role")
  .eq("user_id", user.id)
  .eq("role", "admin")
  .maybeSingle();
if (!roleData) return 403;
```

(O `config.toml` mantém `verify_jwt = false` porque fazemos verificação manual, mas sem depender de `VITE_CRM_ADMIN_SECRET`)

### Ficheiro 2: `src/components/crm/modal/SendPaymentModal.tsx`

**2 correcções:**

**a) Remover `VITE_CRM_ADMIN_SECRET`** — não passar o header `x-crm-secret`. A autenticação passa a ser feita exclusivamente pelo JWT Bearer token do utilizador autenticado.

**b) Tratar resposta 429 (cooldown server-side):**
```ts
if (res.status === 429) {
  const data = await res.json();
  toast({ title: "Cooldown activo", description: `Aguarda ${Math.ceil(data.retryAfterMs / 60000)} min` });
  return;
}
```

### Ficheiro 3: `src/components/crm/templateLabels.ts`

**Adicionar labels em falta:**
```ts
manual_payment_link_sent: "Link de pagamento enviado (manual)",
payment_confirmed_customer: "Confirmação de pagamento",
crm_step_changed: "Alteração de etapa (CRM)",
crm_note_saved: "Nota guardada (CRM)",
payment_link_regenerated: "Link regenerado",
masterclass_upsell_premium: "Convite Masterclass (Premium)",
```

### Ficheiro 4: `src/components/crm/modal/ActivityTimeline.tsx`

**3 melhorias:**

**a) Expandir `isManual` para incluir acções CRM:**
```ts
isManual: [
  "reminder_manual",
  "followup_backlog_checkin",
  "manual_payment_link_sent",
  "crm_step_changed",
  "crm_note_saved",
  "payment_link_regenerated",
].includes(log.template_key),
```

**b) Melhorar categorização dos filtros:**
- `emails`: type === "email" (todos)
- `payments`: type === "payment" OU `template_key` contém "payment", "paid", "eupago"
- `errors`: `status === "failed"` OU `error != null`
- `manual`: `isManual === true`

**c) Melhorar empty state:**
```tsx
<div className="py-6 text-center">
  <p className="text-[13px] text-muted-foreground">Ainda sem actividade registada.</p>
  <p className="text-[11px] text-muted-foreground/60 mt-1">
    Os envios de email, eventos de pagamento e acções manuais serão listados aqui.
  </p>
</div>
```

**d) Mostrar `payment_url` (link estável) nos items de tipo `manual_payment_link_sent`:**
Mapear o campo `payment_url` do log para exibir junto ao item da timeline.

### Ficheiro 5: `src/hooks/useInscritos.ts`

**1 correcção:**

Aumentar o `limit` do `fetchMessageLogs` de 10 para 50 para garantir que todos os logs relevantes são carregados:
```ts
.limit(50)
```

---

## O que NÃO muda

- `FunnelView.tsx` — o marcador "SAIU AQUI" já funciona correctamente com `step_reached`
- `InscritoModal.tsx` — botão "Enviar link de pagamento" e selector de estágio já funcionam
- `ActionsSection.tsx` — cooldown visual já implementado
- `useInscritos.ts` — `updateStepReached` já funciona
- `supabase/config.toml` — configuração correcta

---

## Resumo das prioridades

| Prioridade | Problema | Ficheiro |
|---|---|---|
| 🔴 CRÍTICO | `paid_at` ausente na query (guard-rail inoperacional) | `send-payment-link/index.ts` |
| 🔴 CRÍTICO | `VITE_CRM_ADMIN_SECRET` exposto no bundle | `SendPaymentModal.tsx` + `send-payment-link/index.ts` |
| 🟠 ALTO | Cooldown server-side ausente | `send-payment-link/index.ts` |
| 🟠 ALTO | Actividade mostra "Sem registos" (filtro manual incorrecto + labels em falta) | `ActivityTimeline.tsx` + `templateLabels.ts` |
| 🟡 MÉDIO | `fetchMessageLogs` limite de 10 | `useInscritos.ts` |
