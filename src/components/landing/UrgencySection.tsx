import { useCountdown } from "@/hooks/useCountdown";
import { ScrollReveal } from "./ScrollReveal";
import { AlertTriangle } from "lucide-react";
import { CTAButton } from "./CTAButton";

const WEBINAR_DATE = new Date("2025-02-20T19:00:00+00:00");

const FlipUnit = ({ value, label, isUrgent }: { value: number; label: string; isUrgent: boolean }) => (
  <div className="text-center">
    <div
      className={`text-3xl md:text-5xl font-bold rounded-xl px-4 py-3 min-w-[70px] md:min-w-[90px] ${
        isUrgent
          ? "bg-destructive/20 text-destructive border border-destructive/30"
          : "bg-card neon-border"
      }`}
    >
      {String(value).padStart(2, "0")}
    </div>
    <span className="text-xs text-muted-foreground mt-2 block uppercase tracking-wider">{label}</span>
  </div>
);

export const UrgencySection = () => {
  const { days, hours, minutes, seconds, isUrgent } = useCountdown(WEBINAR_DATE);

  return (
    <section className="py-20 section-dark grid-tron">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <ScrollReveal>
          <p className="text-lg font-semibold mb-6 text-foreground">⏰ Inscrições encerram em:</p>

          <div className="flex items-center justify-center gap-3 md:gap-4 mb-8">
            <FlipUnit value={days} label="Dias" isUrgent={isUrgent} />
            <span className="text-2xl font-bold text-muted-foreground">:</span>
            <FlipUnit value={hours} label="Horas" isUrgent={isUrgent} />
            <span className="text-2xl font-bold text-muted-foreground">:</span>
            <FlipUnit value={minutes} label="Min" isUrgent={isUrgent} />
            <span className="text-2xl font-bold text-muted-foreground">:</span>
            <FlipUnit value={seconds} label="Seg" isUrgent={isUrgent} />
          </div>

          <div className="inline-flex items-center gap-2 neon-border rounded-xl px-6 py-3 bg-card mb-4">
            <AlertTriangle className="w-5 h-5 text-gold" />
            <span className="font-semibold text-foreground">VAGAS LIMITADAS A 250 PARTICIPANTES</span>
          </div>

          <p className="text-sm text-primary font-medium mb-8">
            Última verificação: 142 lugares disponíveis
          </p>

          <CTAButton size="large" />

          <p className="text-xs text-muted-foreground mt-6">
            Edição anterior: 287 inscritos • 91% participação ao vivo
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};
