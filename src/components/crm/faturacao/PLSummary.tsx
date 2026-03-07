import type { Inscrito } from "@/pages/crm/mockData";
import type { AcquisitionCost } from "@/components/crm/FaturacaoView";
import { applyIVA } from "@/components/crm/FaturacaoView";

interface Props {
  receitaConfirmada: number;
  pipelinePendente: number;
  costs: AcquisitionCost[];
  totalCosts: number;
  inscritos: Inscrito[];
  showIVA: boolean;
}

const fmt = (v: number) => `€${v.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function PLSummary({ receitaConfirmada, pipelinePendente, costs, totalCosts, inscritos, showIVA }: Props) {
  const receita = applyIVA(receitaConfirmada, showIVA);
  const pipeline = applyIVA(pipelinePendente, showIVA);
  const margemConfirmada = receita - totalCosts;
  const margemPotencial = receita + pipeline - totalCosts;
  const paidMediaCosts = costs.filter(c => c.category === "paid_media").reduce((s, c) => s + Number(c.amount), 0);
  const roas = paidMediaCosts > 0 ? receita / paidMediaCosts : 0;
  const numPagamentos = inscritos.filter(i => i.payment_status === "paid").length;
  const cac = numPagamentos > 0 ? totalCosts / numPagamentos : 0;

  const costByPlatform: Record<string, number> = {};
  costs.forEach(c => { costByPlatform[c.platform] = (costByPlatform[c.platform] || 0) + Number(c.amount); });

  const revenueByWebinar: Record<string, number> = {};
  inscritos.filter(i => i.payment_status === "paid").forEach(i => {
    revenueByWebinar[i.webinar] = (revenueByWebinar[i.webinar] || 0) + applyIVA(Number(i.valor) || 0, showIVA);
  });
  const hasMultipleWebinars = Object.keys(revenueByWebinar).length > 1;

  const WEBINAR_LABELS: Record<string, string> = { imagens: "📷 Imagens IA", video: "🎬 Vídeo IA" };
  const ivaLabel = showIVA ? "c/ IVA" : "s/ IVA";

  const plLines = [
    { section: `RECEITAS (${ivaLabel})`, items: [
      ...(hasMultipleWebinars
        ? Object.entries(revenueByWebinar).map(([w, v]) => ({ label: WEBINAR_LABELS[w] || w, value: v }))
        : []),
      { label: "Receita confirmada", value: receita, bold: hasMultipleWebinars },
      { label: "Pipeline (pendente)", value: pipeline, muted: true },
      { label: "Total potencial", value: receita + pipeline, bold: true },
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
    <div className="space-y-4">
      <h2 className="text-[15px] font-bold text-slate-900">Mapa de Contas</h2>
      <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 shadow-sm w-full md:max-w-lg">
        {plLines.map(section => (
          <div key={section.section}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2 text-slate-400">{section.section}</p>
            {section.items.map((item: any) => (
              <div key={item.label} className="flex justify-between py-0.5">
                <span className={`text-[11px] sm:text-[12px] ${item.muted ? "text-slate-400" : "text-slate-600"}`}>{item.label}</span>
                <span className={`text-[11px] sm:text-[12px] ${item.bold ? "font-bold" : "font-medium"}`} style={{
                  color: item.highlight !== undefined
                    ? (item.highlight ? "#22c55e" : "#ef4444")
                    : item.bold ? "#0F172A" : "#334155",
                }}>
                  {item.isMultiplier ? `${item.value.toFixed(2)}×` : fmt(item.value)}
                </span>
              </div>
            ))}
            <div className="border-t border-slate-100 my-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
