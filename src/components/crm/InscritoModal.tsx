import { useState } from "react";
import {
  X, ChevronLeft, ChevronRight, MessageSquare, Mail, Star, Archive, Trash2, Copy, Info, Pencil, Check, Bell, Loader2,
} from "lucide-react";
import FunnelView from "@/components/crm/FunnelView";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Inscrito } from "@/pages/crm/mockData";
import { genderEmoji, type Gender } from "@/lib/genderDetection";
import googleIcon from "@/assets/google_g_icon.svg";
import { supabase } from "@/integrations/supabase/client";

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

function abbreviateSource(s: string) {
  if (s.startsWith("Instagram")) return "Instagram";
  if (s.startsWith("Podcast")) return "Podcast RFM";
  if (s.includes("Email")) return "Email/Newsletter";
  if (s.includes("WhatsApp")) return "WhatsApp";
  return s;
}


export default function InscritoModal({
  inscrito, todos, onClose, onSelectInscrito, onAddNota, onRemoveNota, onToggleFollowUp, onArchive, onDelete, onSetGender, onUpdateName,
}: InscritoModalProps) {
  const [notaText, setNotaText] = useState("");
  const [copiedRef, setCopiedRef] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState(inscrito.nome);
  const isMobile = useIsMobile();
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderData, setReminderData] = useState<{ emailSubject: string; emailBody: string; paymentLink: string } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

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
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  Seleccionou {planInfo.label}
                </span>
              )}
              {inscrito.payment_status === "awaiting_payment" && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
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

            {/* Reminder Button for Pending */}
            {(inscrito.payment_status === "awaiting_payment" || inscrito.payment_status === "selected") && (
              <div className="mb-5">
                {!reminderData ? (
                  <button
                    onClick={handleGenerateReminder}
                    disabled={reminderLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-heading font-semibold text-[14px] transition-colors bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60"
                  >
                    {reminderLoading ? (
                      <><Loader2 size={16} className="animate-spin" /> A gerar link de pagamento...</>
                    ) : (
                      <><Bell size={16} /> Gerar Lembrete de Pagamento</>
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
          </div>
        </div>
      </div>
    </>
  );
}
