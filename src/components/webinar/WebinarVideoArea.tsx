import { Clock, ExternalLink, CheckCircle2 } from "lucide-react";
import { WEBINAR_CONFIG } from "./webinarConfig";
import { Button } from "@/components/ui/button";

interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

interface Props {
  isLive: boolean;
  isEnded: boolean;
  countdown: CountdownValues;
}

const CountdownBlock = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="font-heading font-bold text-[28px] sm:text-[36px] leading-none text-white tabular-nums">
      {String(value).padStart(2, "0")}
    </span>
    <span className="text-[11px] uppercase tracking-wider text-ink-400 mt-1">{label}</span>
  </div>
);

const YOUTUBE_LIVE_URL = `https://youtube.com/live/${WEBINAR_CONFIG.YOUTUBE_VIDEO_ID}`;
const YOUTUBE_EMBED_URL = `https://www.youtube.com/embed/${WEBINAR_CONFIG.YOUTUBE_VIDEO_ID}`;

export const WebinarVideoArea = ({ isLive, isEnded, countdown }: Props) => {
  // Ended state
  if (isEnded) {
    return (
      <div className="aspect-video rounded-xl bg-gradient-to-br from-[#0a0f1e] via-[#0f1b33] to-[#0a1628] border border-white/[0.06] flex items-center justify-center mb-6 relative overflow-hidden shadow-2xl">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 text-center px-6 max-w-md">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/70 text-[13px] font-medium px-3 py-1 rounded-full mb-5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            Transmissão concluída
          </div>
          <h2 className="font-heading font-bold text-[22px] sm:text-[28px] text-white mb-3 leading-tight">
            Obrigado por participares!
          </h2>
          <p className="text-[14px] sm:text-[15px] text-white/60 mb-6 leading-relaxed">
            A gravação HD + documentos de apoio (resumos, checklists e prompts) estão disponíveis por <span className="text-white font-semibold">27 €</span>.
          </p>
          <a
            href="/gravacao"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-[15px] px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Aceder à gravação →
          </a>
        </div>
      </div>
    );
  }

  // Live state
  if (isLive) {
    return (
      <div className="mb-6">
        {/* Header above player */}
        <div className="mb-4">
          <h2 className="font-heading font-bold text-[20px] sm:text-[24px] text-foreground">
            Transmissão ao vivo
          </h2>
        </div>

        {/* YouTube embed */}
        <div
          className="w-full rounded-xl overflow-hidden bg-black"
          style={{ aspectRatio: "16 / 9" }}
        >
          <iframe
            src={YOUTUBE_EMBED_URL}
            className="w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title="Webinar ao vivo"
          />
        </div>

        {/* Fallback below player */}
        <div className="flex flex-col items-center gap-2 mt-4">
          <Button variant="outline" size="sm" asChild>
            <a
              href={YOUTUBE_LIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir no YouTube
            </a>
          </Button>
          <p className="text-[13px] text-ink-400">
            Se o player não carregar, abrir no YouTube resolve quase sempre.
          </p>
        </div>
      </div>
    );
  }

  // Waiting state
  return (
    <div className="aspect-video rounded-xl bg-gradient-to-br from-[#0a0f1e] via-[#0f1b33] to-[#0a1628] border border-white/[0.06] flex items-center justify-center mb-4 relative overflow-hidden shadow-2xl">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 text-center px-6">
        <div className="inline-flex items-center gap-2 bg-white/10 text-white/70 text-[13px] font-medium px-3 py-1 rounded-full mb-6">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          A transmissão começa em breve
        </div>

        {/* Countdown */}
        {!countdown.isExpired && (
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <CountdownBlock value={countdown.days} label="dias" />
            <span className="text-white/20 text-[24px] font-light mt-[-16px]">:</span>
            <CountdownBlock value={countdown.hours} label="horas" />
            <span className="text-white/20 text-[24px] font-light mt-[-16px]">:</span>
            <CountdownBlock value={countdown.minutes} label="min" />
            <span className="text-white/20 text-[24px] font-light mt-[-16px]">:</span>
            <CountdownBlock value={countdown.seconds} label="seg" />
          </div>
        )}

        <p className="text-[12px] text-white/40 mt-6 max-w-sm">
          O vídeo fica disponível automaticamente 30 min antes do início. Sugestão: entrar 3–5 min antes.
        </p>
      </div>
    </div>
  );
};
