import { Play, Calendar, Clock, Timer, GraduationCap } from "lucide-react";
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
          <p className="text-[19px] md:text-[21px] text-ink-500 font-medium max-w-[640px] mx-auto mb-6">
            De briefing a imagem profissional em menos de 3 minutos — demonstrado ao vivo.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-[680px] mx-auto mb-12">
            {[
              { icon: Calendar, text: "Ao vivo — 18 Fevereiro" },
              { icon: Clock, text: "10h00 (Portugal)" },
              { icon: Timer, text: "75 minutos" },
              { icon: GraduationCap, text: "Gratuito" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="bg-gradient-to-b from-white to-surface border border-border rounded-xl px-4 py-5 flex flex-col items-center gap-1.5 shadow-card">
                <Icon className="w-6 h-6 text-blue-600 shrink-0" />
                <span className="text-[15px] sm:text-[16px] font-semibold text-ink-700">{text}</span>
              </div>
            ))}
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
          <div id="inscrever" className="flex justify-center mt-8">
            <motion.button
              onClick={() => open("free")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full max-w-[320px] text-center bg-green-600 hover:bg-green-700 text-white font-heading font-bold text-base py-4 rounded-xl shadow-[0_4px_14px_0_rgba(22,163,74,0.35)] transition-all"
            >
              Inscrever-me grátis →
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
