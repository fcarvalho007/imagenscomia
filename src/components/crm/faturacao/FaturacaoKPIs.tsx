import { useState, useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, BarChart3, Zap } from "lucide-react";

interface Props {
  receitaConfirmada: number;
  pipelinePendente: number;
  numPagamentos: number;
  totalCosts: number;
  paidMediaCosts: number;
}

const fmt = (v: number) => v.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function useAnimatedValue(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  const triggered = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !triggered.current) {
        triggered.current = true;
        const start = performance.now();
        const animate = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          setValue(eased * target);
          if (p < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { value, ref };
}

export default function FaturacaoKPIs({ receitaConfirmada, pipelinePendente, numPagamentos, totalCosts, paidMediaCosts }: Props) {
  const margem = receitaConfirmada - totalCosts;
  const margemPositiva = margem >= 0;
  const roas = paidMediaCosts > 0 ? receitaConfirmada / paidMediaCosts : 0;
  const cac = numPagamentos > 0 ? totalCosts / numPagamentos : 0;
  const ticketMedio = numPagamentos > 0 ? receitaConfirmada / numPagamentos : 0;

  const animReceita = useAnimatedValue(receitaConfirmada);
  const animMargem = useAnimatedValue(Math.abs(margem));
  const animRoas = useAnimatedValue(roas, 2200);

  return (
    <div className="space-y-4">
      {/* Hero row — 3 big cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Receita Confirmada */}
        <div
          ref={animReceita.ref}
          className="rounded-2xl p-6 border relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))",
            borderColor: "rgba(34,197,94,0.2)",
            boxShadow: "0 0 30px rgba(34,197,94,0.08)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={16} style={{ color: "#22c55e" }} />
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
              Receita Confirmada
            </span>
          </div>
          <p className="text-4xl md:text-5xl font-black tabular-nums tracking-tight" style={{ color: "#22c55e" }}>
            €{fmt(animReceita.value)}
          </p>
          <p className="text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            {numPagamentos} pagamento{numPagamentos !== 1 ? "s" : ""} confirmado{numPagamentos !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Margem Operacional */}
        <div
          ref={animMargem.ref}
          className="rounded-2xl p-6 border relative overflow-hidden"
          style={{
            background: margemPositiva
              ? "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.01))"
              : "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))",
            borderColor: margemPositiva ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.25)",
            boxShadow: margemPositiva
              ? "0 0 30px rgba(34,197,94,0.06)"
              : "0 0 30px rgba(239,68,68,0.08)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            {margemPositiva ? <TrendingUp size={16} style={{ color: "#22c55e" }} /> : <TrendingDown size={16} style={{ color: "#ef4444" }} />}
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
              Margem Operacional
            </span>
          </div>
          <p className="text-4xl md:text-5xl font-black tabular-nums tracking-tight" style={{ color: margemPositiva ? "#22c55e" : "#ef4444" }}>
            {margemPositiva ? "" : "-"}€{fmt(animMargem.value)}
          </p>
          <p className="text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            Receita − Custos totais
          </p>
        </div>

        {/* ROAS */}
        <div
          ref={animRoas.ref}
          className="rounded-2xl p-6 border relative overflow-hidden"
          style={{
            background: roas >= 2
              ? "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.04))"
              : "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))",
            borderColor: roas >= 2 ? "rgba(59,130,246,0.25)" : "rgba(245,158,11,0.25)",
            boxShadow: roas >= 2
              ? "0 0 30px rgba(59,130,246,0.08)"
              : "0 0 30px rgba(245,158,11,0.06)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} style={{ color: roas >= 2 ? "#3b82f6" : "#f59e0b" }} />
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
              ROAS
            </span>
          </div>
          <p className="text-5xl md:text-6xl font-black tabular-nums tracking-tight" style={{ color: roas >= 2 ? "#3b82f6" : "#f59e0b" }}>
            {animRoas.value.toFixed(1)}<span className="text-3xl">×</span>
          </p>
          <p className="text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            {paidMediaCosts > 0 ? `€${fmt(paidMediaCosts)} investidos em ads` : "Sem custos de ads registados"}
          </p>
        </div>
      </div>

      {/* Secondary row — 4 compact cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Pipeline Pendente", value: `€${fmt(pipelinePendente)}`, icon: Target, color: "#f59e0b" },
          { label: "Ticket Médio", value: `€${fmt(ticketMedio)}`, icon: BarChart3, color: "#8b5cf6" },
          { label: "Nº Pagamentos", value: String(numPagamentos), icon: Users, color: "#06b6d4" },
          { label: "CAC", value: cac > 0 ? `€${fmt(cac)}` : "—", icon: TrendingUp, color: "#f97316" },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl p-4 border"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <c.icon size={13} style={{ color: c.color }} />
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
                {c.label}
              </span>
            </div>
            <p className="text-xl font-bold tabular-nums" style={{ color: "rgba(255,255,255,0.9)" }}>
              {c.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
