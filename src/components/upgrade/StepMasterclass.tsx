import { Check } from "lucide-react";

interface Props {
  onAddMasterclass: () => void;
  onSkip: () => void;
}

const bullets = [
  {
    title: "Imagem → vídeo com IA: do visual estático ao clip pronto",
    sub: "Fluxo prático para transformar uma imagem em vídeo utilizável.",
  },
  {
    title: "Ferramentas certas (gratuitas e pagas) — sem confusão",
    sub: "Seleção curada por objetivo, para guardar e usar.",
  },
  {
    title: "Guia de prompts para vídeo (pronto a reutilizar)",
    sub: "Estruturas testadas para consistência e melhor controlo do resultado.",
  },
  {
    title: "Gravação incluída",
    sub: "Rever e replicar sempre que necessário.",
  },
];

export const StepMasterclass = ({ onAddMasterclass, onSkip }: Props) => (
  <div className="max-w-[480px]">
    <h2 className="font-heading font-bold text-[24px] text-ink-900">
      Transformar imagens em vídeo com IA — ao vivo
    </h2>
    <p className="text-[17px] text-ink-500 mt-2 mb-6">
      O webinar ensina o método. A Masterclass mostra como o usar para gerar vídeo — com ferramentas certas, prompts prontos e um fluxo replicável.
    </p>

    {/* Masterclass Card */}
    <div
      className="bg-background rounded-2xl p-6 max-w-[460px]"
      style={{ border: "2px solid hsl(var(--ink-700))" }}
    >
      {/* Tag */}
      <span className="inline-block text-[12px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 rounded-md bg-ink-100 text-ink-700 mb-4">
        IMAGEM → VÍDEO
      </span>

      {/* Price row */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-heading font-semibold text-[14px] text-ink-500 uppercase tracking-[0.08em]">
            MASTERCLASS ONLINE
          </p>
          <p className="font-heading font-black text-[36px] text-ink-900 leading-none">€47 + IVA</p>
          <p className="text-[14px] text-ink-400">Pagamento único · lugares limitados · 5 de Março (quinta-feira)</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-2 shrink-0 ml-3" style={{ border: "1px solid hsl(var(--amber-500) / 0.5)" }}>
          <p className="font-semibold text-[14px] text-amber-700">Early bird: €47 + IVA</p>
          <p className="text-[14px] text-amber-600">Depois: €97 + IVA</p>
        </div>
      </div>

      <div className="w-full h-px bg-border my-4" />

      <div className="space-y-3">
        {bullets.map((b) => (
          <div key={b.title} className="flex gap-2.5">
            <div className="w-5 h-5 rounded-full bg-ink-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[15px] text-ink-900">{b.title}</p>
              <p className="text-[14px] text-ink-500">{b.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Event details */}
      <div className="flex flex-wrap gap-2 mt-3">
        {["📅 5 de Março (quinta-feira)", "💻 Online", "⏱ 3 horas", "👥 Máx. 30"].map((d) => (
          <span key={d} className="text-[14px] text-ink-400">{d}</span>
        ))}
      </div>

      {/* Scarcity line */}
      <p className="text-[14px] text-ink-400 text-center mt-4">
        Grupo limitado para garantir acompanhamento.
      </p>

      {/* CTA */}
      <button
        onClick={onAddMasterclass}
        className="w-full mt-4 text-white font-heading font-bold text-[16px] py-4 rounded-xl transition-colors"
        style={{ backgroundColor: "hsl(var(--ink-900))" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e293b")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--ink-900))")}
      >
        Garantir lugar na Masterclass →
      </button>
      <p className="text-[13px] text-ink-400 text-center mt-2">
        Pagamento único · acesso à gravação incluído
      </p>
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
      Continuar sem implementação guiada →
    </p>
  </div>
);
