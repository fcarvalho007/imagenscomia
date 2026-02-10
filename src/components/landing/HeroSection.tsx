import { Play, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";

export const HeroSection = () => {
  const { open } = useRegistrationModal();

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 max-w-[800px] text-center">
        <ScrollReveal delay={0.1}>
          <h1 className="font-heading font-extrabold text-[28px] sm:text-[36px] md:text-[40px] leading-[1.15] tracking-[-0.02em] text-ink-900 mb-4">
            Como Criar Imagens Profissionais com IA para a Tua Empresa —{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Sem Designer
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-xl text-ink-600 font-medium max-w-[560px] mx-auto mt-4 mb-10">
            O método que transforma um briefing em imagem utilizável em menos de 3 minutos. Demonstrado ao vivo.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="max-w-[640px] mx-auto aspect-video bg-surface rounded-xl border border-border shadow-card-md flex flex-col items-center justify-center gap-3 cursor-pointer hover:shadow-card-lg transition-shadow"
          >
            <div className="w-[60px] h-[60px] rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </div>
            <p className="text-xs text-ink-400">Pré-visualização · 90 segundos</p>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div id="inscrever" className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <motion.button
              onClick={() => open("free")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto text-center bg-green-600 hover:bg-green-700 text-white font-heading font-bold text-base px-8 py-4 rounded-xl shadow-green transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Inscrever grátis
            </motion.button>
            <motion.button
              onClick={() => open("premium")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto text-center bg-amber-500 hover:bg-amber-600 text-white font-heading font-bold text-base px-8 py-4 rounded-xl shadow-amber transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Premium Pass €15 →
            </motion.button>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.5}>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex -space-x-2">
              {["bg-blue-500", "bg-green-500", "bg-amber-500"].map((bg, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${bg} border-2 border-white`} />
              ))}
            </div>
            <p className="text-sm text-ink-500 font-medium">
              <span className="text-ink-700 font-semibold">127</span> lugares reservados
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
