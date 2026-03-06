import { useState, useEffect, useCallback, useMemo } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Inscrito } from "@/pages/crm/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useWebinarContext } from "@/contexts/WebinarContext";
import FaturacaoKPIs from "@/components/crm/faturacao/FaturacaoKPIs";
import FaturacaoCharts from "@/components/crm/faturacao/FaturacaoCharts";
import PlanBreakdown from "@/components/crm/faturacao/PlanBreakdown";
import CostsSection from "@/components/crm/faturacao/CostsSection";
import InvoiceTable from "@/components/crm/faturacao/InvoiceTable";
import PLSummary from "@/components/crm/faturacao/PLSummary";

export interface AcquisitionCost {
  id: string;
  platform: string;
  description: string;
  amount: number;
  cost_date: string;
  category: string;
  webinar: string;
}

interface FaturacaoViewProps {
  inscritos: Inscrito[];
  onRefresh: () => void;
}

export default function FaturacaoView({ inscritos, onRefresh }: FaturacaoViewProps) {
  const { webinarContext } = useWebinarContext();
  const [costs, setCosts] = useState<AcquisitionCost[]>([]);
  const [loadingCosts, setLoadingCosts] = useState(true);

  const fetchCosts = useCallback(async () => {
    setLoadingCosts(true);
    let query = supabase.from("acquisition_costs" as any).select("*").order("cost_date", { ascending: false });
    if (webinarContext !== "consolidado") {
      query = query.eq("webinar", webinarContext);
    }
    const { data } = await query;
    setCosts((data as any as AcquisitionCost[]) || []);
    setLoadingCosts(false);
  }, [webinarContext]);

  useEffect(() => { fetchCosts(); }, [fetchCosts]);

  const paid = useMemo(() => inscritos.filter(i => i.payment_status === "paid"), [inscritos]);
  const pending = useMemo(() => inscritos.filter(i => i.payment_status === "awaiting_payment" || i.payment_status === "selected"), [inscritos]);
  const receitaConfirmada = useMemo(() => paid.reduce((s, i) => s + i.valor, 0), [paid]);
  const pipelinePendente = useMemo(() => pending.reduce((s, i) => s + i.valor, 0), [pending]);
  const totalCosts = useMemo(() => costs.reduce((s, c) => s + Number(c.amount), 0), [costs]);
  const paidMediaCosts = useMemo(() => costs.filter(c => c.category === "paid_media").reduce((s, c) => s + Number(c.amount), 0), [costs]);

  const exportCSV = () => {
    const rows = [
      ["Métrica", "Valor"],
      ["Receita Confirmada", receitaConfirmada.toFixed(2)],
      ["Pipeline Pendente", pipelinePendente.toFixed(2)],
      ["Total Custos", totalCosts.toFixed(2)],
      ["Margem", (receitaConfirmada - totalCosts).toFixed(2)],
      [],
      ["Custos de Aquisição"],
      ["Plataforma", "Descrição", "Valor", "Data", "Categoria"],
      ...costs.map(c => [c.platform, c.description, String(c.amount), c.cost_date, c.category]),
      [],
      ["Pagantes"],
      ["Nome", "Email", "Plano", "Valor", "Fatura"],
      ...paid.map(i => [i.nome, i.email, i.plan, String(i.valor), i.invoice_document_id || "—"]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `faturacao-${webinarContext}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: "rgba(255,255,255,0.92)" }}>
            Faturação
          </h1>
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.45)" }}>
            Receitas, custos e emissão de faturas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => { onRefresh(); fetchCosts(); }} className="h-8 text-[12px] gap-1.5">
            <RefreshCw size={13} /> Atualizar
          </Button>
          <Button size="sm" variant="outline" onClick={exportCSV} className="h-8 text-[12px] gap-1.5">
            <Download size={13} /> CSV
          </Button>
        </div>
      </div>

      <FaturacaoKPIs
        receitaConfirmada={receitaConfirmada}
        pipelinePendente={pipelinePendente}
        numPagamentos={paid.length}
        totalCosts={totalCosts}
        paidMediaCosts={paidMediaCosts}
      />

      <FaturacaoCharts
        receitaConfirmada={receitaConfirmada}
        pipelinePendente={pipelinePendente}
        totalCosts={totalCosts}
        inscritos={inscritos}
        costs={costs}
      />

      <PlanBreakdown inscritos={inscritos} receitaConfirmada={receitaConfirmada} />

      <CostsSection
        costs={costs}
        loading={loadingCosts}
        numPagamentos={paid.length}
        receitaConfirmada={receitaConfirmada}
        paidMediaCosts={paidMediaCosts}
        onRefresh={fetchCosts}
      />

      <InvoiceTable inscritos={paid} onRefresh={onRefresh} />

      <PLSummary
        receitaConfirmada={receitaConfirmada}
        pipelinePendente={pipelinePendente}
        costs={costs}
        totalCosts={totalCosts}
        inscritos={inscritos}
      />
    </div>
  );
}
