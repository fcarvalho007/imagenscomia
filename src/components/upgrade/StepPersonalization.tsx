interface Props {
  duvida: string;
  setDuvida: (s: string) => void;
  onNext: () => void;
  onSkip: () => void;
}

export const StepPersonalization = ({ duvida, setDuvida, onNext, onSkip }: Props) => {
  const charCount = duvida.length;
  const maxChars = 300;

  return (
    <div className="max-w-[480px]">
      <h2 className="font-heading font-bold text-[22px] text-ink-900">
        A tua maior dúvida sobre imagens com IA
      </h2>
      <p className="text-[15px] text-ink-500 mt-2 mb-2">
        Frederico vai ler antes do webinar.
        <br />
        Quanto mais específico, mais útil para ti.
      </p>

      {/* Blue note */}
      <div
        className="rounded-r-lg p-3 mb-5"
        style={{
          backgroundColor: "hsl(var(--blue-50))",
          borderLeft: "3px solid hsl(var(--blue-600))",
        }}
      >
        <p className="text-[13px]" style={{ color: "hsl(var(--blue-700))" }}>
          As respostas mais específicas recebem atenção especial no Q&A.
        </p>
      </div>

      <textarea
        rows={4}
        maxLength={maxChars}
        value={duvida}
        onChange={(e) => setDuvida(e.target.value)}
        placeholder="Ex: 'Não sei como descrever o estilo visual da minha marca'&#10;ou 'Os resultados são sempre genéricos, sem identidade'"
        className="w-full border border-border rounded-xl p-3.5 text-[15px] text-ink-700 bg-background resize-none focus:outline-none focus:border-blue-600 transition-colors"
      />
      <p className="text-right text-[12px] mt-1" style={{
        color: charCount > 280 ? "hsl(var(--amber-500))" : "hsl(var(--ink-400))"
      }}>
        {charCount}/{maxChars}
      </p>

      <button
        onClick={onNext}
        className="mt-5 bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-[15px] py-3 px-8 rounded-xl transition-colors"
      >
        Próximo passo →
      </button>

      <p
        onClick={onSkip}
        className="text-[13px] text-ink-400 cursor-pointer mt-2.5 text-center hover:underline"
      >
        Saltar — responder depois
      </p>
    </div>
  );
};
