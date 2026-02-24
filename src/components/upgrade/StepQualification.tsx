import { useState, forwardRef } from "react";
import { Check } from "lucide-react";

const ROLE_OPTIONS = [
  "Gestor/a de marketing numa empresa",
  "Empresário/a ou PME — faço o meu próprio marketing",
  "Freelancer ou consultor/a de marketing",
  "Criador/a de conteúdo",
  "Outra função",
];

const TEAM_SIZE_OPTIONS = [
  "Só eu",
  "2 a 5 pessoas",
  "6 a 20 pessoas",
  "Mais de 20 pessoas",
];

interface Props {
  sources?: string[];
  setSources?: (s: string[]) => void;
  otherSource?: string;
  setOtherSource?: (s: string) => void;
  onNext: () => void;
  userName?: string;
  role?: string | null;
  setRole?: (r: string | null) => void;
  teamSize?: string | null;
  setTeamSize?: (t: string | null) => void;
  /** When true, shows the large "ESPERE..." title instead of the default heading */
  videoMode?: boolean;
}

export const StepQualification = forwardRef<HTMLDivElement, Props>(
  ({ sources, setSources, otherSource, setOtherSource, onNext, userName, role, setRole, teamSize, setTeamSize, videoMode }, ref) => {
    const [showOther, setShowOther] = useState(sources?.includes("Outro") ?? false);
    const [attempted, setAttempted] = useState(false);
    const [otherRole, setOtherRole] = useState("");
    const firstName = userName?.trim().split(" ")[0] || "";
    const isOtherRole = role === "Outra função";
    const canProceed = !!(role && teamSize && (!isOtherRole || otherRole.trim()));

    const toggle = (val: string) => {
      if (!sources || !setSources) return;
      setSources(sources.includes(val) ? sources.filter((s) => s !== val) : [...sources, val]);
    };

    const toggleOther = () => {
      if (!sources || !setSources || !setOtherSource) return;
      if (showOther) {
        setShowOther(false);
        setSources(sources.filter((s) => s !== "Outro"));
        setOtherSource("");
      } else {
        setShowOther(true);
        setSources([...sources, "Outro"]);
      }
    };

    const SOURCE_OPTIONS = [
      "Instagram (Frederico Carvalho)",
      "Facebook",
      "LinkedIn",
      "Email / Newsletter",
      "WhatsApp ou grupo de amigos",
      "Podcast Marketing por Idiotas (RFM)",
    ];

    const showSources = !!setSources && !!sources;

    return (
      <div ref={ref} className="max-w-[560px]">
        {/* Title */}
        {videoMode ? (
          <>
            <h2 className="font-heading font-extrabold text-[42px] max-sm:text-[32px] text-ink-900 leading-tight tracking-tight">
              {firstName ? `${firstName}, espera...` : "Espera..."}
            </h2>
            <p className="text-[17px] max-sm:text-[15px] text-ink-500 mt-3 mb-7">
              Só duas perguntas rápidas.
            </p>
          </>
        ) : (
          <>
            <h2 className="font-heading font-bold text-[24px] max-sm:text-[20px] text-ink-900">
              {firstName ? `${firstName}, só` : "Só"} algumas perguntas rápidas
            </h2>
            <p className="text-[17px] max-sm:text-[15px] text-ink-500 mt-2 mb-7">
              Para garantir que o webinar cobre o que precisas.
            </p>
          </>
        )}

        {/* Sources section — only shown when props are provided (non-video mode) */}
        {showSources && (
          <>
            <p className="font-semibold text-[17px] text-ink-900 mb-4">
              Como soubeste desta formação?
            </p>
            <p className="text-[14px] text-ink-400 mb-3">(pode seleccionar mais de uma)</p>

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
                  onChange={(e) => setOtherSource?.(e.target.value)}
                  placeholder="onde viste ou ouviste?"
                  className="w-full border border-border rounded-xl p-3.5 text-[14px] text-ink-700 bg-background focus:outline-none focus:border-blue-600 ml-8"
                  style={{ maxWidth: "calc(100% - 2rem)" }}
                />
              )}
            </div>
          </>
        )}

        {/* Role + Team questions */}
        {setRole && (
          <>
            {showSources && <div className="w-full" style={{ height: 1, background: "#e5e7eb", margin: "24px 0" }} />}

            {/* Question 1 — Role */}
            <p className="font-semibold text-[17px] text-ink-900 mb-4">
              Qual é o teu papel principal?
            </p>
            <p className="text-[14px] text-ink-400 mb-3">(selecciona uma opção)</p>

            <div className="space-y-2.5">
              {ROLE_OPTIONS.map((opt) => {
                const selected = role === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setRole(selected ? null : opt);
                      if (opt !== "Outra função") setOtherRole("");
                    }}
                    className="w-full flex items-center gap-3 p-3.5 bg-background border rounded-xl cursor-pointer transition-all text-left"
                    style={{
                      borderColor: selected ? "hsl(var(--blue-600))" : "hsl(var(--border))",
                      backgroundColor: selected ? "hsl(var(--blue-50))" : "hsl(var(--background))",
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors"
                      style={{
                        border: selected ? "2px solid hsl(var(--blue-600))" : "2px solid hsl(var(--border))",
                      }}
                    >
                      {selected && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--blue-600))" }} />}
                    </div>
                    <span className="text-[15px] text-ink-700">{opt}</span>
                  </button>
                );
              })}

              {isOtherRole && (
                <input
                  type="text"
                  value={otherRole}
                  onChange={(e) => setOtherRole(e.target.value)}
                  placeholder="Descreve a tua função..."
                  className="w-full border border-border rounded-xl p-3.5 text-[14px] text-ink-700 bg-background focus:outline-none focus:border-blue-600 ml-8"
                  style={{ maxWidth: "calc(100% - 2rem)" }}
                />
              )}
            </div>

            {/* Question 2 — Team Size */}
            <div className="mt-4">
              <p className="font-semibold text-[17px] text-ink-900 mb-4">
                Quantas pessoas trabalham em marketing na tua organização?
              </p>
              <p className="text-[14px] text-ink-400 mb-3">(selecciona uma opção)</p>

              <div className="space-y-2.5">
                {TEAM_SIZE_OPTIONS.map((opt) => {
                  const selected = teamSize === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setTeamSize?.(selected ? null : opt)}
                      className="w-full flex items-center gap-3 p-3.5 bg-background border rounded-xl cursor-pointer transition-all text-left"
                      style={{
                        borderColor: selected ? "hsl(var(--blue-600))" : "hsl(var(--border))",
                        backgroundColor: selected ? "hsl(var(--blue-50))" : "hsl(var(--background))",
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors"
                        style={{
                          border: selected ? "2px solid hsl(var(--blue-600))" : "2px solid hsl(var(--border))",
                        }}
                      >
                        {selected && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--blue-600))" }} />}
                      </div>
                      <span className="text-[15px] text-ink-700">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {attempted && !canProceed && (
          <p className="mt-4 text-[13px] text-red-500">
            Preenche as duas perguntas obrigatórias acima para continuar.
          </p>
        )}

        <button
          onClick={() => {
            if (canProceed) {
              // If "Outra função" selected, concatenate the custom text into the role value
              if (isOtherRole && otherRole.trim() && setRole) {
                setRole(`Outra função: ${otherRole.trim()}`);
              }
              onNext();
            } else {
              setAttempted(true);
            }
          }}
          className={`mt-5 font-heading font-bold text-[16px] py-3 px-8 rounded-xl transition-colors ${
            canProceed ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Próximo passo →
        </button>
      </div>
    );
  }
);

StepQualification.displayName = "StepQualification";
