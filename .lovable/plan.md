

# Cross-Webinar History no Modal de Inscrito

## Resumo

Adicionar historico cross-webinar ao modal de inscrito: seccao colapsavel com registos anteriores, badge de relacao no sidebar esquerdo, e alerta inteligente para compradores de Masterclass.

---

## 1. Fetch de historico cross-webinar

**Ficheiro:** `src/components/crm/InscritoModal.tsx`

Adicionar novo state e fetch on mount (junto dos outros useEffect existentes, ~linha 94):

```ts
const [crossHistory, setCrossHistory] = useState<any[]>([]);
const [historyLoading, setHistoryLoading] = useState(true);

useEffect(() => {
  setHistoryLoading(true);
  supabase
    .from("registrations")
    .select("id, webinar, plan_selected, step_reached, created_at, paid_at")
    .eq("email", inscrito.email)
    .neq("id", inscrito.id)
    .order("created_at", { ascending: false })
    .then(({ data }) => {
      setCrossHistory(data || []);
    })
    .catch(() => setCrossHistory([]))
    .finally(() => setHistoryLoading(false));
}, [inscrito.id, inscrito.email]);
```

Derivar badges a partir do historico:

```ts
const hasPaidBefore = crossHistory.some(h => !!h.paid_at);
const hasAttendedBefore = !hasPaidBefore && crossHistory.some(
  h => h.step_reached >= 3
);
const hasMasterclassImagens = crossHistory.some(
  h => h.webinar === "imagens" && h.plan_selected === "masterclass" && h.paid_at
);
```

---

## 2. Badge de relacao no sidebar esquerdo

**Ficheiro:** `src/components/crm/InscritoModal.tsx`

No painel esquerdo (desktop), logo abaixo da data de inscricao (~linha 354, apos o `<p>Inscrito em...</p>`), adicionar:

```tsx
{hasPaidBefore && (
  <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
    style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#d97706" }}>
    ⭐ Cliente anterior
  </div>
)}
{hasAttendedBefore && (
  <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
    style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#3b82f6" }}>
    🔄 Inscrito anterior
  </div>
)}
```

No mobile (~linha 266, apos o email): mesma logica mas numa linha compacta.

So mostra um dos dois badges (hasPaidBefore tem prioridade). Novos inscritos nao mostram nada.

---

## 3. Alerta inteligente (Masterclass cross-sell)

**Ficheiro:** `src/components/crm/InscritoModal.tsx`

No painel direito, logo ACIMA do `<ClientHeader>` (~linha 528), adicionar:

```tsx
{hasMasterclassImagens && inscrito.webinar === "video" && (
  <div className="mb-4 rounded-lg p-3.5 flex items-start gap-2.5"
    style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
    <span className="text-[16px] mt-0.5">⚠️</span>
    <div>
      <p className="text-[13px] font-semibold" style={{ color: "#d97706" }}>
        Este inscrito ja comprou a Masterclass no Webinar Imagens IA
        ({crossHistory.find(h => h.webinar === "imagens" && h.plan_selected === "masterclass" && h.paid_at)
          ? fmtDate(crossHistory.find(...)!.paid_at!)
          : ""}).
      </p>
      <p className="text-[12px] mt-0.5" style={{ color: "#d97706" }}>
        Nao enviar pitch de Masterclass — ajustar comunicacao.
      </p>
    </div>
  </div>
)}
```

So aparece quando: inscrito actual e do webinar "video" E tem um registo anterior no "imagens" com `plan_selected === "masterclass"` e `paid_at` preenchido.

---

## 4. Seccao "Historico de Webinars" (colapsavel)

**Ficheiro:** `src/components/crm/InscritoModal.tsx`

No painel direito, apos o `<FunnelView>` (~linha 634) e ANTES da seccao "Origem" (~linha 637), adicionar:

```tsx
<hr className="border-border my-6" />
<div>
  <button onClick={toggleHistory} className="flex items-center gap-2 w-full">
    <ChevronRight size={14} className={`transition-transform ${historyOpen ? "rotate-90" : ""}`} />
    <h3 className="font-heading font-bold text-[14px] text-foreground">
      Historico de Webinars
    </h3>
    {crossHistory.length > 0 && (
      <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
        {crossHistory.length}
      </span>
    )}
  </button>
  
  {historyOpen && (
    <div className="mt-3 space-y-2">
      {historyLoading ? (
        <p className="text-[12px] text-muted-foreground">A carregar...</p>
      ) : crossHistory.length === 0 ? (
        <p className="text-[11px] italic" style={{ color: "#666" }}>
          Primeira vez neste ecossistema
        </p>
      ) : (
        crossHistory.map(h => <HistoryCard key={h.id} record={h} />)
      )}
    </div>
  )}
</div>
```

Estado `historyOpen`: default `true` se `crossHistory.length > 0`, `false` se vazio.

### HistoryCard (inline ou sub-componente)

Cada card de historico:

```tsx
<div style={{
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(0,0,0,0.06)",
  borderRadius: 8, padding: "10px 14px"
}}>
  {/* Top: webinar badge + data */}
  <div className="flex items-center justify-between">
    <span style={{
      background: h.webinar === "video" ? "rgba(22,163,74,0.15)" : "rgba(30,64,175,0.15)",
      color: h.webinar === "video" ? "#16a34a" : "#1e40af",
      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12
    }}>
      {h.webinar === "video" ? "🎬 Video IA" : "📷 Imagens IA"} · {WEBINAR_CONFIG[h.webinar]?.date}
    </span>
    <span className="text-[11px] text-muted-foreground">{fmtDate(h.created_at)}</span>
  </div>

  {/* Middle: plano */}
  <div className="flex items-center gap-2 mt-2">
    {/* Badge de plano + estado */}
    {renderPlanBadge(h)}
  </div>

  {/* Bottom: valor pago (so se paid) */}
  {h.paid_at && (
    <div className="mt-1.5 text-[11px] text-muted-foreground">
      Valor pago: €{PLAN_VALUES[h.plan_selected] || "—"} · Pago em {fmtDate(h.paid_at)}
    </div>
  )}
</div>
```

Logica de `renderPlanBadge`:

| Condicao | Badge plano | Badge estado |
|---|---|---|
| free + step < 3 | "Inscrito gratuito" (cinza) | "Nao completou o flow" (laranja) |
| free + step >= 3 | "Inscrito gratuito" (cinza) | "Completou o flow" (verde) |
| premium + paid | "Premium Pass €15+IVA" (azul) | "Pago" (verde) |
| masterclass + paid | "Masterclass €47+IVA" (roxo) | "Pago" (verde) |
| bundle + paid | "Bundle €62+IVA" (escuro) | "Pago" (verde) |

---

## Ficheiros a modificar

| Ficheiro | Alteracao |
|---|---|
| `src/components/crm/InscritoModal.tsx` | Fetch cross-history, badge sidebar, alerta, seccao colapsavel |

Nenhum outro ficheiro e alterado. Sem novas tabelas, sem alteracoes a edge functions, sem mudancas noutras views.

