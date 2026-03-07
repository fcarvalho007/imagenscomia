import { useState } from "react";
import { FileText, Send, Loader2, CheckCircle, AlertCircle, Circle, FilePlus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Inscrito } from "@/pages/crm/mockData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  inscritos: Inscrito[];
  onRefresh: () => void;
  webinarFilter: string; // "all" | "imagens" | "video"
}

type InvoiceState = "none" | "draft" | "sent" | "error";

function getInvoiceState(i: Inscrito): InvoiceState {
  if (i.invoice_sent) return "sent";
  if (i.invoice_document_id) return "draft";
  return "none";
}

const STATE_CONFIG: Record<InvoiceState, { icon: typeof Circle; color: string; label: string }> = {
  none: { icon: Circle, color: "rgba(255,255,255,0.3)", label: "Sem fatura" },
  draft: { icon: FilePlus, color: "#f59e0b", label: "Rascunho" },
  sent: { icon: CheckCircle, color: "#22c55e", label: "Emitida" },
  error: { icon: AlertCircle, color: "#ef4444", label: "Erro" },
};

export default function InvoiceTable({ inscritos, onRefresh, webinarFilter }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkRunning, setBulkRunning] = useState<"drafts" | "finalize" | "emit" | null>(null);
  const [individualLoading, setIndividualLoading] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === inscritos.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(inscritos.map(i => i.id)));
    }
  };

  const handleBulkDrafts = async () => {
    if (!confirm("Criar rascunhos para todos os pagantes sem fatura?")) return;
    setBulkRunning("drafts");
    try {
      const { data, error } = await supabase.functions.invoke("bulk-create-invoices", {
        body: { webinar: webinarFilter },
      });
      if (error) throw error;
      toast({ title: `${data.created} rascunhos criados`, description: `${data.errors?.length || 0} erros` });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setBulkRunning(null);
    }
  };

  const handleBulkFinalize = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) { toast({ title: "Seleciona pelo menos um inscrito" }); return; }
    if (!confirm(`Confirmar e enviar ${ids.length} faturas?`)) return;
    setBulkRunning("finalize");
    try {
      const { data, error } = await supabase.functions.invoke("bulk-finalize-invoices", {
        body: { registration_ids: ids },
      });
      if (error) throw error;
      const errCount = data.errors?.length || 0;
      const errEmails = (data.errors || []).map((e: any) => e.email).filter(Boolean).join(", ");
      toast({
        title: `${data.finalized} faturas emitidas e enviadas`,
        description: errCount > 0 ? `${errCount} erro(s): ${errEmails || "ver detalhes"}` : "Sem erros",
        variant: errCount > 0 ? "destructive" : "default",
      });
      setSelected(new Set());
      onRefresh();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setBulkRunning(null);
    }
  };

  const handleBulkEmit = async () => {
    const label = webinarFilter === "all" ? "TODOS os webinars" : `webinar "${webinarFilter}"`;
    if (!confirm(`Emitir faturas para TODOS os pagantes sem fatura de ${label}?\n\nRegistos COM NIF: emissão completa + envio email.\nRegistos SEM NIF: apenas rascunho (para completar depois).`)) return;
    setBulkRunning("emit");
    try {
      const { data, error } = await supabase.functions.invoke("bulk-emit-invoices", {
        body: { webinar: webinarFilter },
      });
      if (error) throw error;
      const errCount = data.errors?.length || 0;
      const drafts = data.draftsOnly || 0;
      const parts = [`${data.emitted} emitidas e enviadas`];
      if (drafts > 0) parts.push(`${drafts} rascunhos (sem NIF)`);
      if (errCount > 0) parts.push(`${errCount} erro(s)`);
      toast({
        title: parts[0],
        description: parts.slice(1).join(" · ") || `${data.total} total`,
        variant: errCount > 0 ? "destructive" : "default",
      });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setBulkRunning(null);
    }
  };

  const handleIndividual = async (id: string, draftOnly: boolean) => {
    setIndividualLoading(id);
    try {
      const { data, error } = await supabase.functions.invoke("create-invoice", {
        body: { registration_id: id, send_email: !draftOnly, draft_only: draftOnly },
      });
      if (error) throw error;
      toast({ title: draftOnly ? "Rascunho criado" : "Fatura emitida e enviada", description: `#${data.document_id}` });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setIndividualLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-[15px] font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>
          Faturação · InvoiceExpress
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={handleBulkDrafts} disabled={bulkRunning !== null} className="h-8 text-[11px] sm:text-[12px] gap-1.5">
            {bulkRunning === "drafts" ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
            Gerar Rascunhos
          </Button>
          <Button size="sm" variant="outline" onClick={handleBulkFinalize} disabled={bulkRunning !== null || selected.size === 0} className="h-8 text-[11px] sm:text-[12px] gap-1.5">
            {bulkRunning === "finalize" ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Enviar ({selected.size})
          </Button>
          <Button size="sm" onClick={handleBulkEmit} disabled={bulkRunning !== null} className="h-8 text-[11px] sm:text-[12px] gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
            {bulkRunning === "emit" ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
            Emitir e Enviar Todas
          </Button>
        </div>
      </div>

      <div className="rounded-lg border overflow-x-auto" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", WebkitOverflowScrolling: "touch" }}>
        <table className="w-full text-[12px] min-w-[600px]">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <th className="px-3 py-2 w-8">
                <Checkbox checked={selected.size === inscritos.length && inscritos.length > 0} onCheckedChange={toggleAll} />
              </th>
              <th className="px-3 py-2 text-left font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Nome</th>
              <th className="px-3 py-2 text-left font-medium hidden md:table-cell" style={{ color: "rgba(255,255,255,0.4)" }}>Email</th>
              <th className="px-3 py-2 text-left font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Plano</th>
              <th className="px-3 py-2 text-left font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Valor</th>
              <th className="px-3 py-2 text-left font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Estado</th>
              <th className="px-3 py-2 text-left font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {inscritos.map(i => {
              const state = getInvoiceState(i);
              const cfg = STATE_CONFIG[state];
              const Icon = cfg.icon;
              return (
                <tr key={i.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-3 py-2"><Checkbox checked={selected.has(i.id)} onCheckedChange={() => toggleSelect(i.id)} /></td>
                  <td className="px-3 py-2 font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{i.nome}</td>
                  <td className="px-3 py-2 hidden md:table-cell" style={{ color: "rgba(255,255,255,0.5)" }}>{i.email}</td>
                  <td className="px-3 py-2" style={{ color: "rgba(255,255,255,0.6)" }}>{i.plan}</td>
                  <td className="px-3 py-2 font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>€{i.valor.toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium">
                      <Icon size={12} style={{ color: cfg.color }} />
                      <span style={{ color: cfg.color }}>{cfg.label}</span>
                      {i.invoice_document_id && <span className="hidden sm:inline" style={{ color: "rgba(255,255,255,0.3)" }}>#{i.invoice_document_id}</span>}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {individualLoading === i.id ? (
                      <Loader2 size={13} className="animate-spin" style={{ color: "rgba(255,255,255,0.4)" }} />
                    ) : state === "sent" ? (
                      <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
                    ) : state === "draft" ? (
                      <button onClick={() => handleIndividual(i.id, false)} className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                        Emitir
                      </button>
                    ) : (
                      <div className="flex gap-1">
                        <button onClick={() => handleIndividual(i.id, true)} className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
                          Rascunho
                        </button>
                        <button onClick={() => handleIndividual(i.id, false)} className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                          Emitir
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {inscritos.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>Nenhum pagamento confirmado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
