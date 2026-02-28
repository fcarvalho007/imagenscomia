

# Fix: Permitir eliminação de registos no CRM

## Diagnóstico

Dois problemas impedem a eliminação:

### Problema 1 — CRM login sem sessão Supabase
O `CRMLogin.tsx` apenas verifica se o email e `fredericodigital@gmail.com` e guarda em `sessionStorage`. Nao faz `supabase.auth.signInWithPassword()`. Quando `deleteInscrito` chama `supabase.auth.getSession()`, recebe `null` — o token enviado a edge function e vazio e ela retorna 401.

### Problema 2 — `getClaims()` nao existe no Supabase SDK
A edge function `delete-registration` usa `userClient.auth.getClaims(token)` que nao e um metodo valido do supabase-js. Mesmo com um token valido, isto daria erro. O metodo correcto e `supabase.auth.getUser(token)`.

## Solucao

### Passo 1 — Adicionar autenticacao Supabase ao CRM login
Modificar `src/components/crm/CRMLogin.tsx`:
- Adicionar campo de password
- Usar `supabase.auth.signInWithPassword({ email, password })` em vez de apenas comparar o email
- Manter a verificacao de email `fredericodigital@gmail.com` como camada extra
- Guardar sessao via Supabase Auth (automatico com `persistSession: true`)

### Passo 2 — Corrigir edge function `delete-registration`
Modificar `supabase/functions/delete-registration/index.ts`:
- Substituir `getClaims(token)` por `getUser(token)` que e o metodo correcto
- Extrair `userId` de `userData.user.id` em vez de `claimsData.claims.sub`

### Passo 3 — Actualizar logout do CRM
Em `src/pages/CRM.tsx`, o `handleLogout` deve tambem chamar `supabase.auth.signOut()` para limpar a sessao.

## Ficheiros alterados

| Ficheiro | Alteracao |
|---|---|
| `src/components/crm/CRMLogin.tsx` | Adicionar password + `signInWithPassword` |
| `src/pages/CRM.tsx` | Adicionar `signOut()` ao logout + verificar sessao existente no mount |
| `supabase/functions/delete-registration/index.ts` | `getClaims` → `getUser` |

## Notas
- A conta Supabase Auth para `fredericodigital@gmail.com` ja existe (user_id: `f1c642b2-...`)
- A role `admin` ja esta atribuida na tabela `user_roles`
- Nenhuma tabela, template, ou outra edge function e alterada
