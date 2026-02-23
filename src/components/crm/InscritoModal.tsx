import { useState, useEffect } from "react";
import {
  X, ChevronLeft, ChevronRight, MessageSquare, Mail, Star, Archive, Trash2, Copy, Pencil, Check, Bell, Loader2, Gift,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import FunnelView from "@/components/crm/FunnelView";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Inscrito } from "@/pages/crm/mockData";
import { genderEmoji, type Gender } from "@/lib/genderDetection";
import googleIcon from "@/assets/google_g_icon.svg";
import { supabase } from "@/integrations/supabase/client";
import { WEBINAR_CONFIG } from "@/config/webinarConfig";

const PLAN_VALUES: Record<string, string> = {
  premium: "15",
  masterclass: "47",
  bundle: "62",
};

// New sub-components
import ClientHeader from "./modal/ClientHeader";
import ActionsSection from "./modal/ActionsSection";
import LinkFollowUpSection from "./modal/LinkFollowUpSection";
import ResendModal from "./modal/ResendModal";
import ActivityTimeline from "./modal/ActivityTimeline";
import InvoiceSection from "./modal/InvoiceSection";
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

function abbreviateSource(s: string) {
  if (s.startsWith("Instagram")) return "Instagram";
  if (s.startsWith("Podcast")) return "Podcast RFM";
  if (s.includes("Email")) return "Email/Newsletter";
  if (s.includes("WhatsApp")) return "WhatsApp";
  return s;
}

