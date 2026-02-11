import { useState, forwardRef } from "react";
import { Check } from "lucide-react";

const SOURCE_OPTIONS = [
  "Instagram (Frederico Carvalho)",
  "Facebook",
  "LinkedIn",
  "Email / Newsletter",
  "WhatsApp ou grupo de amigos",
  "Podcast Marketing por Idiotas (RFM)",
];

interface Props {
  sources: string[];
  setSources: (s: string[]) => void;
  otherSource: string;
  setOtherSource: (s: string) => void;
  onNext: () => void;
  onSkip: () => void;
  userName?: string;
}

export const StepQualification = forwardRef<HTMLDivElement, Props>(
  ({ sources, setSources, otherSource, setOtherSource, onNext, onSkip, userName }, ref) => {
    const [showOther, setShowOther] = useState(sources.includes("Outro"));
    const firstName = userName?.trim().split(" ")[0] || "";

    const toggle = (val: string) => {
      setSources(sources.includes(val) ? sources.filter((s) => s !== val) : [...sources, val]);
    };

    const toggleOther = () => {
      if (showOther) {
        setShowOther(false);
        setSources(sources.filter((s) => s !== "Outro"));
        setOtherSource("");
      } else {
        setShowOther(true);
        setSources([...sources, "Outro"]);
      }
    };

    return (
      <div ref={ref} className="max-w-[560px]">
        <h2 className="font-heading font-bold text-[24px] text-ink-900">
          {firstName ? `${firstName}, só` : "Só"} 2 perguntas muito rápidas
        </h2>
        <p className="text-[17px] text-ink-500 mt-2 mb-7">
          Para garantir que o webinar cobre o que precisas.
        </p>

        <p className="font-semibold text-[17px] text-ink-900 mb-4">
          Como soubeste desta formação?
        </p>
        <p className="text-[14px] text-ink-400 mb-3">(opcional — pode seleccionar mais de uma)</p>

        <div className="space-y-2.5">
          {SOURCE_OPTIONS.map((opt) => {
            const selected = sources.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className="w-full flex items-center gap-3 p-3.5 bg-background border rounded-xl cursor-pointer transition-all text-left"
                style={{
                  borderColor: selected ? "hsl(var(--blue-600))" : "hsl(var(--border))",
                  backgroundColor: selected ? "hsl(var(--blue-50))" : "hsl(var(--background))",
                }}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    backgroundColor: selected ? "hsl(var(--blue-600))" : "transparent",
                    border: selected ? "none" : "2px solid hsl(var(--border))",
                  }}
                >
                  {selected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[15px] text-ink-700">{opt}</span>
              </button>
            );
          })}

          {/* Other option */}
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
              value={otherSource}
              onChange={(e) => setOtherSource(e.target.value)}
              placeholder="onde viste ou ouviste?"
              className="w-full border border-border rounded-xl p-3.5 text-[14px] text-ink-700 bg-background focus:outline-none focus:border-blue-600 ml-8"
              style={{ maxWidth: "calc(100% - 2rem)" }}
            />
          )}
        </div>

        <button
          onClick={onNext}
          className="mt-7 bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-[16px] py-3 px-8 rounded-xl transition-colors"
        >
          Próximo passo →
        </button>

        <p
          onClick={onSkip}
          className="text-[13px] text-ink-300 cursor-pointer mt-2.5 text-center hover:underline"
        >
          Saltar esta pergunta
        </p>
      </div>
    );
  }
);

StepQualification.displayName = "StepQualification";
