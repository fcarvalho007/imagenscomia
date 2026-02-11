import { Check } from "lucide-react";

interface Props {
  onAddPremium: () => void;
  onSkip: () => void;
  userName?: string;
}

const bullets = [
  {
    title: "Gravação HD — para sempre",
    sub: "Sem Premium perdes o acesso quando o directo terminar.",
  },
  {
    title: "Sessão Q&A exclusiva — 60 minutos",
    sub: "O único momento para falar directamente com Frederico.",
  },
  {
    title: "Guia completo de prompts — 30+ páginas",
    sub: "Testado em empresas portuguesas. Não disponível a inscritos gratuitos.",
  },
];

export const StepPremium = ({ onAddPremium, onSkip, userName }: Props) => {
  const firstName = userName?.trim().split(" ")[0] || "";
  return (
  <div className="max-w-[480px]">
    <h2 className="font-heading font-bold text-[24px] text-ink-900">
      {firstName ? `${firstName}, a` : "A"} tua inscrição gratuita está confirmada.
    </h2>
    <p className="text-[17px] text-ink-500 mt-2 mb-6">
      Mas queres adicionar o Premium Pass para mais tranquilidade?
    </p>

    {/* Premium Card */}
    <div
      className="bg-background rounded-2xl p-6 max-w-[460px]"
      style={{
        border: "2px solid hsl(var(--blue-600))",
        boxShadow: "0 4px 20px rgba(37,99,235,0.12)",
      }}
    >
      {/* Price row */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-heading font-semibold text-[14px] text-blue-600 uppercase tracking-[0.08em]">
            PREMIUM PASS
          </p>
          <p className="font-heading font-black text-[40px] text-blue-600 leading-none">€15 <span className="text-[16px] font-bold">+ IVA</span></p>
          <p className="text-[14px] text-ink-400">€18,45 total · pagamento único</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-2" style={{ border: "1px solid hsl(var(--amber-500) / 0.5)" }}>
          <p className="text-[14px] text-amber-700">Sobe para €27</p>
          <p className="text-[14px] text-amber-600">depois do webinar</p>
        </div>
      </div>

      <div className="w-full h-px bg-border my-4" />

      <p className="font-semibold text-[14px] text-ink-700 mb-3">Com o Premium tens acesso a:</p>

      <div className="space-y-3">
        {bullets.map((b) => (
          <div key={b.title} className="flex gap-2.5">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[15px] text-ink-900">{b.title}</p>
              <p className="text-[14px] text-ink-500">{b.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onAddPremium}
        className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-[16px] py-4 rounded-xl transition-colors shadow-blue"
      >
        Adicionar Premium Pass →
      </button>
    </div>

    {/* Separator */}
    <div className="flex items-center gap-3 my-4">
      <div className="flex-grow h-px bg-border" />
      <span className="text-[14px] text-ink-300">ou</span>
      <div className="flex-grow h-px bg-border" />
    </div>

    {/* Skip link */}
    <p
      onClick={onSkip}
      className="text-[14px] text-ink-400 cursor-pointer text-center hover:text-ink-700 hover:underline transition-colors"
    >
      Continuar sem gravação, Q&A nem guia →
    </p>
  </div>
  );
};
