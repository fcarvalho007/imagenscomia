import { useState, useEffect, useMemo } from "react";
import { FileText, Send, Loader2, CheckCircle, AlertCircle, Circle, FilePlus, Zap, AlertTriangle, ChevronDown, Mail, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Inscrito } from "@/pages/crm/mockData";
import { supabase } from "@/integrations/supabase/client";
import WebinarBadge from "@/components/crm/WebinarBadge";
import { toast } from "@/hooks/use-toast";
import { applyIVA } from "@/components/crm/FaturacaoView";

const PLAN_LABELS: Record<string, string> = {
  premium: "Premium Pass",
  masterclass: "Masterclass",
  bundle: "Pack Completo",
  gravacao: "Gravação",
  video_premium: "Vídeo Premium",
};

interface Props {
  inscritos: Inscrito[];
  onRefresh: () => void;
  webinarFilter: string;
  showIVA: boolean;
}

type InvoiceState = "none" | "draft" | "sent" | "error";

function getInvoiceState(i: Inscrito): InvoiceState {
  if (i.invoice_sent) return "sent";
  if (i.invoice_document_id) return "draft";
  return "none";
}

const STATE_CONFIG: Record<InvoiceState, { icon: typeof Circle; color: string; label: string }> = {
  none: { icon: Circle, color: "#94A3B8", label: "Sem fatura" },
  draft: { icon: FilePlus, color: "#f59e0b", label: "Rascunho" },
  sent: { icon: CheckCircle, color: "#22c55e", label: "Emitida" },
  error: { icon: AlertCircle, color: "#ef4444", label: "Erro" },
};

const DEFAULT_EMAIL_SUBJECT = "Fatura-Recibo — {{plano}}";
const DEFAULT_EMAIL_BODY = "Olá {{nome}},\n\nSegue em anexo a sua fatura-recibo referente ao serviço subscrito.\n\nMuito obrigado pela confiança! Este documento foi emitido pela Fomentar Sonhos, Lda. — a empresa por detrás das formações do Frederico Carvalho.\n\nSe tiver qualquer questão, não hesite em responder a este email.\n\nCom os melhores cumprimentos,\nFrederico Carvalho\nFomentar Sonhos";

