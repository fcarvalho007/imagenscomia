import { useState } from "react";
import { Copy, Check, Linkedin, Twitter } from "lucide-react";
import { WEBINAR_CONFIG } from "@/components/webinar/webinarConfig";
import { VIDEO_WEBINAR_CONFIG } from "@/components/webinar/videoWebinarConfig";

const SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || "https://imagenscomia.com";

interface ConfirmacaoExtrasProps {
  webinar?: "imagens" | "video";
}

const ConfirmacaoExtras = ({ webinar }: ConfirmacaoExtrasProps) => {
  const config = webinar === "video" ? VIDEO_WEBINAR_CONFIG : WEBINAR_CONFIG;
  const SHARE_TEXT = `Vou assistir ao webinar gratuito "${config.title}" com Frederico Carvalho! 🚀`;
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(SITE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SITE_URL)}`;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Passo 1 — Instagram */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-ink-100 flex items-center justify-center font-heading font-bold text-[13px] text-ink-600">1</span>
        <a
          href="https://www.instagram.com/frederico.m.carvalho/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 font-heading font-semibold text-[14px] text-white py-3 rounded-[10px] transition-colors bg-[#E1306C] hover:bg-[#c72d5e]"
        >
          📸 Seguir no Instagram
        </a>
      </div>

      {/* Passo 2 — Calendário */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-ink-100 flex items-center justify-center font-heading font-bold text-[13px] text-ink-600">2</span>
        <a
          href="https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MTI2azhxdmZzMWs0OWsxMWhqcHIyODZoYTQgZnJlZGVyaWNvZGlnaXRhbEBt&tmsrc=fredericodigital%40gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 font-heading font-semibold text-[14px] text-white py-3 rounded-[10px] transition-colors bg-[#4285F4] hover:bg-[#3367D6]"
        >
          <img src="/google-cal-icon.svg" alt="" className="w-5 h-5" />
          Adicionar ao Google Calendar
        </a>
      </div>

      {/* Passo 3 — Social Share Card */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-ink-100 flex items-center justify-center font-heading font-bold text-[13px] text-ink-600">3</span>
        <div className="flex-1 rounded-xl border border-border bg-surface p-4">
          <p className="font-heading font-semibold text-[13px] text-ink-500 mb-3">
            Partilha com os teus amigos
          </p>

          {/* Mini social card preview */}
          <div className="rounded-lg bg-ink-50 border border-ink-100 p-3 mb-3">
            <p className="font-heading font-bold text-[14px] text-ink-800 leading-tight">
              {config.title}
            </p>
            <p className="text-[12px] text-ink-400 mt-1">
              {config.metaLine} · Frederico Carvalho
            </p>
          </div>

          {/* Share buttons */}
          <div className="flex gap-2">
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white py-2.5 rounded-lg bg-[#0A66C2] hover:bg-[#004182] transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white py-2.5 rounded-lg bg-[#1DA1F2] hover:bg-[#0d8bd9] transition-colors"
            >
              <Twitter className="w-4 h-4" />
              X / Twitter
            </a>
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-ink-600 py-2.5 rounded-lg border border-ink-200 hover:bg-ink-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copiado!" : "Copiar link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacaoExtras;
