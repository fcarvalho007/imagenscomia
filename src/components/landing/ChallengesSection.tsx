import { ScrollReveal } from "./ScrollReveal";

const challenges = [
  { num: "01", title: "O designer demora dias e custa caro", desc: "Para cada imagem tens de abrir pedido, esperar, rever, aprovar. Um ciclo que nunca termina." },
  { num: "02", title: "Tentaste mas os resultados foram inúteis", desc: "Já usaste DALL-E ou Midjourney e saíste frustrado. Não é a ferramenta. É o método que falta." },
  { num: "03", title: "Stock fotográfico não representa a marca", desc: "As imagens genéricas do Unsplash poderiam ser de qualquer empresa. A tua não é qualquer uma." },
  { num: "04", title: "Não tens consistência visual", desc: "Cada publicação parece de uma empresa diferente. Falta sistema, não criatividade." },
  { num: "05", title: "Não sabes qual ferramenta usar", desc: "Midjourney, DALL-E, Firefly, Ideogram. Qual delas? Para quê? A que custo? Respondo tudo." },
  { num: "06", title: "Precisas de volume sem aumentar equipa", desc: "Campanhas, redes sociais, anúncios, catálogo. Mais imagens do que consegues produzir sozinho." },
];

export const ChallengesSection = () => (
  <section className="py-16 md:py-24 bg-off-white">
    <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
      <ScrollReveal>
        <h2 className="font-heading font-bold text-[22px] sm:text-[28px] md:text-[30px] tracking-[-0.01em] text-center text-ink-900 mb-2">
          Identifica-te com algum destes desafios?
        </h2>
        <p className="text-[17px] text-ink-500 text-center mb-12 max-w-lg mx-auto">
          Se sim a pelo menos um, este webinar foi feito para ti.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {challenges.map((c, i) => (
          <ScrollReveal key={i} delay={i * 0.06}>
            <div className="bg-background border border-border rounded-lg p-6 h-full shadow-card">
              <span className="font-heading font-bold text-[11px] text-ink-300 tracking-[0.1em]">{c.num}</span>
              <h3 className="font-heading font-semibold text-base text-ink-900 mt-2 mb-2">{c.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{c.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal>
        <p className="text-center text-[17px] text-ink-700 font-medium mt-10 max-w-[500px] mx-auto">
          Em 75 minutos, mostro o método completo — do briefing à imagem final, ao vivo.
        </p>
      </ScrollReveal>
    </div>
  </section>
);
