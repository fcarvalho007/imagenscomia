import { useState, useMemo } from "react";
import {
  X, ChevronLeft, ChevronRight, Check, MessageSquare, Mail, Star, Archive, Trash2, Copy, Info,
} from "lucide-react";
import type { Inscrito } from "@/pages/crm/mockData";

interface InscritoModalProps {
  inscrito: Inscrito;
  todos: Inscrito[];
  onClose: () => void;
  onSelectInscrito: (i: Inscrito) => void;
  onAddNota: (id: string, texto: string) => void;
  onRemoveNota: (id: string, notaId: string) => void;
  onToggleFollowUp: (id: string) => void;
  onArchive: (id: string) => void;
}

const GRADIENTS = [
  "linear-gradient(135deg,#1e3a5f,#3b82f6)",
  "linear-gradient(135deg,#064e3b,#10b981)",
  "linear-gradient(135deg,#7c2d12,#f97316)",
  "linear-gradient(135deg,#1e1b4b,#7c3aed)",
  "linear-gradient(135deg,#0c4a6e,#0284c7)",
  "linear-gradient(135deg,#134e4a,#0d9488)",
];

const PLAN_INFO: Record<string, { bg: string; color: string; label: string }> = {
  free: { bg: "hsl(var(--surface))", color: "hsl(var(--ink-400))", label: "Gratuito" },
  premium: { bg: "hsl(var(--blue-50))", color: "hsl(var(--blue-600))", label: "Premium" },
  masterclass: { bg: "rgba(124,58,237,0.1)", color: "#7C3AED", label: "Masterclass" },
  bundle: { bg: "hsl(var(--green-50))", color: "hsl(var(--green-600))", label: "Bundle" },
};

const PLAN_COLORS: Record<string, string> = {
  free: "hsl(var(--ink-400))",
  premium: "hsl(var(--blue-600))",
  masterclass: "#7C3AED",
  bundle: "hsl(var(--green-600))",
};

const STEPS = [
  { name: "Origem", getStatus: (i: Inscrito) => i.step_reached >= 1 ? (i.source.length > 0 ? `${i.source.length} canais indicados` : "Completado") : "Saltou" },
  { name: "Dúvida", getStatus: (i: Inscrito) => i.step_reached >= 2 ? (i.duvida ? "Respondeu" : "Saltou") : "Não atingiu" },
  { name: "Premium", getStatus: (i: Inscrito) => i.step_reached >= 3 ? (i.plan === "premium" || i.plan === "bundle" ? "Converteu" : "Não converteu") : "Não atingiu" },
  { name: "Masterclass", getStatus: (i: Inscrito) => i.step_reached >= 4 ? (i.plan === "masterclass" || i.plan === "bundle" ? "Converteu" : "Não converteu") : "Não atingiu" },
  { name: "Conclusão", getStatus: (i: Inscrito) => i.step_reached >= 5 ? "Concluído" : "Não concluiu" },
];

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
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

function stepConverted(i: Inscrito, step: number): boolean {
  if (step === 1) return i.step_reached >= 1 && i.source.length > 0;
  if (step === 2) return i.step_reached >= 2 && i.duvida !== "";
  if (step === 3) return i.step_reached >= 3 && (i.plan === "premium" || i.plan === "bundle");
  if (step === 4) return i.step_reached >= 4 && (i.plan === "masterclass" || i.plan === "bundle");
  if (step === 5) return i.step_reached >= 5;
  return false;
}

