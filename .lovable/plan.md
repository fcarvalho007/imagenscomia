
## 3 Correcções — /recursos link + E-goi grantPremium + Dashboard filtros

### 1. Link "Inscrição na Masterclass (3h)" em /recursos

**Problema:** `MASTERCLASS_URL` está definida como `"https://imagenscomia.com/masterclass"` — URL externo que não existe. O botão abre numa nova tab em vez de navegar para `/upgrade-gravacao`.

**Ficheiro:** `src/components/recursos/RecursosUpsell.tsx`

**Alterações:**
- Remover a constante `MASTERCLASS_URL`
- Importar `useNavigate` do `react-router-dom`
- Substituir `window.open(MASTERCLASS_URL, "_blank")` por `navigate("/upgrade-gravacao")` em ambas as variantes (compact e normal)

---

### 2. E-goi Tag 32 ao marcar como "oferta" / grant premium

**Problema:** O `grantPremium` em `useInscritos.ts` apenas actualiza a base de dados — nunca notifica o E-goi. Quem é marcado manualmente como acesso premium fica sem a Tag 32.

**Solução:** Criar uma Edge Function `grant-premium-egoi` (ou adicionar lógica a uma Edge Function existente) que, dado um `registration_id`, aplica a Tag 32 no E-goi para esse email.

**Alternativa mais simples:** Adicionar a chamada E-goi directamente no `grantPremium` do `useInscritos.ts` via `supabase.functions.invoke("grant-premium-egoi", ...)`.

**Ficheiros a alterar:**
- `supabase/functions/grant-premium-egoi/index.ts` — nova Edge Function
- `supabase/config.toml` — registar a função
- `src/hooks/useInscritos.ts` — invocar a função após o `supabase.from("registrations").update(...)`

**Lógica da Edge Function `grant-premium-egoi`:**
```ts
// 1. Recebe { registration_id }
// 2. Busca email do registo
// 3. Procura contactId no E-goi por email
// 4. Aplica Tag 32 via /attach-tag
// 5. Retorna { ok: true } ou { error }
```

Esta função é idempotente — aplicar uma tag já existente não causa erros no E-goi.

---

### 3. Dashboard — Ponto 0 e filtros de período

**Problema raiz (2 bugs separados):**

**Bug A — `stats` não reage ao período:**
O `useMemo` de `stats` (linha 250) tem `[inscritos]` na dependência em vez de `[filteredInscritos]`. Quando o utilizador muda o período (7d, 14d...), `filteredInscritos` actualiza-se correctamente, mas `stats` não é recomputado porque a sua dependência (`inscritos`) não mudou.

Correcção: alterar a dependência de `stats` de `[inscritos]` para `[filteredInscritos]` e garantir que todos os cálculos dentro do `useMemo` usam `filteredInscritos` em vez de `inscritos`.

**Bug B — Ponto 0 (Visitantes) não é filtrável por data:**
O valor vem da `analytics_cache` (total acumulado desde o início da campanha). Quando o utilizador selecciona "7 dias", os outros passos do funil filtram-se mas o Ponto 0 continua a mostrar 2226 (total histórico), criando uma discrepância visual.

Correcção: quando o `period` não é `"all"`, mostrar o Ponto 0 com uma nota explicativa "(acumulado)" ou esconder a barra de visitantes totais, substituindo-a por um texto mais neutro que deixe claro que este número é global e não filtrável.

**Ficheiro:** `src/components/crm/DashboardView.tsx`

**Alterações concretas:**

1. Linha 250: `}, [inscritos]);` → `}, [filteredInscritos]);`

2. Dentro do `useMemo` de `stats`, substituir todas as referências a `inscritos` por `filteredInscritos` (a variável `active` já usa `filteredInscritos` correctamente — verificar se não há referências directas a `inscritos` dentro do useMemo).

3. Ponto 0: Quando `period !== "all"`, adicionar badge "(total campanha)" ao lado do número de visitantes, e ajustar o texto informativo já existente para ser mais claro.

4. Botão "Atualizar" — verificar se o `onRefresh` é passado correctamente. Em `CRM.tsx`, `<DashboardView onRefresh={refresh} ...>`. O `refresh` é `fetchData`. Confirmar que a tipagem bate certo e o botão não está bloqueado por nenhuma condição.

---

### Ficheiros a alterar

| Ficheiro | Alteração |
|---|---|
| `src/components/recursos/RecursosUpsell.tsx` | Remover `MASTERCLASS_URL`, usar `useNavigate("/upgrade-gravacao")` |
| `supabase/functions/grant-premium-egoi/index.ts` | Nova Edge Function — aplica Tag 32 |
| `supabase/config.toml` | Registar `grant-premium-egoi` com `verify_jwt = false` |
| `src/hooks/useInscritos.ts` | Invocar `grant-premium-egoi` após `grantPremium` |
| `src/components/crm/DashboardView.tsx` | Corrigir dependência do useMemo (`filteredInscritos`), clarificar Ponto 0 com período |
