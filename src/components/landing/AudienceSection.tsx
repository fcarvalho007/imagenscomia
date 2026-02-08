import { ScrollReveal } from "./ScrollReveal";
import { Check, X } from "lucide-react";

const forWhom = [
  "Empresários e gestores de PMEs (10-200 colaboradores)",
  "Diretores de Marketing que precisam de mais output sem mais equipa",
  "Responsáveis Comerciais que querem automatizar follow-up de leads",
  "Gestores que procuram eficiência através de automação inteligente",
  "Quem já usa ChatGPT mas sente que não aproveita o potencial",
];

const notFor = [
  "Developers que procuram IA técnica avançada",
  "Quem procura soluções mágicas sem implementação",
  "Grandes empresas com +500 colaboradores",
];

export const AudienceSection = () => (
  <section className="py-20 bg-muted/30 grid-tron">
    <div className="container mx-auto px-4 max-w-3xl">
      <ScrollReveal>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Para quem é <span className="text-gradient">este webinar</span>
        </h2>
      </ScrollReveal>

      <div className="space-y-3 mb-10">
        {forWhom.map((item, i) => (
          <ScrollReveal key={i} delay={i * 0.08}>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-foreground/80">{item}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal>
        <h3 className="text-lg font-bold text-center mb-4 text-muted-foreground">Não é para:</h3>
      </ScrollReveal>

      <div className="space-y-3">
        {notFor.map((item, i) => (
          <ScrollReveal key={i} delay={i * 0.08}>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/10">
              <X className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-muted-foreground text-sm">{item}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
