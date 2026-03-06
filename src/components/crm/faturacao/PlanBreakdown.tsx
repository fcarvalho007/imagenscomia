import type { Inscrito } from "@/pages/crm/mockData";
import { Users } from "lucide-react";

interface Props {
  inscritos: Inscrito[];
  receitaConfirmada: number;
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

function buildRows(inscritos: Inscrito[], source: "webinar" | "gravacao"): PlanRow[] {
  const config = PLAN_CONFIG[source];
  const filtered = inscritos.filter(i => i.registration_source === source && i.plan !== "free");

  return Object.entries(config).map(([plan, { label }]) => {
    const matching = filtered.filter(i => i.plan === plan);
    const paidItems = matching.filter(i => i.payment_status === "paid");
    const pendingItems = matching.filter(i => i.payment_status === "awaiting_payment" || i.payment_status === "selected");
    const groupItems = matching.filter(i => !!i.group_payment_ref);
    // Use actual paid amounts instead of static price × count
    const total = paidItems.reduce((s, i) => s + (Number(i.valor) || 0), 0);
    // Show average price per unit if there are paid items
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

function PlanTable({ title, rows, receitaConfirmada }: { title: string; rows: PlanRow[]; receitaConfirmada: number }) {
  const subtotal = rows.reduce((s, r) => s + r.total, 0);

  return (
    <div>
      <h3 className="text-[13px] font-semibold mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>{title}</h3>
      <div className="rounded-lg border overflow-x-auto" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", WebkitOverflowScrolling: "touch" }}>
        <table className="w-full text-[12px] min-w-[500px]">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Plano", "Preço médio", "Pagos", "Pendentes", "Total (€)"].map(h => (
                <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>{h}</th>
              ))}
              <th className="px-3 py-2 text-left font-medium hidden sm:table-cell" style={{ color: "rgba(255,255,255,0.4)" }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const pct = receitaConfirmada > 0 ? (r.total / receitaConfirmada) * 100 : 0;
              return (
                <tr key={r.plan} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-3 py-2 font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {r.label}
                    {r.hasGroup && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold"
                        style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
                        <Users size={9} /> {r.groupCount} grupo
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2" style={{ color: "rgba(255,255,255,0.6)" }}>{r.price}</td>
                  <td className="px-3 py-2" style={{ color: "#22c55e" }}>{r.paid}</td>
                  <td className="px-3 py-2">
                    {r.pending > 0 ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
                        {r.pending}
                      </span>
                    ) : (
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>0</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>€{r.total.toFixed(2)}</td>
                  <td className="px-3 py-2 w-24 hidden sm:table-cell">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: "#3b82f6" }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <td colSpan={4} className="px-3 py-2 font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Subtotal</td>
              <td className="px-3 py-2 font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>€{subtotal.toFixed(2)}</td>
              <td className="hidden sm:table-cell" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default function PlanBreakdown({ inscritos, receitaConfirmada }: Props) {
  const preRows = buildRows(inscritos, "webinar");
  const postRows = buildRows(inscritos, "gravacao");
  const freeCount = inscritos.filter(i => i.plan === "free").length;

  return (
    <div className="space-y-5">
      <h2 className="text-[15px] font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>Detalhe por Plano</h2>
      <PlanTable title="Pré-Webinar (Early Bird)" rows={preRows} receitaConfirmada={receitaConfirmada} />
      <PlanTable title="Pós-Webinar (Regular)" rows={postRows} receitaConfirmada={receitaConfirmada} />
      <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
        Gratuitos: {freeCount} inscritos
      </p>
    </div>
  );
}
