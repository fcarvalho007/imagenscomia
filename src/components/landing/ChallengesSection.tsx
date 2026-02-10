import { ScrollReveal } from "./ScrollReveal";

const challenges = [
  { num: "01", title: "O designer demora dias e custa caro" },
  { num: "02", title: "Tentaste IA mas os resultados foram inúteis" },
  { num: "03", title: "O teu stock fotográfico parece de qualquer empresa" },
  { num: "04", title: "Não tens consistência visual entre publicações" },
  { num: "05", title: "Não sabes qual ferramenta usar para quê" },
  { num: "06", title: "Precisas de mais volume sem aumentar equipa" },
];

export const ChallengesSection = () => (
  <section className="py-16 md:py-24 bg-off-white">
    <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
      <ScrollReveal>
        <h2 className="font-heading font-bold text-[22px] sm:text-[28px] md:text-[30px] tracking-[-0.01em] text-center text-ink-900 mb-12">
          Algum disto soa familiar?
        </h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {challenges.map((c, i) => (
          <ScrollReveal key={i} delay={i * 0.06}>
            <div className="bg-background border border-border rounded-lg p-6 h-full shadow-card">
              <span className="font-heading font-bold text-[11px] text-[hsl(262,83%,58%)]/40 tracking-[0.1em]">{c.num}</span>
              <h3 className="font-heading font-semibold text-[17px] text-ink-900 mt-2">{c.title}</h3>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal>
        <p className="text-center text-[18px] text-ink-700 font-medium mt-10 max-w-[500px] mx-auto">
          Em 75 minutos mostro como resolver os três primeiros. Ao vivo, no teu tipo de empresa.
        </p>
      </ScrollReveal>
    </div>
  </section>
);
