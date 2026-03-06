import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, TrendingUp, DollarSign, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AcquisitionCost } from "@/components/crm/FaturacaoView";
import CostModal from "@/components/crm/faturacao/CostModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  costs: AcquisitionCost[];
  loading: boolean;
  numPagamentos: number;
  receitaConfirmada: number;
  paidMediaCosts: number;
  onRefresh: () => void;
}

const fmt = (v: number) => v.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CostsSection({ costs, loading, numPagamentos, receitaConfirmada, paidMediaCosts, onRefresh }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<AcquisitionCost | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const totalCosts = costs.reduce((s, c) => s + Number(c.amount), 0);
  const cac = numPagamentos > 0 ? totalCosts / numPagamentos : 0;
  const roas = paidMediaCosts > 0 ? receitaConfirmada / paidMediaCosts : 0;

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este custo?")) return;
    setDeleting(id);
    await supabase.from("acquisition_costs" as any).delete().eq("id", id);
    toast({ title: "Custo eliminado" });
    onRefresh();
    setDeleting(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>Custos de Aquisição</h2>
        <div className="flex items-center gap-2">
          {costs.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => {
              const header = "Plataforma,Descrição,Valor,Data,Categoria,Webinar";
              const rows = costs.map(c => `"${c.platform}","${c.description || ""}",${c.amount},"${c.cost_date}","${c.category}","${(c as any).webinar || ""}"`);
              const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
              const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "custos.csv"; a.click();
            }} className="h-8 text-[12px] gap-1.5">
              <Download size={13} /> CSV
            </Button>
          )}
          <Button size="sm" onClick={() => { setEditingCost(null); setModalOpen(true); }} className="h-8 text-[12px] gap-1.5">
            <Plus size={13} /> Adicionar Custo
          </Button>
        </div>
      </div>

      {/* Cost metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Custos", value: `€${fmt(totalCosts)}`, icon: DollarSign, color: "#ef4444" },
          { label: "Custos Paid Media", value: `€${fmt(paidMediaCosts)}`, icon: DollarSign, color: "#f59e0b" },
          { label: "CAC", value: `€${fmt(cac)}`, icon: TrendingUp, color: "#8b5cf6" },
          { label: "ROAS", value: roas > 0 ? `${roas.toFixed(2)}×` : "—", icon: TrendingUp, color: "#22c55e" },
        ].map(c => (
          <div key={c.label} className="rounded-lg p-3 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-1 mb-1">
              <c.icon size={12} style={{ color: c.color }} />
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{c.label}</span>
            </div>
            <p className="text-base font-bold" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Costs table */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin" style={{ color: "rgba(255,255,255,0.3)" }} /></div>
      ) : costs.length === 0 ? (
        <p className="text-[12px] py-4 text-center" style={{ color: "rgba(255,255,255,0.35)" }}>Nenhum custo registado.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Plataforma", "Descrição", "Valor", "Data", "Categoria", ""].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {costs.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-3 py-2 font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{c.platform}</td>
                  <td className="px-3 py-2" style={{ color: "rgba(255,255,255,0.6)" }}>{c.description || "—"}</td>
                  <td className="px-3 py-2 font-semibold" style={{ color: "#ef4444" }}>€{Number(c.amount).toFixed(2)}</td>
                  <td className="px-3 py-2" style={{ color: "rgba(255,255,255,0.5)" }}>{c.cost_date}</td>
                  <td className="px-3 py-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                      {c.category}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingCost(c); setModalOpen(true); }} className="p-1 rounded hover:bg-white/10 transition-colors">
                        <Pencil size={12} style={{ color: "rgba(255,255,255,0.4)" }} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id} className="p-1 rounded hover:bg-red-500/10 transition-colors">
                        {deleting === c.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} style={{ color: "rgba(239,68,68,0.6)" }} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <td colSpan={2} className="px-3 py-2 font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Total</td>
                <td className="px-3 py-2 font-bold" style={{ color: "#ef4444" }}>€{totalCosts.toFixed(2)}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {modalOpen && (
        <CostModal
          cost={editingCost}
          onClose={() => { setModalOpen(false); setEditingCost(null); }}
          onSaved={() => { setModalOpen(false); setEditingCost(null); onRefresh(); }}
        />
      )}
    </div>
  );
}
