import { ScrollReveal } from "./ScrollReveal";
import { Check, X } from "lucide-react";

const forWhom = [
  "Empresários e gestores de PMEs",
  "Diretores de Marketing que precisam de mais resultados sem mais equipa",
  "Responsáveis Comerciais que querem automatizar o follow-up",
  "Quem já usa ChatGPT mas sente que não aproveita o potencial",
];

const notFor = [
  "Developers que procuram IA técnica avançada",
  "Quem procura soluções mágicas sem implementação",
];

export const AudienceSection = () => (
  <section className="py-16 md:py-20 section-light">
    <div className="container mx-auto px-5 sm:px-6 max-w-2xl">
      <ScrollReveal>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-10 text-navy">
          Para quem é <span className="text-gradient">este webinar</span>
        </h2>
      </ScrollReveal>

      <div className="space-y-2.5 mb-8">
        {forWhom.map((item, i) => (
          <ScrollReveal key={i} delay={i * 0.06}>
            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-white border border-primary/8 shadow-sm">
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-navy text-sm sm:text-base">{item}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal>
        <p className="text-sm font-semibold text-center mb-3 text-navy-light">Não é para:</p>
      </ScrollReveal>

      <div className="space-y-2">
        {notFor.map((item, i) => (
          <ScrollReveal key={i} delay={i * 0.06}>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/4 border border-destructive/8">
              <X className="w-4 h-4 text-destructive/60 mt-0.5 shrink-0" />
              <p className="text-navy-light text-sm">{item}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
