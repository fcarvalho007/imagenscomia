import { useState, forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  duvida: string;
  setDuvida: (d: string) => void;
  onNext: () => void;
  onSkip: () => void;
  userName?: string;
}

export const StepDuvida = forwardRef<HTMLDivElement, Props>(
  ({ duvida, setDuvida, onNext, onSkip, userName }, ref) => {
    const firstName = userName?.trim().split(" ")[0] || "";

    return (
      <div ref={ref} className="max-w-[560px]">
        <h2 className="font-heading font-bold text-[24px] max-sm:text-[20px] text-ink-900">
          {firstName ? `${firstName}, uma` : "Uma"} última pergunta
        </h2>
        <p className="text-[17px] max-sm:text-[15px] text-ink-500 mt-2 mb-7">
          Isto ajuda-nos a preparar o conteúdo para ti.
        </p>

        <p className="font-semibold text-[17px] text-ink-900 mb-4">
          Qual a maior dúvida que este webinar pode ajudar a resolver?
        </p>

        <Textarea
          value={duvida}
          onChange={(e) => setDuvida(e.target.value)}
          placeholder="Ex: Como criar vídeos curtos para redes sociais sem ter de filmar..."
          className="min-h-[120px] rounded-xl border-border text-[15px] text-ink-700 placeholder:text-ink-400 focus:border-blue-600"
        />

        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={onNext}
            className="font-heading font-bold text-[16px] py-3 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Finalizar →
          </button>
          <button
            onClick={onSkip}
            className="text-[14px] text-ink-400 hover:text-ink-600 transition-colors underline underline-offset-2"
          >
            Saltar
          </button>
        </div>
      </div>
    );
  }
);

StepDuvida.displayName = "StepDuvida";
