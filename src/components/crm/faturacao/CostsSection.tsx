import { editionNames } from "@/lib/course/editions";
import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, TrendingUp, Euro, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AcquisitionCost } from "@/components/crm/FaturacaoView";
import { applyIVA } from "@/components/crm/FaturacaoView";
import CostModal from "@/components/crm/faturacao/CostModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import WebinarBadge from "@/components/crm/WebinarBadge";

interface Props {
  courseEdition?: string;
  costs: AcquisitionCost[];
  loading: boolean;
  numPagamentos: number;
  receitaConfirmada: number;
  paidMediaCosts: number;
  onRefresh: () => void;
  showWebinarColumn?: boolean;
  showIVA: boolean;
}

const fmt = (v: number) => v.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CostsSection({ costs, loading, numPagamentos, receitaConfirmada, paidMediaCosts, onRefresh, showWebinarColumn, showIVA, courseEdition }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<AcquisitionCost | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const totalCosts = costs.reduce((s, c) => s + Number(c.amount), 0);
  const receita = applyIVA(receitaConfirmada, showIVA);
  const cac = numPagamentos > 0 ? totalCosts / numPagamentos : 0;
  const roas = paidMediaCosts > 0 ? receita / paidMediaCosts : 0;

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este custo?")) return;
    setDeleting(id);
    try {
      const {error}=courseEdition !== undefined ? await (supabase as any).rpc("delete_course_cost",{cost_id:id}) : await supabase.from("acquisition_costs" as any).delete().eq("id", id);
      if(error) throw error;
    } catch {toast({title:"Não foi possível eliminar o custo.",variant:"destructive"});setDeleting(null);return;}
    toast({ title: "Custo eliminado" });
    onRefresh();
    setDeleting(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-[15px] font-bold text-slate-900">Custos registados · s/ IVA</h2>
        <div className="flex items-center gap-2">
          {costs.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => {
              const rows = [["Plataforma","Descrição","Valor sem IVA","Data","Categoria",courseEdition !== undefined ? "Edição" : "Webinar"],...costs.map(c=>[c.platform,c.description,c.amount,c.cost_date,c.category,c.webinar])];
              const csv="\uFEFF"+rows.map(row=>row.map(v=>'"'+String(v??'').replace(/^[=+@-]/," '$&").replace(/"/g,'""')+'"').join(';')).join('\r\n');
              const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
              const a=document.createElement("a");a.href=url;a.download="custos.csv";a.click();URL.revokeObjectURL(url);
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
          { label: "Total Custos", value: `€${fmt(totalCosts)}`, icon: Euro, color: "#ef4444" },
          { label: "Custos Paid Media", value: `€${fmt(paidMediaCosts)}`, icon: Euro, color: "#f59e0b" },
          { label: "CAC", value: `€${fmt(cac)}`, icon: TrendingUp, color: "#8b5cf6" },
          { label: "ROAS", value: roas > 0 ? `${roas.toFixed(2)}×` : "—", icon: TrendingUp, color: "#22c55e" },
        ].map(c => (
          <div key={c.label} className="rounded-lg p-3 bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-1 mb-1">
              <c.icon size={12} style={{ color: c.color }} />
              <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-slate-500">{c.label}</span>
            </div>
            <p className="text-sm sm:text-base font-bold" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Costs table */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-slate-300" /></div>
      ) : costs.length === 0 ? (
        <p className="text-[12px] py-4 text-center text-slate-400">Nenhum custo registado.</p>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto shadow-sm" style={{ WebkitOverflowScrolling: "touch" }}>
          <table className="w-full text-[12px] min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-3 py-2 text-left font-medium text-slate-500">Plataforma</th>
                <th className="px-3 py-2 text-left font-medium hidden md:table-cell text-slate-500">Descrição</th>
                <th className="px-3 py-2 text-left font-medium text-slate-500">Valor</th>
                <th className="px-3 py-2 text-left font-medium text-slate-500">Data</th>
                <th className="px-3 py-2 text-left font-medium text-slate-500">Categoria</th>
                {showWebinarColumn && <th className="px-3 py-2 text-left font-medium text-slate-500">{courseEdition !== undefined ? "Edição" : "Webinar"}</th>}
                <th className="px-3 py-2 text-left font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {costs.map(c => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2 font-medium text-slate-900">{c.platform}</td>
                  <td className="px-3 py-2 hidden md:table-cell text-slate-600">{c.description || "—"}</td>
                  <td className="px-3 py-2 font-semibold" style={{ color: "#ef4444" }}>€{Number(c.amount).toFixed(2)}</td>
                  <td className="px-3 py-2 text-slate-500">{c.cost_date}</td>
                  <td className="px-3 py-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                      {c.category}
                    </span>
                  </td>
                  {showWebinarColumn && <td className="px-3 py-2">{courseEdition !== undefined ? editionNames[c.webinar] : <WebinarBadge webinar={c.webinar} />}</td>}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingCost(c); setModalOpen(true); }} className="p-1 rounded hover:bg-slate-100 transition-colors">
                        <Pencil size={12} className="text-slate-400" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id} className="p-1 rounded hover:bg-red-50 transition-colors">
                        {deleting === c.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} className="text-red-400" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200">
                <td className="px-3 py-2 font-semibold text-slate-600">Total</td>
                <td className="hidden md:table-cell" />
                <td className="px-3 py-2 font-bold" style={{ color: "#ef4444" }}>€{totalCosts.toFixed(2)}</td>
                <td colSpan={showWebinarColumn ? 4 : 3} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {modalOpen && (
        <CostModal
          courseEdition={courseEdition}
          cost={editingCost}
          onClose={() => { setModalOpen(false); setEditingCost(null); }}
          onSaved={() => { setModalOpen(false); setEditingCost(null); onRefresh(); }}
        />
      )}
    </div>
  );
}
