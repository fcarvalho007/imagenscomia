import { useState } from "react";
import { X, Check, MessageSquare, Mail, Star, Archive, Trash2, Quote } from "lucide-react";
import type { Inscrito } from "@/pages/crm/mockData";

interface InscritoSlideOverProps {
  inscrito: Inscrito;
  onClose: () => void;
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
  free: { bg: "hsl(var(--surface))", color: "hsl(var(--ink-400))", label: "Gratuito · €0" },
  premium: { bg: "hsl(var(--blue-50))", color: "hsl(var(--blue-600))", label: "Premium Pass · €15" },
  masterclass: { bg: "rgba(124,58,237,0.1)", color: "#7C3AED", label: "Masterclass · €57,81" },
  bundle: { bg: "hsl(var(--green-50))", color: "hsl(var(--green-600))", label: "Bundle · €72,81" },
};

const STEPS = ["Origem", "Dúvida", "Premium", "MC", "Conclusão"];

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatDateFull(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} de ${months[d.getMonth()]} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

export default function InscritoSlideOver({
  inscrito,
  onClose,
  onAddNota,
  onRemoveNota,
  onToggleFollowUp,
  onArchive,
}: InscritoSlideOverProps) {
  const [notaText, setNotaText] = useState("");
  const gradIdx = parseInt(inscrito.id, 10) % GRADIENTS.length;
  const planInfo = PLAN_INFO[inscrito.plan];

  const handleAddNota = () => {
    if (!notaText.trim()) return;
    onAddNota(inscrito.id, notaText.trim());
    setNotaText("");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[99]"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-screen w-[420px] max-sm:w-full bg-white z-[100] overflow-y-auto animate-in slide-in-from-right duration-250"
        style={{ boxShadow: "-8px 0 40px rgba(0,0,0,0.15)" }}
      >
        <div className="p-6">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-ink-400 hover:text-ink-900 transition-colors"
            aria-label="Fechar ficha"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white font-heading font-bold text-lg"
            style={{ background: GRADIENTS[gradIdx] }}
          >
            {getInitials(inscrito.nome)}
          </div>
          <h2 className="font-heading font-bold text-xl text-ink-900 mt-3">{inscrito.nome}</h2>
          <p className="text-sm text-ink-500">{inscrito.email}</p>
          <a
            href={`https://wa.me/${inscrito.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline block"
          >
            {inscrito.whatsapp}
          </a>
          <span
            className="inline-block text-[13px] font-medium px-3 py-1 rounded-full mt-2"
            style={{ background: planInfo.bg, color: planInfo.color }}
          >
            {planInfo.label}
          </span>
          <p className="text-xs text-ink-400 mt-1">Inscrito em {formatDateFull(inscrito.timestamp)}</p>

          {/* Divider */}
          <hr className="border-border my-5" />

          {/* Progress */}
          <p className="font-heading font-semibold text-[13px] text-ink-500 uppercase mb-2.5">Progresso</p>
          <div className="flex gap-1 mb-1">
            {STEPS.map((_, idx) => {
              const step = idx + 1;
              const completed = inscrito.step_reached >= step;
              const isCurrent = inscrito.step_reached === step;
              return (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent ? "ring-2 ring-blue-300 ring-offset-1" : ""
                    }`}
                    style={{
                      background: completed ? "hsl(var(--blue-600))" : "hsl(var(--surface))",
                      color: completed ? "white" : "hsl(var(--ink-400))",
                    }}
                  >
                    {completed ? <Check size={14} /> : step}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-1">
            {STEPS.map((label) => (
              <span key={label} className="flex-1 text-center text-[10px] text-ink-400">{label}</span>
            ))}
          </div>

          {/* Divider */}
          <hr className="border-border my-5" />

          {/* Details */}
          <p className="font-heading font-semibold text-[13px] text-ink-500 uppercase mb-3">Detalhes da Inscrição</p>
          <div className="grid grid-cols-2 gap-3 mb-2">
            {[
              { label: "Plano", value: planInfo.label },
              { label: "Pago em", value: inscrito.paid_at ? formatDateFull(inscrito.paid_at) : "Gratuito" },
              { label: "Ref. EuPago", value: inscrito.eupago_ref || "—" },
              { label: "Passo máximo", value: `${inscrito.step_reached} de 5` },
            ].map((d) => (
              <div key={d.label} className="bg-off-white rounded-lg p-3">
                <p className="text-[11px] text-ink-400 mb-0.5">{d.label}</p>
                <p className="text-[13px] font-medium text-ink-900">{d.value}</p>
              </div>
            ))}
          </div>

          {/* Sources */}
          {inscrito.source.length > 0 && (
            <div className="mt-3">
              <p className="font-heading font-semibold text-xs text-ink-500 mb-1.5">Origem</p>
              <div className="flex flex-wrap gap-1">
                {inscrito.source.map((s) => (
                  <span key={s} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Duvida */}
          {inscrito.duvida && (
            <>
              <hr className="border-border my-5" />
              <p className="font-heading font-semibold text-[13px] text-ink-500 uppercase mb-2.5">Maior Dúvida</p>
              <div className="rounded-lg p-3.5 border" style={{ background: "hsl(var(--amber-50))", borderColor: "rgba(217,119,6,0.2)" }}>
                <Quote size={14} className="text-amber-600 mb-1" />
                <p className="text-sm leading-relaxed" style={{ color: "hsl(26 90% 30%)" }}>{inscrito.duvida}</p>
              </div>
            </>
          )}

          {/* Divider */}
          <hr className="border-border my-5" />

          {/* Notes */}
          <div className="flex items-center gap-2 mb-3">
            <p className="font-heading font-semibold text-[13px] text-ink-500 uppercase">Notas</p>
            {inscrito.notas.length > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                {inscrito.notas.length}
              </span>
            )}
          </div>
          <div className="space-y-2 mb-3">
            {inscrito.notas.map((n) => (
              <div key={n.id} className="bg-off-white border-l-[3px] border-blue-300 rounded-r-lg px-3.5 py-2.5 relative group">
                <p className="text-[13px] text-ink-700 pr-6">{n.texto}</p>
                <p className="text-[11px] text-ink-400 mt-1">{formatDateFull(n.timestamp)}</p>
                <button
                  onClick={() => onRemoveNota(inscrito.id, n.id)}
                  className="absolute top-2.5 right-2.5 text-ink-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Apagar nota"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
          <textarea
            value={notaText}
            onChange={(e) => setNotaText(e.target.value)}
            placeholder="Adicionar nota sobre este inscrito..."
            className="w-full bg-off-white border border-border rounded-lg p-2.5 text-sm resize-none h-[72px] outline-none focus:ring-1 focus:ring-blue-300"
          />
          <button
            onClick={handleAddNota}
            disabled={!notaText.trim()}
            className="mt-1.5 bg-blue-600 text-white font-heading font-semibold text-[13px] px-3.5 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            Guardar nota
          </button>

          {/* Divider */}
          <hr className="border-border my-5" />

          {/* Actions */}
          <p className="font-heading font-semibold text-[13px] text-ink-500 uppercase mb-2.5">Acções</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => window.open(`https://wa.me/${inscrito.whatsapp.replace(/\D/g, "")}`, "_blank")}
              className="flex items-center gap-2 border border-border rounded-lg p-2.5 text-sm text-ink-700 hover:bg-off-white transition-colors"
            >
              <MessageSquare size={16} /> Abrir WhatsApp
            </button>
            <button
              onClick={() => window.open(`mailto:${inscrito.email}`, "_blank")}
              className="flex items-center gap-2 border border-border rounded-lg p-2.5 text-sm text-ink-700 hover:bg-off-white transition-colors"
            >
              <Mail size={16} /> Enviar Email
            </button>
            <button
              onClick={() => onToggleFollowUp(inscrito.id)}
              className="flex items-center gap-2 border border-border rounded-lg p-2.5 text-sm text-ink-700 hover:bg-off-white transition-colors"
            >
              <Star size={16} className={inscrito.follow_up ? "text-amber-500 fill-amber-500" : ""} />
              {inscrito.follow_up ? "Remover Follow-up" : "Marcar Follow-up"}
            </button>
            <button
              onClick={() => onArchive(inscrito.id)}
              className="flex items-center gap-2 border border-border rounded-lg p-2.5 text-sm text-ink-700 hover:bg-off-white transition-colors"
            >
              <Archive size={16} /> Arquivar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
