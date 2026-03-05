import { useState } from "react";
import { Copy, Check, Linkedin } from "lucide-react";
import { WEBINAR_CONFIG } from "@/components/webinar/webinarConfig";
import { VIDEO_WEBINAR_CONFIG } from "@/components/webinar/videoWebinarConfig";

const SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || "https://imagenscomia.com";

interface ConfirmacaoExtrasProps {
  webinar?: "imagens" | "video";
}

const ConfirmacaoExtras = ({ webinar }: ConfirmacaoExtrasProps) => {
  const config = webinar === "video" ? VIDEO_WEBINAR_CONFIG : WEBINAR_CONFIG;
  const SHARE_TEXT = `Vou assistir ao webinar "${config.title}" com Frederico Carvalho! 🚀`;
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(SITE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + " " + SITE_URL)}`;

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
        {(() => {
          const VIDEO_CAL_URL = "https://calendar.app.google/kyhFPoficXByZf5S8";
          let calUrl: string;
          if (webinar === "video") {
            calUrl = VIDEO_CAL_URL;
          } else {
            const start = config.startDate;
            const end = new Date(start.getTime() + config.durationMinutes * 60000);
            const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
            calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(config.title)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(config.summary)}`;
          }
          return (
            <a
              href={calUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 font-heading font-semibold text-[14px] text-white py-3 rounded-[10px] transition-colors bg-[#4285F4] hover:bg-[#3367D6]"
            >
              <img src="/google-cal-icon.svg" alt="" className="w-5 h-5" />
              Adicionar ao Google Calendar
            </a>
          );
        })()}
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
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white py-2.5 rounded-lg bg-[#25D366] hover:bg-[#1da851] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
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
