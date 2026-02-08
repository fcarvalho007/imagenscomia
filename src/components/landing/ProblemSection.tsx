import { ScrollReveal } from "./ScrollReveal";
import { X } from "lucide-react";

const problems = [
  "A concorrência já usa IA mas não sabe por onde começar",
  "Horas desperdiçadas em tarefas que podiam ser automatizadas",
  "Já testou o ChatGPT mas os resultados foram inconsistentes",
  "Receio de investir nas ferramentas erradas",
  "A equipa resiste à mudança tecnológica",
  "Precisa de mais conteúdo sem orçamento para agência",
];

export const ProblemSection = () => (
  <section className="py-16 md:py-20 section-dark grid-tron">
    <div className="container mx-auto px-5 sm:px-6 max-w-2xl">
      <ScrollReveal>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3">
          Identifica-se com algum destes <span className="text-gradient">desafios</span>?
        </h2>
        <p className="text-center text-muted-foreground text-sm sm:text-base mb-8 md:mb-10 max-w-lg mx-auto leading-relaxed">
          Se respondeu "sim" a pelo menos um, este webinar foi desenhado para si.
        </p>
      </ScrollReveal>

      <div className="space-y-2.5 mb-10">
        {problems.map((problem, i) => (
          <ScrollReveal key={i} delay={i * 0.06}>
            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-destructive/5 border border-destructive/10">
              <X className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-foreground/80 text-sm sm:text-base leading-relaxed">{problem}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal>
        <div className="text-center p-6 sm:p-8 rounded-2xl neon-border bg-card">
          <p className="text-base sm:text-lg font-medium text-foreground/90 leading-relaxed">
            Em 90 minutos, vai descobrir <strong className="text-primary">quais</strong> ferramentas usar e <strong className="text-primary">como</strong> implementá-las — com demonstrações ao vivo.
          </p>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
