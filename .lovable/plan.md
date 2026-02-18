
## Alterações no CRM — Pipeline, Dashboard (Planos + Funil + Emails)

### 1. Pipeline — remover colunas "Inscrito" e "Flow Completo" no filtro Pós-webinar

**Ficheiro:** `src/components/crm/PipelineView.tsx`

Actualmente as 6 colunas do Kanban incluem "Inscrito" e "Flow Completo" (ambas para `plan === "free"`). No contexto Pós-webinar (filtro `gravacao`), estas colunas são irrelevantes — os inscritos pós-webinar têm já um contexto diferente.

A solução mais limpa: quando o `sourceFilter === "gravacao"`, excluir as colunas com `title === "Inscrito"` e `title === "Flow Completo"` antes de renderizar. O filtro já existe — basta filtrar também as colunas:

```ts
const visibleColumns = useMemo(() => {
  if (sourceFilter === "gravacao") {
    return COLUMNS.filter(c => c.title !== "Inscrito" && c.title !== "Flow Completo");
  }
  return COLUMNS;
}, [sourceFilter]);
```

E usar `visibleColumns` em vez de `COLUMNS` no render.

**Preço Pós-webinar:** Mudar a coluna `"Premium Pass — €15"` para `"Premium Pass — €27"` **apenas quando está em modo Pós-webinar**. Isto implica que o título da coluna seja dinâmico consoante o filtro:

```ts
const visibleColumns = useMemo(() => {
  let cols = COLUMNS;
  if (sourceFilter === "gravacao") {
    cols = cols
      .filter(c => c.title !== "Inscrito" && c.title !== "Flow Completo")
      .map(c => c.title === "Premium Pass — €15"
        ? { ...c, title: "Premium Pass — €27" }
        : c
      );
  }
  return cols;
}, [sourceFilter]);
```

Nota: o preço exibido no cabeçalho da coluna muda visualmente, mas a coluna continua a filtrar por `plan === "premium"` — os dados não mudam.

---

### 2. Dashboard — "Distribuição por Plano" — melhorar UI

**Ficheiro:** `src/components/crm/DashboardView.tsx` (linhas 496–533)

Actualmente é uma lista de barras simples sem contexto de pagamentos. Proposta de redesign mais claro:

Para cada plano, mostrar 3 sub-métricas em linha:
- **Total** de inscritos com aquele plano seleccionado
- **Pagos** (com `paid_at`)
- **Pendentes** (com referência mas sem `paid_at`)
- Barra de progresso com dois segmentos: pago (verde) + pendente (âmbar)

Adicionar também ao `stats` o cálculo de `paidCounts` por plano:
```ts
const paidCounts: Record<string, number> = { premium: 0, masterclass: 0, bundle: 0, free: 0 };
pagantes.forEach((i) => { paidCounts[i.plan] = (paidCounts[i.plan] || 0) + 1; });
```

O novo card fica assim (exemplo para Premium):
```
● Premium €15    15 inscritos
  ████████░░░░  9 pagos · 3 pendentes · 3 free
```

Layout em duas colunas para ter espaço: mantém-se no `grid-cols-2`.

---

### 3. Dashboard — Funil de Inscrição — sincronizar visitantes

**Ficheiro:** `src/components/crm/DashboardView.tsx`

O visitante "2.5k" mencionado é o valor real de analytics que o utilizador viu. O campo de visitantes é actualmente um `<input>` editável com default `1034`. Basta mudar o valor inicial para `2500`:

```ts
const [visitantes, setVisitantes] = useState(2500);
```

O campo continua editável, por isso o utilizador pode ajustar se o valor mudar.

---

### 4. Dashboard — Remover secção de "Logs internos" e "Falhas por etapa" — simplificar email UX

**Ficheiro:** `src/components/crm/DashboardView.tsx` (linhas 342–383)

Remover completamente os 3 cards:
- "Logs internos" (card opaco, provider=internal)
- "Falhas" (AlertCircle, emailFailed)
- "Por etapa (Resend)" (BarChart2, stageCounts)

**Substituir** a grelha de 4 colunas por **um único card limpo** de estado do Resend, com informação que realmente importa:

```
✉️  Emails de Follow-up Resend
    
    [24h]  12 enviados   0 falhas
    [7d]   47 enviados   3 falhas
    
    Estado: ✅ A funcionar normalmente
    (ou ⚠️ X falhas nas últimas 24h se houver)
```

Remover dos `useState` e `useEffect` as variáveis desnecessárias: `internalSent24h`, `internalSent7d`, `stageCounts`. Manter apenas `resendSent24h`, `resendSent7d`, `emailFailed24h`, `emailFailed7d`.

O novo card ocupa toda a largura (ou metade ao lado do Pipeline Pendente se já existe) e comunica o estado operacional de forma imediata.

---

### Ficheiros alterados

| Ficheiro | Alteração |
|---|---|
| `src/components/crm/PipelineView.tsx` | Remover colunas "Inscrito"/"Flow Completo" em pós-webinar + título "€27" |
| `src/components/crm/DashboardView.tsx` | Planos: novo UI com pagos/pendentes por plano; Funil: visitantes=2500; Emails: substituir 4 cards por 1 card limpo |

### O que NÃO muda
- Lógica de filtros, dados reais, queries à BD
- Todas as outras secções do Dashboard (KPIs, Pipeline Pendente, Fontes, Género, Dificuldades, Dúvidas, Leaderboard, Para Fazer Hoje)
- PipelineView no modo "Todos" e "Pré-webinar" — ficam iguais
