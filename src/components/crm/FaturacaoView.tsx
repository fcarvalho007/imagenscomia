import { editionNames } from "@/lib/course/editions";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Download, RefreshCw } from "lucide-react";
import { useWebinarContext } from "@/contexts/WebinarContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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

/** Remove IVA (23%) from a value that includes it */
export const removeIVA = (v: number) => v / 1.23;
/** Conditionally apply IVA conversion */
export const applyIVA = (v: number, showIVA: boolean) => showIVA ? v : removeIVA(v);

type FaturacaoTab = string;

interface FaturacaoViewProps {
  course?: { edition: string; onEditionChange: (id:string)=>void; onSelectInscrito: (i:Inscrito)=>void };
  inscritos: Inscrito[];
  onRefresh: () => void;
}

const TAB_BASE: { value: FaturacaoTab; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "imagens", label: "Imagens" },
  { value: "video", label: "Vídeo" },
];

export default function FaturacaoView({ inscritos, onRefresh, course }: FaturacaoViewProps) {
  const { webinarContext } = useWebinarContext();
  const [activeTab, setActiveTab] = useState<FaturacaoTab>(() => {
    if (course) return course.edition || "todos";
    if (webinarContext === "consolidado") return "todos";
    return webinarContext as FaturacaoTab;
  });
  const [costs, setCosts] = useState<AcquisitionCost[]>([]);
  const [loadingCosts, setLoadingCosts] = useState(true);
  const [showIVA, setShowIVA] = useState(false);

  useEffect(() => {
    if (course) { setActiveTab(course.edition || "todos"); return; }
    if (webinarContext === "imagens") setActiveTab("imagens");
    else if (webinarContext === "video") setActiveTab("video");
    else if (webinarContext === "consolidado") setActiveTab("todos");
  }, [webinarContext, course?.edition]);

  const tabInscritos = useMemo(() => {
    if (activeTab === "todos") return inscritos;
    return inscritos.filter(i => (course ? i.course?.edition : i.webinar) === activeTab);
  }, [inscritos, activeTab, course]);

  const fetchCosts = useCallback(async () => {
    if (course) { setCosts([]); setLoadingCosts(false); return; }
    setLoadingCosts(true);
    let query = supabase.from("acquisition_costs" as any).select("*").order("cost_date", { ascending: false });
    if (activeTab !== "todos") {
      query = query.eq("webinar", activeTab);
    }
    const { data } = await query;
    setCosts((data as any as AcquisitionCost[]) || []);
    setLoadingCosts(false);
  }, [activeTab, !!course]);

  useEffect(() => { fetchCosts(); }, [fetchCosts]);

  const paid = useMemo(() => tabInscritos.filter(i => i.payment_status === "paid"), [tabInscritos]);
  const pending = useMemo(() => tabInscritos.filter(i => (i.payment_status === "awaiting_payment" || i.payment_status === "selected") && !i.lost_at), [tabInscritos]);
  const receitaConfirmada = useMemo(() => paid.reduce((s, i) => s + i.valor, 0), [paid]);
  const pipelinePendente = useMemo(() => pending.reduce((s, i) => s + i.valor, 0), [pending]);
  const totalCosts = useMemo(() => costs.reduce((s, c) => s + Number(c.amount), 0), [costs]);
  const paidMediaCosts = useMemo(() => costs.filter(c => c.category === "paid_media").reduce((s, c) => s + Number(c.amount), 0), [costs]);

  const paidCountImagens = useMemo(() => inscritos.filter(i => i.webinar === "imagens" && i.payment_status === "paid").length, [inscritos]);
  const paidCountVideo = useMemo(() => inscritos.filter(i => i.webinar === "video" && i.payment_status === "paid").length, [inscritos]);
  const tabOptions = useMemo(() => course ? [{value:"todos",label:"Todas as edições"},...Object.entries(editionNames).map(([value,label])=>({value,label}))] : TAB_BASE.map(t => ({
    ...t,
    label: t.value === "todos" ? `Todos (${paidCountImagens + paidCountVideo})` : t.value === "imagens" ? `Imagens (${paidCountImagens})` : `Vídeo (${paidCountVideo})`,
  })), [paidCountImagens, paidCountVideo, !!course]);

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
      ["Nome", "Email", course ? "Edição" : "Plano", "Valor com IVA", "Fatura"],
      ...paid.map(i => [i.nome, i.email, i.course?.editionLabel || i.plan, String(i.valor), i.invoice_document_id || "—"]),
    ];
    const csv = '\uFEFF' + rows.map(r=>r.map(v=>'"'+String(v??'').replace(/^[=+@-]/," '$&").replace(/"/g,'""')+'"').join(';')).join('\r\n');
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `faturacao-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ivaLabel = showIVA ? "c/ IVA" : "s/ IVA";

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              Faturação
            </h1>
            <p className="text-[13px] text-slate-500">
              Receitas, custos e emissão de faturas
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* IVA Toggle */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm">
              <span className={`text-[11px] font-medium ${!showIVA ? "text-slate-900" : "text-slate-400"}`}>s/ IVA</span>
              <Switch checked={showIVA} onCheckedChange={setShowIVA} className="h-5 w-9 data-[state=checked]:bg-slate-700 data-[state=unchecked]:bg-slate-300" />
              <span className={`text-[11px] font-medium ${showIVA ? "text-slate-900" : "text-slate-400"}`}>c/ IVA</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => { onRefresh(); fetchCosts(); }} className="h-8 text-[12px] gap-1.5">
              <RefreshCw size={13} /> Atualizar
            </Button>
            <Button size="sm" variant="outline" onClick={exportCSV} className="h-8 text-[12px] gap-1.5">
              <Download size={13} /> CSV
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 rounded-lg p-1 bg-white border border-slate-200">
          {tabOptions.map(tab => (
            <button
              key={tab.value}
              onClick={() => course ? course.onEditionChange(tab.value === "todos" ? "" : tab.value) : setActiveTab(tab.value)}
              className={`px-3 sm:px-4 py-1.5 rounded-md text-[12px] sm:text-[13px] font-medium transition-all ${
                activeTab === tab.value
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
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
          showIVA={showIVA}
          costsKnown={!course}
        />

        <FaturacaoCharts
          receitaConfirmada={receitaConfirmada}
          pipelinePendente={pipelinePendente}
          totalCosts={totalCosts}
          inscritos={tabInscritos}
          costs={costs}
          showIVA={showIVA}
          costsKnown={!course}
        />

        {!course && <PlanBreakdown inscritos={tabInscritos} receitaConfirmada={receitaConfirmada} showIVA={showIVA} />}

{!course && <>
        <CostsSection
          costs={costs}
          loading={loadingCosts}
          numPagamentos={paid.length}
          receitaConfirmada={receitaConfirmada}
          paidMediaCosts={paidMediaCosts}
          onRefresh={fetchCosts}
          showWebinarColumn={activeTab === "todos"}
          showIVA={showIVA}
        />
</>}
        <InvoiceTable inscritos={paid} onRefresh={onRefresh} webinarFilter={webinarForEdgeFunction} showIVA={showIVA} course={course ? {onSelect:course.onSelectInscrito} : undefined} />

        {!course && <PLSummary
          receitaConfirmada={receitaConfirmada}
          pipelinePendente={pipelinePendente}
          costs={costs}
          totalCosts={totalCosts}
          inscritos={tabInscritos}
          showIVA={showIVA}
        />}
      </div>
    </div>
  );
}
