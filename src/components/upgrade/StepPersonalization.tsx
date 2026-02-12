import { useState } from "react";
import { Check } from "lucide-react";

const DUVIDA_OPTIONS = [
  "Não sei descrever o estilo visual que quero",
  "Os resultados ficam sempre genéricos, sem identidade",
  "Não percebo que ferramenta usar (ChatGPT, Google, outros...)",
  "Quero criar imagens para a minha marca mas não sei por onde começar",
  "Tenho dificuldade em editar ou refinar as imagens geradas",
];

interface Props {
  duvidas: string[];
  setDuvidas: (s: string[]) => void;
  outraDuvida: string;
  setOutraDuvida: (s: string) => void;
  setDuvida: (s: string) => void;
  onNext: () => void;
  onSkip: () => void;
}

export const StepPersonalization = ({
  duvidas, setDuvidas, outraDuvida, setOutraDuvida, setDuvida, onNext, onSkip,
}: Props) => {
  const [showOther, setShowOther] = useState(duvidas.includes("Outro"));

  const toggle = (val: string) => {
    setDuvidas(duvidas.includes(val) ? duvidas.filter((d) => d !== val) : [...duvidas, val]);
  };

  const toggleOther = () => {
    if (showOther) {
      setShowOther(false);
      setDuvidas(duvidas.filter((d) => d !== "Outro"));
      setOutraDuvida("");
    } else {
      setShowOther(true);
      setDuvidas([...duvidas, "Outro"]);
    }
  };

  const handleNext = () => {
    const parts = duvidas.filter((d) => d !== "Outro");
    if (showOther && outraDuvida.trim()) {
      parts.push(`Outro: ${outraDuvida.trim()}`);
    }
    setDuvida(parts.join(", "));
    onNext();
  };

  return (
    <div className="max-w-[560px]">
      <h2 className="font-heading font-bold text-[24px] text-ink-900">
        A tua maior dúvida sobre imagens com IA
      </h2>
      <p className="text-[17px] text-ink-500 mt-2 mb-2">
        O Frederico vai ler antes do webinar. Quanto mais específico, mais útil para ti.
      </p>

      <div
        className="rounded-r-lg p-2.5 mb-4"
        style={{
          backgroundColor: "hsl(var(--blue-50))",
          borderLeft: "3px solid hsl(var(--blue-600))",
        }}
      >
        <p className="text-[14px]" style={{ color: "hsl(var(--blue-700))" }}>
          As respostas mais específicas recebem atenção especial no Q&A.
        </p>
      </div>

      <p className="text-[14px] text-ink-400 mb-3">(pode seleccionar mais de uma)</p>

      <div className="space-y-2.5">
        {DUVIDA_OPTIONS.map((opt) => {
          const selected = duvidas.includes(opt);
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
            value={outraDuvida}
            onChange={(e) => setOutraDuvida(e.target.value.slice(0, 200))}
            placeholder="Escreve a tua dúvida..."
            maxLength={200}
            className="w-full border border-border rounded-xl p-3.5 text-[14px] text-ink-700 bg-background focus:outline-none focus:border-blue-600 ml-8"
            style={{ maxWidth: "calc(100% - 2rem)" }}
          />
        )}
      </div>

      <button
        onClick={handleNext}
        className="mt-7 bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-[16px] py-3 px-8 rounded-xl transition-colors"
      >
        Próximo passo →
      </button>

      <p
        onClick={onSkip}
        className="text-[13px] text-ink-300 cursor-pointer mt-2.5 text-center hover:underline"
      >
        Saltar — responder depois
      </p>
    </div>
  );
};
