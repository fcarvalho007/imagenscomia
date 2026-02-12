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
      <div className="container mx-auto px-4 sm:px-6 max-w-[800px] text-center relative z-10">
        <ScrollReveal>
          <h2 className="font-heading font-extrabold text-[28px] sm:text-[34px] md:text-[38px] leading-[1.2] text-white mb-1 max-w-[700px] mx-auto">
            Imagens profissionais com IA.
          </h2>
          <p className="font-heading font-extrabold text-[28px] sm:text-[34px] md:text-[38px] leading-[1.2] text-blue-600 mb-4">
            Sem equipa criativa. Sem agência. Sem esperas.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="text-[18px] text-white/65 mb-6">
            75 minutos. Sem custo. Método pronto a usar no dia seguinte.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <p className="text-[16px] text-white/50 italic mb-10 max-w-[600px] mx-auto">
            Sessão especial preparada com poucos dias de antecedência para manter o grupo prático. Se fizer sentido, vale a pena convidar um colega ou amigo.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex justify-center">
            <motion.button
              onClick={() => open("free")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto text-center bg-green-600 hover:bg-green-700 text-white font-heading font-bold text-lg px-8 py-4 rounded-xl shadow-[0_4px_14px_0_rgba(22,163,74,0.35)] transition-all"
            >
              Inscrever-me grátis →
            </motion.button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
