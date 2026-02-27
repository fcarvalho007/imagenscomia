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
  {
    title: "Gravação HD (acesso contínuo)",
    sub: "Rever ao teu ritmo, sem depender do directo.",
  },
  {
    title: "Pack de apoio completo",
    sub: "Checklists, briefings e templates prontos a usar.",
  },
  {
    title: "Sessão Q&A exclusiva (30 min)",
    sub: "Terça-feira, 10 de Março · 14h30–15h00 · Dúvidas respondidas ao vivo, em grupo.",
  },
];

export const StepVideoPremium = ({ onAddPremium, onSkip, userName, masterclassSelected }: Props) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div className="text-center">
        {/* Masterclass confirmed note */}
        {masterclassSelected && (
          <div className="mb-4 rounded-lg text-left" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#16a34a" }}>✓ Masterclass garantida.</p>
          </div>
        )}

        {/* Step label */}
        <p style={{ fontSize: 12, color: "#9ca3af" }}>Passo 4 de 5 — Gravação Vídeo</p>

        <div style={{ height: 24 }} />

        {/* Headline */}
        <h2 className="max-sm:text-[24px]" style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0, display: "inline" }}>
          Gravação do Webinar Vídeo{" "}
        </h2>
        <span style={{ fontSize: 28, fontWeight: 400, color: "#9ca3af" }}>(opcional)</span>

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
            <span style={{ fontSize: 9, fontWeight: 700, color: "white", background: "#1e40af", borderRadius: 6, padding: "3px 8px", letterSpacing: "0.5px" }}>
              🎬 WEBINAR VÍDEO COM IA
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#1e40af", background: "#eff6ff", borderRadius: 6, padding: "3px 8px", letterSpacing: "0.5px" }}>
              GRAVAÇÃO + PACK
            </span>
          </div>

          {/* Price row */}
          <div className="flex max-sm:flex-col justify-between items-start gap-3 mb-4">
            <div className="flex items-baseline gap-1">
              <span className="max-sm:text-[38px]" style={{ fontSize: 48, fontWeight: 800, color: "#111827", lineHeight: 1 }}>€15</span>
              <span style={{ fontSize: 16, fontWeight: 400, color: "#6b7280" }}>+ IVA</span>
            </div>
            <div style={{ background: "#fefce8", border: "1px solid #fde047", borderRadius: 8, padding: "6px 10px" }} className="max-sm:w-full">
              <p style={{ fontSize: 11, fontWeight: 600, color: "#854d0e" }}>Early bird: €15 + IVA</p>
              <p style={{ fontSize: 11, fontWeight: 400, color: "#854d0e" }}>Depois: €27 + IVA</p>
            </div>
          </div>

          {/* Date box */}
          <div className="flex items-start gap-2.5 rounded-[10px] p-3 mb-5" style={{ background: "#eff6ff" }}>
            <span className="text-[16px] leading-none mt-0.5">📅</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1e40af" }}>Sessão Q&A em grupo</p>
              <p style={{ fontSize: 12, color: "#6b7280" }}>Terça-feira, 10 de Março · 14h30–15h00</p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3.5">
            {bullets.map((b) => (
              <div key={b.title} className="flex gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "#1e40af" }}>
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>{b.title}</p>
                  <p className="max-sm:text-[12px]" style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{b.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full mt-6 text-white font-bold transition-colors"
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

          {/* Social proof */}
          <p className="text-center mt-3" style={{ fontSize: 12, color: "#9ca3af" }}>
            Recomendado para quem quer rever e aplicar sem pressa.
          </p>
        </div>

        {/* Separator */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-grow" style={{ height: 1, background: "#e5e7eb" }} />
          <span style={{ fontSize: 12, color: "#9ca3af", background: "white", padding: "0 12px" }}>ou</span>
          <div className="flex-grow" style={{ height: 1, background: "#e5e7eb" }} />
        </div>

        {/* Secondary CTA */}
        <button
          onClick={onSkip}
          className="w-full transition-colors"
          style={{
            height: 48,
            borderRadius: 28,
            border: "1.5px solid #e5e7eb",
            background: "white",
            color: "#374151",
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
        >
          Continuar com inscrição gratuita →
        </button>

        {/* Reassurance */}
        <p className="mt-2" style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
          A inscrição gratuita no Webinar Vídeo fica confirmada de qualquer forma.
        </p>
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
