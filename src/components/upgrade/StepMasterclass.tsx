import { useState } from "react";
import { Check } from "lucide-react";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface Props {
  onAddMasterclass: () => void;
  onSkip: () => void;
}

const bullets = [
  {
    title: "Sistema completo de produção de vídeo curto",
    sub: "Fluxo prático para gerar vídeo utilizável.",
  },
  {
    title: "Ferramentas certas (sem confusão)",
    sub: "Curadoria por objectivo: gratuitas e pagas.",
  },
  {
    title: "Prompts para vídeo (reutilizáveis)",
    sub: "Estruturas para consistência e controlo.",
  },
  {
    title: "Gravação da Masterclass incluída",
    sub: "Rever e replicar quando precisares.",
    highlight: true,
  },
];

export const StepMasterclass = ({ onAddMasterclass, onSkip }: Props) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div className="text-center">
        {/* Step label */}
        <p style={{ fontSize: 12, color: "#9ca3af" }}>Passo 3 de 5 — Masterclass Vídeo</p>

        <div style={{ height: 24 }} />

        {/* Headline */}
        <h2 style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0 }}>
          Vais gostar desta opção
        </h2>
        <p style={{ fontSize: 15, color: "#6b7280", marginTop: 8 }}>
          Aprofunda o sistema completo em 3 horas ao vivo.
        </p>

        <div style={{ height: 28 }} />

        {/* ── Pricing card ── */}
        <div
          style={{
            border: "2px solid #7c3aed",
            borderRadius: 20,
            padding: "28px 24px",
            background: "white",
            boxShadow: "0 4px 16px rgba(124,58,237,0.10)",
            textAlign: "left",
          }}
          className="sm:p-7 max-sm:!p-[20px_16px]"
        >
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <span style={{ fontSize: 9, fontWeight: 700, color: "white", background: "#7c3aed", borderRadius: 6, padding: "3px 8px", letterSpacing: "0.5px" }}>
              🎬 MASTERCLASS VÍDEO COM IA
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", borderRadius: 6, padding: "3px 8px", letterSpacing: "0.5px" }}>
              SESSÃO AVANÇADA
            </span>
          </div>

          {/* Label */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>
            MASTERCLASS ONLINE
          </p>

          {/* Price row */}
          <div className="flex max-sm:flex-col justify-between items-start gap-3 mb-4">
            <div className="flex items-baseline gap-1">
              <span className="max-sm:text-[40px]" style={{ fontSize: 48, fontWeight: 800, color: "#111827", lineHeight: 1 }}>€47</span>
              <span style={{ fontSize: 16, fontWeight: 400, color: "#6b7280" }}>+ IVA</span>
            </div>
            <div style={{ background: "#fefce8", border: "1px solid #fde047", borderRadius: 8, padding: "6px 10px" }} className="max-sm:w-full">
              <p style={{ fontSize: 11, fontWeight: 600, color: "#854d0e" }}>Early bird: €47 + IVA</p>
              <p style={{ fontSize: 11, fontWeight: 400, color: "#854d0e" }}>Depois: €97 + IVA</p>
            </div>
          </div>

          {/* Date box */}
          <div className="flex items-start gap-2.5 rounded-[10px] p-3 mb-5" style={{ background: "#f5f3ff" }}>
            <span className="text-[16px] leading-none mt-0.5">📅</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed" }}>Sessão ao vivo · 3 horas</p>
              <p style={{ fontSize: 12, color: "#6b7280" }}>Quinta-feira, 12 de Março · 10h00–13h00 · Online</p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3.5">
            {bullets.map((b) => (
              <div key={b.title} className="flex gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "#7c3aed" }}>
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: b.highlight ? 700 : 600, color: "#111827" }}>{b.title}</p>
                  <p className="max-sm:text-[12px]" style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{b.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Meta row */}
          <p className="text-center mt-5" style={{ fontSize: 12, color: "#9ca3af" }}>
            📅 12 de Março · 💻 Online · ⏱ 3 horas
          </p>

          {/* Primary CTA */}
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full mt-4 text-white font-bold transition-colors"
            style={{
              background: "#7c3aed",
              height: 52,
              borderRadius: 28,
              fontSize: 16,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#6d28d9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#7c3aed")}
          >
            Garantir lugar na Masterclass Vídeo →
          </button>

          {/* Social proof */}
          <p className="text-center mt-3" style={{ fontSize: 12, color: "#9ca3af" }}>
            Grupo limitado para garantir acompanhamento.
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
              Vais adicionar a Masterclass ao teu checkout. No próximo passo podes rever tudo antes de pagar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onAddMasterclass} style={{ backgroundColor: "#7c3aed" }}>
              Sim, adicionar ao checkout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
