import { useEffect, useRef } from "react";

const TEAM_SIZE_OPTIONS = [
  "Só eu",
  "2 a 5 pessoas",
  "6 a 20 pessoas",
  "Mais de 20 pessoas",
];

interface Props {
  teamSize: string | null;
  setTeamSize: (t: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepTeamSize({ teamSize, setTeamSize, onNext, onBack }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (teamSize) {
      timerRef.current = setTimeout(onNext, 400);
    }
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamSize]);

  return (
    <div className="text-center">
      {/* Back arrow rendered by parent card wrapper */}
      <p className="text-xs" style={{ color: "#9ca3af" }}>Passo 2 de 5</p>

      <h2 className="mt-2 font-heading font-bold text-[28px] max-sm:text-[22px] leading-tight" style={{ color: "#111827" }}>
        Quantas pessoas trabalham<br />em marketing na tua organização?
      </h2>
      <p className="mt-2 text-[13px] italic" style={{ color: "#9ca3af" }}>(selecciona uma opção)</p>

      <div className="mt-7 flex flex-wrap justify-center gap-2.5">
        {TEAM_SIZE_OPTIONS.map((opt) => {
          const selected = teamSize === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setTeamSize(selected ? null : opt)}
              className="transition-all duration-150 cursor-pointer max-sm:w-full"
              style={{
                border: selected ? "2px solid #1e40af" : "1.5px solid #e5e7eb",
                borderRadius: 100,
                padding: "12px 20px",
                fontSize: 14,
                fontWeight: selected ? 600 : 500,
                color: selected ? "#1e40af" : "#374151",
                background: selected ? "#eff6ff" : "white",
                whiteSpace: "normal",
                textAlign: "center",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => teamSize && onNext()}
        disabled={!teamSize}
        className="mt-8 w-full font-heading font-bold text-[16px] transition-colors duration-200"
        style={{
          height: 52,
          borderRadius: 28,
          background: teamSize ? "#1e40af" : "#e5e7eb",
          color: teamSize ? "white" : "#9ca3af",
          cursor: teamSize ? "pointer" : "not-allowed",
        }}
      >
        Próximo →
      </button>
    </div>
  );
}
