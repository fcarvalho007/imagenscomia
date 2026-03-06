import { TrendingUp, TrendingDown, DollarSign, Users, Target, PieChart } from "lucide-react";

interface Props {
  receitaConfirmada: number;
  pipelinePendente: number;
  numPagamentos: number;
  totalCosts: number;
}

const fmt = (v: number) => v.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function FaturacaoKPIs({ receitaConfirmada, pipelinePendente, numPagamentos, totalCosts }: Props) {
  const receitaPotencial = receitaConfirmada + pipelinePendente;
  const ticketMedio = numPagamentos > 0 ? receitaConfirmada / numPagamentos : 0;
  const margem = receitaConfirmada - totalCosts;
  const margemPositiva = margem >= 0;

  const cards = [
    { label: "Receita Confirmada", value: `€${fmt(receitaConfirmada)}`, icon: DollarSign, color: "#22c55e" },
    { label: "Pipeline Pendente", value: `€${fmt(pipelinePendente)}`, icon: Target, color: "#f59e0b" },
    { label: "Receita Potencial", value: `€${fmt(receitaPotencial)}`, icon: PieChart, color: "#3b82f6" },
    { label: "Ticket Médio", value: `€${fmt(ticketMedio)}`, icon: TrendingUp, color: "#8b5cf6" },
    { label: "Nº Pagamentos", value: String(numPagamentos), icon: Users, color: "#06b6d4" },
    {
      label: "Margem Operacional",
      value: `${margemPositiva ? "" : "-"}€${fmt(Math.abs(margem))}`,
      icon: margemPositiva ? TrendingUp : TrendingDown,
      color: margemPositiva ? "#22c55e" : "#ef4444",
      highlight: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl p-4 border transition-all"
          style={{
            background: c.highlight
              ? `linear-gradient(135deg, ${c.color}15, ${c.color}08)`
              : "rgba(255,255,255,0.03)",
            borderColor: c.highlight ? `${c.color}40` : "rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <c.icon size={14} style={{ color: c.color }} />
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.45)" }}>
              {c.label}
            </span>
          </div>
          <p className="text-lg md:text-xl font-bold" style={{ color: c.highlight ? c.color : "rgba(255,255,255,0.9)" }}>
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}
