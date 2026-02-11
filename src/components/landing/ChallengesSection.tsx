import { ScrollReveal } from "./ScrollReveal";

const challenges = [
  { num: "01", title: "O stock fotográfico parece de qualquer empresa" },
  { num: "02", title: "Sem consistência visual entre publicações" },
  { num: "03", title: "Difícil saber qual ferramenta usar para quê" },
  { num: "04", title: "Mais volume sem aumentar equipa" },
];

export const ChallengesSection = () => (
  <section className="py-16 md:py-24 bg-off-white">
    <div className="container mx-auto px-4 sm:px-6 max-w-[960px]">
      <ScrollReveal>
        <h2 className="font-heading font-bold text-[24px] sm:text-[30px] md:text-[34px] tracking-[-0.01em] text-center text-ink-900 mb-12">
          Algum disto soa familiar?
        </h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {challenges.map((c, i) => (
          <ScrollReveal key={i} delay={i * 0.06}>
            <div className="bg-background border border-border rounded-lg p-6 h-full shadow-card">
              <span className="font-heading font-bold text-[14px] text-[hsl(262,83%,58%)]/40 tracking-[0.1em]">{c.num}</span>
              <h3 className="font-heading font-semibold text-[17px] text-ink-900 mt-2">{c.title}</h3>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={0.4}>
        <p className="text-center text-[17px] text-ink-500 mt-8">
          Se te identificaste com pelo menos 2 destes problemas, este webinar vai poupar-te meses de tentativa e erro.
        </p>
      </ScrollReveal>

    </div>
  </section>
);
