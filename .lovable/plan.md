

## Ajustes Finais: Validacao Robusta + Guard-rails + Auditoria

### Resumo

Tres blocos de alteracoes: (1) validacao de link com fallback HEAD->GET e metadata de diagnostico, (2) cooldown de 6h no reenvio manual, (3) registo de auditoria na regeneracao de link.

### Ficheiros Alterados

| Ficheiro | Accao |
|----------|-------|
| `supabase/functions/followup-abandoned/index.ts` | Melhorar `validateLink` com fallback GET; adicionar cooldown 6h para `reminder_manual`; guardar metadata de validacao no `error` field |
| `supabase/functions/generate-reminder/index.ts` | Registar `template_key='payment_link_regenerated'` + `provider='internal'` no message_logs (auditoria da regeneracao) |
| `src/components/crm/InscritoModal.tsx` | Mostrar mensagem de cooldown no botao "Reenviar email" quando ultimo `reminder_manual` < 6h |
| `src/hooks/useInscritos.ts` | Sem alteracoes |

---

### 1. `followup-abandoned/index.ts` -- validateLink com fallback

Substituir a funcao `validateLink` actual (linhas 51-61) por uma versao que:

- Tenta HEAD primeiro
- Se receber 405 ou 403, tenta GET (sem ler o body completo via `AbortController` timeout)
- Devolve um objecto com metadata: `{ ok, method, status }`
- Guarda esta metadata no campo `error` do message_log quando a validacao falha (ex: `link_validation_failed|HEAD:404|GET:404`)

```text
async function validateLink(url: string): Promise<{ ok: boolean; method: string; status: number }> {
  if (!url?.startsWith("https://")) return { ok: false, method: "none", status: 0 };
  const trimmed = url.trim();
  if (trimmed.length < 30 || trimmed !== url) return { ok: false, method: "none", status: 0 };

  // Try HEAD first
  try {
    const res = await fetch(trimmed, { method: "HEAD", redirect: "follow" });
    if (res.status >= 200 && res.status < 400) return { ok: true, method: "HEAD", status: res.status };
    if (res.status !== 405 && res.status !== 403) return { ok: false, method: "HEAD", status: res.status };
  } catch { /* fall through to GET */ }

  // Fallback: GET with abort
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(trimmed, { method: "GET", redirect: "follow", signal: ctrl.signal });
    clearTimeout(timer);
    const ok = res.status >= 200 && res.status < 400;
    return { ok, method: "GET", status: res.status };
  } catch {
    return { ok: false, method: "GET", status: 0 };
  }
}
```

Todos os locais que chamam `validateLink` serao actualizados para usar `.ok` em vez do boolean directo.

Quando a validacao falha e a regeneracao tambem falha, o `error` no message_log incluira `link_validation_failed|{method}:{status}`.

### 2. `followup-abandoned/index.ts` -- Cooldown 6h para reminder_manual

No bloco manual_send (apos a verificacao de idempotencia existente, linhas 374-387), adicionar:

```text
// Para reminder_manual: verificar cooldown de 6h
if (manualMode.templateKey === "reminder_manual") {
  const { data: recentManual } = await supabase
    .from("message_logs")
    .select("created_at")
    .eq("registration_id", reg.id)
    .eq("template_key", "reminder_manual")
    .order("created_at", { ascending: false })
    .limit(1);

  if (recentManual && recentManual.length > 0) {
    const lastSentMs = new Date(recentManual[0].created_at).getTime();
    const cooldownMs = 6 * 60 * 60 * 1000;
    if (now - lastSentMs < cooldownMs) {
      const hoursAgo = ((now - lastSentMs) / (60 * 60 * 1000)).toFixed(1);
      return Response 429 { error: "cooldown", hours_ago: hoursAgo, retry_after_hours: ((cooldownMs - (now - lastSentMs)) / 3600000).toFixed(1) }
    }
  }
}
```

### 3. `generate-reminder/index.ts` -- Auditoria da regeneracao

Alterar o registo em message_logs (linhas 108-117) para usar `template_key='payment_link_regenerated'` em vez de `'reminder_manual'`, e adicionar `payment_url`:

```text
await supabase.from("message_logs").insert({
  registration_id: regRow.id,
  channel: "email",
  provider: "internal",
  template_key: "payment_link_regenerated",
  status: "sent",
  payment_url: paymentLink || null,
});
```

Isto separa claramente a accao "regenerar link" (audit) da accao "reenviar email" (delivery).

### 4. `InscritoModal.tsx` -- UI de cooldown

No botao "Reenviar email de pagamento":

- Verificar nos `messageLogs` locais se existe um `reminder_manual` com `created_at` < 6h
- Se sim, desactivar o botao e mostrar texto "Bloqueado: enviado ha Xh"
- Se o servidor devolver 429 (cooldown), mostrar toast com o motivo

```text
// Calcular cooldown a partir dos logs locais
const lastManualLog = messageLogs.find(l => l.template_key === "reminder_manual");
const manualCooldownMs = lastManualLog
  ? Date.now() - new Date(lastManualLog.created_at).getTime()
  : Infinity;
const isManualCoolingDown = manualCooldownMs < 6 * 60 * 60 * 1000;
const cooldownHoursAgo = (manualCooldownMs / (60 * 60 * 1000)).toFixed(1);
```

Botao mostra: `Reenviar email (enviado ha {cooldownHoursAgo}h)` quando em cooldown, e fica `disabled`.

### O que NAO muda

- Logica de cobranca, valores, webhooks
- Fluxo de stages automaticos (0/1/2)
- Botao "Gerar link de pagamento" (Gmail)
- Templates de email

### Prova objectiva

Apos implementacao, executar 1 regeneracao + 1 reenvio manual e verificar nos message_logs que:
- `payment_link_regenerated` existe com `provider='internal'` e `payment_url` preenchido
- `reminder_manual` existe com `provider='resend'`, `provider_message_id` preenchido, `payment_url` preenchido
- Verificar que segundo reenvio < 6h devolve 429

