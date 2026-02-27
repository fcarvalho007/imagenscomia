import { useState } from "react";
import { Check } from "lucide-react";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface Props {
  onAddPremium: () => void;
  onSkip: () => void;
  userName?: string;
  masterclassSelected?: boolean;
}

const bullets = [
  { title: "Gravação HD — acesso contínuo" },
  { title: "Pack de apoio completo" },
  { title: "Sessão Q&A exclusiva (30 min) — Terça, 10 Mar" },
];

export const StepVideoPremium = ({ onAddPremium, onSkip, userName, masterclassSelected }: Props) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div className="text-center" style={{ paddingBottom: 128 }}>
        {/* Headline */}
        <h2 className="max-sm:text-[24px]" style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0 }}>
          Gravação do Webinar Vídeo
        </h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span style={{
            fontSize: 10, fontWeight: 600, color: "#9ca3af",
            border: "1px solid #e5e7eb", borderRadius: 6,
            padding: "2px 8px", background: "white",
            display: "inline-block",
          }}>
            OPCIONAL
          </span>
          {masterclassSelected && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: "#16a34a",
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: 20, padding: "2px 8px",
              display: "inline-block",
            }}>
              ✓ Masterclass
            </span>
          )}
        </div>

        <p style={{ fontSize: 15, color: "#6b7280", marginTop: 8 }}>
          Para aplicar o método com mais tranquilidade, ao teu ritmo.
        </p>

        <div style={{ height: 28 }} />

        {/* ── Pricing card ── */}
        <div
          style={{
            border: "2px solid #1e40af",
            borderRadius: 20,
            padding: "28px 24px",
            background: "white",
            boxShadow: "0 4px 16px rgba(30,64,175,0.08)",
            textAlign: "left",
          }}
          className="sm:p-7 max-sm:!p-[20px_16px]"
        >
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <span className="max-sm:text-[8px]" style={{ fontSize: 9, fontWeight: 700, color: "white", background: "#1e40af", borderRadius: 6, padding: "3px 8px", letterSpacing: "0.5px" }}>
              🎬 WEBINAR VÍDEO COM IA
            </span>
            <span className="max-sm:text-[8px]" style={{ fontSize: 9, fontWeight: 700, color: "#1e40af", background: "#eff6ff", borderRadius: 6, padding: "3px 8px", letterSpacing: "0.5px" }}>
              GRAVAÇÃO + PACK
            </span>
          </div>

          {/* Price row */}
          <div className="flex max-sm:flex-col justify-between items-start gap-3 mb-4">
            <div className="flex items-baseline gap-1">
              <span className="max-sm:text-[36px]" style={{ fontSize: 48, fontWeight: 800, color: "#111827", lineHeight: 1 }}>€15</span>
              <span style={{ fontSize: 16, fontWeight: 400, color: "#6b7280" }}>+ IVA</span>
            </div>
            <div style={{ background: "#fefce8", border: "1px solid #fde047", borderRadius: 8, padding: "6px 10px" }} className="max-sm:w-full max-sm:text-[10px]">
              <p style={{ fontSize: 11, fontWeight: 600, color: "#854d0e" }} className="max-sm:text-[10px]">Early bird: €15 + IVA</p>
              <p style={{ fontSize: 11, fontWeight: 400, color: "#854d0e" }} className="max-sm:text-[10px]">Depois: €27 + IVA</p>
            </div>
          </div>

          {/* Date box */}
          <div className="flex items-start gap-2.5 rounded-[10px] p-3 max-sm:p-[10px_12px] mb-5" style={{ background: "#eff6ff" }}>
            <span className="text-[16px] leading-none mt-0.5">📅</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1e40af" }}>Sessão Q&A em grupo</p>
              <p style={{ fontSize: 12, color: "#6b7280" }} className="max-sm:text-[12px]">Terça-feira, 10 de Março · 14h30–15h00</p>
            </div>
          </div>

          {/* Benefits — titles only */}
          <div className="space-y-2 max-sm:space-y-1.5">
            {bullets.map((b) => (
              <div key={b.title} className="flex gap-2 items-center" style={{ height: 36 }}>
                <div className="w-5 h-5 max-sm:w-4 max-sm:h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#1e40af" }}>
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <p className="max-sm:text-[13px]" style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>{b.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky bottom bar ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "white", borderTop: "1px solid #e5e7eb",
        padding: "12px 24px",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        zIndex: 50,
        boxShadow: "0 -4px 12px rgba(0,0,0,0.06)",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full text-white font-bold transition-colors max-sm:text-[15px]"
            style={{
              background: "#1e40af",
              height: 52,
              borderRadius: 28,
              fontSize: 16,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1e3a8a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1e40af")}
          >
            Garantir Gravação do Vídeo + Pack →
          </button>
          <p className="text-center" style={{ fontSize: 11, color: "#9ca3af" }}>
            Recomendado para quem quer rever e aplicar sem pressa.
          </p>
          <button
            onClick={onSkip}
            className="w-full transition-colors max-sm:text-[12px]"
            style={{
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              color: "#6b7280",
              fontSize: 13,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#374151")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
          >
            ou continuar com inscrição gratuita →
          </button>
        </div>
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-[20px]">Boa escolha!</AlertDialogTitle>
            <AlertDialogDescription className="text-[15px]" style={{ color: "#6b7280" }}>
              Vais adicionar a Gravação + Pack ao teu checkout. No próximo passo podes rever tudo antes de pagar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onAddPremium} style={{ backgroundColor: "#1e40af" }}>
              Sim, adicionar ao checkout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
