import { useState, forwardRef } from "react";
import { Check } from "lucide-react";

const DUVIDA_OPTIONS = [
  "Como criar vídeos curtos sem filmar",
  "Que ferramentas de IA usar para vídeo",
  "Como integrar vídeo na estratégia de marketing",
];

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

    // Parse existing duvida back into state
    const [selected, setSelected] = useState<string[]>(() => {
      if (!duvida) return [];
      return duvida.split("; ").filter((s) => DUVIDA_OPTIONS.includes(s));
    });
    const [showOther, setShowOther] = useState(() => {
      if (!duvida) return false;
      return duvida.split("; ").some((s) => s.startsWith("Outro:"));
    });
    const [otherText, setOtherText] = useState(() => {
      if (!duvida) return "";
      const part = duvida.split("; ").find((s) => s.startsWith("Outro: "));
      return part ? part.replace("Outro: ", "") : "";
    });

    const buildDuvida = (sel: string[], other: boolean, text: string) => {
      const parts = [...sel];
      if (other && text.trim()) parts.push(`Outro: ${text.trim()}`);
      return parts.join("; ");
    };

    const toggle = (opt: string) => {
      const next = selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt];
      setSelected(next);
      setDuvida(buildDuvida(next, showOther, otherText));
    };

    const toggleOther = () => {
      const next = !showOther;
      setShowOther(next);
      if (!next) {
        setOtherText("");
        setDuvida(buildDuvida(selected, false, ""));
      } else {
        setDuvida(buildDuvida(selected, true, otherText));
      }
    };

    const handleOtherText = (val: string) => {
      setOtherText(val);
      setDuvida(buildDuvida(selected, showOther, val));
    };

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
        <p className="text-[14px] text-ink-400 mb-3">(pode seleccionar mais de uma)</p>

        <div className="space-y-2.5">
          {DUVIDA_OPTIONS.map((opt) => {
            const isSelected = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className="w-full flex items-center gap-3 p-3.5 bg-background border rounded-xl cursor-pointer transition-all text-left"
                style={{
                  borderColor: isSelected ? "hsl(var(--blue-600))" : "hsl(var(--border))",
                  backgroundColor: isSelected ? "hsl(var(--blue-50))" : "hsl(var(--background))",
                }}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    backgroundColor: isSelected ? "hsl(var(--blue-600))" : "transparent",
                    border: isSelected ? "none" : "2px solid hsl(var(--border))",
                  }}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[15px] text-ink-700">{opt}</span>
              </button>
            );
          })}

          {/* Outro option */}
          <button
            type="button"
            onClick={toggleOther}
            className="w-full flex items-center gap-3 p-3.5 bg-background border rounded-xl cursor-pointer transition-all text-left"
            style={{
              borderColor: showOther ? "hsl(var(--blue-600))" : "hsl(var(--border))",
              backgroundColor: showOther ? "hsl(var(--blue-50))" : "hsl(var(--background))",
            }}
          >
            <div
              className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors"
              style={{
                backgroundColor: showOther ? "hsl(var(--blue-600))" : "transparent",
                border: showOther ? "none" : "2px solid hsl(var(--border))",
              }}
            >
              {showOther && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-[15px] text-ink-700">Outro</span>
          </button>

          {showOther && (
            <input
              type="text"
              value={otherText}
              onChange={(e) => handleOtherText(e.target.value)}
              placeholder="Escreve a tua dúvida..."
              className="w-full border border-border rounded-xl p-3.5 text-[14px] text-ink-700 bg-background focus:outline-none focus:border-blue-600 ml-8"
              style={{ maxWidth: "calc(100% - 2rem)" }}
            />
          )}
        </div>

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
