import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Inscrito } from "@/pages/crm/mockData";
import type { AcquisitionCost } from "@/components/crm/FaturacaoView";

interface Props {
  receitaConfirmada: number;
  pipelinePendente: number;
  costs: AcquisitionCost[];
  totalCosts: number;
  inscritos: Inscrito[];
}

const fmt = (v: number) => `€${v.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PLAN_COLORS: Record<string, string> = {
  premium: "#3b82f6",
  masterclass: "#8b5cf6",
  bundle: "#06b6d4",
  free: "rgba(255,255,255,0.1)",
};

export default function PLSummary({ receitaConfirmada, pipelinePendente, costs, totalCosts, inscritos }: Props) {
  const margemConfirmada = receitaConfirmada - totalCosts;
  const margemPotencial = receitaConfirmada + pipelinePendente - totalCosts;
  const paidMediaCosts = costs.filter(c => c.category === "paid_media").reduce((s, c) => s + Number(c.amount), 0);
  const roas = paidMediaCosts > 0 ? receitaConfirmada / paidMediaCosts : 0;
  const numPagamentos = inscritos.filter(i => i.payment_status === "paid").length;
  const cac = numPagamentos > 0 ? totalCosts / numPagamentos : 0;

  // Cost breakdown by platform
  const costByPlatform: Record<string, number> = {};
  costs.forEach(c => { costByPlatform[c.platform] = (costByPlatform[c.platform] || 0) + Number(c.amount); });

  // Bar chart data
  const barData = [
    { name: "Receita", value: receitaConfirmada, fill: "#22c55e" },
    { name: "Pipeline", value: pipelinePendente, fill: "#f59e0b" },
    { name: "Custos", value: totalCosts, fill: "#ef4444" },
  ];

  // Pie chart data
  const planCounts: Record<string, number> = {};
  inscritos.filter(i => i.payment_status === "paid" && i.plan !== "free").forEach(i => {
    planCounts[i.plan] = (planCounts[i.plan] || 0) + 1;
  });
  const pieData = Object.entries(planCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: PLAN_COLORS[name] || "#64748b",
  }));

  const plLines = [
    { section: "RECEITAS", items: [
      { label: "Receita confirmada", value: receitaConfirmada },
      { label: "Pipeline (pendente)", value: pipelinePendente, muted: true },
      { label: "Total potencial", value: receitaConfirmada + pipelinePendente, bold: true },
    ]},
    { section: "CUSTOS", items: [
      ...Object.entries(costByPlatform).map(([label, value]) => ({ label, value })),
      { label: "Total custos", value: totalCosts, bold: true },
    ]},
    { section: "RESULTADO", items: [
      { label: "Margem (confirmada)", value: margemConfirmada, highlight: margemConfirmada >= 0 },
      { label: "Margem (potencial)", value: margemPotencial, muted: true },
      { label: "ROAS", value: roas, isMultiplier: true },
      { label: "CAC", value: cac },
    ]},
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-[15px] font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>Mapa de Contas</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* P&L Text */}
        <div className="lg:col-span-1 rounded-xl p-5 border space-y-4" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
          {plLines.map(section => (
            <div key={section.section}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>{section.section}</p>
              {section.items.map((item: any) => (
                <div key={item.label} className="flex justify-between py-0.5">
                  <span className="text-[12px]" style={{ color: item.muted ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.6)" }}>{item.label}</span>
                  <span className={`text-[12px] ${item.bold ? "font-bold" : "font-medium"}`} style={{
                    color: item.highlight !== undefined
                      ? (item.highlight ? "#22c55e" : "#ef4444")
                      : item.bold ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.7)",
                  }}>
                    {item.isMultiplier ? `${item.value.toFixed(2)}×` : fmt(item.value)}
                  </span>
                </div>
              ))}
              <div className="border-t my-2" style={{ borderColor: "rgba(255,255,255,0.06)" }} />
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="rounded-xl p-5 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-[11px] font-medium mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>Receita vs Custos</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={40}>
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "#fff" }} formatter={(v: number) => fmt(v)} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="rounded-xl p-5 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-[11px] font-medium mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>Distribuição por Plano</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} innerRadius={40} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-[12px] text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>Sem dados</p>
          )}
        </div>
      </div>
    </div>
  );
}