export default function InscritoModal({
  inscrito, todos, onClose, onSelectInscrito, onAddNota, onRemoveNota, onToggleFollowUp, onArchive,
}: InscritoModalProps) {
  const [notaText, setNotaText] = useState("");
  const [copiedRef, setCopiedRef] = useState(false);

  const gradIdx = parseInt(inscrito.id, 10) % GRADIENTS.length;
  const planInfo = PLAN_INFO[inscrito.plan];
  const planColor = PLAN_COLORS[inscrito.plan];

  const currentIdx = todos.findIndex((i) => i.id === inscrito.id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < todos.length - 1;

  const timeline = useMemo(() => {
    const events: { type: "inscricao" | "passo" | "pagamento" | "nota"; text: string; date: string }[] = [];
    events.push({ type: "inscricao", text: "Inscrito no webinar", date: inscrito.timestamp });
    for (let s = 1; s <= inscrito.step_reached; s++) {
      events.push({ type: "passo", text: `Completou o passo ${s} (${STEPS[s - 1].name})`, date: inscrito.timestamp });
    }
    if (inscrito.upgrade_clicked_at && inscrito.plan_selected) {
      const planLabel = inscrito.plan_selected.charAt(0).toUpperCase() + inscrito.plan_selected.slice(1);
      events.push({ type: "passo", text: `Clicou para pagar (${planLabel})`, date: inscrito.upgrade_clicked_at });
    }
    if (inscrito.paid_at) {
      events.push({ type: "pagamento", text: `Pagamento confirmado · €${inscrito.valor} (${planInfo.label})`, date: inscrito.paid_at });
    }
    inscrito.notas.forEach((n) => {
      events.push({ type: "nota", text: `Nota adicionada: ${n.texto.slice(0, 40)}${n.texto.length > 40 ? "…" : ""}`, date: n.timestamp });
    });
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return events;
  }, [inscrito]);

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

  const eventDotColor = (type: string) => {
    if (type === "inscricao") return "hsl(var(--blue-600))";
    if (type === "pagamento") return "hsl(var(--green-600))";
    if (type === "nota") return "hsl(var(--amber-500))";
    return "hsl(var(--ink-300))";
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
        className="fixed z-[101] flex flex-col overflow-hidden"
        style={{
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "min(880px, 95vw)", maxHeight: "90vh",
          borderRadius: "20px", boxShadow: "0 32px 80px rgba(0,0,0,0.25)", background: "white",
        }}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 border-b border-border shrink-0" style={{ height: 56 }}>
          <div className="text-[13px]">
            <span className="text-ink-400">Ficha</span>
            <span className="text-ink-300"> · </span>
            <span className="font-semibold text-ink-800 text-[14px]">{inscrito.nome}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => hasPrev && onSelectInscrito(todos[currentIdx - 1])}
              disabled={!hasPrev}
              className="flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-ink-600 border border-border rounded-lg hover:bg-off-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <button
              onClick={() => hasNext && onSelectInscrito(todos[currentIdx + 1])}
              disabled={!hasNext}
              className="flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-ink-600 border border-border rounded-lg hover:bg-off-white disabled:opacity-40 transition-colors"
            >
              Próximo <ChevronRight size={14} />
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface text-ink-400 transition-colors" aria-label="Fechar">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-[280px_1fr]" style={{ height: "calc(90vh - 56px)" }}>
          {/* LEFT PANEL */}
          <div className="overflow-y-auto p-5 md:p-7 md:sticky md:top-0 text-center md:text-left" style={{ background: "#0F172A" }}>
            {/* Avatar */}
            <div className="flex justify-center md:justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-heading font-extrabold text-[22px]"
                style={{ background: GRADIENTS[gradIdx] }}
              >
                {getInitials(inscrito.nome)}
              </div>
            </div>
            <h2 className="font-heading font-bold text-[18px] text-white mt-3">{inscrito.nome}</h2>
            <p className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{inscrito.email}</p>

            {/* WhatsApp clickable */}
            <button
              onClick={() => window.open(`https://wa.me/${inscrito.whatsapp.replace(/\D/g, "")}`, "_blank")}
              className="w-full mt-3 flex items-center gap-2 justify-center rounded-lg px-3 py-2 transition-colors"
              style={{ background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.20)" }}
            >
              <MessageSquare size={14} color="#25D366" />
              <span className="text-[13px] font-medium" style={{ color: "#4ADE80" }}>{inscrito.whatsapp}</span>
            </button>
            <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Abrir WhatsApp</p>

            {/* Plan badge */}
            <div className="flex justify-center mt-3">
              <span className="font-heading font-bold text-[13px] px-3.5 py-1.5 rounded-full" style={{ background: planInfo.bg, color: planInfo.color }}>
                {planInfo.label}
              </span>
            </div>

            {/* Timestamp */}
            <p className="text-[12px] mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
              Inscrito em {fmtDate(inscrito.timestamp)}
            </p>

            {/* Divider */}
            <div className="my-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }} />

            {/* Progress */}
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Progresso</p>
            <div className="space-y-0 text-left">
              {STEPS.map((step, idx) => {
                const stepNum = idx + 1;
                const reached = inscrito.step_reached >= stepNum;
                const converted = stepConverted(inscrito, stepNum);
                const status = step.getStatus(inscrito);
                return (
                  <div key={idx}>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                        style={
                          reached && converted
                            ? { background: planColor, color: "white" }
                            : reached
                            ? { background: "transparent", border: `2px solid ${planColor}`, color: planColor }
                            : { background: "rgba(255,255,255,0.06)", color: "hsl(var(--ink-400))" }
                        }
                      >
                        {reached ? <Check size={12} style={{ opacity: converted ? 1 : 0.5 }} /> : stepNum}
                      </div>
                      <div>
                        <p className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.70)" }}>{step.name}</p>
                        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>{status}</p>
                      </div>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className="ml-3 h-3" style={{ borderLeft: "2px solid rgba(255,255,255,0.08)" }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }} />

            {/* Quick Actions */}
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: "rgba(255,255,255,0.35)" }}>Acções</p>
            <div className="space-y-1.5 text-left">
              <button
                onClick={() => window.open(`https://wa.me/${inscrito.whatsapp.replace(/\D/g, "")}`, "_blank")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
                style={{ background: "rgba(255,255,255,0.06)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              >
                <MessageSquare size={14} style={{ color: "rgba(255,255,255,0.50)" }} />
                <span className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.70)" }}>Enviar WhatsApp</span>
              </button>
              <button
                onClick={() => window.open(`mailto:${inscrito.email}`, "_blank")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
                style={{ background: "rgba(255,255,255,0.06)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              >
                <Mail size={14} style={{ color: "rgba(255,255,255,0.50)" }} />
                <span className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.70)" }}>Enviar Email</span>
              </button>
              <button
                onClick={() => onToggleFollowUp(inscrito.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
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
                <Star size={14} style={{ color: inscrito.follow_up ? "hsl(var(--amber-400))" : "rgba(255,255,255,0.50)" }} />
                <span className="text-[13px] font-medium" style={{ color: inscrito.follow_up ? "hsl(var(--amber-300))" : "rgba(255,255,255,0.70)" }}>
                  {inscrito.follow_up ? "Remover Follow-up" : "Marcar Follow-up"}
                </span>
              </button>
              <button
                onClick={() => { onArchive(inscrito.id); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
                style={{ background: "rgba(255,255,255,0.06)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.10)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              >
                <Archive size={14} style={{ color: "rgba(255,255,255,0.50)" }} className="group-hover:text-red-400" />
                <span className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.70)" }}>Arquivar inscrito</span>
              </button>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="overflow-y-auto p-5 md:p-7 bg-white">
            {/* Detalhes */}
            <h3 className="font-heading font-bold text-[14px] text-ink-800 mb-4">Detalhes</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-off-white border border-border rounded-xl p-4">
                <p className="text-[11px] text-ink-400 mb-1">Plano</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: planInfo.bg, color: planInfo.color }}>
                    {planInfo.label}
                  </span>
                  <span className="font-semibold text-[14px] text-ink-800">· €{inscrito.valor}</span>
                </div>
              </div>
              <div className="bg-off-white border border-border rounded-xl p-4">
                <p className="text-[11px] text-ink-400 mb-1">Pago em</p>
                {inscrito.paid_at ? (
                  <p className="font-semibold text-[14px] text-ink-800">{fmtDate(inscrito.paid_at)}</p>
                ) : (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface text-ink-400">Gratuito</span>
                )}
              </div>
              <div className="bg-off-white border border-border rounded-xl p-4">
                <p className="text-[11px] text-ink-400 mb-1">Ref. EuPago</p>
                {inscrito.eupago_ref ? (
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-[13px] text-ink-700">{inscrito.eupago_ref}</span>
                    <button onClick={copyRef} className="text-ink-300 hover:text-blue-600 transition-colors" aria-label="Copiar referência">
                      <Copy size={12} />
                    </button>
                    {copiedRef && <span className="text-[10px] text-green-600">Copiado!</span>}
                  </div>
                ) : (
                  <span className="text-ink-300">—</span>
                )}
              </div>
              <div className="bg-off-white border border-border rounded-xl p-4">
                <p className="text-[11px] text-ink-400 mb-1">Progresso no flow</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(inscrito.step_reached / 5) * 100}%`, background: "hsl(var(--blue-600))" }} />
                  </div>
                  <span className="font-heading font-bold text-[14px] text-ink-900">{inscrito.step_reached} de 5</span>
                </div>
              </div>
              {inscrito.plan_selected && (
                <div className="bg-off-white border border-border rounded-xl p-4">
                  <p className="text-[11px] text-ink-400 mb-1">Plano seleccionado (upgrade)</p>
                  <span className="text-[13px] font-semibold text-ink-800 capitalize">{inscrito.plan_selected}</span>
                </div>
              )}
              {inscrito.upgrade_clicked_at && (
                <div className="bg-off-white border border-border rounded-xl p-4">
                  <p className="text-[11px] text-ink-400 mb-1">Clicou em pagar</p>
                  <p className="font-semibold text-[14px] text-ink-800">{fmtDate(inscrito.upgrade_clicked_at)}</p>
                </div>
              )}
            </div>

            {/* Origem */}
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

            {/* Dúvida */}
            {inscrito.duvida && (
              <>
                <hr className="border-border my-6" />
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-bold text-[14px] text-ink-800">Maior Dúvida</h3>
                  <span className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-600">Passo 2 preenchido</span>
                </div>
                <div className="rounded-xl p-4 border" style={{ background: "hsl(var(--amber-50))", borderColor: "rgba(217,119,6,0.20)" }}>
                  <span className="font-heading font-extrabold text-[40px] leading-[0.5]" style={{ color: "rgba(217,119,6,0.20)" }}>"</span>
                  <p className="text-[15px] leading-[1.7] text-amber-900 mt-2">{inscrito.duvida}</p>
                </div>
              </>
            )}

            {/* Timeline */}
            <hr className="border-border my-6" />
            <h3 className="font-heading font-bold text-[14px] text-ink-800 mb-4">Actividade</h3>
            <div className="relative pl-6">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
              {timeline.map((ev, idx) => (
                <div key={idx} className="flex gap-3.5 mb-3.5 relative">
                  <div
                    className="w-4 h-4 rounded-full shrink-0 absolute -left-6 mt-0.5 border-2 border-white"
                    style={{ background: eventDotColor(ev.type), boxShadow: "0 1px 3px rgba(0,0,0,0.1)", zIndex: 1 }}
                  />
                  <div>
                    <p className="text-[13px] font-medium text-ink-800">{ev.text}</p>
                    <p className="text-[12px] text-ink-400">{fmtDate(ev.date)}</p>
                  </div>
                </div>
              ))}
            </div>

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