export default function InscritoModal({
  inscrito, todos, onClose, onSelectInscrito, onAddNota, onRemoveNota, onToggleFollowUp, onArchive, onDelete, onSetGender, onUpdateName, onToggleDoNotContact, fetchMessageLogs, fetchPaymentEvents, sendBacklogCheckin, regenerateLink, resendPaymentEmail, onRefresh, onUpdateStepReached, onToggleInvoiceSent, onGrantPremium,
}: InscritoModalProps) {
  const [notaText, setNotaText] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState(inscrito.nome);
  const isMobile = useIsMobile();

  // Gmail reminder state
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderData, setReminderData] = useState<{ emailSubject: string; emailBody: string; paymentLink: string } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Logs state
  const [messageLogs, setMessageLogs] = useState<any[]>([]);
  const [paymentEvents, setPaymentEvents] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Backlog check-in state
  const [backlogSending, setBacklogSending] = useState(false);
  const [backlogSent, setBacklogSent] = useState(false);
  const [backlogError, setBacklogError] = useState<string | null>(null);

  // Resend modal
  const [resendModalOpen, setResendModalOpen] = useState(false);

  // Send payment modal
  const [sendPaymentOpen, setSendPaymentOpen] = useState(false);

  // Cross-webinar history
  const [crossHistory, setCrossHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Step reached — pending confirm
  const [pendingStep, setPendingStep] = useState<number | null>(null);
  const [stepSaving, setStepSaving] = useState(false);

  // Fetch logs
  useEffect(() => {
    if (!fetchMessageLogs || !fetchPaymentEvents) return;
    setLogsLoading(true);
    Promise.all([
      fetchMessageLogs(inscrito.id),
      fetchPaymentEvents(inscrito.id),
    ]).then(([msgs, evts]) => {
      setMessageLogs(msgs);
      setPaymentEvents(evts);
    }).finally(() => setLogsLoading(false));
  }, [inscrito.id, fetchMessageLogs, fetchPaymentEvents]);

  // Cross-webinar history fetch
  useEffect(() => {
    setHistoryLoading(true);
    setCrossHistory([]);
    const fetchHistory = async () => {
      try {
        const { data } = await supabase
          .from("registrations")
          .select("id, webinar, plan_selected, step_reached, created_at, paid_at")
          .eq("email", inscrito.email)
          .neq("id", inscrito.id)
          .order("created_at", { ascending: false });
        const hist = data || [];
        setCrossHistory(hist);
        setHistoryOpen(hist.length > 0);
      } catch {
        setCrossHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [inscrito.id, inscrito.email]);

  // Derived cross-history badges
  const hasPaidBefore = crossHistory.some(h => !!h.paid_at);
  const hasAttendedBefore = !hasPaidBefore && crossHistory.some(h => (h.step_reached ?? 0) >= 3);
  const masterclassImagensRecord = crossHistory.find(
    h => h.webinar === "imagens" && h.plan_selected === "masterclass" && h.paid_at
  );
  const hasMasterclassImagens = !!masterclassImagensRecord;

  const currentIdx = todos.findIndex((i) => i.id === inscrito.id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < todos.length - 1;

  const handleAddNota = () => {
    if (!notaText.trim()) return;
    onAddNota(inscrito.id, notaText.trim());
    setNotaText("");
  };

  const handleSaveName = () => {
    if (editName.trim() && editName.trim() !== inscrito.nome && onUpdateName) {
      onUpdateName(inscrito.id, editName.trim());
    }
    setEditingName(false);
  };

  const startEditName = () => {
    setEditName(inscrito.nome);
    setEditingName(true);
  };

  const handleGenerateReminder = async () => {
    setReminderLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-reminder", {
        body: { email: inscrito.email, plan: inscrito.plan, nome: inscrito.nome },
      });
      if (error) throw error;
      setReminderData(data);
    } catch (e) {
      console.error("Reminder error:", e);
      toast({ title: "Erro ao gerar lembrete", variant: "destructive" });
    } finally {
      setReminderLoading(false);
    }
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
    const to = encodeURIComponent(inscrito.email);
    const su = encodeURIComponent(reminderData.emailSubject);
    const body = encodeURIComponent(reminderData.emailBody);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${body}`;
  };

  const handleConfirmStep = async (step: 1 | 2 | 3 | 4 | 5) => {
    if (!onUpdateStepReached) return;
    setStepSaving(true);
    try {
      await onUpdateStepReached(inscrito.id, step);
      toast({ title: `Estágio actualizado para Passo ${step}` });
    } catch {
      toast({ title: "Erro ao actualizar estágio", variant: "destructive" });
    } finally {
      setStepSaving(false);
      setPendingStep(null);
    }
  };

  const refreshLogs = async () => {
    if (!fetchMessageLogs) return;
    const logs = await fetchMessageLogs(inscrito.id);
    setMessageLogs(logs);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] animate-in fade-in duration-200"
        style={{ background: "rgba(0,0,0,0.50)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={`fixed z-[101] flex flex-col overflow-hidden ${isMobile ? "inset-0" : ""}`}
        style={
          isMobile
            ? { background: "white" }
            : {
                top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                width: "min(880px, 95vw)", maxHeight: "95vh",
                borderRadius: "20px", boxShadow: "0 32px 80px rgba(0,0,0,0.25)", background: "white",
              }
        }
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 md:px-6 border-b border-border shrink-0" style={{ height: 56 }}>
          <div className="text-[13px] min-w-0">
            <span className="text-muted-foreground">Ficha</span>
            <span className="text-border"> · </span>
            <span className="font-semibold text-foreground text-[14px] truncate">{inscrito.nome}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <button
              onClick={() => hasPrev && onSelectInscrito(todos[currentIdx - 1])}
              disabled={!hasPrev}
              className="flex items-center gap-0.5 md:gap-1 px-2 md:px-3 py-1.5 text-[12px] md:text-[13px] font-medium text-muted-foreground border border-border rounded-lg hover:bg-accent disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Anterior</span>
            </button>
            <button
              onClick={() => hasNext && onSelectInscrito(todos[currentIdx + 1])}
              disabled={!hasNext}
              className="flex items-center gap-0.5 md:gap-1 px-2 md:px-3 py-1.5 text-[12px] md:text-[13px] font-medium text-muted-foreground border border-border rounded-lg hover:bg-accent disabled:opacity-40 transition-colors"
            >
              <span className="hidden sm:inline">Próximo</span>
              <ChevronRight size={14} />
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors" aria-label="Fechar">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-[280px_1fr]"
          style={isMobile ? {} : { height: "calc(95vh - 56px)" }}
        >
          {/* LEFT PANEL */}
          <div
            className={`overflow-y-auto ${isMobile ? "p-4" : "p-5 md:p-7 md:sticky md:top-0 text-center md:text-left"}`}
            style={{ background: "#0F172A" }}
          >
            {isMobile ? (
              <div>
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    {editingName ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                          className="font-heading font-bold text-[18px] text-white bg-transparent border-b border-white/30 outline-none w-full"
                          autoFocus
                        />
                        <button onClick={handleSaveName} className="text-green-400 shrink-0"><Check size={16} /></button>
                        <button onClick={() => setEditingName(false)} className="text-white/40 shrink-0"><X size={16} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <h2 className="font-heading font-bold text-[18px] text-white truncate">{genderEmoji(inscrito.gender)} {inscrito.nome}</h2>
                        {onUpdateName && (
                          <button onClick={startEditName} className="text-white/30 hover:text-white/60 shrink-0 transition-colors"><Pencil size={13} /></button>
                        )}
                      </div>
                    )}
                    <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.5)" }}>{inscrito.email}</p>
                    {hasPaidBefore && (
                      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#d97706" }}>
                        ⭐ Cliente anterior
                      </div>
                    )}
                    {hasAttendedBefore && (
                      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#3b82f6" }}>
                        🔄 Inscrito anterior
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => window.open(`https://wa.me/${inscrito.whatsapp.replace(/\D/g, "")}`, "_blank")}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-medium"
                    style={{ background: "rgba(37,211,102,0.12)", color: "#4ADE80" }}
                  >
                    <MessageSquare size={13} /> WhatsApp
                  </button>
                  <button
                    onClick={() => window.open(`mailto:${inscrito.email}`, "_blank")}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-medium"
                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
                  >
                    <Mail size={13} /> Email
                  </button>
                  <button
                    onClick={() => onToggleFollowUp(inscrito.id)}
                    className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium"
                    style={{
                      background: inscrito.follow_up ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.08)",
                      color: inscrito.follow_up ? "hsl(var(--amber-300))" : "rgba(255,255,255,0.7)",
                    }}
                  >
                    <Star size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop: Name + gender */}
                {editingName ? (
                  <div className="flex items-center gap-1.5 justify-center">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      className="font-heading font-bold text-[18px] text-white bg-transparent border-b border-white/30 outline-none text-center w-full max-w-[220px]"
                      autoFocus
                    />
                    <button onClick={handleSaveName} className="text-green-400 shrink-0"><Check size={16} /></button>
                    <button onClick={() => setEditingName(false)} className="text-white/40 shrink-0"><X size={16} /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 justify-center">
                    <h2 className="font-heading font-bold text-[18px] text-white">{genderEmoji(inscrito.gender)} {inscrito.nome}</h2>
                    {onUpdateName && (
                      <button onClick={startEditName} className="text-white/30 hover:text-white/60 shrink-0 transition-colors"><Pencil size={13} /></button>
                    )}
                  </div>
                )}

                {onSetGender && (
                  <div className="flex justify-center gap-1.5 mt-1.5">
                    {(["M","F","U"] as Gender[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => onSetGender(inscrito.id, g)}
                        className="text-[14px] w-7 h-7 rounded-full flex items-center justify-center transition-all"
                        style={{
                          background: inscrito.gender === g ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.05)",
                          border: inscrito.gender === g ? "2px solid rgba(255,255,255,0.40)" : "2px solid transparent",
                        }}
                        title={g === "M" ? "Masculino" : g === "F" ? "Feminino" : "Indefinido"}
                      >
                        {genderEmoji(g)}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{inscrito.email}</p>

                <button
                  onClick={() => window.open(`https://wa.me/${inscrito.whatsapp.replace(/\D/g, "")}`, "_blank")}
                  className="w-full mt-2 flex items-center gap-2 justify-center rounded-lg px-3 py-1.5 transition-colors"
                  style={{ background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.20)" }}
                >
                  <MessageSquare size={14} color="#25D366" />
                  <span className="text-[13px] font-medium" style={{ color: "#4ADE80" }}>{inscrito.whatsapp}</span>
                </button>
                <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Abrir WhatsApp</p>

                <div className="flex items-center justify-center gap-2 mt-2">
                  <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Inscrito em {fmtDate(inscrito.timestamp)}
                  </p>
                </div>

                {hasPaidBefore && (
                  <div className="mt-2 flex justify-center">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#d97706" }}>
                      ⭐ Cliente anterior
                    </div>
                  </div>
                )}
                {hasAttendedBefore && (
                  <div className="mt-2 flex justify-center">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#3b82f6" }}>
                      🔄 Inscrito anterior
                    </div>
                  </div>
                )}

                <div className="my-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }} />

                {/* Admin actions */}
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Acções</p>
                <div className="space-y-1 text-left">
                  <button
                    onClick={() => window.open(`mailto:${inscrito.email}`, "_blank")}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                  >
                    <Mail size={13} style={{ color: "rgba(255,255,255,0.50)" }} />
                    <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.70)" }}>Enviar Email</span>
                  </button>
                  <button
                    onClick={() => onToggleFollowUp(inscrito.id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
                    style={{
                      background: inscrito.follow_up ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.06)",
                    }}
                    onMouseEnter={(e) => { if (!inscrito.follow_up) e.currentTarget.style.background = "rgba(255,255,255,0.10)"; }}
                    onMouseLeave={(e) => { if (!inscrito.follow_up) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  >
                    <Star size={13} style={{ color: inscrito.follow_up ? "hsl(var(--amber-400))" : "rgba(255,255,255,0.50)" }} />
                    <span className="text-[12px] font-medium" style={{ color: inscrito.follow_up ? "hsl(var(--amber-300))" : "rgba(255,255,255,0.70)" }}>
                      {inscrito.follow_up ? "Remover Follow-up" : "Marcar Follow-up"}
                    </span>
                  </button>
                  <button
                    onClick={() => onArchive(inscrito.id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.10)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  >
                    <Archive size={13} style={{ color: "rgba(255,255,255,0.50)" }} />
                    <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.70)" }}>Arquivar inscrito</span>
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (confirm(`Eliminar definitivamente "${inscrito.nome}"? Esta acção é irreversível.`)) {
                          onDelete(inscrito.id);
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
                      style={{ background: "rgba(239,68,68,0.10)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.20)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.10)"; }}
                    >
                      <Trash2 size={13} style={{ color: "#f87171" }} />
                      <span className="text-[12px] font-medium" style={{ color: "#f87171" }}>Eliminar definitivamente</span>
                    </button>
                  )}
                  {/* Backlog check-in */}
                  {sendBacklogCheckin && !inscrito.paid_at && inscrito.plan_selected && inscrito.plan_selected !== "free" && !inscrito.do_not_contact && (
                    <button
                      onClick={async () => {
                        if (!confirm(`Enviar email de check-in backlog para ${inscrito.nome} (${inscrito.email})?`)) return;
                        setBacklogSending(true);
                        setBacklogError(null);
                        try {
                          await sendBacklogCheckin(inscrito.id, "followup_backlog_checkin");
                          setBacklogSent(true);
                        } catch (e: any) {
                          setBacklogError(e?.message || "Erro ao enviar");
                        } finally {
                          setBacklogSending(false);
                        }
                      }}
                      disabled={backlogSending || backlogSent}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
                      style={{ background: backlogSent ? "rgba(34,197,94,0.15)" : "rgba(59,130,246,0.12)" }}
                      onMouseEnter={(e) => { if (!backlogSent) e.currentTarget.style.background = "rgba(59,130,246,0.20)"; }}
                      onMouseLeave={(e) => { if (!backlogSent) e.currentTarget.style.background = "rgba(59,130,246,0.12)"; }}
                    >
                      {backlogSending ? (
                        <Loader2 size={13} className="animate-spin" style={{ color: "rgba(255,255,255,0.70)" }} />
                      ) : (
                        <Bell size={13} style={{ color: backlogSent ? "#22C55E" : "rgba(255,255,255,0.70)" }} />
                      )}
                      <span className="text-[12px] font-medium" style={{ color: backlogSent ? "#22C55E" : "rgba(255,255,255,0.70)" }}>
                        {backlogSent ? "Check-in enviado ✓" : backlogSending ? "A enviar..." : "Enviar check-in backlog"}
                      </span>
                    </button>
                  )}
                  {backlogError && (
                    <p className="text-[11px] px-3 mt-0.5" style={{ color: "#f87171" }}>{backlogError}</p>
                  )}

                  {/* Send payment link */}
                  {!inscrito.paid_at && (
                    <button
                      onClick={() => setSendPaymentOpen(true)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
                      style={{ background: "rgba(37,99,235,0.12)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(37,99,235,0.22)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(37,99,235,0.12)"; }}
                    >
                      <Mail size={13} style={{ color: "#60A5FA" }} />
                      <span className="text-[12px] font-medium" style={{ color: "#93C5FD" }}>Enviar link de pagamento</span>
                    </button>
                  )}
                </div>

                {/* Step reached selector */}
                {onUpdateStepReached && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                      Estágio do funil
                    </p>
                    <div className="flex gap-1.5">
                      {([1, 2, 3, 4, 5] as const).map((step) => {
                        const isActive = inscrito.step_reached === step;
                        const isPending = pendingStep === step;
                        return (
                          <button
                            key={step}
                            onClick={() => {
                              if (isActive) return;
                              if (pendingStep === step) {
                                handleConfirmStep(step);
                              } else {
                                setPendingStep(step);
                              }
                            }}
                            disabled={stepSaving}
                            className="flex-1 h-8 rounded-lg text-[12px] font-bold transition-all"
                            style={{
                              background: isActive
                                ? "rgba(96,165,250,0.25)"
                                : isPending
                                ? "rgba(245,158,11,0.25)"
                                : "rgba(255,255,255,0.06)",
                              color: isActive ? "#93C5FD" : isPending ? "#FCD34D" : "rgba(255,255,255,0.40)",
                              border: isActive
                                ? "1px solid rgba(96,165,250,0.40)"
                                : isPending
                                ? "1px solid rgba(245,158,11,0.40)"
                                : "1px solid transparent",
                            }}
                            title={isPending ? `Confirmar: mover para Passo ${step}` : `Passo ${step}`}
                          >
                            {stepSaving && isPending ? "…" : step}
                          </button>
                        );
                      })}
                    </div>
                    {pendingStep && (
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-[10px]" style={{ color: "rgba(245,158,11,0.8)" }}>
                          Mover para Passo {pendingStep}?
                        </p>
                        <button
                          onClick={() => setPendingStep(null)}
                          className="text-[10px]"
                          style={{ color: "rgba(255,255,255,0.30)" }}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="overflow-y-auto p-4 md:p-7 bg-white">
            {/* Smart alert: Masterclass cross-sell warning */}
            {hasMasterclassImagens && inscrito.webinar === "video" && masterclassImagensRecord && (
              <div className="mb-4 rounded-lg p-3.5 flex items-start gap-2.5"
                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
                <span className="text-[16px] mt-0.5">⚠️</span>
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: "#d97706" }}>
                    Este inscrito já comprou a Masterclass no Webinar Imagens IA
                    {masterclassImagensRecord.paid_at ? ` (${fmtDate(masterclassImagensRecord.paid_at)})` : ""}.
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: "#d97706" }}>
                    Não enviar pitch de Masterclass — ajustar comunicação.
                  </p>
                </div>
              </div>
            )}

            {/* Client Header (sticky summary) */}
            <ClientHeader inscrito={inscrito} />

            {/* Actions Section */}
            <ActionsSection
              inscrito={inscrito}
              messageLogs={messageLogs}
              regenerateLink={regenerateLink}
              resendPaymentEmail={resendPaymentEmail}
              sendBacklogCheckin={sendBacklogCheckin}
              onRefresh={onRefresh}
              onOpenResendModal={() => setResendModalOpen(true)}
              onGenerateReminder={handleGenerateReminder}
              reminderLoading={reminderLoading}
              reminderData={reminderData}
              onOpenSendPayment={!inscrito.paid_at ? () => setSendPaymentOpen(true) : undefined}
            />

            {/* Gmail reminder card (when generated) */}
            {reminderData && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden mb-4">
                <div className="flex items-center justify-between px-4 py-3 bg-amber-100/60 border-b border-amber-200">
                  <h4 className="font-heading font-bold text-[14px] text-amber-900">📧 Email pronto a enviar</h4>
                  <button onClick={() => setReminderData(null)} className="text-[11px] text-amber-600 hover:text-amber-800 transition-colors">
                    Gerar novo
                  </button>
                </div>
                <div className="px-4 py-2.5 bg-white/50 border-b border-amber-200/60">
                  <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Assunto</span>
                  <p className="text-[13px] text-amber-900 font-semibold mt-0.5">{reminderData.emailSubject}</p>
                </div>
                <div className="px-4 py-3">
                  <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Corpo</span>
                  <pre className="text-[13px] text-amber-900 whitespace-pre-wrap leading-relaxed mt-1">{reminderData.emailBody}</pre>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-amber-100/40 border-t border-amber-200">
                  <a
                    href={buildGmailLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-heading font-semibold text-[13px] text-white transition-colors"
                    style={{ background: "#1a73e8" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#1557b0")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#1a73e8")}
                  >
                    <img src={googleIcon} alt="" className="w-4 h-4" style={{ filter: "brightness(0) invert(1)" }} />
                    Enviar via Gmail
                  </a>
                  <button
                    onClick={copyEmailBody}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-medium border border-amber-300 text-amber-800 hover:bg-amber-200 transition-colors"
                  >
                    <Copy size={12} /> {copiedEmail ? "Copiado!" : "Copiar tudo"}
                  </button>
                </div>
                <div className="px-4 py-2 border-t border-amber-200/60">
                  <a href={reminderData.paymentLink} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:underline">
                    Link de pagamento: {reminderData.paymentLink} ↗
                  </a>
                </div>
              </div>
            )}

            {/* Link / Follow-up Section */}
            <LinkFollowUpSection inscrito={inscrito} onToggleDoNotContact={onToggleDoNotContact} />

            {/* Invoice Section */}
            <InvoiceSection
              registrationId={inscrito.id}
              invoiceSent={inscrito.invoice_sent}
              onToggleInvoiceSent={() => onToggleInvoiceSent?.(inscrito.id)}
            />

            {/* Premium Grant Control */}
            {onGrantPremium && (
              <div className="my-4 p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift size={14} className="text-purple-600" />
                    <span className="text-[13px] font-semibold text-foreground">Acesso Premium (Oferta)</span>
                    {inscrito.premium_granted_at && (
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                        Activo
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onGrantPremium(inscrito.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      inscrito.premium_granted_at ? "bg-purple-600" : "bg-input"
                    }`}
                    aria-label="Toggle acesso premium"
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      inscrito.premium_granted_at ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
                {inscrito.premium_granted_at && (
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Concedido por {inscrito.premium_granted_by || "—"} · {fmtDate(inscrito.premium_granted_at)}
                  </p>
                )}
              </div>
            )}

            {/* Funnel */}
            <FunnelView inscrito={inscrito} />

            {/* Cross-webinar history section */}
            <hr className="border-border my-6" />
            <div>
              <button onClick={() => setHistoryOpen(!historyOpen)} className="flex items-center gap-2 w-full text-left">
                <ChevronRight size={14} className={`transition-transform text-muted-foreground ${historyOpen ? "rotate-90" : ""}`} />
                <h3 className="font-heading font-bold text-[14px] text-foreground">
                  Histórico de Webinars
                </h3>
                {crossHistory.length > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                    {crossHistory.length}
                  </span>
                )}
              </button>

              {historyOpen && (
                <div className="mt-3 space-y-2">
                  {historyLoading ? (
                    <p className="text-[12px] text-muted-foreground">A carregar...</p>
                  ) : crossHistory.length === 0 ? (
                    <p className="text-[11px] italic" style={{ color: "#666" }}>
                      Primeira vez neste ecossistema
                    </p>
                  ) : (
                    crossHistory.map(h => {
                      const wCfg = WEBINAR_CONFIG[h.webinar as keyof typeof WEBINAR_CONFIG];
                      const isVideo = h.webinar === "video";
                      const isFree = !h.plan_selected || h.plan_selected === "free";
                      const isPaid = !!h.paid_at;

                      let planLabel = "Inscrito gratuito";
                      let planBg = "rgba(0,0,0,0.06)";
                      let planColor = "#666";
                      let statusLabel = (h.step_reached ?? 0) >= 3 ? "Completou o flow" : "Não completou o flow";
                      let statusColor = (h.step_reached ?? 0) >= 3 ? "#16a34a" : "#d97706";

                      if (!isFree && isPaid) {
                        statusLabel = "✓ Pago";
                        statusColor = "#16a34a";
                        if (h.plan_selected === "premium") {
                          planLabel = "Premium Pass €15+IVA";
                          planBg = "rgba(30,64,175,0.15)";
                          planColor = "#1e40af";
                        } else if (h.plan_selected === "masterclass") {
                          planLabel = "Masterclass €47+IVA";
                          planBg = "rgba(124,58,237,0.15)";
                          planColor = "#7c3aed";
                        } else if (h.plan_selected === "bundle") {
                          planLabel = "Bundle €62+IVA";
                          planBg = "rgba(15,23,42,0.12)";
                          planColor = "#0f172a";
                        }
                      }

                      return (
                        <div key={h.id} style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(0,0,0,0.06)",
                          borderRadius: 8, padding: "10px 14px"
                        }}>
                          <div className="flex items-center justify-between">
                            <span style={{
                              background: isVideo ? "rgba(22,163,74,0.15)" : "rgba(30,64,175,0.15)",
                              color: isVideo ? "#16a34a" : "#1e40af",
                              fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12
                            }}>
                              {isVideo ? "🎬 Vídeo IA" : "📷 Imagens IA"} · {wCfg?.date || "—"}
                            </span>
                            <span className="text-[11px] text-muted-foreground">{fmtDate(h.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: planBg, color: planColor }}>
                              {planLabel}
                            </span>
                            <span className="text-[10px] font-medium" style={{ color: statusColor }}>
                              {statusLabel}
                            </span>
                          </div>
                          {isPaid && (
                            <div className="mt-1.5 text-[11px] text-muted-foreground">
                              Valor pago: €{PLAN_VALUES[h.plan_selected] || "—"}+IVA · Pago em {fmtDate(h.paid_at)}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Origem */}
            {inscrito.source.length > 0 && (
              <>
                <hr className="border-border my-6" />
                <h3 className="font-heading font-bold text-[14px] text-foreground mb-3">Origem</h3>
                <div className="flex flex-wrap gap-2">
                  {inscrito.source.map((s) => (
                    <span key={s} className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                      {abbreviateSource(s)}
                    </span>
                  ))}
                </div>
                {inscrito.source_outro && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{ background: "hsl(var(--amber-50))", border: "1px solid rgba(217,119,6,0.15)" }}>
                    <span className="text-[13px] text-amber-700">Indicação: {inscrito.source_outro}</span>
                  </div>
                )}
              </>
            )}

            {/* Dúvida */}
            {inscrito.duvida && (
              <>
                <hr className="border-border my-6" />
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h3 className="font-heading font-bold text-[14px] text-foreground">Maior Dúvida</h3>
                  <span className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-600">Passo 2 preenchido</span>
                </div>
                <div className="rounded-xl p-4 border" style={{ background: "hsl(var(--amber-50))", borderColor: "rgba(217,119,6,0.20)" }}>
                  <span className="font-heading font-extrabold text-[40px] leading-[0.5]" style={{ color: "rgba(217,119,6,0.20)" }}>"</span>
                  <p className="text-[15px] leading-[1.7] text-amber-900 mt-2">{inscrito.duvida}</p>
                </div>
              </>
            )}

            {/* Notas */}
            <hr className="border-border my-6" />
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-heading font-bold text-[14px] text-foreground">Notas</h3>
              {inscrito.notas.length > 0 && (
                <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  {inscrito.notas.length}
                </span>
              )}
            </div>
            {inscrito.notas.map((n) => (
              <div key={n.id} className="bg-muted border-l-[3px] border-blue-300 rounded-r-[10px] px-3.5 py-3 mb-2 group relative">
                <p className="text-[14px] text-foreground leading-relaxed pr-6">{n.texto}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] text-muted-foreground">{fmtDate(n.timestamp)}</span>
                  <button
                    onClick={() => onRemoveNota(inscrito.id, n.id)}
                    className="text-[12px] text-muted-foreground hover:text-destructive hover:underline transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Apagar
                  </button>
                </div>
              </div>
            ))}
            <textarea
              value={notaText}
              onChange={(e) => setNotaText(e.target.value.slice(0, 500))}
              placeholder="Escreve uma nota sobre este inscrito..."
              className="w-full bg-muted border border-border rounded-[10px] p-3 text-[14px] resize-none outline-none focus:border-ring mt-2"
              style={{ minHeight: 80 }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[12px] text-muted-foreground">{notaText.length} / 500</span>
              <button
                onClick={handleAddNota}
                disabled={!notaText.trim()}
                className="bg-primary text-primary-foreground font-heading font-semibold text-[13px] px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                Guardar nota
              </button>
            </div>

            {/* Activity Timeline */}
            {(fetchMessageLogs || fetchPaymentEvents) && (
              <>
                <hr className="border-border my-6" />
                <ActivityTimeline
                  messageLogs={messageLogs}
                  paymentEvents={paymentEvents}
                  loading={logsLoading}
                  inscrito={inscrito}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Resend Modal */}
      {resendPaymentEmail && (
        <ResendModal
          open={resendModalOpen}
          onOpenChange={setResendModalOpen}
          inscrito={inscrito}
          resendPaymentEmail={resendPaymentEmail}
          regenerateLink={regenerateLink}
          onRefresh={onRefresh}
          onLogsRefresh={refreshLogs}
        />
      )}

      {/* Send Payment Modal */}
      {sendPaymentOpen && (
        <SendPaymentModal
          inscrito={inscrito}
          messageLogs={messageLogs}
          onClose={() => setSendPaymentOpen(false)}
          onSuccess={refreshLogs}
        />
      )}
    </>
  );
}
