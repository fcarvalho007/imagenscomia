import { ScrollReveal } from "./ScrollReveal";
import { X } from "lucide-react";

const problems = [
  "A concorrência já usa IA mas não há clareza sobre por onde começar",
  "Tempo desperdiçado em tarefas repetitivas que poderiam ser automatizadas",
  "ChatGPT já foi testado mas os resultados foram inconsistentes",
  "Receio de investir em ferramentas erradas e desperdiçar orçamento",
  "A equipa resiste à mudança tecnológica",
  "Necessidade de mais conteúdo sem orçamento para agência",
  "Sistemas e dados desorganizados que impedem decisões rápidas",
];

export const ProblemSection = () => (
  <section className="py-20">
    <div className="container mx-auto px-4 max-w-3xl">
      <ScrollReveal>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Se algum destes desafios é familiar, <span className="text-gradient">este webinar foi feito para si</span>
        </h2>
      </ScrollReveal>

      <div className="space-y-3 mb-12">
        {problems.map((problem, i) => (
          <ScrollReveal key={i} delay={i * 0.08}>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/15">
              <X className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <p className="text-foreground/80">{problem}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal>
        <div className="text-center p-8 rounded-2xl neon-border bg-card">
          <p className="text-lg font-medium text-foreground/90">
            Em 90 minutos, vai descobrir <strong className="text-primary">QUAIS</strong> ferramentas usar e <strong className="text-primary">COMO</strong> implementar — com demonstrações ao vivo.
          </p>
          <p className="text-muted-foreground mt-3 font-medium">
            Sem teoria. Só aplicação prática.
          </p>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
