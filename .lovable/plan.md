
## Bulk Tagging E-Goi — Compradores Existentes

### Contexto

O webhook de pagamento já tem a lógica de tagging implementada para novos pagamentos, mas **os compradores anteriores** nunca receberam as tags porque a lógica ainda não existia quando pagaram. São ao total:

| Plano | Nº compradores | Tags a atribuir |
|---|---|---|
| premium | 11 | Tag 32 |
| bundle | 2 | Tags 32 + 33 |
| premium_granted_at (gravação) | 1 | Tag 32 (acesso premium) |

**Total: 14 contactos** a sincronizar no E-Goi.

---

### Solução: nova Edge Function `bulk-tag-egoi`

Criar uma função dedicada para este bulk update, separada do `bulk-sync-egoi` existente (que só trata registos/contactos, não tags). A função:

1. Busca na base de dados todos os registos com `paid_at IS NOT NULL OR premium_granted_at IS NOT NULL`
2. Para cada registo, procura o `contactId` no E-Goi pelo email
3. Atribui as tags conforme o plano:
   - `premium` → tag 32
   - `masterclass` → tag 33
   - `bundle` → tags 32 + 33
   - `premium_granted_at` (sem `plan_selected` de produto) → tag 32
4. Regista resultado por email (ok / contact_not_found / error)
5. Retorna um relatório JSON com os resultados

A função tem um **delay de 300ms entre chamadas** para não ser banida pela API do E-Goi.

---

### Implementação técnica

**Ficheiro novo:** `supabase/functions/bulk-tag-egoi/index.ts`

```ts
// Lógica principal:

// 1. Buscar compradores
const { data: buyers } = await supabase
  .from("registrations")
  .select("email, plan_selected, paid_at, premium_granted_at")
  .or("paid_at.not.is.null,premium_granted_at.not.is.null");

// 2. Para cada comprador:
for (const buyer of buyers) {
  // a) Encontrar contact_id por email
  const contactRes = await fetch(
    `https://api.egoiapp.com/lists/5/contacts?email=${encodeURIComponent(buyer.email)}`,
    { headers: { "Apikey": EGOI_API_KEY } }
  );
  const contactId = contactData?.items?.[0]?.contact || null;
  
  if (!contactId) {
    results.push({ email: buyer.email, status: "contact_not_found" });
    continue;
  }

  // b) Determinar tags a aplicar
  const plan = buyer.plan_selected;
  const tagsToApply: number[] = [];
  
  if (["premium", "bundle"].includes(plan) || buyer.premium_granted_at) {
    tagsToApply.push(32); // TAG_PREMIUM
  }
  if (["masterclass", "bundle"].includes(plan)) {
    tagsToApply.push(33); // TAG_MASTERCLASS
  }

  // c) Aplicar cada tag via attach-tag
  for (const tagId of tagsToApply) {
    await fetch("https://api.egoiapp.com/lists/5/contacts/actions/attach-tag", {
      method: "POST",
      headers: { "Apikey": EGOI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ tag_id: tagId, contacts: [contactId] }),
    });
  }

  // d) Delay anti-rate-limit
  await new Promise(r => setTimeout(r, 300));
}
```

**`supabase/config.toml`** — adicionar:
```toml
[functions.bulk-tag-egoi]
verify_jwt = false
```

---

### Como invocar

Após deploy, invocar via curl na consola (ou ferramenta de testes):

```bash
curl -X POST https://gwphpsehcnhwjiypyolg.supabase.co/functions/v1/bulk-tag-egoi \
  -H "Authorization: Bearer eyJ..."
```

Retorna um relatório como:
```json
{
  "total": 14,
  "tagged": 12,
  "contact_not_found": 2,
  "errors": 0,
  "details": [
    { "email": "joana@e-accelerator.pt", "plan": "premium", "tags": [32], "status": "ok" },
    { "email": "mariahelena@...", "plan": "bundle", "tags": [32, 33], "status": "ok" },
    ...
  ]
}
```

---

### Ficheiros a criar/modificar

| Ficheiro | Acção |
|---|---|
| `supabase/functions/bulk-tag-egoi/index.ts` | Criar — nova edge function |
| `supabase/config.toml` | Adicionar `[functions.bulk-tag-egoi]` com `verify_jwt = false` |

### O que NÃO muda
- `bulk-sync-egoi` (function existente para sincronizar contactos — mantém-se)
- `eupago-webhook` (já tem a lógica para novos pagamentos)
- Base de dados / registrations

Depois de executar, posso confirmar os resultados nos logs da edge function para ver quais os emails que foram marcados com sucesso e quais não foram encontrados no E-Goi.
