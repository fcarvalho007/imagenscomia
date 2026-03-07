import type { Inscrito } from "@/pages/crm/mockData";
import { Users } from "lucide-react";
import { applyIVA } from "@/components/crm/FaturacaoView";

interface Props {
  inscritos: Inscrito[];
  receitaConfirmada: number;
  showIVA: boolean;
}

interface PlanRow {
  plan: string;
  label: string;
  price: string;
  paid: number;
  pending: number;
  total: number;
  hasGroup: boolean;
  groupCount: number;
}

const PLAN_CONFIG: Record<string, Record<string, { label: string }>> = {
  webinar: {
    premium: { label: "Premium Pass" },
    masterclass: { label: "Masterclass" },
    bundle: { label: "Pack Completo" },
  },
  gravacao: {
    premium: { label: "Sessão Prática" },
    masterclass: { label: "Masterclass Vídeo" },
    bundle: { label: "Pack IA Completo" },
  },
};

function buildRows(inscritos: Inscrito[], source: "webinar" | "gravacao", showIVA: boolean): PlanRow[] {
  const config = PLAN_CONFIG[source];
  const filtered = inscritos.filter(i => i.registration_source === source && i.plan !== "free");

  return Object.entries(config).map(([plan, { label }]) => {
    const matching = filtered.filter(i => i.plan === plan);
    const paidItems = matching.filter(i => i.payment_status === "paid");
    const pendingItems = matching.filter(i => i.payment_status === "awaiting_payment" || i.payment_status === "selected");
    const groupItems = matching.filter(i => !!i.group_payment_ref);
    const total = paidItems.reduce((s, i) => s + applyIVA(Number(i.valor) || 0, showIVA), 0);
    const avgPrice = paidItems.length > 0 ? (total / paidItems.length) : 0;
    return {
      plan,
      label,
      price: avgPrice > 0 ? `€${avgPrice.toFixed(2)}` : "—",
      paid: paidItems.length,
      pending: pendingItems.length,
      total,
      hasGroup: groupItems.length > 0,
      groupCount: groupItems.length,
    };
  });
}

function PlanTable({ title, rows, receitaConfirmada, ivaLabel }: { title: string; rows: PlanRow[]; receitaConfirmada: number; ivaLabel: string }) {
  const subtotal = rows.reduce((s, r) => s + r.total, 0);

  return (
    <div>
      <h3 className="text-[13px] font-semibold mb-2 text-slate-700">{title}</h3>
      <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto shadow-sm" style={{ WebkitOverflowScrolling: "touch" }}>
        <table className="w-full text-[12px] min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-100">
              {["Plano", `Preço médio (${ivaLabel})`, "Pagos", "Pendentes", `Total (${ivaLabel})`].map(h => (
                <th key={h} className="px-3 py-2 text-left font-medium text-slate-500">{h}</th>
              ))}
              <th className="px-3 py-2 text-left font-medium hidden sm:table-cell"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const pct = receitaConfirmada > 0 ? (r.total / receitaConfirmada) * 100 : 0;
              return (
                <tr key={r.plan} className="border-b border-slate-50">
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {r.label}
                    {r.hasGroup && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-violet-50 text-violet-600">
                        <Users size={9} /> {r.groupCount} grupo
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{r.price}</td>
                  <td className="px-3 py-2" style={{ color: "#22c55e" }}>{r.paid}</td>
                  <td className="px-3 py-2">
                    {r.pending > 0 ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-600">
                        {r.pending}
                      </span>
                    ) : (
                      <span className="text-slate-300">0</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-semibold text-slate-900">€{r.total.toFixed(2)}</td>
                  <td className="px-3 py-2 w-24 hidden sm:table-cell">
                    <div className="h-1.5 rounded-full overflow-hidden bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: "#3b82f6" }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200">
              <td colSpan={4} className="px-3 py-2 font-semibold text-slate-600">Subtotal</td>
              <td className="px-3 py-2 font-bold text-slate-900">€{subtotal.toFixed(2)}</td>
              <td className="hidden sm:table-cell" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default function PlanBreakdown({ inscritos, receitaConfirmada, showIVA }: Props) {
  const convertedReceita = applyIVA(receitaConfirmada, showIVA);
  const preRows = buildRows(inscritos, "webinar", showIVA);
  const postRows = buildRows(inscritos, "gravacao", showIVA);
  const freeCount = inscritos.filter(i => i.plan === "free").length;
  const ivaLabel = showIVA ? "c/ IVA" : "s/ IVA";

  return (
    <div className="space-y-5">
      <h2 className="text-[15px] font-bold text-slate-900">Detalhe por Plano</h2>
      <PlanTable title="Pré-Webinar (Early Bird)" rows={preRows} receitaConfirmada={convertedReceita} ivaLabel={ivaLabel} />
      <PlanTable title="Pós-Webinar (Regular)" rows={postRows} receitaConfirmada={convertedReceita} ivaLabel={ivaLabel} />
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-400">
          Gratuitos: {freeCount} inscritos
        </p>
        <p className="text-[10px] text-slate-400">
          Valores {ivaLabel}
        </p>
      </div>
    </div>
  );
}
