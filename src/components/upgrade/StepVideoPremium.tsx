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
}

const bullets = [
  {
    title: "Gravação HD (acesso contínuo)",
    sub: "Rever ao seu ritmo, sem depender do direto.",
  },
  {
    title: "Pack de apoio completo",
    sub: "Checklists, briefings e templates prontos a usar.",
  },
  {
    title: "Sessão Q&A exclusiva (30 min)",
    sub: "Terça-feira, 10 de Março, 14:30h–15:00h · Dúvidas respondidas ao vivo, em grupo.",
  },
];

export const StepVideoPremium = ({ onAddPremium, onSkip, userName }: Props) => {
  const [showConfirm, setShowConfirm] = useState(false);
  return (
  <>
  <div className="max-w-[620px]">
    <h2 className="font-heading font-bold text-[24px] max-sm:text-[20px] text-ink-900">
      Gravação do Webinar Vídeo (opcional)
    </h2>
    <p className="text-[17px] max-sm:text-[14px] text-ink-500 mt-2 mb-6">
      Para aplicar o método com mais tranquilidade, ao teu ritmo.
    </p>

    {/* Premium Card */}
    <div
      className="bg-background rounded-2xl p-6 max-sm:p-4 max-w-[560px]"
      style={{
        border: "2px solid hsl(var(--blue-600))",
        boxShadow: "0 4px 20px rgba(37,99,235,0.12)",
      }}
    >
      {/* Eyebrow badges */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="inline-block rounded px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[1px]" style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', color: '#16a34a' }}>🎬 WEBINAR VÍDEO COM IA</span>
        <span className="inline-block rounded px-2 py-0.5 text-[9px] font-bold tracking-[1px]" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}>GRAVAÇÃO + PACK</span>
      </div>

      {/* Price row */}
      <div className="flex max-sm:flex-col justify-between items-start mb-4 gap-3">
        <div>
          <p className="font-heading font-black text-[36px] max-sm:text-[28px] text-blue-600 leading-none whitespace-nowrap">€15 <span className="text-[16px] font-bold">+ IVA</span></p>
          <p className="text-[14px] text-ink-400">Sem depender do direto. Ao teu ritmo.</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-2 max-sm:p-1.5 min-w-[150px] max-sm:w-full whitespace-nowrap" style={{ border: "1px solid hsl(var(--amber-500) / 0.5)" }}>
          <p className="font-semibold text-[14px] max-sm:text-[13px] text-amber-700">Early bird: €15 + IVA</p>
          <p className="text-[14px] max-sm:text-[13px] text-amber-600">Depois: €27 + IVA</p>
        </div>
      </div>

      <div className="w-full h-px bg-border my-4" />

      {/* Date box */}
      <div className="flex items-start gap-2.5 rounded-lg p-2.5 mb-3" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <span className="text-[18px] leading-none">📅</span>
        <div>
          <p className="text-[12px] font-bold" style={{ color: '#14532d' }}>Sessão Q&A em grupo</p>
          <p className="text-[12px]" style={{ color: '#166534' }}>Terça-feira, 10 de Março · 14h30–15h00</p>
        </div>
      </div>

      <div className="space-y-3">
        {bullets.map((b) => (
          <div key={b.title} className="flex gap-2.5">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[15px] text-ink-900">{b.title}</p>
              <p className="text-[14px] text-ink-500 leading-[1.5]">{b.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-[16px] py-4 max-sm:py-3 rounded-xl transition-colors shadow-blue"
      >
        Garantir Gravação do Vídeo + Pack →
      </button>
      <p className="text-[13px] text-ink-400 text-center mt-2">
        Recomendado para quem quer rever e aplicar sem pressa.
      </p>
    </div>

    {/* Separator */}
    <div className="flex items-center gap-3 my-4">
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
          Vais adicionar a Gravação + Pack ao teu checkout. No próximo passo podes rever tudo antes de pagar.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={onAddPremium} className="bg-blue-600 hover:bg-blue-700">
          Sim, adicionar ao checkout
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  </>
  );
};
