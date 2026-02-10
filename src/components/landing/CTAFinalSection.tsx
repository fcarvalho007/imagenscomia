import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";

export const CTAFinalSection = () => (
  <section className="py-20 md:py-28 bg-gradient-to-b from-[hsl(222,47%,5%)] to-[hsl(217,33%,11%)] grid-pattern">
    <div className="container mx-auto px-5 sm:px-6 max-w-3xl text-center">
      <ScrollReveal>
        <h2 className="font-heading font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-[2.5rem] leading-[1.2] mb-4 max-w-2xl mx-auto">
          A diferença entre empresas que crescem e as que estacionam está na{" "}
          <span className="text-gradient">velocidade de adoção</span> de sistemas novos.
        </h2>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <p className="font-heading font-semibold text-secondary text-base sm:text-lg mb-8 md:mb-10">
          75 minutos. Sem custo. Ferramentas prontas a usar.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
          <motion.a
            href="#inscrever"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto text-center bg-cta-free hover:bg-cta-free-hover text-white font-heading font-bold text-sm px-8 py-4 rounded-xl glow-green transition-all"
          >
            GARANTIR LUGAR GRÁTIS
          </motion.a>
          <motion.a
            href="#form-premium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto text-center bg-cta-premium hover:bg-cta-premium-hover text-white font-heading font-bold text-sm px-8 py-4 rounded-xl glow-amber transition-all"
          >
            PREMIUM PASS €15
          </motion.a>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.3}>
        <p className="text-xs text-text-secondary flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span>Sem spam</span>
          <span>·</span>
          <span>Dados protegidos RGPD</span>
          <span>·</span>
          <span>Reembolso 14 dias</span>
        </p>
      </ScrollReveal>
    </div>
  </section>
);
