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

export default function PLSummary({ receitaConfirmada, pipelinePendente, costs, totalCosts, inscritos }: Props) {
  const margemConfirmada = receitaConfirmada - totalCosts;
  const margemPotencial = receitaConfirmada + pipelinePendente - totalCosts;
  const paidMediaCosts = costs.filter(c => c.category === "paid_media").reduce((s, c) => s + Number(c.amount), 0);
  const roas = paidMediaCosts > 0 ? receitaConfirmada / paidMediaCosts : 0;
  const numPagamentos = inscritos.filter(i => i.payment_status === "paid").length;
  const cac = numPagamentos > 0 ? totalCosts / numPagamentos : 0;

  const costByPlatform: Record<string, number> = {};
  costs.forEach(c => { costByPlatform[c.platform] = (costByPlatform[c.platform] || 0) + Number(c.amount); });

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
    <div className="space-y-4">
      <h2 className="text-[15px] font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>Mapa de Contas</h2>
      <div className="rounded-2xl p-5 border max-w-lg" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
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
    </div>
  );
}
