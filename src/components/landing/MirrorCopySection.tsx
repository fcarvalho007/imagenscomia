import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";

const points = [
  { main: "Já percebeste que IA não é só ChatGPT", sub: "e queres saber o que está para além disso" },
  { main: "A concorrência está a avançar", sub: "e não queres ficar para trás sem um plano claro" },
  { main: "Já tentaste ferramentas de IA", sub: "mas os resultados foram inconsistentes ou dececionantes" },
  { main: "Queres ver sistemas reais a funcionar", sub: "não slides com promessas" },
  { main: "Tens uma empresa ou geres uma equipa", sub: "e o tempo é o teu recurso mais escasso" },
];

export const MirrorCopySection = () => (
  <section className="py-16 md:py-24 bg-primary-dark grid-pattern">
    <div className="container mx-auto px-5 sm:px-6 max-w-3xl">
      {/* Gradient line */}
      <div className="w-20 h-0.5 gradient-main rounded-full mb-8 mx-auto md:mx-0" />

      <ScrollReveal>
        <p className="font-heading font-bold text-text-secondary uppercase tracking-[0.2em] text-xs sm:text-sm mb-8 text-center md:text-left">
          Este webinar é para ti se:
        </p>
      </ScrollReveal>

      <div className="space-y-4 mb-10">
        {points.map((p, i) => (
          <ScrollReveal key={i} delay={i * 0.08}>
            <div className="flex items-start gap-3">
              <span className="text-secondary shrink-0 mt-0.5 text-lg">→</span>
              <p className="text-sm sm:text-base leading-relaxed">
                <span className="text-foreground font-medium">{p.main}</span>
                <span className="text-text-secondary"> — {p.sub}</span>
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Gradient line */}
      <div className="w-full h-px gradient-main opacity-20 mb-8" />

      <ScrollReveal>
        <p className="text-center text-sm text-text-muted font-heading font-semibold tracking-wide mb-8">
          Quarta, 18 de Fevereiro <span className="text-secondary">·</span> 10h00 <span className="text-secondary">·</span> 75 minutos <span className="text-secondary">·</span> Gratuito
        </p>
      </ScrollReveal>

      <ScrollReveal>
        <div id="inscrever" className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <motion.a
            href="#form-gratis"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto text-center bg-cta-free hover:bg-cta-free-hover text-white font-heading font-bold text-sm px-8 py-4 rounded-xl glow-green transition-all"
          >
            INSCREVER GRÁTIS
          </motion.a>
          <motion.a
            href="#form-premium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto text-center bg-cta-premium hover:bg-cta-premium-hover text-white font-heading font-bold text-sm px-8 py-4 rounded-xl glow-amber transition-all"
          >
            PREMIUM PASS €15 🔥
          </motion.a>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
