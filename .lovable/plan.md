
## Dois problemas a resolver no Dashboard

---

### Problema 1 — "Visitaram a landing page" passar a dados reais do analytics

**Situação actual:** O campo de visitantes é um input manual (valor padrão: 2500). O utilizador tem de actualizar manualmente.

**Solução:** Chamar a API de analytics do Lovable Cloud directamente no `useEffect` do `DashboardView`. A API já está disponível internamente e retorna o total de visitantes únicos da rota `/` (landing page).

**Dados reais disponíveis agora (últimos 7 dias):**
```
Total visitantes únicos:  2.555
  11 Fev →   30
  12 Fev →  229
  13 Fev →  637
  14 Fev →  462
  15 Fev →  246
  16 Fev →  576
  17 Fev →   84
  18 Fev →  291
```

**Implementação:**

O analytics é exposto via edge function que usa o mesmo projeto Lovable Cloud. A chamada usa a `VITE_SUPABASE_URL` e um endpoint interno de analytics.

Alternativa mais simples e robusta: criar uma **nova edge function** `get-analytics-visitors` que:
1. Chama a API de analytics da Lovable Cloud com as datas desde o início da campanha (8 Fev 2026) até hoje
2. Filtra apenas a rota `/` (landing page)
3. Devolve o total de visitantes únicos

No `DashboardView`, trocar o `useState(2500)` editável por um `useState(null)` com loading, preenchido automaticamente pelo resultado da edge function. O campo deixa de ser editável.

**UI:** O campo passa a mostrar o número com um pequeno badge "via Analytics" em vez da caixa de input editável, com um ícone de sincronização que indica que o valor é automático.

---

### Problema 2 — "5.2% Conversão" vs "0.5%" no funil — inconsistência e confusão

**Diagnóstico:**

As duas métricas medem coisas diferentes:

| Onde aparece | Cálculo | Valor actual |
|---|---|---|
| KPI card "Conversão para pago" | `pagantes / inscritos_activos` = 12 / 234 | **5.2%** |
| Passo 7 do funil "(0.5%)" | `pagantes / visitantes` = 12 / 2500 | **0.5%** |

A confusão é válida: ambas mostram "conversão" mas com denominadores completamente diferentes. A solução não é torná-las iguais (são métricas distintas e ambas úteis), mas sim **torná-las claramente distinguíveis**.

**Alterações:**

**A. KPI card — melhorar label e sub-label:**

Actualmente:
```
5.2%
Conversão para pago
inscritos que realmente pagaram
```

Passar para:
```
5.2%
Taxa de conversão (inscritos → pago)
12 de 234 inscritos activos pagaram
```

A sub-label passa a mostrar o numerador e denominador concretos, eliminando qualquer ambiguidade.

**B. Passo 7 do funil — adicionar label contextual:**

O passo 7 "Pagamento confirmado" actualmente mostra `12 (0.5%)`. O `0.5%` é calculado relativamente ao Passo 0 (visitantes da landing page). Esta é a taxa de conversão da landing page para pagamento confirmado — um KPI de marketing muito valioso.

Adicionar uma sub-label pequena junto ao valor percentual do Passo 7:
```
12  (0.5% dos visitantes)
```

Assim fica explícito que este percentual é relativo ao total de visitantes, não aos inscritos.

**C. Adicionar um terceiro dado no KPI de conversão — taxa sobre visitantes:**

Junto ao KPI card existente (5.2%), adicionar uma linha `sub` mais informativa:
```
12 de 234 inscritos · 0.5% da landing page
```

Isto resolve a confusão sem eliminar nenhuma das métricas.

---

### Ficheiros a alterar

| Ficheiro | Alteração |
|---|---|
| `supabase/functions/get-analytics-visitors/index.ts` | Nova edge function: chama API de analytics, filtra rota `/`, devolve visitantes únicos desde 8 Fev |
| `src/components/crm/DashboardView.tsx` | 1. Remover input manual; chamar edge function e preencher visitantes automaticamente; 2. Melhorar labels do KPI de conversão; 3. Adicionar sub-label contextual no Passo 7 do funil |

---

### O que NÃO muda

- Os dados do funil (passos 1–7) — todos reais, sem alteração
- A lógica de cálculo dos drop-offs e `maxDropIdx`
- O separador "Intenção de compra" e o design da zona de conversão
- Todas as outras secções do dashboard

---

### Nota técnica — âmbito dos dados de analytics

A API de analytics retorna visitas ao **site completo** (todas as rotas). Para filtrar apenas a landing page (`/`), a edge function usa o `page breakdown` que já detalha por rota. O valor correcto a usar é o da rota `/` — não o total de visitantes do site, que inclui `/upgrade`, `/live`, `/crm`, etc.

Dados actuais:
- Visitantes rota `/` nos últimos 7 dias: **2.222 visitantes únicos**
- Total do site (todas as rotas): 2.555

O campo "Visitaram a landing page" deve mostrar **2.222** (apenas `/`), não 2.555. Isto é factualmente mais correcto.
