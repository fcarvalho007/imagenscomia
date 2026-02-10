import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";
import particlesBg from "@/assets/particles-bg.jpg";

export const CTAFinalSection = () => {
  const { open } = useRegistrationModal();

  return (
    <section
      className="py-20 md:py-28 relative bg-ink-900"
      style={{ backgroundImage: `url(${particlesBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-ink-900/85" />
      <div className="container mx-auto px-4 sm:px-6 max-w-[720px] text-center relative z-10">
        <ScrollReveal>
          <h2 className="font-heading font-extrabold text-[28px] sm:text-[32px] md:text-[36px] leading-[1.2] text-white mb-1 max-w-[600px] mx-auto">
            Imagens profissionais com IA.
          </h2>
          <p className="font-heading font-extrabold text-[28px] sm:text-[32px] md:text-[36px] leading-[1.2] text-blue-600 mb-4">
            Sem equipa criativa. Sem agência. Sem esperas.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="text-[18px] text-white/65 mb-10">
            75 minutos. Sem custo. Método pronto a usar no dia seguinte.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <motion.button
              onClick={() => open("free")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto text-center bg-gradient-to-r from-neon-purple to-blue-600 text-white font-heading font-bold text-base px-8 py-4 rounded-xl shadow-neon-purple transition-all"
            >
              Garantir lugar grátis
            </motion.button>
            <motion.button
              onClick={() => open("free")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto text-center bg-gradient-to-r from-blue-600 to-neon-cyan text-white font-heading font-bold text-base px-8 py-4 rounded-xl shadow-neon-cyan transition-all"
            >
              Premium Pass €15
            </motion.button>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <p className="text-[13px] text-white/40 flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
            <span>✓ Sem spam</span>
            <span>✓ Dados protegidos RGPD</span>
            <span>✓ Reembolso garantido 14 dias</span>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};
