import { ScrollReveal } from "./ScrollReveal";
import { Check, X } from "lucide-react";

const forWhom = [
  { main: "Empresários e gestores de PMEs", sub: "que querem adotar IA de forma prática" },
  { main: "Diretores de Marketing", sub: "que precisam de mais resultados sem mais equipa" },
  { main: "Responsáveis Comerciais", sub: "que querem automatizar follow-up e prospeção" },
  { main: "Quem já usa ChatGPT", sub: "mas sente que não está a aproveitar o potencial" },
  { main: "Profissionais que querem perceber IA", sub: "antes de investir em ferramentas" },
];

const notFor = [
  { main: "Developers à procura de IA técnica avançada", sub: "este webinar é para gestores e equipas de negócio" },
  { main: "Quem procura soluções mágicas sem implementação", sub: "há trabalho. Mostro o trabalho." },
];

export const AudienceSection = () => (
  <section className="py-16 md:py-24 bg-primary-dark grid-pattern">
    <div className="container mx-auto px-5 sm:px-6 max-w-4xl">
      <ScrollReveal>
        <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-center mb-10 md:mb-14">
          Para quem é este webinar
        </h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* For whom */}
        <div>
          <p className="font-heading font-semibold text-sm text-cta-free mb-4 flex items-center gap-2">
            <Check className="w-4 h-4" /> Para quem é
          </p>
          <div className="space-y-3">
            {forWhom.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
                <div className="flex items-start gap-3 glass-card rounded-xl p-3.5 sm:p-4">
                  <Check className="w-4 h-4 text-cta-free mt-0.5 shrink-0" />
                  <p className="text-sm">
                    <span className="text-foreground font-medium">{item.main}</span>{" "}
                    <span className="text-text-secondary">{item.sub}</span>
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Not for */}
        <div>
          <p className="font-heading font-semibold text-sm text-urgency mb-4 flex items-center gap-2">
            <X className="w-4 h-4" /> Para quem não
          </p>
          <div className="space-y-3">
            {notFor.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
                <div className="flex items-start gap-3 rounded-xl p-3.5 sm:p-4 border border-urgency/10 bg-urgency/[0.03]">
                  <X className="w-4 h-4 text-urgency/60 mt-0.5 shrink-0" />
                  <p className="text-sm">
                    <span className="text-foreground font-medium">{item.main}</span>{" "}
                    <span className="text-text-secondary">({item.sub})</span>
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);
