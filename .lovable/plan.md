
## Diagnóstico Final

### Situação confirmada
- A API de analytics da Lovable **funciona** e retorna dados reais: **2226 visitantes únicos** na rota `/` entre 8–18 Fev 2026.
- A edge function `get-analytics-visitors` **falha sempre** porque o `LOVABLE_API_KEY` guardado nos secrets não tem permissão para chamar a API de analytics externamente — só o agente Lovable tem acesso interno a esses dados.
- Resultado actual: a função retorna `null`, o frontend usa o fallback hardcoded `2225` silenciosamente, sem qualquer indicação de estado ou timestamp.

### Problemas a resolver
1. **Visitantes — fonte instável e silenciosa**: fallback hardcoded sem transparência, sem timestamp, sem "re-tentar"
2. **KPI duplo confuso**: 5.2% (inscritos→pago) e 0.5% (visitantes→pago) aparecem misturados sem clareza
3. **Sem período seleccionável**: tudo é "desde o início"
4. **Sem tooltips informativos**: utilizador não sabe o que é cada métrica

---

## Solução para Visitantes — Cache em Base de Dados

Como a API de analytics só é acessível pelo agente Lovable (não via token externo), a architecture correta é:

1. **Criar tabela `analytics_cache`** com `key TEXT PRIMARY KEY`, `value INTEGER`, `updated_at TIMESTAMPTZ`, `source TEXT`
2. **Inserir o valor actual (2226)** directamente na tabela via migration
3. **Remover a edge function `get-analytics-visitors`** (que falha sempre)
4. **No `DashboardView`**: ler `analytics_cache` via Supabase client directamente (sem edge function)
5. **UI**: mostrar número + badge "via Analytics Cache · rota /" + "Actualizado em DD Mês HH:mm" + botão "Pedir actualização" que cria um evento de sistema (para que o agent atualize manualmente quando necessário)

Esta abordagem é **100% fiável**, transparente, auditável e sem dependências externas que falham. O valor é actualizado pelo agent periodicamente (basta uma query SQL).

---

## Plano de Implementação

### 1. Migration — Tabela `analytics_cache`

Criar tabela simples:
```sql
CREATE TABLE public.analytics_cache (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir valor actual confirmado
INSERT INTO analytics_cache (key, value, source, updated_at)
VALUES ('landing_visitors', 2226, 'lovable_analytics_api', '2026-02-18T14:00:00Z');

-- RLS: só leitura pública (o dashboard precisa de ler sem auth)
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_anon_select_analytics_cache" ON public.analytics_cache
  FOR SELECT USING (true);
```

### 2. Edge function `get-analytics-visitors` — Simplificar

Remover toda a lógica de chamada à API externa. A função passa a apenas:
- Ler `analytics_cache` WHERE key = 'landing_visitors'
- Retornar `{ visitors, source, updated_at }`

Assim fica simples, fiável e sem falhas de autenticação. Quando o agente actualizar o valor na tabela, o dashboard passa a mostrar o novo valor automaticamente.

### 3. `DashboardView.tsx` — 4 melhorias

**A) Visitantes — estado transparente**

Estado actual (silencioso):
```tsx
// Se falha, mostra 2225 sem aviso
setVisitantes(2225);
```

Estado novo (transparente):
```tsx
// 3 estados possíveis:
// - loading: "—" animado
// - success: número + badge + "Actualizado em DD Mês HH:mm"  
// - unavailable: "Indisponível" + "Último valor: N (data)" + botão "Re-tentar"
const [visitantesState, setVisitantesState] = useState<{
  value: number | null;
  updatedAt: string | null;
  source: string | null;
  status: "loading" | "ok" | "unavailable";
}>({ value: null, updatedAt: null, source: null, status: "loading" });
```

UI do Passo 0:
- `status === "ok"`: número, badge `via Analytics Cache · rota /`, `Actualizado em DD Mês HH:mm`
- `status === "unavailable"`: "Indisponível" em âmbar, `Último valor conhecido: N`, botão `Re-tentar`
- Drop-off row só aparece se `value != null`

**B) KPI conversão — duas taxas claramente separadas**

Card actual (confuso):
```tsx
<p>Taxa de conversão (inscritos → pago)</p>
<p>{paidConfirmed} de {total} inscritos pagaram</p>
<p style={amber}>{landingToPayPct}% dos visitantes da landing page</p>  ← misturado
```

Card novo (dois KPIs separados com visual distinto):
```tsx
// KPI principal
<p className="text-[32px]">{conversao.toFixed(1)}%</p>
<p>Taxa Inscritos → Pago</p>
<p className="text-[11px] text-ink-400">{paidConfirmed} de {total} inscritos activos pagaram</p>

// Divisor
<div className="border-t border-dashed border-border my-3" />

// KPI secundário (só se visitantes disponíveis)
<p className="text-[20px] font-bold" style={amber}>{landingToPayPct.toFixed(1)}%</p>
<p className="text-[12px] text-ink-500">Landing page → Pago</p>
<p className="text-[11px] text-ink-400">{paidConfirmed} de {visitantes} visitantes únicos</p>
```

**C) Funil — último passo mais claro**

No último passo do funil (Pagamento confirmado), a percentagem actualmente mostra:
```
12 (5.2%) · 0.5% dos visitantes
```
Tornar mais legível:
```
12 inscritos (5.2% dos inscritos · 0.5% dos visitantes)
```
Labels explícitos inline evitam confusão entre as duas bases.

**D) Selector de período — simples, 4 opções**

Adicionar no topo do dashboard, ao lado do botão "Atualizar":
```tsx
const [period, setPeriod] = useState<"7d" | "14d" | "30d" | "all">("all");
```
Botões pill: `7 dias | 14 dias | 30 dias | Desde início`

O `period` filtra `inscritos` por `created_at` antes de calcular stats:
```tsx
const filtered = period === "all" 
  ? inscritos 
  : inscritos.filter(i => new Date(i.timestamp) >= periodStart);
```
Os visitantes da analytics cache **não são filtrados** por período (só temos o total acumulado) — mostrar nota "Desde 8 Fev" sempre junto ao passo 0.

O selector afecta: inscritos, receita, conversão, ticket, funil, fontes, planos, dúvidas, pipeline, pendentes.

### 4. Ficheiros a criar/editar

| Ficheiro | O que muda |
|---|---|
| `supabase/migrations/...` | Criar `analytics_cache` + inserir 2226 + RLS |
| `supabase/functions/get-analytics-visitors/index.ts` | Ler de `analytics_cache` (sem chamada API externa) |
| `src/components/crm/DashboardView.tsx` | Estados transparentes visitantes, KPI duplo claro, selector de período |

### 5. O que NÃO muda
- `send-payment-link` — já corrigido
- `ActivityTimeline` — já corrigido
- `templateLabels` — já corrigido
- Tabelas existentes — sem alterações de schema (excepto nova tabela `analytics_cache`)
- Pipeline, Tabela, Ficha — sem alterações

---

## Resultado Final Esperado

- Passo 0 lê de `analytics_cache` → sempre funciona, nunca silencioso
- Se tabela falhar: "Indisponível · Último valor: 2226 (18 Fev 14:00)" + Re-tentar
- KPI mostra `5.2%` grande + `0.5%` menor com labels inequívocos
- Funil: último passo = "12 (5.2% dos inscritos · 0.5% dos visitantes)"
- Selector de período filtra tudo excepto visitantes (que são acumulados)
- O agent pode atualizar o valor bastando fazer `UPDATE analytics_cache SET value=2500, updated_at=NOW() WHERE key='landing_visitors'`
