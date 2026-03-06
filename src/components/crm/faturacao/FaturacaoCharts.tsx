import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Inscrito } from "@/pages/crm/mockData";
import type { AcquisitionCost } from "@/components/crm/FaturacaoView";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  receitaConfirmada: number;
  pipelinePendente: number;
  totalCosts: number;
  inscritos: Inscrito[];
  costs: AcquisitionCost[];
}

const fmt = (v: number) => `€${v.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PLAN_COLORS: Record<string, string> = {
  premium: "#3b82f6",
  masterclass: "#8b5cf6",
  bundle: "#06b6d4",
};

const TOOLTIP_STYLE = {
  background: "rgba(15,23,42,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  fontSize: 12,
  color: "#fff",
  backdropFilter: "blur(8px)",
};

export default function FaturacaoCharts({ receitaConfirmada, pipelinePendente, totalCosts, inscritos, costs }: Props) {
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 200 : 280;
  const smallChartHeight = isMobile ? 180 : 230;

  // Bar chart data
  const barData = [
    { name: "Receita", value: receitaConfirmada, fill: "#22c55e" },
    { name: "Pipeline", value: pipelinePendente, fill: "#f59e0b" },
    { name: "Custos", value: totalCosts, fill: "#ef4444" },
  ];

  // Donut chart — distribution by plan
  const planRevenue: Record<string, number> = {};
  const planCounts: Record<string, number> = {};
  inscritos.filter(i => i.payment_status === "paid" && i.plan !== "free").forEach(i => {
    planRevenue[i.plan] = (planRevenue[i.plan] || 0) + i.valor;
    planCounts[i.plan] = (planCounts[i.plan] || 0) + 1;
  });
  const pieData = Object.entries(planRevenue).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    count: planCounts[name] || 0,
    fill: PLAN_COLORS[name] || "#64748b",
  }));

  // Margin gauge
  const margemPct = receitaConfirmada > 0 ? Math.max(0, Math.min(100, ((receitaConfirmada - totalCosts) / receitaConfirmada) * 100)) : 0;
  const custosPct = receitaConfirmada > 0 ? Math.min(100, (totalCosts / receitaConfirmada) * 100) : 0;

  // Cost breakdown by category
  const costByCat: Record<string, number> = {};
  costs.forEach(c => { costByCat[c.category] = (costByCat[c.category] || 0) + Number(c.amount); });
  const costCatData = Object.entries(costByCat).map(([name, value]) => ({
    name: name === "paid_media" ? "Ads" : name === "tools" ? "Ferramentas" : name === "other" ? "Outros" : name,
    value,
  }));
  const COST_COLORS = ["#ef4444", "#f97316", "#eab308", "#64748b"];

  const outerRadius = isMobile ? 70 : 100;
  const innerRadius = isMobile ? 38 : 55;
  const smallOuterRadius = isMobile ? 60 : 80;
  const smallInnerRadius = isMobile ? 32 : 45;

  return (
    <div className="space-y-4">
      <h2 className="text-[15px] font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>Visão Geral</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="rounded-2xl p-4 sm:p-5 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-[12px] font-semibold mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>Receita vs Pipeline vs Custos</p>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={barData} barSize={isMobile ? 36 : 52}>
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: isMobile ? 10 : 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} width={isMobile ? 45 : 60} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => fmt(v)} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {barData.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart */}
        <div className="rounded-2xl p-4 sm:p-5 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-[12px] font-semibold mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>Receita por Plano</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={outerRadius}
                  innerRadius={innerRadius}
                  dataKey="value"
                  strokeWidth={0}
                  label={isMobile ? false : ({ name, value }: any) => `${name} — ${fmt(value)}`}
                  labelLine={isMobile ? false : { stroke: "rgba(255,255,255,0.2)" }}
                >
                  {pieData.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: number, name: string, props: any) => [
                    `${fmt(v)} (${props.payload.count} venda${props.payload.count !== 1 ? "s" : ""})`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center" style={{ height: chartHeight }}>
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>Sem vendas registadas</p>
            </div>
          )}
        </div>

        {/* Margin gauge */}
        <div className="rounded-2xl p-4 sm:p-5 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-[12px] font-semibold mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>Estrutura de Custos</p>
          <div className="space-y-6 py-4">
            <div>
              <div className="flex justify-between text-[11px] mb-2">
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Custos / Receita</span>
                <span className="font-bold" style={{ color: custosPct > 80 ? "#ef4444" : custosPct > 50 ? "#f59e0b" : "#22c55e" }}>
                  {custosPct.toFixed(1)}%
                </span>
              </div>
              <div className="h-5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${custosPct}%`,
                    background: custosPct > 80
                      ? "linear-gradient(90deg, #ef4444, #dc2626)"
                      : custosPct > 50
                        ? "linear-gradient(90deg, #f59e0b, #d97706)"
                        : "linear-gradient(90deg, #22c55e, #16a34a)",
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] mt-1.5">
                <span style={{ color: "rgba(255,255,255,0.3)" }}>€0</span>
                <span style={{ color: "rgba(255,255,255,0.3)" }}>{fmt(receitaConfirmada)}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-2">
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Margem</span>
                <span className="font-bold" style={{ color: margemPct > 30 ? "#22c55e" : "#f59e0b" }}>
                  {margemPct.toFixed(1)}%
                </span>
              </div>
              <div className="h-5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${margemPct}%`,
                    background: "linear-gradient(90deg, #22c55e, #4ade80)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cost breakdown mini donut */}
        <div className="rounded-2xl p-4 sm:p-5 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-[12px] font-semibold mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>Custos por Categoria</p>
          {costCatData.length > 0 ? (
            <ResponsiveContainer width="100%" height={smallChartHeight}>
              <PieChart>
                <Pie
                  data={costCatData}
                  cx="50%"
                  cy="50%"
                  outerRadius={smallOuterRadius}
                  innerRadius={smallInnerRadius}
                  dataKey="value"
                  strokeWidth={0}
                  label={isMobile ? false : ({ name, value }: any) => `${name} ${fmt(value)}`}
                  labelLine={isMobile ? false : { stroke: "rgba(255,255,255,0.15)" }}
                >
                  {costCatData.map((_, idx) => <Cell key={idx} fill={COST_COLORS[idx % COST_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center" style={{ height: smallChartHeight }}>
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>Sem custos registados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
