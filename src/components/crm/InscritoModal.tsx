import { useState, useEffect } from "react";
import {
  X, ChevronLeft, ChevronRight, MessageSquare, Mail, Pencil, Check, Loader2, Copy,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Inscrito } from "@/pages/crm/mockData";
import { genderEmoji, type Gender } from "@/lib/genderDetection";
import googleIcon from "@/assets/google_g_icon.svg";
import { supabase } from "@/integrations/supabase/client";
import { WEBINAR_CONFIG } from "@/config/webinarConfig";

import StatusBlock from "./modal/StatusBlock";
import SidebarActions from "./modal/SidebarActions";
import SidebarFunnel from "./modal/SidebarFunnel";
import TabResumo from "./modal/TabResumo";
import TabActividade from "./modal/TabActividade";
import TabHistorico from "./modal/TabHistorico";
import TabLinkPagamento from "./modal/TabLinkPagamento";
import ResendModal from "./modal/ResendModal";
import SendPaymentModal from "./modal/SendPaymentModal";

interface InscritoModalProps {
  inscrito: Inscrito;
  todos: Inscrito[];
  onClose: () => void;
  onSelectInscrito: (i: Inscrito) => void;
  onAddNota: (id: string, texto: string) => void;
  onRemoveNota: (id: string, notaId: string) => void;
  onToggleFollowUp: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete?: (id: string) => void;
  onSetGender?: (id: string, gender: Gender) => void;
  onUpdateName?: (id: string, fullName: string) => void;
  onToggleDoNotContact?: (id: string) => void;
  fetchMessageLogs?: (id: string) => Promise<any[]>;
  fetchPaymentEvents?: (id: string) => Promise<any[]>;
  sendBacklogCheckin?: (id: string, templateKey?: string) => Promise<any>;
  regenerateLink?: (id: string) => Promise<any>;
  resendPaymentEmail?: (id: string) => Promise<any>;
  onRefresh?: () => void;
  onUpdateStepReached?: (id: string, step: 1 | 2 | 3 | 4 | 5) => Promise<void>;
  onToggleInvoiceSent?: (id: string) => void;
  onGrantPremium?: (id: string) => void;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

type TabKey = "resumo" | "actividade" | "historico" | "pagamento";
const TABS: { key: TabKey; label: string }[] = [
  { key: "resumo", label: "Resumo" },
  { key: "actividade", label: "Actividade" },
  { key: "historico", label: "Histórico" },
  { key: "pagamento", label: "Link & Pagamento" },
];

export default function InscritoModal({
  inscrito, todos, onClose, onSelectInscrito, onAddNota, onRemoveNota, onToggleFollowUp, onArchive, onDelete, onSetGender, onUpdateName, onToggleDoNotContact, fetchMessageLogs, fetchPaymentEvents, sendBacklogCheckin, regenerateLink, resendPaymentEmail, onRefresh, onUpdateStepReached, onToggleInvoiceSent, onGrantPremium,
}: InscritoModalProps) {
  const [notaText, setNotaText] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState(inscrito.nome);
  const [activeTab, setActiveTab] = useState<TabKey>("resumo");
  const isMobile = useIsMobile();

  // Gmail reminder state
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderData, setReminderData] = useState<any>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Logs state
  const [messageLogs, setMessageLogs] = useState<any[]>([]);
  const [paymentEvents, setPaymentEvents] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Modals
  const [resendModalOpen, setResendModalOpen] = useState(false);
  const [sendPaymentOpen, setSendPaymentOpen] = useState(false);

