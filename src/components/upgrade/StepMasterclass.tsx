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
    title: "Imagem → vídeo: do estático ao clip",
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
    title: "Gravação incluída",
    sub: "Rever e replicar quando necessário.",
  },
];

export const StepMasterclass = ({ onAddMasterclass, onSkip }: Props) => {
  const [showConfirm, setShowConfirm] = useState(false);
  return (
  <>
  <div className="max-w-[620px]">
    <h2 className="font-heading font-bold text-[24px] max-sm:text-[18px] text-ink-900">
      Transformar imagens em vídeo com IA — ao vivo
    </h2>
    <p className="text-[17px] max-sm:text-[14px] text-ink-500 mt-2 mb-6">
      O webinar ensina o método. A Masterclass mostra como o usar para gerar vídeo — com ferramentas certas, prompts prontos e um fluxo replicável.
    </p>

    {/* Masterclass Card */}
    <div
      className="bg-background rounded-2xl p-6 max-sm:p-4 max-w-[560px]"
      style={{ border: "2px solid hsl(var(--ink-700))" }}
    >
      {/* Tag */}
      <span className="inline-block text-[12px] max-sm:text-[11px] font-bold tracking-[0.1em] uppercase px-2.5 max-sm:px-2 py-1 rounded-md bg-ink-100 text-ink-700 mb-3">
        IMAGEM → VÍDEO
      </span>

      {/* Price row */}
      <div className="flex max-sm:flex-col justify-between items-start mb-4 gap-3">
        <div>
          <p className="font-heading font-semibold text-[14px] text-ink-500 uppercase tracking-[0.08em]">
            MASTERCLASS ONLINE
          </p>
          <p className="font-heading font-black text-[36px] max-sm:text-[28px] text-ink-900 leading-none whitespace-nowrap">€47 <span className="text-[16px] font-bold">+ IVA</span></p>
          <p className="text-[14px] max-sm:text-[13px] text-ink-400">Pagamento único · 5 de Março</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-2 max-sm:p-1.5 shrink-0 max-sm:w-full whitespace-nowrap" style={{ border: "1px solid hsl(var(--amber-500) / 0.5)" }}>
          <p className="font-semibold text-[14px] max-sm:text-[13px] text-amber-700">Early bird: €47 + IVA</p>
          <p className="text-[14px] max-sm:text-[13px] text-amber-600">Depois: €97 + IVA</p>
        </div>
      </div>

      <div className="w-full h-px bg-border my-4" />

      <div className="space-y-3">
        {bullets.map((b) => (
          <div key={b.title} className="flex gap-2.5">
            <div className="w-5 h-5 rounded-full bg-ink-700 flex items-center justify-center shrink-0 mt-0.5">
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
        {["💻 Online", "⏱ 3 horas"].map((d) => (
          <span key={d} className="text-[14px] max-sm:text-[13px] text-ink-400">{d}</span>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full mt-4 text-white font-heading font-bold text-[16px] py-4 max-sm:py-3 rounded-xl transition-colors"
        style={{ backgroundColor: "hsl(var(--ink-900))" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e293b")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--ink-900))")}
      >
        Garantir lugar na Masterclass →
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
    <p className="text-[13px] text-ink-400 text-center mt-2">A vaga no webinar já está garantida.</p>
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
        <AlertDialogAction onClick={onAddMasterclass} style={{ backgroundColor: "hsl(var(--ink-900))" }}>
          Sim, adicionar ao checkout
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  </>
  );
};
