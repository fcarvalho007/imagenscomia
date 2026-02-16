import { useState, useEffect, useMemo } from "react";
import {
  X, ChevronLeft, ChevronRight, MessageSquare, Mail, Star, Archive, Trash2, Copy, Info, Pencil, Check, Bell, Loader2, ExternalLink, Clock, CheckCircle2, AlertTriangle, ChevronDown, Send, RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import FunnelView from "@/components/crm/FunnelView";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Inscrito } from "@/pages/crm/mockData";
import { genderEmoji, type Gender } from "@/lib/genderDetection";
import googleIcon from "@/assets/google_g_icon.svg";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { getTemplateLabel, fmtTimeAgo } from "./templateLabels";

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
}

const PLAN_INFO: Record<string, { bg: string; color: string; label: string }> = {
  free: { bg: "hsl(var(--surface))", color: "hsl(var(--ink-400))", label: "Gratuito" },
  premium: { bg: "hsl(var(--blue-50))", color: "hsl(var(--blue-600))", label: "Premium" },
  masterclass: { bg: "rgba(124,58,237,0.1)", color: "#7C3AED", label: "Masterclass" },
  bundle: { bg: "hsl(var(--green-50))", color: "hsl(var(--green-600))", label: "Bundle" },
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function fmtDateShort(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtRelative(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return "Expirado";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `em ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `em ${hours}h`;
  return `em ${Math.floor(hours / 24)}d`;
}

function abbreviateSource(s: string) {
  if (s.startsWith("Instagram")) return "Instagram";
  if (s.startsWith("Podcast")) return "Podcast RFM";
  if (s.includes("Email")) return "Email/Newsletter";
  if (s.includes("WhatsApp")) return "WhatsApp";
  return s;
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  queued: { bg: "hsl(var(--surface))", color: "hsl(var(--ink-400))" },
  sent: { bg: "hsl(var(--green-50))", color: "hsl(var(--green-600))" },
  delivered: { bg: "hsl(var(--green-50))", color: "hsl(var(--green-600))" },
  failed: { bg: "rgba(239,68,68,0.1)", color: "#DC2626" },
};

export default function InscritoModal({
  inscrito, todos, onClose, onSelectInscrito, onAddNota, onRemoveNota, onToggleFollowUp, onArchive, onDelete, onSetGender, onUpdateName, onToggleDoNotContact, fetchMessageLogs, fetchPaymentEvents, sendBacklogCheckin, regenerateLink, resendPaymentEmail, onRefresh,
}: InscritoModalProps) {
  const [notaText, setNotaText] = useState("");
  const [copiedRef, setCopiedRef] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState(inscrito.nome);
  const isMobile = useIsMobile();
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderData, setReminderData] = useState<{ emailSubject: string; emailBody: string; paymentLink: string } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPayLink, setCopiedPayLink] = useState(false);
  const [copiedEupagoRef, setCopiedEupagoRef] = useState(false);

  // Activity logs state
  const [messageLogs, setMessageLogs] = useState<any[]>([]);
  const [paymentEvents, setPaymentEvents] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [copiedIdempKey, setCopiedIdempKey] = useState<string | null>(null);
  const [backlogSending, setBacklogSending] = useState(false);
  const [backlogSent, setBacklogSent] = useState(false);
  const [backlogError, setBacklogError] = useState<string | null>(null);
  const [regenLoading, setRegenLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showResendConfirm, setShowResendConfirm] = useState(false);

  // Fetch logs lazily when modal opens or inscrito changes
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

  const planInfo = PLAN_INFO[inscrito.plan];

  const currentIdx = todos.findIndex((i) => i.id === inscrito.id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < todos.length - 1;

  const handleAddNota = () => {
    if (!notaText.trim()) return;
    onAddNota(inscrito.id, notaText.trim());
    setNotaText("");
  };

  const copyRef = () => {
    if (inscrito.eupago_ref) {
      navigator.clipboard.writeText(inscrito.eupago_ref);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 1500);
    }
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
      alert("Erro ao gerar lembrete. Verifica a consola.");
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

  const copyPaymentLink = () => {
    if (inscrito.last_payment_link) {
      navigator.clipboard.writeText(inscrito.last_payment_link);
      setCopiedPayLink(true);
      setTimeout(() => setCopiedPayLink(false), 1500);
    }
  };

  const copyEupagoRef = () => {
    if (inscrito.eupago_ref) {
      navigator.clipboard.writeText(inscrito.eupago_ref);
      setCopiedEupagoRef(true);
      setTimeout(() => setCopiedEupagoRef(false), 1500);
    }
  };

  const copyToClipboard = (text: string, setter: (v: string | null) => void, key: string) => {
    navigator.clipboard.writeText(text);
    setter(key);
    setTimeout(() => setter(null), 1500);
  };

  // Build compact summary line
  const summaryParts: string[] = [];
  if (inscrito.plan !== "free") {
    summaryParts.push(planInfo.label);
    summaryParts.push(`€${inscrito.valor}`);
    if (inscrito.paid_at) summaryParts.push(`Pago em ${fmtDateShort(inscrito.paid_at)}`);
  } else {
    summaryParts.push("Gratuito");
  }
  summaryParts.push(`Passo ${inscrito.step_reached}/5`);

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
        className={`fixed z-[101] flex flex-col overflow-hidden ${
          isMobile ? "inset-0" : ""
        }`}
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
            <span className="text-ink-400">Ficha</span>
            <span className="text-ink-300"> · </span>
            <span className="font-semibold text-ink-800 text-[14px] truncate">{inscrito.nome}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <button
              onClick={() => hasPrev && onSelectInscrito(todos[currentIdx - 1])}
              disabled={!hasPrev}
              className="flex items-center gap-0.5 md:gap-1 px-2 md:px-3 py-1.5 text-[12px] md:text-[13px] font-medium text-ink-600 border border-border rounded-lg hover:bg-off-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Anterior</span>
            </button>
            <button
              onClick={() => hasNext && onSelectInscrito(todos[currentIdx + 1])}
              disabled={!hasNext}
              className="flex items-center gap-0.5 md:gap-1 px-2 md:px-3 py-1.5 text-[12px] md:text-[13px] font-medium text-ink-600 border border-border rounded-lg hover:bg-off-white disabled:opacity-40 transition-colors"
            >
              <span className="hidden sm:inline">Próximo</span>
              <ChevronRight size={14} />
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface text-ink-400 transition-colors" aria-label="Fechar">
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
              /* ── Mobile: compact horizontal header ── */
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
                  </div>
                </div>
                {/* Compact actions row */}
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
              /* ── Desktop: full left panel ── */
              <>
                {/* Name + gender emoji (no avatar) */}
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

                {/* Inscription date & step */}
                <div className="flex items-center justify-center gap-2 mt-2">
                  <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Inscrito em {fmtDate(inscrito.timestamp)}
                  </p>
                </div>

                <div className="my-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }} />

                {/* Quick Actions */}
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
                    onMouseEnter={(e) => {
                      if (!inscrito.follow_up) e.currentTarget.style.background = "rgba(255,255,255,0.10)";
                    }}
                    onMouseLeave={(e) => {
                      if (!inscrito.follow_up) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    }}
                  >
                    <Star size={13} style={{ color: inscrito.follow_up ? "hsl(var(--amber-400))" : "rgba(255,255,255,0.50)" }} />
                    <span className="text-[12px] font-medium" style={{ color: inscrito.follow_up ? "hsl(var(--amber-300))" : "rgba(255,255,255,0.70)" }}>
                      {inscrito.follow_up ? "Remover Follow-up" : "Marcar Follow-up"}
                    </span>
                  </button>
                  <button
                    onClick={() => { onArchive(inscrito.id); }}
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
                  {/* Backlog check-in button */}
                  {sendBacklogCheckin && !inscrito.paid_at && inscrito.plan_selected && inscrito.plan_selected !== "free" && !inscrito.do_not_contact && (
                    <button
                      onClick={async () => {
                        if (!confirm(`Enviar email de check-in backlog para ${inscrito.nome} (${inscrito.email})? Este email será enviado via Resend.`)) return;
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
                </div>
              </>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="overflow-y-auto p-4 md:p-7 bg-white">
            {/* Compact Summary */}
            <div className="flex flex-wrap items-center gap-2 mb-5 px-3 py-2.5 rounded-xl bg-off-white border border-border">
              <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: planInfo.bg, color: planInfo.color }}>
                {planInfo.label}
              </span>
              {inscrito.payment_status === "selected" && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                  Seleccionou e saiu — {planInfo.label}
                </span>
              )}
              {inscrito.payment_status === "awaiting_payment" && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                  Aguarda pagamento{inscrito.eupago_ref ? ` — ref: ${inscrito.eupago_ref}` : ""}
                </span>
              )}
              {inscrito.payment_status === "paid" && inscrito.plan !== "free" && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  Pago
                </span>
              )}
              {inscrito.plan !== "free" && (
                <span className="font-semibold text-[14px] text-ink-800">€{inscrito.valor}</span>
              )}
              {inscrito.paid_at && (
                <span className="text-[12px] text-ink-500">Pago em {fmtDateShort(inscrito.paid_at)}</span>
              )}
              {inscrito.upgrade_clicked_at && !inscrito.paid_at && (
                <span className="text-[11px] text-amber-600">Clicou em {fmtDateShort(inscrito.upgrade_clicked_at)}</span>
              )}
              <span className="text-ink-300">·</span>
              <span className="text-[12px] font-medium text-ink-500">Passo {inscrito.step_reached}/5</span>
              {inscrito.eupago_ref && (
                <>
                  <span className="text-ink-300">·</span>
                  <span className="text-[12px] text-ink-500 flex items-center gap-1">
                    Ref: <span className="font-medium text-ink-700">{inscrito.eupago_ref}</span>
                    <button onClick={copyRef} className="text-ink-300 hover:text-blue-600 transition-colors" aria-label="Copiar referência">
                      <Copy size={11} />
                    </button>
                    {copiedRef && <span className="text-[10px] text-green-600">Copiado!</span>}
                  </span>
                </>
              )}
            </div>

            {/* Follow-up Info & Reminder Button for Pending */}
            {(inscrito.payment_status === "awaiting_payment" || inscrito.payment_status === "selected") && (
              <div className="mb-5">
                {/* Follow-up stage, timing & do_not_contact */}
                <div className="flex flex-col gap-2 mb-3 px-3 py-2.5 rounded-lg bg-off-white border border-border text-[12px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink-600">
                      Follow-up automático: etapa {Math.min(inscrito.followup_stage, 3)}/3
                    </span>
                    {inscrito.last_payment_link_sent_at && (
                      <>
                        <span className="text-ink-300">·</span>
                        <span className="text-ink-500">Último link enviado em {fmtDate(inscrito.last_payment_link_sent_at)}</span>
                      </>
                    )}
                    {onToggleDoNotContact && (
                      <>
                        <span className="text-ink-300">·</span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={inscrito.do_not_contact}
                            onChange={() => onToggleDoNotContact(inscrito.id)}
                            className="w-3.5 h-3.5 rounded accent-red-500"
                          />
                          <span className={inscrito.do_not_contact ? "text-red-600 font-semibold" : "text-ink-500"}>
                            Não contactar
                          </span>
                        </label>
                      </>
                    )}
                  </div>
                  {/* Timing info */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-ink-500">
                      <Clock size={11} />
                      Última tentativa: {inscrito.last_followup_at ? fmtDate(inscrito.last_followup_at) : "Nunca"}
                    </span>
                    <span className="flex items-center gap-1 text-ink-500">
                      <Clock size={11} />
                      Próxima tentativa: {inscrito.followup_stage >= 3 ? "Concluído" : inscrito.next_followup_at ? fmtDate(inscrito.next_followup_at) : "N/A"}
                    </span>
                  </div>

                  {/* Payment link quick actions + status */}
                  {inscrito.last_payment_link && (() => {
                    const linkAgeMs = inscrito.payment_link_created_at
                      ? Date.now() - new Date(inscrito.payment_link_created_at).getTime()
                      : Infinity;
                    const linkAgeH = Math.round(linkAgeMs / (60 * 60 * 1000));
                    const linkColor = linkAgeH < 12 ? "#22C55E" : linkAgeH < 24 ? "#F59E0B" : "#DC2626";
                    const linkLabel = linkAgeH < 12 ? "OK" : linkAgeH < 24 ? "A expirar" : "Expirado";
                    return (
                      <div className="flex flex-col gap-1.5 mt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${linkColor}20`, color: linkColor }}>
                            Link: {linkLabel} ({linkAgeH}h)
                          </span>
                          {inscrito.payment_link_created_at && (
                            <span className="text-[10px] text-ink-400">Criado em {fmtDate(inscrito.payment_link_created_at)}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={copyPaymentLink}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            <Copy size={10} /> {copiedPayLink ? "Copiado!" : "Copiar link"}
                          </button>
                          <button
                            onClick={() => window.open(inscrito.last_payment_link!, "_blank")}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            <ExternalLink size={10} /> Abrir
                          </button>
                          {inscrito.eupago_ref && (
                            <button
                              onClick={copyEupagoRef}
                              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-off-white text-ink-600 hover:bg-surface transition-colors border border-border"
                            >
                              <Copy size={10} /> {copiedEupagoRef ? "Copiado!" : "Ref EuPago"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Manual recovery actions */}
                {inscrito.plan !== "free" && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {regenerateLink && (
                      <button
                        onClick={async () => {
                          setRegenLoading(true);
                          try {
                            const result = await regenerateLink(inscrito.id);
                            toast({ title: "Link regenerado com sucesso", description: result?.paymentLink ? `Novo link: ${result.paymentLink.slice(0, 50)}...` : "Link actualizado." });
                            onRefresh?.();
                          } catch (e: any) {
                            toast({ title: "Erro ao regenerar link", description: e?.message || "Tenta novamente.", variant: "destructive" });
                          } finally {
                            setRegenLoading(false);
                          }
                        }}
                        disabled={regenLoading}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        {regenLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                        Regenerar link EuPago
                      </button>
                    )}
                    {resendPaymentEmail && (
                      <>
                        <button
                          onClick={() => setShowResendConfirm(true)}
                          disabled={resendLoading}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                          {resendLoading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                          Reenviar email de pagamento
                        </button>
                        {showResendConfirm && (
                          <div className="w-full mt-1 p-3 rounded-lg border border-blue-200 bg-blue-50/50">
                            <p className="text-[12px] text-ink-700 mb-2">
                              Enviar email de pagamento via Resend para <strong>{inscrito.email}</strong>?
                            </p>
                            {inscrito.last_payment_link && (
                              <p className="text-[11px] text-ink-500 mb-2 truncate">Link: {inscrito.last_payment_link}</p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  setResendLoading(true);
                                  setShowResendConfirm(false);
                                  try {
                                    const result = await resendPaymentEmail(inscrito.id);
                                    toast({ title: "Email enviado com sucesso", description: result?.messageId ? `ID: ${result.messageId}` : "Enviado via Resend." });
                                    // Refresh logs
                                    if (fetchMessageLogs) {
                                      const logs = await fetchMessageLogs(inscrito.id);
                                      setMessageLogs(logs);
                                    }
                                  } catch (e: any) {
                                    toast({ title: "Erro ao enviar email", description: e?.message || "Tenta novamente.", variant: "destructive" });
                                  } finally {
                                    setResendLoading(false);
                                  }
                                }}
                                className="px-3 py-1.5 rounded text-[11px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                              >
                                Confirmar envio
                              </button>
                              <button
                                onClick={() => setShowResendConfirm(false)}
                                className="px-3 py-1.5 rounded text-[11px] font-medium border border-border text-ink-500 hover:bg-surface transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {!reminderData ? (
                  <button
                    onClick={handleGenerateReminder}
                    disabled={reminderLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-heading font-semibold text-[14px] transition-colors bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60"
                  >
                    {reminderLoading ? (
                      <><Loader2 size={16} className="animate-spin" /> A gerar link de pagamento...</>
                    ) : (
                      <><Bell size={16} /> {inscrito.eupago_ref ? "Gerar NOVO link de pagamento" : "Gerar link de pagamento"}</>
                    )}
                  </button>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-amber-100/60 border-b border-amber-200">
                      <h4 className="font-heading font-bold text-[14px] text-amber-900">📧 Email pronto a enviar</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setReminderData(null)}
                          className="text-[11px] text-amber-600 hover:text-amber-800 transition-colors"
                        >
                          Gerar novo
                        </button>
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="px-4 py-2.5 bg-white/50 border-b border-amber-200/60">
                      <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Assunto</span>
                      <p className="text-[13px] text-amber-900 font-semibold mt-0.5">{reminderData.emailSubject}</p>
                    </div>

                    {/* Body */}
                    <div className="px-4 py-3">
                      <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Corpo</span>
                      <pre className="text-[13px] text-amber-900 whitespace-pre-wrap leading-relaxed mt-1">
{reminderData.emailBody}
                      </pre>
                    </div>

                    {/* Actions */}
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

                    {/* Payment link */}
                    <div className="px-4 py-2 border-t border-amber-200/60">
                      <a
                        href={reminderData.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 hover:underline"
                      >
                        Link de pagamento: {reminderData.paymentLink} ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Funnel */}
            <FunnelView inscrito={inscrito} />

            {/* Origem */}
            {inscrito.source.length > 0 && (
              <>
                <hr className="border-border my-6" />
                <h3 className="font-heading font-bold text-[14px] text-ink-800 mb-3">Origem</h3>
                <div className="flex flex-wrap gap-2">
                  {inscrito.source.map((s) => (
                    <span key={s} className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                      {abbreviateSource(s)}
                    </span>
                  ))}
                </div>
                {inscrito.source_outro && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{ background: "hsl(var(--amber-50))", border: "1px solid rgba(217,119,6,0.15)" }}>
                    <Info size={12} className="text-amber-500 shrink-0" />
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
                  <h3 className="font-heading font-bold text-[14px] text-ink-800">Maior Dúvida</h3>
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
              <h3 className="font-heading font-bold text-[14px] text-ink-800">Notas</h3>
              {inscrito.notas.length > 0 && (
                <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  {inscrito.notas.length}
                </span>
              )}
            </div>
            {inscrito.notas.map((n) => (
              <div key={n.id} className="bg-off-white border-l-[3px] border-blue-300 rounded-r-[10px] px-3.5 py-3 mb-2 group relative">
                <p className="text-[14px] text-ink-700 leading-relaxed pr-6">{n.texto}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] text-ink-400">{fmtDate(n.timestamp)}</span>
                  <button
                    onClick={() => onRemoveNota(inscrito.id, n.id)}
                    className="text-[12px] text-ink-300 hover:text-red-500 hover:underline transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Apagar
                  </button>
                </div>
              </div>
            ))}

            {/* Add nota form */}
            <textarea
              value={notaText}
              onChange={(e) => setNotaText(e.target.value.slice(0, 500))}
              placeholder="Escreve uma nota sobre este inscrito..."
              className="w-full bg-off-white border border-border rounded-[10px] p-3 text-[14px] resize-none outline-none focus:border-blue-300 mt-2"
              style={{ minHeight: 80 }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[12px] text-ink-300">{notaText.length} / 500</span>
              <button
                onClick={handleAddNota}
                disabled={!notaText.trim()}
                className="bg-blue-600 text-white font-heading font-semibold text-[13px] px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                Guardar nota
              </button>
            </div>

            {/* ── Activity / Logs Section ── */}
            {(fetchMessageLogs || fetchPaymentEvents) && (() => {
              // Derived state for sticky summary
              const resendConfirmedLogs = messageLogs.filter((l: any) => l.provider === "resend" && l.status === "sent" && l.provider_message_id);
              const lastConfirmed = resendConfirmedLogs[0];
              const lastLog = messageLogs[0];
              const hasAnyResendConfirmed = resendConfirmedLogs.length > 0;
              const lastFailed = messageLogs.find((l: any) => l.status === "failed");
              const failedRecently = lastFailed && (Date.now() - new Date(lastFailed.created_at).getTime()) < 2 * 3600000;

              // Check if reminder_manual was sent in last 6h
              const reminderManualRecent = messageLogs.find((l: any) => l.template_key === "reminder_manual" && (Date.now() - new Date(l.created_at).getTime()) < 6 * 3600000);

              // Determine state
              let estadoLabel = "NUNCA ENVIADO";
              let estadoColor = "#94A3B8";
              let estadoBg = "rgba(148,163,184,0.1)";
              if (lastLog) {
                if (lastLog.status === "failed") { estadoLabel = "FALHOU"; estadoColor = "#DC2626"; estadoBg = "rgba(239,68,68,0.1)"; }
                else if (lastLog.status === "queued") { estadoLabel = "PENDENTE"; estadoColor = "#D97706"; estadoBg = "rgba(245,158,11,0.1)"; }
                else if (lastLog.provider === "resend" && lastLog.provider_message_id) { estadoLabel = "CONFIRMADO"; estadoColor = "#059669"; estadoBg = "rgba(16,185,129,0.1)"; }
                else if (lastLog.status === "sent") { estadoLabel = "ENVIADO"; estadoColor = "#2563EB"; estadoBg = "rgba(37,99,235,0.1)"; }
              }

              // Next action
              let nextAction = "";
              if (failedRecently) nextAction = "Reenviar quando possível / verificar rate limit";
              else if (!hasAnyResendConfirmed && !inscrito.paid_at && inscrito.plan_selected && inscrito.plan_selected !== "free") nextAction = "Enviar check-in backlog";
              else if (inscrito.next_followup_at && new Date(inscrito.next_followup_at).getTime() > Date.now()) nextAction = `Aguardar: ${fmtDate(inscrito.next_followup_at)}`;
              else if (inscrito.next_followup_at && new Date(inscrito.next_followup_at).getTime() <= Date.now()) nextAction = "Em atraso: rever";

              // Show reenviar button?
              const showReenviar = sendBacklogCheckin && !inscrito.paid_at && inscrito.plan_selected && inscrito.plan_selected !== "free" && !inscrito.do_not_contact && (
                (lastLog && lastLog.status === "failed") || !hasAnyResendConfirmed
              );

              return (
              <>
                <hr className="border-border my-6" />

                {/* Quick Actions Bar */}
                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  {inscrito.last_payment_link && (
                    <>
                      <button onClick={copyPaymentLink} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                        <Copy size={10} /> {copiedPayLink ? "Copiado!" : "Link pgto"}
                      </button>
                      <button onClick={() => window.open(inscrito.last_payment_link!, "_blank")} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                        <ExternalLink size={10} /> Abrir
                      </button>
                    </>
                  )}
                  {inscrito.eupago_ref && (
                    <button onClick={copyEupagoRef} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-off-white text-ink-600 hover:bg-surface transition-colors border border-border">
                      <Copy size={10} /> {copiedEupagoRef ? "Copiado!" : "Ref EuPago"}
                    </button>
                  )}
                  {inscrito.whatsapp && (
                    <button onClick={() => window.open(`https://wa.me/${inscrito.whatsapp.replace(/\D/g, "")}`, "_blank")} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                      <MessageSquare size={10} /> WhatsApp
                    </button>
                  )}
                </div>

                <h3 className="font-heading font-bold text-[14px] text-ink-800 mb-3">Actividade / Logs</h3>

                {/* Sticky Summary Block */}
                {!logsLoading && (
                  <div className="rounded-xl border border-border bg-off-white p-3 mb-4 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Estado</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: estadoBg, color: estadoColor }}>{estadoLabel}</span>
                    </div>
                    {lastConfirmed && (
                      <div className="text-[12px] text-ink-600">
                        <span className="text-ink-400">Último confirmado:</span>{" "}
                        <span className="font-medium">{getTemplateLabel(lastConfirmed.template_key)}</span>{" "}
                        <span className="text-ink-400">{fmtTimeAgo(lastConfirmed.created_at)}</span>
                      </div>
                    )}
                    {nextAction && (
                      <div className="text-[12px]">
                        <span className="text-ink-400">Próxima acção:</span>{" "}
                        <span className="font-medium text-ink-700">{nextAction}</span>
                      </div>
                    )}

                    {/* Reenviar button */}
                    {showReenviar && (
                      reminderManualRecent ? (
                        <p className="text-[11px] text-amber-600 mt-1">
                          ⚠ Lembrete manual já enviado {fmtTimeAgo(reminderManualRecent.created_at)} — aguardar
                        </p>
                      ) : (
                        <button
                          onClick={async () => {
                            if (!confirm(`Reenviar email (lembrete manual) para ${inscrito.email}?`)) return;
                            setBacklogSending(true);
                            setBacklogError(null);
                            try {
                              await sendBacklogCheckin!(inscrito.id, "reminder_manual");
                              setBacklogSent(true);
                            } catch (e: any) {
                              setBacklogError(e?.message || "Erro ao enviar");
                            } finally {
                              setBacklogSending(false);
                            }
                          }}
                          disabled={backlogSending || backlogSent}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium mt-1 transition-colors"
                          style={{ background: backlogSent ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: backlogSent ? "#059669" : "#DC2626" }}
                        >
                          {backlogSending ? <Loader2 size={12} className="animate-spin" /> : backlogSent ? <CheckCircle2 size={12} /> : <Send size={12} />}
                          {backlogSent ? "Enviado ✓" : backlogSending ? "A enviar..." : "Reenviar último email"}
                        </button>
                      )
                    )}
                    {backlogError && <p className="text-[11px] text-red-600">{backlogError}</p>}
                  </div>
                )}

                {logsLoading ? (
                  <div className="flex items-center gap-2 text-ink-400 text-[13px] py-4">
                    <Loader2 size={14} className="animate-spin" /> A carregar logs...
                  </div>
                ) : (
                  <Tabs defaultValue="emails" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 mb-3">
                      <TabsTrigger value="emails" className="text-[12px]">
                        Emails {messageLogs.length > 0 && <span className="ml-1 text-[10px] opacity-60">({messageLogs.length})</span>}
                      </TabsTrigger>
                      <TabsTrigger value="pagamentos" className="text-[12px]">
                        Pagamentos {paymentEvents.length > 0 && <span className="ml-1 text-[10px] opacity-60">({paymentEvents.length})</span>}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="emails">
                      {messageLogs.length === 0 ? (
                        <p className="text-[13px] text-ink-400 py-3">Sem emails enviados</p>
                      ) : (
                        <div className="space-y-2">
                          {messageLogs.map((log) => {
                            const st = STATUS_STYLES[log.status] || STATUS_STYLES.queued;
                            const isConfirmed = log.provider === "resend" && log.provider_message_id;
                            const isLegacy = log.provider === "internal";
                            return (
                              <div key={log.id} className="rounded-lg border border-border bg-off-white px-3 py-2.5" style={isLegacy ? { opacity: 0.55 } : {}}>
                                {/* Title line */}
                                <div className="flex items-start gap-1.5 mb-1">
                                  {isConfirmed && <CheckCircle2 size={13} className="text-green-600 mt-0.5 shrink-0" />}
                                  <span className="text-[13px] font-semibold text-ink-800">{getTemplateLabel(log.template_key)}</span>
                                </div>
                                {/* Badges row */}
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-1">
                                  <span className="font-medium px-1.5 py-0.5 rounded-full text-[10px]" style={{ background: st.bg, color: st.color }}>
                                    {log.status}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-full text-[10px]" style={{
                                    background: isLegacy ? "rgba(148,163,184,0.1)" : "rgba(37,99,235,0.08)",
                                    color: isLegacy ? "#94A3B8" : "#2563EB",
                                  }}>
                                    {isLegacy ? "Internal" : "Resend"}
                                  </span>
                                  <span className="text-ink-400">{fmtTimeAgo(log.created_at)}</span>
                                  {isLegacy && <span className="text-ink-300 text-[10px]" title="Log interno antigo — não prova envio real">⚠ legado</span>}
                                </div>
                                {/* Recipient */}
                                <div className="text-[11px] text-ink-500 mb-1">Para: {inscrito.email}</div>
                                {/* Resend ID */}
                                {log.provider_message_id && (
                                  <div className="flex items-center gap-1 text-[10px] text-ink-400 mb-1">
                                    <span className="truncate max-w-[180px]" title={log.provider_message_id}>{log.provider_message_id.slice(0, 24)}…</span>
                                    <button
                                      onClick={() => copyToClipboard(log.provider_message_id, setCopiedMsgId, log.id)}
                                      className="text-ink-400 hover:text-blue-600 transition-colors"
                                    >
                                      <Copy size={10} />
                                    </button>
                                    {copiedMsgId === log.id && <span className="text-green-600">Copiado!</span>}
                                  </div>
                                )}
                                {/* Error collapsible */}
                                {log.error && (
                                  <Collapsible>
                                    <CollapsibleTrigger className="flex items-center gap-1 text-[11px] text-red-600 hover:underline cursor-pointer">
                                      <AlertTriangle size={10} /> Ver erro
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                      <pre className="text-[10px] text-red-700 bg-red-50 rounded p-2 mt-1 overflow-x-auto max-h-[100px] border border-red-200">
                                        {log.error}
                                      </pre>
                                    </CollapsibleContent>
                                  </Collapsible>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="pagamentos">
                      {paymentEvents.length === 0 ? (
                        <p className="text-[13px] text-ink-400 py-3">Sem eventos de pagamento</p>
                      ) : (
                        <div className="space-y-2">
                          {paymentEvents.map((evt) => (
                            <div key={evt.id} className="rounded-lg border border-border bg-off-white px-3 py-2">
                              <div className="flex flex-wrap items-center gap-2 text-[12px]">
                                <span className="text-ink-500">{fmtDate(evt.received_at)}</span>
                                <span className="font-medium px-1.5 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700">
                                  {evt.event_type}
                                </span>
                                {evt.eupago_ref && (
                                  <span className="text-ink-500">Ref: {evt.eupago_ref}</span>
                                )}
                                {evt.processed_at && (
                                  <span className="text-green-600 text-[11px]">✓ Processado</span>
                                )}
                                <button
                                  onClick={() => copyToClipboard(evt.idempotency_key, setCopiedIdempKey, evt.id)}
                                  className="flex items-center gap-0.5 text-ink-400 hover:text-blue-600 transition-colors"
                                  title={evt.idempotency_key}
                                >
                                  <Copy size={10} />
                                  <span className="text-[10px]">
                                    {copiedIdempKey === evt.id ? "Copiado!" : "Key"}
                                  </span>
                                </button>
                              </div>
                              <Collapsible>
                                <CollapsibleTrigger className="text-[11px] text-blue-600 hover:underline mt-1 cursor-pointer">
                                  Ver payload
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <pre className="text-[10px] text-ink-600 bg-white rounded p-2 mt-1 overflow-x-auto max-h-[120px] border border-border">
                                    {JSON.stringify(evt.payload, null, 2)}
                                  </pre>
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </>
              );
            })()}
          </div>
        </div>
      </div>
    </>
  );
}
