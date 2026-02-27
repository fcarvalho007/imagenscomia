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

    const CheckboxIcon = ({ checked }: { checked: boolean }) => (
      <div
        className="w-5 h-5 shrink-0 flex items-center justify-center transition-colors"
        style={{
          borderRadius: 6,
          backgroundColor: checked ? "#1e40af" : "white",
          border: checked ? "2px solid #1e40af" : "2px solid #d1d5db",
        }}
      >
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
    );

    const OptionRow = ({
      label,
      checked,
      onClick,
    }: {
      label: string;
      checked: boolean;
      onClick: () => void;
    }) => (
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center gap-3 cursor-pointer transition-all text-left"
        style={{
          minHeight: 52,
          border: checked ? "1.5px solid #1e40af" : "1.5px solid #e5e7eb",
          borderRadius: 12,
          padding: "14px 16px",
          background: checked ? "#eff6ff" : "white",
        }}
      >
        <CheckboxIcon checked={checked} />
        <span
          style={{
            fontSize: 15,
            fontWeight: checked ? 600 : 500,
            color: checked ? "#1e40af" : "#374151",
          }}
        >
          {label}
        </span>
      </button>
    );

    return (
      <div ref={ref} className="text-center">
        {/* Step label */}
        <p style={{ fontSize: 12, color: "#9ca3af" }}>Passo 5 de 5 — A tua dúvida</p>

        <div style={{ height: 24 }} />

        {/* Headline */}
        <h2 className="max-sm:text-[24px]" style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0 }}>
          {firstName ? `${firstName}, uma` : "Uma"} última pergunta
        </h2>
        <p style={{ fontSize: 15, color: "#6b7280", marginTop: 8 }}>
          Isto ajuda-nos a preparar o conteúdo para ti.
        </p>

        <div className="max-sm:h-6" style={{ height: 32 }} />

        {/* Question */}
        <div className="text-left">
          <p style={{ fontSize: 17, fontWeight: 600, color: "#111827", marginBottom: 4 }}>
            Qual a maior dúvida que este webinar pode ajudar a resolver?
          </p>
          <p style={{ fontSize: 13, color: "#9ca3af", fontStyle: "italic", marginBottom: 16 }}>
            (pode seleccionar mais de uma)
          </p>

          <div className="space-y-2.5">
            {DUVIDA_OPTIONS.map((opt) => (
              <OptionRow
                key={opt}
                label={opt}
                checked={selected.includes(opt)}
                onClick={() => toggle(opt)}
              />
            ))}

            <OptionRow
              label="Outro"
              checked={showOther}
              onClick={toggleOther}
            />

            {showOther && (
              <input
                type="text"
                value={otherText}
                onChange={(e) => handleOtherText(e.target.value)}
                placeholder="Escreve a tua dúvida..."
                className="w-full focus:outline-none"
                style={{
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "14px 16px",
                  fontSize: 16,
                  color: "#374151",
                  background: "white",
                }}
              />
            )}
          </div>
        </div>

        <div className="max-sm:h-6" style={{ height: 32 }} />

        {/* Buttons */}
        <div className="flex items-center gap-5 max-sm:flex-col max-sm:gap-3">
          <button
            onClick={onNext}
            className="font-bold text-white transition-colors max-sm:w-full"
            style={{
              background: "#1e40af",
              height: 52,
              borderRadius: 28,
              fontSize: 16,
              fontWeight: 700,
              minWidth: 160,
              paddingLeft: 32,
              paddingRight: 32,
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1e3a8a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1e40af")}
          >
            Finalizar →
          </button>
          <button
            onClick={onSkip}
            className="transition-colors max-sm:py-3"
            style={{
              fontSize: 14,
              color: "#9ca3af",
              textDecoration: "underline",
              textDecorationStyle: "dotted",
              textUnderlineOffset: 3,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#6b7280")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
          >
            Saltar
          </button>
        </div>
      </div>
    );
  }
);

StepDuvida.displayName = "StepDuvida";