export default function InvoiceTable({ inscritos, onRefresh, webinarFilter, showIVA }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkRunning, setBulkRunning] = useState<"drafts" | "finalize" | "emit" | null>(null);
  const [individualLoading, setIndividualLoading] = useState<string | null>(null);
  const [idsWithNif, setIdsWithNif] = useState<Set<string>>(new Set());
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState(DEFAULT_EMAIL_SUBJECT);
  const [emailBody, setEmailBody] = useState(DEFAULT_EMAIL_BODY);

  useEffect(() => {
    if (inscritos.length === 0) return;
    const ids = inscritos.map(i => i.id);
    supabase
      .from("invoice_details")
      .select("registration_id")
      .in("registration_id", ids)
      .then(({ data }) => {
        if (data) setIdsWithNif(new Set(data.map((d: any) => d.registration_id)));
      });
  }, [inscritos]);

  const sentCount = inscritos.filter(i => i.invoice_sent).length;
  const pendingCount = inscritos.filter(i => !i.invoice_sent).length;
  const missingNifCount = inscritos.filter(i => !idsWithNif.has(i.id)).length;

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

  const emailParams = () => ({
    ...(emailSubject !== DEFAULT_EMAIL_SUBJECT ? { email_subject: emailSubject } : {}),
    ...(emailBody !== DEFAULT_EMAIL_BODY ? { email_body: emailBody } : {}),
  });

  const handleBulkDrafts = async () => {
    if (!confirm("Criar rascunhos de fatura-recibo para todos os pagantes sem fatura?")) return;
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
    if (!confirm(`Finalizar e enviar fatura-recibo a ${ids.length} cliente(s)?`)) return;
    setBulkRunning("finalize");
    try {
      const { data, error } = await supabase.functions.invoke("bulk-finalize-invoices", {
        body: { registration_ids: ids, ...emailParams() },
      });
      if (error) throw error;
      const errCount = data.errors?.length || 0;
      const errEmails = (data.errors || []).map((e: any) => e.email).filter(Boolean).join(", ");
      toast({
        title: `${data.finalized} faturas-recibo emitidas e enviadas`,
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
    if (!confirm(`Emitir fatura-recibo e enviar por email a TODOS os pagantes sem fatura de ${label}?\n\nRegistos COM NIF: emissão completa + envio email.\nRegistos SEM NIF: apenas rascunho (para completar depois).`)) return;
    setBulkRunning("emit");
    try {
      const { data, error } = await supabase.functions.invoke("bulk-emit-invoices", {
        body: { webinar: webinarFilter, ...emailParams() },
      });
      if (error) throw error;
      const errCount = data.errors?.length || 0;
      const drafts = data.draftsOnly || 0;
      const parts = [`${data.emitted} faturas-recibo emitidas e enviadas`];
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
        body: { registration_id: id, send_email: !draftOnly, draft_only: draftOnly, ...emailParams() },
      });
      if (error) throw error;
      toast({ title: draftOnly ? "Rascunho criado" : "Fatura-recibo emitida e enviada", description: `#${data.document_id}` });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setIndividualLoading(null);
    }
  };

  const ivaLabel = showIVA ? "c/ IVA" : "s/ IVA";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-[15px] font-bold text-slate-900">
          Faturação · InvoiceExpress
        </h2>
        <span className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
          {sentCount > 0 && <span className="text-emerald-600">{sentCount} emitida{sentCount !== 1 ? "s" : ""}</span>}
          {sentCount > 0 && pendingCount > 0 && <span>·</span>}
          {pendingCount > 0 && <span className="text-amber-600">{pendingCount} por emitir</span>}
          {missingNifCount > 0 && <><span>·</span><span className="flex items-center gap-0.5 text-amber-600"><AlertTriangle size={11} />{missingNifCount} sem NIF</span></>}
        </span>

        {/* Email customization */}
        <Collapsible open={emailOpen} onOpenChange={setEmailOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors text-slate-500">
              <Mail size={12} />
              Personalizar email da fatura
              <ChevronDown size={11} className={`transition-transform ${emailOpen ? "rotate-180" : ""}`} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 p-3 rounded-lg space-y-2 bg-slate-50 border border-slate-200">
              <div>
                <label className="text-[10px] font-medium mb-1 block text-slate-500">
                  Assunto <span className="text-slate-400">({"{{plano}}"} = nome do plano)</span>
                </label>
                <Input
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="h-7 text-[11px] bg-white border-slate-200 text-slate-900"
                />
              </div>
              <div>
                 <label className="text-[10px] font-medium mb-1 block text-slate-500">
                   Corpo do email <span className="text-slate-400">({"{{nome}}"} = nome do cliente)</span>
                 </label>
                <Textarea
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  rows={3}
                  className="text-[11px] bg-white border-slate-200 text-slate-900 min-h-[60px]"
                />
              </div>
              <p className="text-[9px] text-slate-400">
                O PDF da fatura-recibo é sempre enviado em anexo pelo InvoiceExpress.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-2 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={handleBulkDrafts} disabled={bulkRunning !== null} className="h-8 text-[11px] sm:text-[12px] gap-1.5">
                  {bulkRunning === "drafts" ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
                  Criar Rascunhos
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[11px] max-w-[220px]">
                Cria rascunhos de fatura-recibo no InvoiceExpress sem finalizar nem enviar
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={handleBulkFinalize} disabled={bulkRunning !== null || selected.size === 0} className="h-8 text-[11px] sm:text-[12px] gap-1.5">
                  {bulkRunning === "finalize" ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  Finalizar e Enviar ({selected.size})
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[11px] max-w-[240px]">
                Finaliza as faturas-recibo seleccionadas e envia o PDF por email ao cliente
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" onClick={handleBulkEmit} disabled={bulkRunning !== null || pendingCount === 0} className="h-8 text-[11px] sm:text-[12px] gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                   {bulkRunning === "emit" ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                   Emitir Fatura-Recibo<span className="hidden sm:inline">&nbsp;e Enviar a Todos</span>{pendingCount > 0 && ` (${pendingCount})`}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[11px] max-w-[260px]">
                Cria, finaliza e envia a fatura-recibo por email a todos os pagantes sem fatura
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={handleSolicitarNif} disabled={bulkRunning !== null || missingNifCount === 0} className="h-8 text-[11px] sm:text-[12px] gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50">
                   {bulkRunning === "nif-request" as any ? <Loader2 size={13} className="animate-spin" /> : <AlertTriangle size={13} />}
                   Solicitar NIF{missingNifCount > 0 && ` (${missingNifCount})`}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[11px] max-w-[260px]">
                Envia email aos inscritos sem NIF com link para preencherem os dados de faturação
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto shadow-sm" style={{ WebkitOverflowScrolling: "touch" }}>
        <table className="w-full text-[12px] min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-3 py-2 w-8">
                <Checkbox checked={selected.size === inscritos.length && inscritos.length > 0} onCheckedChange={toggleAll} />
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-500">Nome</th>
              <th className="px-3 py-2 text-left font-medium hidden md:table-cell text-slate-500">Email</th>
              <th className="px-3 py-2 text-left font-medium text-slate-500">Plano</th>
              <th className="px-3 py-2 text-left font-medium text-slate-500">Valor ({ivaLabel})</th>
              <th className="px-3 py-2 text-left font-medium text-slate-500">Estado</th>
              <th className="px-3 py-2 text-left font-medium text-slate-500">Ação</th>
            </tr>
          </thead>
          <tbody>
            {inscritos.map(i => {
              const state = getInvoiceState(i);
              const cfg = STATE_CONFIG[state];
              const Icon = cfg.icon;
              const displayValue = applyIVA(i.valor, showIVA);
              return (
                <tr key={i.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2"><Checkbox checked={selected.has(i.id)} onCheckedChange={() => toggleSelect(i.id)} /></td>
                  <td className="px-3 py-2 font-medium text-slate-900">
                    <span className="flex items-center gap-1.5 flex-wrap">
                      {i.nome}
                      {webinarFilter === "all" && <WebinarBadge webinar={i.webinar} />}
                      {i.group_payment_ref && (() => {
                        const groupCount = inscritos.filter(g => g.group_payment_ref === i.group_payment_ref).length;
                        return groupCount > 1 ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200">
                            <Users size={9} /> ×{groupCount}
                          </span>
                        ) : null;
                      })()}
                      {!idsWithNif.has(i.id) && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                          <AlertTriangle size={9} />
                          Sem NIF
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell text-slate-500">{i.email}</td>
                  <td className="px-3 py-2 text-slate-600">{PLAN_LABELS[i.plan] || i.plan}</td>
                  <td className="px-3 py-2 font-semibold text-slate-900">€{displayValue.toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium">
                      <Icon size={12} style={{ color: cfg.color }} />
                      <span style={{ color: cfg.color }}>{cfg.label}</span>
                      {i.invoice_document_id && <span className="hidden sm:inline text-slate-400">#{i.invoice_document_id}</span>}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {individualLoading === i.id ? (
                      <Loader2 size={13} className="animate-spin text-slate-400" />
                    ) : state === "sent" ? (
                      <span className="text-[10px] text-slate-300">—</span>
                    ) : state === "draft" ? (
                      <button onClick={() => handleIndividual(i.id, false)} className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                        Emitir e Enviar
                      </button>
                    ) : (
                      <div className="flex gap-1">
                        <button onClick={() => handleIndividual(i.id, true)} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                          Rascunho
                        </button>
                        <button onClick={() => handleIndividual(i.id, false)} className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                          Emitir e Enviar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {inscritos.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-[12px] text-slate-400">Nenhum pagamento confirmado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
