import { useMemo } from "react";
import { TrendingUp, ArrowRight } from "lucide-react";
import type { Inscrito } from "@/pages/crm/mockData";

interface ConversionFunnelBlockProps {
  inscritos: Inscrito[];
}

function pct(num: number, den: number): string {
  if (!den) return "0%";
  return `${((num / den) * 100).toFixed(1)}%`;
}

export default function ConversionFunnelBlock({ inscritos }: ConversionFunnelBlockProps) {
  const data = useMemo(() => {
    const active = inscritos.filter((i) => i.status === "activo");
    const total = active.length;
    const clickedUpgrade = active.filter((i) => i.upgrade_clicked_at !== null).length;
    const selectedPlan = active.filter((i) => i.plan_selected && i.plan_selected !== "free").length;
    const awaitingPayment = active.filter((i) => i.payment_status === "awaiting_payment").length;
    const paid = active.filter((i) => i.paid_at !== null).length;
    const receita = active.filter((i) => i.paid_at).reduce((s, i) => s + i.valor, 0);

    // By plan
    const planBreakdown = ["premium", "masterclass", "bundle"].map((plan) => {
      const selected = active.filter((i) => i.plan === plan && i.plan_selected && i.plan_selected !== "free").length;
      const paidCount = active.filter((i) => i.plan === plan && i.paid_at).length;
      return { plan, selected, paid: paidCount, convRate: selected ? paidCount / selected : 0 };
    });

    return { total, clickedUpgrade, selectedPlan, awaitingPayment, paid, receita, planBreakdown };
  }, [inscritos]);

  const steps = [
    { label: "Inscritos", value: data.total, color: "hsl(var(--blue-600))" },
    { label: "Clicaram upgrade", value: data.clickedUpgrade, color: "#7C3AED" },
    { label: "Selecionaram plano", value: data.selectedPlan, color: "hsl(var(--amber-500))" },
    { label: "Pagaram", value: data.paid, color: "hsl(var(--green-600))" },
  ];

  const maxVal = Math.max(...steps.map((s) => s.value), 1);

  const PLAN_COLORS: Record<string, { bg: string; color: string; label: string }> = {
    premium: { bg: "hsl(var(--blue-50))", color: "hsl(var(--blue-600))", label: "Premium" },
    masterclass: { bg: "rgba(124,58,237,0.1)", color: "#7C3AED", label: "Masterclass" },
    bundle: { bg: "hsl(var(--green-50))", color: "hsl(var(--green-600))", label: "Bundle" },
  };

  return (
    <div className="bg-white border border-border rounded-xl p-5 mb-5">
      <div className="flex items-center gap-2.5 mb-4">
        <TrendingUp size={18} className="text-ink-400" />
        <div>
          <h3 className="font-heading font-bold text-[14px] text-ink-800">Funil de Conversão Pós-Evento</h3>
          <p className="text-[12px] text-ink-400">Inscritos → Upgrade → Pagamento</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-heading font-extrabold text-[20px] text-ink-900">€{data.receita.toFixed(0)}</p>
          <p className="text-[11px] text-ink-400">receita total</p>
        </div>
      </div>

      {/* Horizontal funnel */}
      <div className="space-y-3 mb-5">
        {steps.map((step, idx) => (
          <div key={step.label}>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-ink-500 w-[160px] max-sm:w-[120px] shrink-0 truncate">
                {step.label}
              </span>
              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "hsl(var(--surface))" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max((step.value / maxVal) * 100, 2)}%`,
                    background: step.color,
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5 w-24 justify-end shrink-0">
                <span className="text-[13px] font-heading font-bold text-ink-700">{step.value}</span>
                <span className="text-ink-400 text-[11px]">({pct(step.value, data.total)})</span>
              </div>
            </div>
            {/* Drop-off between steps */}
            {idx < steps.length - 1 && (
              <div className="flex items-center gap-2 ml-[160px] max-sm:ml-[120px] pl-2 mt-0.5">
                <ArrowRight size={10} className="text-ink-300" />
                <span className="text-[10px] font-medium text-ink-400">
                  {pct(steps[idx + 1].value, step.value)} conversão
                  {step.value - steps[idx + 1].value > 0 && (
                    <span className="ml-1 text-red-400">(-{step.value - steps[idx + 1].value})</span>
                  )}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Plan breakdown */}
      <div className="border-t border-border pt-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-2.5">Conversão por plano</p>
        <div className="grid grid-cols-3 gap-3">
          {data.planBreakdown.map((pb) => {
            const cfg = PLAN_COLORS[pb.plan];
            if (!cfg) return null;
            return (
              <div key={pb.plan} className="rounded-lg px-3 py-2.5 text-center" style={{ background: cfg.bg }}>
                <p className="text-[12px] font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
                <p className="font-heading font-extrabold text-[18px] mt-0.5" style={{ color: cfg.color }}>{pb.paid}</p>
                <p className="text-[10px] text-ink-400 mt-0.5">
                  {pb.selected} selecionaram · {(pb.convRate * 100).toFixed(0)}% conv.
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
