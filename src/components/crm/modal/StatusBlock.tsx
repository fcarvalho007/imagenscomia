import type { Inscrito } from "@/pages/crm/mockData";
import { Send } from "lucide-react";

const STEP_NAMES_IMAGENS = ["Inscrição", "Origem", "Dúvida", "Premium", "Masterclass", "Conclusão"];
const STEP_NAMES_VIDEO = ["Inscrição", "Qualificação", "Qualificação", "Masterclass", "Gravação", "Dúvida"];

const PLAN_LABELS: Record<string, string> = {
  free: "Gratuito",
  premium: "Premium Pass — €15+IVA",
  masterclass: "Masterclass — €47+IVA",
  bundle: "Bundle — €62+IVA",
};

function normalizePlan(inscrito: Inscrito) {
  const rawPlan = inscrito.plan_selected || inscrito.plan || "free";
  const normalized = rawPlan.replace(/^video-/, "");
  return PLAN_LABELS[normalized] || (normalized === "free" ? "Gratuito" : normalized);
}

interface StatusBlockProps {
  inscrito: Inscrito;
  onResendLink?: () => void;
  onToggleInvoiceSent?: () => void;
}

export default function StatusBlock({ inscrito, onResendLink, onToggleInvoiceSent }: StatusBlockProps) {
  const linkAgeMs = inscrito.payment_link_created_at
    ? Date.now() - new Date(inscrito.payment_link_created_at).getTime()
    : Infinity;
  const linkAgeH = Math.round(linkAgeMs / (60 * 60 * 1000));
  const remainingH = Math.max(0, 24 - linkAgeH);
  const linkExpired = linkAgeH >= 24;
  const planLabel = normalizePlan(inscrito);

  // State A — Awaiting payment
  if (inscrito.payment_status === "awaiting_payment" || inscrito.payment_status === "selected") {
    return (
      <div className="rounded-[10px] p-4" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}>
        <span className="inline-flex items-center gap-1.5 text-[14px] font-bold" style={{ color: "#d97706" }}>
          ⏳ {inscrito.payment_status === "selected" ? "Seleccionou e saiu" : "Aguarda pagamento"}
        </span>
        <p className="text-[13px] mt-2 font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
          {planLabel}
        </p>
        {inscrito.payment_link_created_at && (
          <p className="text-[12px] mt-1.5" style={{ color: linkExpired ? "#ef4444" : "rgba(255,255,255,0.45)" }}>
            {linkExpired
              ? "⚠️ Link expirado"
              : `Link criado há ${linkAgeH}h · válido por ${remainingH}h restantes`}
          </p>
        )}
        {onResendLink && (
          <button
            onClick={onResendLink}
            className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold transition-colors px-3 py-1.5 rounded-md"
            style={{ color: "#d97706", background: "rgba(245,158,11,0.1)" }}
          >
            <Send size={12} /> Reenviar link →
          </button>
        )}
      </div>
    );
  }

  // State B — Paid
  if (inscrito.paid_at) {
    return (
      <div className="rounded-[10px] p-4" style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)" }}>
        <span className="inline-flex items-center gap-1.5 text-[14px] font-bold" style={{ color: "#16a34a" }}>
          ✅ Pago
        </span>
        <p className="text-[13px] mt-2 font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
          {planLabel} · €{inscrito.valor}
        </p>
        <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
          Pago em {new Date(inscrito.paid_at).toLocaleDateString("pt-PT", { day: "numeric", month: "short" })} · {String(new Date(inscrito.paid_at).getHours()).padStart(2, "0")}:{String(new Date(inscrito.paid_at).getMinutes()).padStart(2, "0")}
        </p>
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {!inscrito.invoice_sent ? (
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium" style={{ color: "#d97706" }}>🧾 Fatura por enviar</span>
              {onToggleInvoiceSent && (
                <button
                  onClick={onToggleInvoiceSent}
                  className="text-[12px] font-medium px-3 py-1 rounded-full transition-colors"
                  style={{ border: "1px solid rgba(245,158,11,0.4)", color: "#d97706" }}
                >
                  Assinalar enviada
                </button>
              )}
            </div>
          ) : (
            <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>🧾 Fatura enviada</span>
          )}
        </div>
      </div>
    );
  }

  // State C — Free, incomplete flow
  if ((inscrito.step_reached || 0) < 5) {
    const step = inscrito.step_reached || 1;
    const STEP_NAMES = inscrito.webinar === "video" ? STEP_NAMES_VIDEO : STEP_NAMES_IMAGENS;
    return (
      <div className="rounded-[10px] p-4" style={{ background: "rgba(100,116,139,0.05)", border: "1px solid rgba(100,116,139,0.15)" }}>
        <span className="inline-flex items-center gap-1.5 text-[14px] font-bold" style={{ color: "#94a3b8" }}>
          Gratuito
        </span>
        <div className="flex items-center gap-2 mt-2.5">
          <span className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Passo {step}/5</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <div
                key={s}
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: s <= step ? "#60a5fa" : "rgba(255,255,255,0.15)" }}
              />
            ))}
          </div>
        </div>
        <p className="text-[12px] mt-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
          Saiu no passo {step} — {STEP_NAMES[step] || "—"}
        </p>
      </div>
    );
  }

  // State D — Free, complete flow
  return (
    <div className="rounded-[10px] p-4" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
      <span className="inline-flex items-center gap-1.5 text-[14px] font-bold" style={{ color: "#3b82f6" }}>
        ✓ Flow completo
      </span>
      <p className="text-[13px] mt-2" style={{ color: "rgba(255,255,255,0.6)" }}>
        Completou todos os passos · Gratuito
      </p>
      <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
        Não converteu para pago
      </p>
    </div>
  );
}
