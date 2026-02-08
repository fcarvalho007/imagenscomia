import { useCountdown } from "@/hooks/useCountdown";
import { ScrollReveal } from "./ScrollReveal";
import { AlertTriangle } from "lucide-react";
import { CTAButton } from "./CTAButton";

const WEBINAR_DATE = new Date("2025-02-20T19:00:00+00:00");

const FlipUnit = ({ value, label, isUrgent }: { value: number; label: string; isUrgent: boolean }) => (
  <div className="text-center">
    <div
      className={`text-2xl sm:text-3xl md:text-5xl font-bold rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 min-w-[55px] sm:min-w-[70px] md:min-w-[90px] ${
        isUrgent
          ? "bg-destructive/15 text-destructive border border-destructive/20"
          : "bg-card neon-border"
      }`}
    >
      {String(value).padStart(2, "0")}
    </div>
    <span className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 block uppercase tracking-wider">{label}</span>
  </div>
);

export const UrgencySection = () => {
  const { days, hours, minutes, seconds, isUrgent } = useCountdown(WEBINAR_DATE);

  return (
    <section className="py-16 md:py-20 section-dark grid-tron">
      <div className="container mx-auto px-5 sm:px-6 max-w-2xl text-center">
        <ScrollReveal>
          <p className="text-base sm:text-lg font-semibold mb-5 text-foreground">⏰ Inscrições encerram em:</p>

          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-6 md:mb-8">
            <FlipUnit value={days} label="Dias" isUrgent={isUrgent} />
            <span className="text-xl sm:text-2xl font-bold text-muted-foreground/50">:</span>
            <FlipUnit value={hours} label="Horas" isUrgent={isUrgent} />
            <span className="text-xl sm:text-2xl font-bold text-muted-foreground/50">:</span>
            <FlipUnit value={minutes} label="Min" isUrgent={isUrgent} />
            <span className="text-xl sm:text-2xl font-bold text-muted-foreground/50">:</span>
            <FlipUnit value={seconds} label="Seg" isUrgent={isUrgent} />
          </div>

          <div className="inline-flex items-center gap-2 neon-border rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 bg-card mb-3">
            <AlertTriangle className="w-4 h-4 text-gold shrink-0" />
            <span className="font-semibold text-foreground text-xs sm:text-sm">VAGAS LIMITADAS A 250 PARTICIPANTES</span>
          </div>

          <p className="text-xs sm:text-sm text-primary font-medium mb-6 md:mb-8">
            Última verificação: 142 lugares disponíveis
          </p>

          <CTAButton size="large" />

          <p className="text-xs text-muted-foreground mt-5">
            Edição anterior: 287 inscritos • 91% participação ao vivo
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};
