import { ScrollReveal } from "./ScrollReveal";

const challenges = [
  { num: "01", title: "A concorrência já usa IA", desc: "Sentes que estás a ficar para trás sem saberes por onde começar." },
  { num: "02", title: "Tempo desperdiçado em tarefas repetitivas", desc: "Horas em trabalho que podia ser automatizado — análises, relatórios, conteúdo." },
  { num: "03", title: "ChatGPT decepcionante", desc: "Já experimentaste mas os resultados foram inconsistentes. Falta método." },
  { num: "04", title: "Medo de escolher as ferramentas erradas", desc: "O mercado tem centenas de opções. Não sabes em quais investir tempo e dinheiro." },
  { num: "05", title: "Precisas de mais conteúdo sem mais equipa", desc: "Publicar com consistência é difícil sem orçamento para agência externa." },
  { num: "06", title: "Queres ROI claro, não promessas", desc: "Chega de casos de estudo americanos. Queres ver o que funciona em Portugal." },
];

export const ChallengesSection = () => (
  <section className="py-16 md:py-24 bg-primary-dark grid-pattern">
    <div className="container mx-auto px-5 sm:px-6 max-w-4xl">
      <ScrollReveal>
        <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-center mb-3">
          Identifica-te com algum destes desafios?
        </h2>
        <p className="text-sm sm:text-base text-text-secondary text-center mb-10 md:mb-14 max-w-lg mx-auto">
          Se sim a pelo menos um, este webinar foi feito para ti.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {challenges.map((c, i) => (
          <ScrollReveal key={i} delay={i * 0.06}>
            <div className="glass-card glass-card-hover rounded-2xl p-5 sm:p-6 h-full">
              <span className="font-mono text-secondary/40 text-2xl font-bold">{c.num}</span>
              <h3 className="font-heading font-semibold text-sm sm:text-base text-foreground mt-2 mb-1.5">{c.title}</h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{c.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal>
        <p className="text-center text-sm sm:text-base text-foreground font-medium mt-10 max-w-md mx-auto">
          Em 75 minutos, mostro sistemas reais — com demonstrações ao vivo no computador.
        </p>
      </ScrollReveal>
    </div>
  </section>
);
