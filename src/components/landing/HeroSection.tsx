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
          <p className="font-heading font-semibold text-[14px] uppercase tracking-[0.08em] text-blue-600 mb-4">
            WEBINAR GRATUITO · 18 FEVEREIRO · 10H00
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h1 className="mb-3">
            <span className="block font-heading font-extrabold text-[32px] sm:text-[40px] md:text-[48px] leading-[1.15] tracking-[-0.02em] text-ink-900">
              Cria Imagens Profissionais com IA
            </span>
            <span className="block font-heading font-bold text-[21px] sm:text-[26px] md:text-[31px] leading-[1.15] tracking-[-0.02em] text-ink-500">
              para a Tua Empresa
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <p className="font-heading font-bold text-[17px] sm:text-[20px] md:text-[24px] text-blue-600 mb-4">
            Sem equipa criativa. Sem agência. Sem meses de tentativa e erro.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-[19px] md:text-[21px] text-ink-500 font-medium max-w-[720px] mx-auto mb-6">
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
                <span className="text-[16px] font-semibold text-ink-700">{text}</span>
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
            <p className="text-[14px] text-ink-400">Pré-visualização · 90 segundos</p>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div id="inscrever" className="flex justify-center mt-8">
            <motion.button
              onClick={() => open("free")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full max-w-[380px] text-center bg-green-600 hover:bg-green-700 text-white font-heading font-bold text-lg py-5 rounded-xl shadow-[0_4px_14px_0_rgba(22,163,74,0.35)] transition-all"
            >
              Inscrever-me grátis →
            </motion.button>
          </div>
          <p className="text-[14px] text-ink-400 mt-3">
            Sem spam. Dados protegidos (RGPD). Cancelamento simples.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.45}>
          <div className="flex justify-center mt-5">
            <div className="inline-flex items-center gap-[10px] bg-white border border-border rounded-xl px-[18px] py-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
              <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <div className="w-px h-[18px] bg-border mx-[2px]" />
              <div className="flex flex-col gap-px">
                <div className="flex items-center gap-1">
                  <span className="font-heading font-bold text-[14px] text-ink-900">5,0</span>
                  <span className="text-[13px] leading-none" style={{ color: '#FBBC05' }}>★★★★★</span>
                </div>
                <span className="text-[14px] text-ink-400">1 194 avaliações no Google</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
