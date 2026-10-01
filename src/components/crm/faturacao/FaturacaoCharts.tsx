import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Inscrito } from "@/pages/crm/mockData";
import type { AcquisitionCost } from "@/components/crm/FaturacaoView";
import { applyIVA } from "@/components/crm/FaturacaoView";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  costsKnown?: boolean;
  groupByEdition?: boolean;
  receitaConfirmada: number;
  pipelinePendente: number;
  totalCosts: number;
  inscritos: Inscrito[];
  costs: AcquisitionCost[];
  showIVA: boolean;
}

const PLAN_COLORS: Record<string, string> = {
  premium: "#3b82f6",
  masterclass: "#8b5cf6",
  bundle: "#06b6d4",
};

const TOOLTIP_STYLE = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 10,
  fontSize: 12,
  color: "#0F172A",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

export default function FaturacaoCharts({ receitaConfirmada, pipelinePendente, totalCosts, inscritos, costs, showIVA, costsKnown = true, groupByEdition = false }: Props) {
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 200 : 280;
  const smallChartHeight = isMobile ? 180 : 230;

  const receita = applyIVA(receitaConfirmada, showIVA);
  const pipeline = applyIVA(pipelinePendente, showIVA);

  const fmt = (v: number) => `€${v.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const barData = [
    { name: "Receita", value: receita, fill: "#22c55e" },
    { name: "Pipeline", value: pipeline, fill: "#f59e0b" },
    ...(costsKnown ? [{ name: "Custos", value: totalCosts, fill: "#ef4444" }] : []),
  ];

  const planRevenue: Record<string, number> = {};
  const planCounts: Record<string, number> = {};
  inscritos.filter(i => i.payment_status === "paid" && i.plan !== "free").forEach(i => {
    const val = applyIVA(i.valor, showIVA);
    const key = i.course?.editionLabel || i.plan;
    planRevenue[key] = (planRevenue[key] || 0) + val;
    planCounts[key] = (planCounts[key] || 0) + 1;
  });
  const pieData = Object.entries(planRevenue).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    count: planCounts[name] || 0,
    fill: PLAN_COLORS[name] || (name.startsWith("Lisboa") ? "#3b82f6" : name.startsWith("Porto") ? "#8b5cf6" : name.startsWith("Online") ? "#06b6d4" : "#64748b"),
  }));

  const margemPct = receita > 0 ? Math.max(0, Math.min(100, ((receita - totalCosts) / receita) * 100)) : 0;
  const custosPct = receita > 0 ? Math.min(100, (totalCosts / receita) * 100) : 0;

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

  const ivaLabel = showIVA ? "c/ IVA" : "s/ IVA";

  return (
    <div className="space-y-4">
      <h2 className="text-[15px] font-bold text-slate-900">Visão Geral</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 shadow-sm">
          <p className="text-[12px] font-semibold mb-4 text-slate-500">Receita vs Pipeline{costsKnown ? " vs Custos" : ""} <span className="text-slate-400">({ivaLabel})</span></p>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={barData} barSize={isMobile ? 36 : 52}>
              <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: isMobile ? 10 : 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} width={isMobile ? 45 : 60} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => fmt(v)} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {barData.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart */}
        <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 shadow-sm">
          <p className="text-[12px] font-semibold mb-4 text-slate-500">Receita por {groupByEdition ? "Edição" : "Plano"} <span className="text-slate-400">({ivaLabel})</span></p>
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
                  labelLine={isMobile ? false : { stroke: "#CBD5E1" }}
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
              <p className="text-[13px] text-slate-400">Sem vendas registadas</p>
            </div>
          )}
        </div>

{costsKnown && <>
        {/* Margin gauge */}
        <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 shadow-sm">
          <p className="text-[12px] font-semibold mb-4 text-slate-500">Estrutura de Custos</p>
          <div className="space-y-6 py-4">
            <div>
              <div className="flex justify-between text-[11px] mb-2">
                <span className="text-slate-500">Custos / Receita</span>
                <span className="font-bold" style={{ color: custosPct > 80 ? "#ef4444" : custosPct > 50 ? "#f59e0b" : "#22c55e" }}>
                  {custosPct.toFixed(1)}%
                </span>
              </div>
              <div className="h-5 rounded-full overflow-hidden bg-slate-100">
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
                <span className="text-slate-400">€0</span>
                <span className="text-slate-400">{fmt(receita)}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-2">
                <span className="text-slate-500">Margem</span>
                <span className="font-bold" style={{ color: margemPct > 30 ? "#22c55e" : "#f59e0b" }}>
                  {margemPct.toFixed(1)}%
                </span>
              </div>
              <div className="h-5 rounded-full overflow-hidden bg-slate-100">
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
        <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 shadow-sm">
          <p className="text-[12px] font-semibold mb-4 text-slate-500">Custos por Categoria</p>
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
                  labelLine={isMobile ? false : { stroke: "#CBD5E1" }}
                >
                  {costCatData.map((_, idx) => <Cell key={idx} fill={COST_COLORS[idx % COST_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center" style={{ height: smallChartHeight }}>
              <p className="text-[13px] text-slate-400">Sem custos registados</p>
            </div>
          )}
        </div></>}
      </div>
    </div>
  );
}
