import { Play, Check, Sparkles, Calendar, Clock, Timer, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";

export const HeroSection = () => {
  const { open } = useRegistrationModal();

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 max-w-[960px] text-center">
        <ScrollReveal delay={0.05}>
          <p className="font-heading font-semibold text-[13px] uppercase tracking-[0.08em] text-blue-600 mb-4">
            WEBINAR GRATUITO · 18 FEVEREIRO · 10H00
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h1 className="font-heading font-extrabold text-[32px] sm:text-[40px] md:text-[48px] leading-[1.15] tracking-[-0.02em] text-ink-900 mb-3">
            Como Criar Imagens Profissionais
            <br />
            com IA para a Tua Empresa
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <p className="font-heading font-bold text-[17px] sm:text-[20px] md:text-[24px] text-blue-600 mb-4">
            Sem equipa criativa. Sem agência. Sem meses de tentativa e erro.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-[19px] md:text-[21px] text-ink-500 font-medium max-w-[560px] mx-auto mb-4">
            O método que transforma um briefing em imagem utilizável em menos de 3 minutos. Demonstrado ao vivo, no ecrã.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="bg-ink-900 rounded-xl px-6 py-3 max-w-fit mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-10">
            <span className="flex items-center gap-1.5 text-[14px] font-medium text-white">
              <Calendar className="w-4 h-4 text-neon-cyan" />
              Quarta 18 Fev
            </span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1.5 text-[14px] font-medium text-white">
              <Clock className="w-4 h-4 text-neon-cyan" />
              10h00
            </span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1.5 text-[14px] font-medium text-white">
              <Timer className="w-4 h-4 text-neon-cyan" />
              75 min
            </span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1.5 text-[14px] font-medium text-white">
              <GraduationCap className="w-4 h-4 text-neon-cyan" />
              Gratuito
            </span>
          </div>
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
              className="w-full sm:w-auto text-center bg-gradient-to-r from-neon-purple to-blue-600 text-white font-heading font-bold text-base px-8 py-4 rounded-xl shadow-neon-purple transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Reservar Lugar Grátis!
            </motion.button>
            <motion.button
              onClick={() => open("free")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto text-center border-2 border-neon-cyan text-neon-cyan bg-transparent hover:bg-neon-cyan/10 font-heading font-bold text-base px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Garantir Premium €15
            </motion.button>
          </div>
          <p className="text-[13px] text-ink-400 mt-3">
            Sem spam. Dados protegidos (RGPD). Cancelamento simples.
          </p>
        </ScrollReveal>

      </div>
    </section>
  );
};
