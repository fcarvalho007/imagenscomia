import { useEffect, useRef } from "react";

const ROLE_OPTIONS = [
  "Gestor/a de marketing numa empresa",
  "Empresário/a ou PME — faço o meu próprio marketing",
  "Freelancer ou consultor/a de marketing",
  "Criador/a de conteúdo",
  "Outra função",
];

interface Props {
  role: string | null;
  setRole: (r: string | null) => void;
  onNext: () => void;
  firstName: string;
}

export function StepRole({ role, setRole, onNext, firstName }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (role) {
      timerRef.current = setTimeout(onNext, 400);
    }
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  return (
    <div className="text-center">
      <p className="text-xs" style={{ color: "#9ca3af" }}>Passo 1 de 5</p>
      <h2 className="mt-2 font-heading font-bold text-[32px] max-sm:text-[26px] leading-tight" style={{ color: "#111827" }}>
        {firstName ? `${firstName}, espera...` : "Espera..."}
      </h2>
      <p className="mt-2 text-[16px]" style={{ color: "#6b7280" }}>Só duas perguntas rápidas.</p>

      <div className="mt-8">
        <p className="text-[18px] font-semibold mb-4" style={{ color: "#111827" }}>Qual é o teu papel principal?</p>

        <div className="flex flex-wrap justify-center gap-2.5">
          {ROLE_OPTIONS.map((opt) => {
            const selected = role === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setRole(selected ? null : opt)}
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
      </div>

      <button
        onClick={() => role && onNext()}
        disabled={!role}
        className="mt-8 w-full font-heading font-bold text-[16px] transition-colors duration-200"
        style={{
          height: 52,
          borderRadius: 28,
          background: role ? "#1e40af" : "#e5e7eb",
          color: role ? "white" : "#9ca3af",
          cursor: role ? "pointer" : "not-allowed",
        }}
      >
        Próximo →
      </button>
    </div>
  );
}
