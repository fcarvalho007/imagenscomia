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
    sub: "Curadoria por objetivo: gratuitas e pagas.",
  },
  {
    title: "Prompts para vídeo (reutilizáveis)",
    sub: "Estruturas para consistência e controlo.",
  },
  {
    title: "Gravação da Masterclass incluída — revê quando precisares",
    sub: "Rever e replicar quando necessário.",
  },
];

export const StepMasterclass = ({ onAddMasterclass, onSkip }: Props) => {
  const [showConfirm, setShowConfirm] = useState(false);
  return (
  <>
  <div className="max-w-[620px]">
    <h2 className="font-heading font-bold text-[24px] max-sm:text-[18px] text-ink-900">
      Masterclass Vídeo com IA — sistema completo ao vivo
    </h2>
    <p className="text-[17px] max-sm:text-[14px] text-ink-500 mt-2 mb-6">
      O webinar cobre o essencial. A Masterclass aprofunda o sistema completo — 3 horas ao vivo com casos reais, fluxos replicáveis e ferramentas testadas.
    </p>

    {/* Masterclass Card */}
    <div
      className="bg-background rounded-2xl p-6 max-sm:p-4 max-w-[560px]"
      style={{ border: "2px solid #7c3aed" }}
    >
      {/* Eyebrow badges */}
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block rounded px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[1px]" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#7c3aed' }}>🎬 MASTERCLASS VÍDEO COM IA</span>
        <span className="inline-block rounded px-2 py-0.5 text-[9px] font-bold tracking-[1px]" style={{ background: '#faf5ff', border: '1px solid #e9d5ff', color: '#6d28d9' }}>SESSÃO AVANÇADA</span>
      </div>

      {/* Price row */}
      <div className="flex max-sm:flex-col justify-between items-start mb-4 gap-3">
        <div>
          <p className="font-heading font-semibold text-[14px] uppercase tracking-[0.08em]" style={{ color: '#7c3aed' }}>
            MASTERCLASS ONLINE
          </p>
          <p className="font-heading font-black text-[36px] max-sm:text-[28px] text-ink-900 leading-none whitespace-nowrap">€47 <span className="text-[16px] font-bold">+ IVA</span></p>
          <p className="text-[14px] max-sm:text-[13px] text-ink-400">Quinta-feira, 12 de Março · 10h–13h</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-2 max-sm:p-1.5 shrink-0 max-sm:w-full whitespace-nowrap" style={{ border: "1px solid hsl(var(--amber-500) / 0.5)" }}>
          <p className="font-semibold text-[14px] max-sm:text-[13px] text-amber-700">Early bird: €47 + IVA</p>
          <p className="text-[14px] max-sm:text-[13px] text-amber-600">Depois: €97 + IVA</p>
        </div>
      </div>

      <div className="w-full h-px bg-border my-4" />

      {/* Date box */}
      <div className="flex items-start gap-2 sm:gap-2.5 rounded-lg p-2 sm:p-2.5 mb-3" style={{ background: '#faf5ff', border: '1px solid #e9d5ff' }}>
        <span className="text-[16px] sm:text-[18px] leading-none">📅</span>
        <div>
          <p className="text-[11px] sm:text-[12px] font-bold" style={{ color: '#4c1d95' }}>Sessão ao vivo · 3 horas</p>
          <p className="text-[11px] sm:text-[12px]" style={{ color: '#6d28d9' }}>Quinta-feira, 12 de Março · 10h00–13h00 · Online</p>
        </div>
      </div>

      <div className="space-y-3">
        {bullets.map((b) => (
          <div key={b.title} className="flex gap-2.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: '#7c3aed' }}>
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[15px] text-ink-900">{b.title}</p>
              <p className="text-[14px] text-ink-500 leading-[1.5]">{b.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Event details */}
      <div className="flex flex-wrap gap-2 mt-3">
        {["📅 12 de Março", "💻 Online", "⏱ 3 horas"].map((d) => (
          <span key={d} className="text-[14px] max-sm:text-[13px] text-ink-400">{d}</span>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full mt-4 mb-4 text-white font-heading font-bold text-[15px] sm:text-[16px] py-3.5 sm:py-4 rounded-xl transition-colors min-h-[52px]"
        style={{ backgroundColor: "#7c3aed", whiteSpace: "normal" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6d28d9")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#7c3aed")}
      >
        Garantir lugar na Masterclass Vídeo →
      </button>
      <p className="text-[13px] text-ink-400 text-center mt-2">
        Grupo limitado para garantir acompanhamento.
      </p>
    </div>

    {/* Separator */}
    <div className="flex items-center gap-3 my-3">
      <div className="flex-grow h-px bg-border" />
      <span className="text-[14px] text-ink-300">ou</span>
      <div className="flex-grow h-px bg-border" />
    </div>

    {/* Skip button */}
    <button
      onClick={onSkip}
      className="w-full py-3 rounded-xl border border-ink-200 text-ink-500 hover:bg-ink-50 font-medium text-[14px] transition-colors"
    >
      Continuar com inscrição gratuita →
    </button>
    <p className="text-[11px] text-center mt-1" style={{ color: '#aaa' }}>
      A inscrição gratuita no Webinar Vídeo fica confirmada de qualquer forma.
    </p>
    
  </div>

  <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
    <AlertDialogContent className="max-w-md">
      <AlertDialogHeader>
        <AlertDialogTitle className="font-heading text-[20px]">Boa escolha!</AlertDialogTitle>
        <AlertDialogDescription className="text-[15px] text-ink-500">
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