  // Cross-webinar history
  const [crossHistory, setCrossHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Fetch logs
  useEffect(() => {
    if (!fetchMessageLogs || !fetchPaymentEvents) return;
    setLogsLoading(true);
    Promise.all([fetchMessageLogs(inscrito.id), fetchPaymentEvents(inscrito.id)])
      .then(([msgs, evts]) => { setMessageLogs(msgs); setPaymentEvents(evts); })
      .finally(() => setLogsLoading(false));
  }, [inscrito.id, fetchMessageLogs, fetchPaymentEvents]);

  // Cross-webinar history fetch
  useEffect(() => {
    setHistoryLoading(true);
    setCrossHistory([]);
    (async () => {
      try {
        const { data } = await supabase
          .from("registrations")
          .select("id, webinar, plan_selected, step_reached, created_at, paid_at")
          .eq("email", inscrito.email)
          .neq("id", inscrito.id)
          .order("created_at", { ascending: false });
        setCrossHistory(data || []);
      } catch { setCrossHistory([]); }
      finally { setHistoryLoading(false); }
    })();
  }, [inscrito.id, inscrito.email]);

  const hasPaidBefore = crossHistory.some(h => !!h.paid_at);
  const hasAttendedBefore = !hasPaidBefore && crossHistory.some(h => (h.step_reached ?? 0) >= 3);
  const masterclassImagensRecord = crossHistory.find(h => h.webinar === "imagens" && h.plan_selected === "masterclass" && h.paid_at);
  const hasMasterclassImagens = !!masterclassImagensRecord;

  const currentIdx = todos.findIndex(i => i.id === inscrito.id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < todos.length - 1;

  const handleSaveName = () => {
    if (editName.trim() && editName.trim() !== inscrito.nome && onUpdateName) onUpdateName(inscrito.id, editName.trim());
    setEditingName(false);
  };

  const handleGenerateReminder = async () => {
    setReminderLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-reminder", { body: { email: inscrito.email, plan: inscrito.plan, nome: inscrito.nome } });
      if (error) throw error;
      setReminderData(data);
    } catch { toast({ title: "Erro ao gerar lembrete", variant: "destructive" }); }
    finally { setReminderLoading(false); }
  };

  const copyEmailBody = () => {
    if (reminderData) {
      navigator.clipboard.writeText(`Assunto: ${reminderData.emailSubject}\n\n${reminderData.emailBody}`);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const buildGmailLink = () => {
    if (!reminderData) return "";
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(inscrito.email)}&su=${encodeURIComponent(reminderData.emailSubject)}&body=${encodeURIComponent(reminderData.emailBody)}`;
  };

  const refreshLogs = async () => {
    if (!fetchMessageLogs) return;
    const logs = await fetchMessageLogs(inscrito.id);
    setMessageLogs(logs);
  };

  // Header status badge
  const getStatusBadge = () => {
    if (inscrito.paid_at) return { label: `✅ Pago — €${inscrito.valor}`, bg: "rgba(22,163,74,0.1)", color: "#16a34a" };
    if (inscrito.payment_status === "awaiting_payment") return { label: "⏳ Aguarda pagamento", bg: "rgba(245,158,11,0.1)", color: "#d97706" };
    if (inscrito.payment_status === "selected") return { label: "🟠 Seleccionou e saiu", bg: "rgba(245,158,11,0.1)", color: "#d97706" };
    return { label: `Gratuito · Passo ${inscrito.step_reached || 1}/5`, bg: "rgba(100,116,139,0.08)", color: "#64748b" };
  };
  const statusBadge = getStatusBadge();

  // Relationship badge
  const getRelBadge = () => {
    if (hasPaidBefore) return { label: "⭐ Cliente anterior", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)", color: "#d97706" };
    if (hasAttendedBefore) return { label: "🔄 Inscrito anterior", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)", color: "#3b82f6" };
    return { label: "🆕 Primeira vez", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.2)", color: "#64748b" };
  };
  const relBadge = getRelBadge();

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[100] animate-in fade-in duration-200" style={{ background: "rgba(0,0,0,0.50)", backdropFilter: "blur(3px)" }} onClick={onClose} />

      {/* Modal */}
      <div
        className={`fixed z-[101] flex flex-col overflow-hidden ${isMobile ? "inset-0" : ""}`}
        style={isMobile ? { background: "white" } : {
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "min(900px, 95vw)", maxHeight: "95vh",
          borderRadius: "20px", boxShadow: "0 32px 80px rgba(0,0,0,0.25)", background: "white",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 border-b border-border shrink-0" style={{ height: 56 }}>
          <div className="text-[13px] min-w-0">
            <span className="text-muted-foreground">Ficha</span>
            <span className="text-border"> · </span>
            <span className="font-semibold text-foreground text-[14px] truncate">{inscrito.nome}</span>
          </div>
          {/* Center badge */}
          <div className="hidden md:flex items-center">
            <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ background: statusBadge.bg, color: statusBadge.color }}>
              {statusBadge.label}
            </span>
          </div>
          {/* Nav */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => hasPrev && onSelectInscrito(todos[currentIdx - 1])} disabled={!hasPrev} className="flex items-center gap-0.5 px-2 md:px-3 py-1.5 text-[12px] md:text-[13px] font-medium text-muted-foreground border border-border rounded-lg hover:bg-accent disabled:opacity-40 transition-colors">
              <ChevronLeft size={14} /><span className="hidden sm:inline">Anterior</span>
            </button>
            <button onClick={() => hasNext && onSelectInscrito(todos[currentIdx + 1])} disabled={!hasNext} className="flex items-center gap-0.5 px-2 md:px-3 py-1.5 text-[12px] md:text-[13px] font-medium text-muted-foreground border border-border rounded-lg hover:bg-accent disabled:opacity-40 transition-colors">
              <span className="hidden sm:inline">Próximo</span><ChevronRight size={14} />
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><X size={20} /></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:grid md:grid-cols-[280px_1fr]" style={isMobile ? {} : { height: "calc(95vh - 56px)" }}>

          {/* LEFT SIDEBAR */}
          <div className={`overflow-y-auto shrink-0 ${isMobile ? "p-4" : "p-5"}`} style={{ background: "#0F172A" }}>
            {isMobile ? (
              /* Mobile: compact top strip */
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold text-white shrink-0" style={{ background: "rgba(255,255,255,0.12)" }}>
                    {inscrito.primeiro_nome?.[0]?.toUpperCase() || inscrito.nome[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-[16px] text-white truncate">{genderEmoji(inscrito.gender)} {inscrito.nome}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full" style={{ background: statusBadge.bg, color: statusBadge.color }}>{statusBadge.label}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: relBadge.bg, border: `1px solid ${relBadge.border}`, color: relBadge.color }}>{relBadge.label}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => window.open(`https://wa.me/${inscrito.whatsapp.replace(/\D/g, "")}`, "_blank")} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-medium" style={{ background: "rgba(37,211,102,0.12)", color: "#4ADE80" }}>
                    <MessageSquare size={13} /> WhatsApp
                  </button>
                  <button onClick={() => window.open(`mailto:${inscrito.email}`, "_blank")} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-medium" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
                    <Mail size={13} /> Email
                  </button>
                </div>
              </div>
            ) : (
              /* Desktop sidebar */
              <>
                {/* Identity */}
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-[18px] font-bold text-white mx-auto mb-2" style={{ background: "rgba(255,255,255,0.12)" }}>
                    {inscrito.primeiro_nome?.[0]?.toUpperCase() || inscrito.nome[0]?.toUpperCase()}
                  </div>
                  {editingName ? (
                    <div className="flex items-center gap-1.5 justify-center">
                      <input value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSaveName()} className="font-bold text-[16px] text-white bg-transparent border-b border-white/30 outline-none text-center w-full max-w-[220px]" autoFocus />
                      <button onClick={handleSaveName} className="text-green-400 shrink-0"><Check size={16} /></button>
                      <button onClick={() => setEditingName(false)} className="text-white/40 shrink-0"><X size={16} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 justify-center">
                      <h2 className="font-bold text-[16px] text-white">{genderEmoji(inscrito.gender)} {inscrito.nome}</h2>
                      {onUpdateName && <button onClick={() => { setEditName(inscrito.nome); setEditingName(true); }} className="text-white/30 hover:text-white/60 shrink-0"><Pencil size={12} /></button>}
                    </div>
                  )}
                  {onSetGender && (
                    <div className="flex justify-center gap-1 mt-1">
                      {(["M","F","U"] as Gender[]).map(g => (
                        <button key={g} onClick={() => onSetGender(inscrito.id, g)} className="text-[13px] w-6 h-6 rounded-full flex items-center justify-center" style={{ background: inscrito.gender === g ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.05)", border: inscrito.gender === g ? "2px solid rgba(255,255,255,0.40)" : "2px solid transparent" }} title={g === "M" ? "Masculino" : g === "F" ? "Feminino" : "Indefinido"}>
                          {genderEmoji(g)}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Relationship badge */}
                  <div className="mt-2 flex justify-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: relBadge.bg, border: `1px solid ${relBadge.border}`, color: relBadge.color }}>
                      {relBadge.label}
                    </span>
                  </div>
                  <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{inscrito.email}</p>
                  <button onClick={() => window.open(`https://wa.me/${inscrito.whatsapp.replace(/\D/g, "")}`, "_blank")} className="w-full mt-2 flex items-center gap-2 justify-center rounded-lg px-3 py-1.5 transition-colors" style={{ background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.20)" }}>
                    <MessageSquare size={14} color="#25D366" />
                    <span className="text-[12px] font-medium" style={{ color: "#4ADE80" }}>{inscrito.whatsapp}</span>
                  </button>
                  <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Inscrito em {fmtDate(inscrito.timestamp)}</p>
                </div>

                {/* Divider */}
                <div className="my-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }} />

                {/* StatusBlock */}
                <StatusBlock
                  inscrito={inscrito}
                  onResendLink={() => setResendModalOpen(true)}
                  onToggleInvoiceSent={() => onToggleInvoiceSent?.(inscrito.id)}
                />

                {/* Divider */}
                <div className="my-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }} />

                {/* SidebarActions */}
                <SidebarActions
                  inscrito={inscrito}
                  onToggleFollowUp={onToggleFollowUp}
                  onArchive={onArchive}
                  onDelete={onDelete}
                  onOpenResendModal={() => setResendModalOpen(true)}
                  onOpenSendPayment={() => setSendPaymentOpen(true)}
                  onToggleInvoiceSent={() => onToggleInvoiceSent?.(inscrito.id)}
                  sendBacklogCheckin={sendBacklogCheckin}
                  regenerateLink={regenerateLink}
                />

                {/* Divider */}
                <div className="my-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }} />

                {/* SidebarFunnel */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[1.5px] mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Funil</p>
                  <SidebarFunnel stepReached={inscrito.step_reached || 1} />
                </div>
              </>
            )}
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Tab bar */}
            <div className="sticky top-0 z-10 bg-white border-b border-border px-4 md:px-6 py-2 flex items-center gap-1 overflow-x-auto shrink-0">
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors"
                  style={{
                    background: activeTab === t.key ? "#2563eb" : "transparent",
                    color: activeTab === t.key ? "#fff" : "#666",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Mobile sidebar extras (actions + funnel) */}
            {isMobile && (
              <div className="px-4 py-3 space-y-3" style={{ background: "#0F172A" }}>
                <StatusBlock inscrito={inscrito} onResendLink={() => setResendModalOpen(true)} onToggleInvoiceSent={() => onToggleInvoiceSent?.(inscrito.id)} />
                <SidebarActions inscrito={inscrito} onToggleFollowUp={onToggleFollowUp} onArchive={onArchive} onDelete={onDelete} onOpenResendModal={() => setResendModalOpen(true)} onOpenSendPayment={() => setSendPaymentOpen(true)} onToggleInvoiceSent={() => onToggleInvoiceSent?.(inscrito.id)} sendBacklogCheckin={sendBacklogCheckin} regenerateLink={regenerateLink} />
                <SidebarFunnel stepReached={inscrito.step_reached || 1} />
              </div>
            )}

            {/* Tab content */}
            <div className="flex-1 p-4 md:p-6">
              {activeTab === "resumo" && (
                <TabResumo
                  inscrito={inscrito}
                  crossHistory={crossHistory}
                  historyLoading={historyLoading}
                  hasMasterclassImagens={hasMasterclassImagens}
                  masterclassImagensRecord={masterclassImagensRecord}
                />
              )}
              {activeTab === "actividade" && (
                <TabActividade messageLogs={messageLogs} paymentEvents={paymentEvents} loading={logsLoading} inscrito={inscrito} />
              )}
              {activeTab === "historico" && (
                <TabHistorico inscrito={inscrito} crossHistory={crossHistory} historyLoading={historyLoading} notaText={notaText} setNotaText={setNotaText} onAddNota={onAddNota} onRemoveNota={onRemoveNota} />
              )}
              {activeTab === "pagamento" && (
                <TabLinkPagamento
                  inscrito={inscrito} messageLogs={messageLogs}
                  onToggleDoNotContact={onToggleDoNotContact} onToggleInvoiceSent={onToggleInvoiceSent}
                  onGrantPremium={onGrantPremium} regenerateLink={regenerateLink}
                  resendPaymentEmail={resendPaymentEmail} sendBacklogCheckin={sendBacklogCheckin}
                  onRefresh={onRefresh} onOpenResendModal={() => setResendModalOpen(true)}
                  onOpenSendPayment={() => setSendPaymentOpen(true)}
                  onGenerateReminder={handleGenerateReminder} reminderLoading={reminderLoading}
                  reminderData={reminderData} copiedEmail={copiedEmail}
                  copyEmailBody={copyEmailBody} buildGmailLink={buildGmailLink}
                  setReminderData={setReminderData}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resend Modal */}
      {resendPaymentEmail && (
        <ResendModal open={resendModalOpen} onOpenChange={setResendModalOpen} inscrito={inscrito} resendPaymentEmail={resendPaymentEmail} regenerateLink={regenerateLink} onRefresh={onRefresh} onLogsRefresh={refreshLogs} />
      )}

      {/* Send Payment Modal */}
      {sendPaymentOpen && (
        <SendPaymentModal inscrito={inscrito} messageLogs={messageLogs} onClose={() => setSendPaymentOpen(false)} onSuccess={refreshLogs} />
      )}
    </>
  );
}
