import { Check } from "lucide-react";

interface Props {
  onAddMasterclass: () => void;
  onSkip: () => void;
}

const bullets = [
  {
    title: "Da imagem ao vídeo — domina a próxima fronteira",
    sub: "Aprende a criar vídeo com IA usando o mesmo método das imagens.",
  },
  {
    title: "Casos reais de empresas portuguesas",
    sub: "Trabalho feito durante a sessão, no teu sector.",
  },
  {
    title: "Gravação vitalícia + certificado Professor FEUC",
    sub: "Rever sempre que precisares.",
  },
];

export const StepMasterclass = ({ onAddMasterclass, onSkip }: Props) => (
  <div className="max-w-[480px]">
    <h2 className="font-heading font-bold text-[22px] text-ink-900">
      Para quem quer implementar, não só aprender
    </h2>
    <p className="text-[15px] text-ink-500 mt-2 mb-6">
      O webinar ensina o método.
      <br />
      A Masterclass aprofunda para um grupo restrito ao vivo, com o Frederico.
    </p>

    {/* Masterclass Card */}
    <div
      className="bg-background rounded-2xl p-6 max-w-[460px]"
      style={{ border: "2px solid hsl(var(--ink-700))" }}
    >
      {/* Price row */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-heading font-semibold text-[11px] text-ink-500 uppercase tracking-[0.08em]">
            MASTERCLASS ONLINE
          </p>
          <p className="font-heading font-black text-[36px] text-ink-900 leading-none">€47 + IVA</p>
          <p className="text-[12px] text-ink-400">€57,81 total · pagamento único</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-2" style={{ border: "1px solid hsl(var(--amber-500) / 0.5)" }}>
          <p className="font-semibold text-[11px] text-amber-700">Early bird</p>
          <p className="text-[10px] text-amber-600">Sobe para €97</p>
        </div>
      </div>

      <div className="w-full h-px bg-border my-4" />

      <p className="font-semibold text-[13px] text-ink-700 mb-3">Da imagem ao vídeo — ao vivo com o Frederico:</p>

      <div className="space-y-3">
        {bullets.map((b) => (
          <div key={b.title} className="flex gap-2.5">
            <div className="w-5 h-5 rounded-full bg-ink-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[14px] text-ink-900">{b.title}</p>
              <p className="text-[12px] text-ink-500">{b.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Event details */}
      <div className="flex flex-wrap gap-2 mt-3">
        {["📅 Data a anunciar", "💻 Online", "⏱ 3 horas", "👥 Máx. 30"].map((d) => (
          <span key={d} className="text-[12px] text-ink-400">{d}</span>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onAddMasterclass}
        className="w-full mt-5 text-white font-heading font-bold text-[16px] py-4 rounded-xl transition-colors"
        style={{ backgroundColor: "hsl(var(--ink-900))" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e293b")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--ink-900))")}
      >
        Reservar Masterclass →
      </button>
    </div>

    {/* Separator */}
    <div className="flex items-center gap-3 my-4">
      <div className="flex-grow h-px bg-border" />
      <span className="text-[13px] text-ink-300">ou</span>
      <div className="flex-grow h-px bg-border" />
    </div>

    {/* Skip link */}
    <p
      onClick={onSkip}
      className="text-[14px] text-ink-400 cursor-pointer text-center hover:text-ink-700 hover:underline transition-colors"
    >
      Continuar sem implementação guiada →
    </p>
  </div>
);
