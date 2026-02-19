
## Diagnóstico: porque é que o grant-premium-egoi nunca disparou

### Causa raiz

A invocação em `useInscritos.ts` usa `.then()` sem `await`, o que torna o erro invisível:

```ts
// Actual code — fire-and-forget, errors silently ignored
supabase.functions.invoke("grant-premium-egoi", {
  body: { registration_id: inscritoId },
}).then(({ error: egoiErr }) => {
  if (egoiErr) console.error("Error applying E-goi tag 32:", egoiErr);
});
```

O `supabase.functions.invoke()` usa o token de sessão do utilizador autenticado no browser. Se o token expirou, ou se houve qualquer falha de rede, o erro é engolido silenciosamente. Os logs da função confirmam: **zero invocações registadas** — a função nunca foi chamada.

---

### O que fazer agora (2 acções)

#### Acção 1 — Corrigir a invocação para ser fiável

Em vez de fire-and-forget, a chamada E-goi deve ser feita **dentro da própria Edge Function** que já faz o grant na base de dados — ou seja, criar uma nova Edge Function `crm-grant-premium` que:

1. Actualiza `premium_granted_at` e `premium_granted_by` na DB (move esta lógica do cliente para o servidor)
2. Insere o log em `message_logs`
3. Chama a lógica de tagging E-goi (Tag 32) internamente

Desta forma, o cliente invoca **uma única Edge Function** e tudo acontece no servidor de forma atómica.

**Alternativa mais simples (menos disruptiva):** manter a arquitectura actual mas tornar a chamada `await` e mostrar feedback de erro:

```ts
// In grantPremium, after DB update succeeds:
if (!isGranted) {
  const { error: egoiErr } = await supabase.functions.invoke("grant-premium-egoi", {
    body: { registration_id: inscritoId },
  });
  if (egoiErr) {
    console.error("E-goi tag 32 failed:", egoiErr);
    // Don't block the UI — log it but continue
  }
}
```

**Esta é a abordagem mais simples e é a que será implementada.**

---

#### Acção 2 — Retroactivamente aplicar Tag 32 à Isabel Martins (e qualquer outro)

A `bulk-tag-egoi` já existe e já processa registos com `premium_granted_at IS NOT NULL`. Vou executá-la agora via curl para aplicar a tag 32 imediatamente à Isabel Martins e ao Frederico.

Registos com `premium_granted_at`:
- `isabelmartins@essenciacompleta.pt` — grant em 18 Fev 2026 (sem `paid_at`)
- `fredericodigital@gmail.com` — grant em 18 Fev 2026 (sem `paid_at`)

---

### Ficheiros a alterar

| Ficheiro | Alteração |
|---|---|
| `src/hooks/useInscritos.ts` | Tornar a invocação `grant-premium-egoi` em `await` dentro do `grantPremium` |

### Execução imediata

Após a correcção do código, executar a `bulk-tag-egoi` via curl para retroactivamente aplicar as tags em falta para a Isabel Martins e Frederico.

---

### Resumo do que fica corrigido

| # | Problema | Solução |
|---|---|---|
| Histórico | Isabel Martins e Frederico sem Tag 32 | Executar `bulk-tag-egoi` agora |
| Futuro | Invocação fire-and-forget ignora erros | Tornar `await` no `grantPremium` |
