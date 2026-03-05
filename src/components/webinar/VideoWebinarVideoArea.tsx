import { Clock, CalendarPlus, ExternalLink } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";
import { VIDEO_WEBINAR_CONFIG } from "./videoWebinarConfig";

const CountdownBlock = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="font-heading font-bold text-[28px] sm:text-[36px] leading-none text-white tabular-nums">
      {String(value).padStart(2, "0")}
    </span>
    <span className="text-[11px] uppercase tracking-wider text-ink-400 mt-1">{label}</span>
  </div>
);

const GOOGLE_CAL_URL = "https://calendar.app.google/kyhFPoficXByZf5S8";

export const VideoWebinarVideoArea = () => {
  const countdown = useCountdown(VIDEO_WEBINAR_CONFIG.startDate);
  const { isLive, YOUTUBE_VIDEO_ID } = VIDEO_WEBINAR_CONFIG;

  if (isLive && YOUTUBE_VIDEO_ID) {
    return (
      <div className="mb-4">
        <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
          <iframe
            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0`}
            title={VIDEO_WEBINAR_CONFIG.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        <div className="mt-3 flex justify-end">
          <a
            href={`https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] text-ink-400 hover:text-ink-600 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Abrir no YouTube
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-xl bg-gradient-to-br from-[#0a0f1e] via-[#0f1b33] to-[#0a1628] border border-white/[0.06] flex items-center justify-center mb-4 relative overflow-hidden shadow-2xl">
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
          A sessão começa em breve
        </div>
        {!countdown.isExpired && (
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
            <CountdownBlock value={countdown.days} label="dias" />
            <span className="text-white/20 text-[24px] font-light mt-[-16px]">:</span>
            <CountdownBlock value={countdown.hours} label="horas" />
            <span className="text-white/20 text-[24px] font-light mt-[-16px]">:</span>
            <CountdownBlock value={countdown.minutes} label="min" />
            <span className="text-white/20 text-[24px] font-light mt-[-16px]">:</span>
            <CountdownBlock value={countdown.seconds} label="seg" />
          </div>
        )}
        <p className="text-[13px] text-white/50 mb-5 max-w-sm mx-auto">
          Webinar — Vídeo com IA. Duração aproximada: 60 min.
        </p>
        <a
          href={GOOGLE_CAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[14px] px-5 py-2.5 rounded-lg transition-colors"
        >
          <CalendarPlus className="w-4 h-4" />
          Guardar no Google Calendar
        </a>
      </div>
    </div>
  );
};
