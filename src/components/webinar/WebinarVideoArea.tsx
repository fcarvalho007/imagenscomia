import { Clock, Radio } from "lucide-react";
import { WEBINAR_CONFIG } from "./webinarConfig";
import WebinarCalendarButton from "./AddToCalendarButton";

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

export const WebinarVideoArea = ({ isLive, isEnded, countdown }: Props) => {
  // Ended state
  if (isEnded) {
    return (
      <div className="aspect-video rounded-xl bg-ink-900 flex items-center justify-center mb-6">
        <div className="text-center px-6">
          <h2 className="font-heading font-bold text-[20px] sm:text-[24px] text-white mb-2">
            Obrigado por participar!
          </h2>
          <p className="text-[15px] text-white/60 max-w-md">
            A gravação está disponível para quem tem o Premium Pass.
          </p>
        </div>
      </div>
    );
  }

  // Live state
  if (isLive) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-black mb-6 relative">
        {WEBINAR_CONFIG.EMBED_IFRAME_HTML ? (
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: WEBINAR_CONFIG.EMBED_IFRAME_HTML }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-ink-900">
            <div className="text-center px-6">
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 text-[13px] font-semibold px-3 py-1 rounded-full mb-4">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                EM DIRETO
              </div>
              <h2 className="font-heading font-bold text-[20px] sm:text-[24px] text-white mb-2">
                Transmissão em curso
              </h2>
              <p className="text-[14px] text-white/50">
                O embed será colocado aqui quando disponível.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Waiting state
  return (
    <div className="aspect-video rounded-xl bg-gradient-to-br from-ink-900 via-[#0f1b33] to-ink-900 flex items-center justify-center mb-6 relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 text-center px-6">
        <div className="inline-flex items-center gap-2 bg-white/10 text-white/70 text-[13px] font-medium px-3 py-1 rounded-full mb-5 animate-pulse">
          <Clock className="w-3.5 h-3.5" />
          A transmissão começa em breve
        </div>

        {/* Countdown */}
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

        <p className="text-[14px] text-white/40 mb-5 max-w-sm mx-auto">
          O vídeo fica disponível automaticamente perto da hora de início.
        </p>

        <WebinarCalendarButton />
      </div>
    </div>
  );
};
