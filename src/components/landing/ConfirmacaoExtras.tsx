import { useState } from "react";
import { Check, Copy } from "lucide-react";

const generateICS = () => {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Webinar IA//PT",
    "BEGIN:VEVENT",
    "DTSTART:20260218T100000",
    "DTEND:20260218T111500",
    "SUMMARY:Webinar IA — Frederico Carvalho",
    "DESCRIPTION:Como Criar Imagens Profissionais com IA para a Tua Empresa",
    "URL:https://fredericocarvalho.pt",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "webinar-ia.ics";
  a.click();
  URL.revokeObjectURL(url);
};

interface Props {
  referralLink: string;
}

const ConfirmacaoExtras = ({ referralLink }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Bloco 1 — Referral Bónus */}
      <div className="w-full max-w-[560px] rounded-xl p-5 text-left bg-amber-50 border border-amber-200">
        <p className="font-heading font-bold text-[15px] text-amber-800 mb-2">
          🎁 Convida 2 amigos — ganha acesso ao Q&A Bónus de 25 Fev
        </p>
        <p className="text-[14px] text-amber-700 leading-relaxed mb-4">
          Partilha o teu link com 2 amigos. Quando ambos se inscreverem,
          entras gratuitamente na sessão extra de Q&A com Frederico
          no dia 25 de Fevereiro.
        </p>
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 font-heading font-semibold text-[14px] text-amber-700 py-3 rounded-[10px] transition-colors bg-transparent border border-amber-400 hover:bg-amber-100"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Link copiado ✓" : "Copiar o meu link de convite"}
        </button>
      </div>

      {/* Bloco 2 — Calendário */}
      <button
        onClick={generateICS}
        className="w-full max-w-[560px] flex items-center justify-center gap-2 font-heading font-semibold text-[14px] text-ink-900 bg-background border border-ink-700 py-3 rounded-[10px] hover:bg-surface transition-colors"
      >
        📅 Guardar no calendário
      </button>

      {/* Bloco 3 — Instagram */}
      <a
        href="https://www.instagram.com/frederico.m.carvalho/"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full max-w-[560px] flex items-center justify-center gap-2 font-heading font-semibold text-[14px] text-white py-3 rounded-[10px] transition-colors bg-[#E1306C] hover:bg-[#c72d5e]"
      >
        📸 Seguir no Instagram
      </a>
    </div>
  );
};

export default ConfirmacaoExtras;
