import { useState, useEffect, useCallback, useMemo } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Inscrito } from "@/pages/crm/mockData";
import { supabase } from "@/integrations/supabase/client";
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

type FaturacaoTab = "todos" | "imagens" | "video";

interface FaturacaoViewProps {
  inscritos: Inscrito[];
  onRefresh: () => void;
}

const TAB_OPTIONS: { value: FaturacaoTab; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "imagens", label: "Imagens" },
  { value: "video", label: "Vídeo" },
];

export default function FaturacaoView({ inscritos, onRefresh }: FaturacaoViewProps) {
  const [activeTab, setActiveTab] = useState<FaturacaoTab>("todos");
  const [costs, setCosts] = useState<AcquisitionCost[]>([]);
  const [loadingCosts, setLoadingCosts] = useState(true);

  // Filter inscritos by active tab
  const tabInscritos = useMemo(() => {
    if (activeTab === "todos") return inscritos;
    return inscritos.filter(i => i.webinar === activeTab);
  }, [inscritos, activeTab]);

  const fetchCosts = useCallback(async () => {
    setLoadingCosts(true);
    let query = supabase.from("acquisition_costs" as any).select("*").order("cost_date", { ascending: false });
    if (activeTab !== "todos") {
      query = query.eq("webinar", activeTab);
    }
    const { data } = await query;
    setCosts((data as any as AcquisitionCost[]) || []);
    setLoadingCosts(false);
  }, [activeTab]);

  useEffect(() => { fetchCosts(); }, [fetchCosts]);

  const paid = useMemo(() => tabInscritos.filter(i => i.payment_status === "paid"), [tabInscritos]);
  const pending = useMemo(() => tabInscritos.filter(i => i.payment_status === "awaiting_payment" || i.payment_status === "selected"), [tabInscritos]);
  const receitaConfirmada = useMemo(() => paid.reduce((s, i) => s + i.valor, 0), [paid]);
  const pipelinePendente = useMemo(() => pending.reduce((s, i) => s + i.valor, 0), [pending]);
  const totalCosts = useMemo(() => costs.reduce((s, c) => s + Number(c.amount), 0), [costs]);
  const paidMediaCosts = useMemo(() => costs.filter(c => c.category === "paid_media").reduce((s, c) => s + Number(c.amount), 0), [costs]);

  const webinarForEdgeFunction = activeTab === "todos" ? "all" : activeTab;

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
    a.download = `faturacao-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen" style={{ background: "#0F172A" }}>
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

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg p-1" style={{ background: "rgba(255,255,255,0.04)" }}>
          {TAB_OPTIONS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className="px-4 py-1.5 rounded-md text-[13px] font-medium transition-all"
              style={{
                background: activeTab === tab.value ? "rgba(255,255,255,0.1)" : "transparent",
                color: activeTab === tab.value ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.4)",
              }}
            >
              {tab.label}
            </button>
          ))}
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
          inscritos={tabInscritos}
          costs={costs}
        />

        <PlanBreakdown inscritos={tabInscritos} receitaConfirmada={receitaConfirmada} />

        <CostsSection
          costs={costs}
          loading={loadingCosts}
          numPagamentos={paid.length}
          receitaConfirmada={receitaConfirmada}
          paidMediaCosts={paidMediaCosts}
          onRefresh={fetchCosts}
        />

        <InvoiceTable inscritos={paid} onRefresh={onRefresh} webinarFilter={webinarForEdgeFunction} />

        <PLSummary
          receitaConfirmada={receitaConfirmada}
          pipelinePendente={pipelinePendente}
          costs={costs}
          totalCosts={totalCosts}
          inscritos={tabInscritos}
        />
      </div>
    </div>
  );
}
