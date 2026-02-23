
# Correcao: Registo video nao aparece no CRM

## Problema raiz

A tabela `registrations` tem um **UNIQUE constraint na coluna `email`** (`registrations_email_key`). Isto impede a criacao de um segundo registo com o mesmo email para um webinar diferente. O `register-free` tenta inserir mas o INSERT falha silenciosamente (o codigo nao verifica o `error` retornado pelo Supabase).

Os logs mostram "Created video registration for existing user" mas na verdade a linha nunca foi inserida na base de dados.

## Solucao

### Passo 1 — Migracao de base de dados

1. Remover o unique constraint `registrations_email_key` (email unico)
2. Criar um novo unique constraint composto `registrations_email_webinar_key` em `(email, webinar)` — permite o mesmo email em webinars diferentes mas impede duplicados no mesmo webinar

```sql
ALTER TABLE registrations DROP CONSTRAINT registrations_email_key;
CREATE UNIQUE INDEX registrations_email_webinar_key ON registrations (email, webinar);
```

### Passo 2 — Corrigir register-free (error handling)

Em `supabase/functions/register-free/index.ts`, na linha 105 onde faz o INSERT do video registration, adicionar verificacao de erro:

```typescript
const { error: insertErr } = await supabase.from("registrations").insert({...});
if (insertErr) {
  console.error("Failed to create video registration:", insertErr);
} else {
  console.log(`Created video registration for existing user: ${email}`);
}
```

### Passo 3 — Corrigir queries maybeSingle() nas edge functions

Com dois registos por email, as queries que usam `.eq("email", ...).maybeSingle()` sem filtrar por webinar vao retornar erro (mais de 1 resultado). Funcoes afectadas:

| Funcao | Correcao |
|---|---|
| `register-free` (linha 43-47) | Manter maybeSingle mas a query principal ja e "find any existing" — ok, mas mudar para `.limit(1).single()` ou adicionar `.order("created_at").limit(1)` |
| `check-referrals` (linha 31-34) | Adicionar `.limit(1)` |
| `redeem-voucher` (linha 46-49) | Adicionar `.limit(1)` |
| `create-payment` (linhas 85-89, 116-120) | Adicionar `.eq("webinar", webinar)` quando disponivel, ou `.limit(1)` |
| `generate-reminder` (linha 87-90) | Adicionar `.limit(1)` |
| `eupago-webhook` (linha 144-152) | Ja usa `.select().eq("email")` sem maybeSingle — ok, update afecta todas as linhas com esse email, mas deve filtrar por webinar |

**Estrategia pratica**: Para funcoes que nao recebem o parametro `webinar`, usar `.order("created_at", { ascending: false }).limit(1).maybeSingle()` para pegar o registo mais recente. Para `create-payment` e `eupago-webhook` que lidam com pagamentos, precisam de identificar o registo correcto (pelo `eupago_ref` ou `order_id`, nao pelo email).

### Passo 4 — Re-deploy das funcoes alteradas

Deploy de `register-free`, `create-payment`, `check-referrals`, `redeem-voucher`, `generate-reminder`.

`eupago-webhook` ja usa estrategias de match por `eupago_ref`/`order_id` nas estrategias 1 e 2 — a estrategia 3 (fallback por email) e raramente usada e pode manter `.eq("email", email)` que agora actualiza ambas as linhas (aceitavel como fallback).

## Ficheiros a modificar

| Ficheiro | Alteracao |
|---|---|
| Migracao SQL | DROP unique email, CREATE unique (email, webinar) |
| `register-free/index.ts` | Error handling no insert (linha 105); query existente (linha 43) adicionar `.order` + `.limit(1)` |
| `create-payment/index.ts` | Linhas 85-89 e 116-120: adicionar `.order("created_at", {ascending:false}).limit(1)` |
| `check-referrals/index.ts` | Linha 31-34: adicionar `.limit(1)` |
| `redeem-voucher/index.ts` | Linha 46-49: adicionar `.limit(1)` |
| `generate-reminder/index.ts` | Linha 87-90: adicionar `.limit(1)` |

## O que NAO muda

- Frontend / CRM (ja filtra por webinar correctamente)
- Schema de colunas (nenhuma coluna adicionada/removida)
- Logica de E-goi (ja corrigida anteriormente)
- eupago-webhook (estrategias 1/2 usam eupago_ref, nao email)
