import { Calendar, Clock, Timer, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";
import heroBg from "@/assets/hero-bg.jpeg";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

export const HeroSection = () => {
  const { open } = useRegistrationModal();

  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-background">
      {/* Background image */}
      <img
        src={heroBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-[0.50] pointer-events-none"
      />
      {/* Overlay for legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.92) 25%, rgba(255,255,255,0.65) 55%, rgba(255,255,255,0.20) 100%)",
        }}
      />
      {/* Top/bottom fade for smooth edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-white/70 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-[960px] text-center">
        {/* Neon badge */}
        <motion.div {...fade(0.05)}>
          <div className="flex justify-center mb-5">
            <span
              className="inline-block bg-white/90 backdrop-blur-sm font-heading font-bold text-[13px] uppercase tracking-[0.12em] text-blue-600 px-5 py-2 rounded-full border border-blue-100"
              style={{
                boxShadow:
                  "0 0 12px rgba(59,130,246,0.35), 0 0 32px rgba(59,130,246,0.15), 0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              WEBINAR GRATUITO
            </span>
          </div>
        </motion.div>

        <motion.div {...fade(0.1)}>
          <h1 className="mb-3">
            <span
              className="block font-heading font-extrabold text-[28px] sm:text-[40px] md:text-[48px] leading-[1.15] tracking-[-0.02em] text-ink-900"
              style={{ textShadow: "0 1px 8px rgba(255,255,255,0.9), 0 0 2px rgba(255,255,255,0.7)" }}
            >
              Aprende a Criar Imagens Profissionais com IA
            </span>
          </h1>
        </motion.div>

        <motion.div {...fade(0.15)}>
          <p
            className="font-heading font-bold text-[17px] sm:text-[20px] md:text-[24px] text-blue-600 mb-6"
            style={{ textShadow: "0 1px 6px rgba(255,255,255,0.8)" }}
          >
            Em 60 minutos ao vivo: do briefing à imagem pronta a publicar.
          </p>
        </motion.div>

        <motion.div {...fade(0.25)}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-[720px] mx-auto mb-10">
            {[
              { icon: Calendar, label: "ONLINE & AO VIVO", value: "18 de Fevereiro" },
              { icon: Clock, label: "HORÁRIO", value: "10h00 (Portugal)" },
              { icon: Timer, label: "DURAÇÃO", value: "60 minutos" },
              { icon: GraduationCap, label: "INVESTIMENTO", value: "Gratuito" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-gradient-to-b from-white to-surface border border-border rounded-xl px-4 py-5 flex flex-col items-center gap-1.5 shadow-card">
                  <Icon className="w-6 h-6 text-blue-600 shrink-0" />
                  <div className="text-center">
                    <span className="block text-[13px] font-bold text-ink-700 uppercase tracking-wide">{item.label}</span>
                    <span className="block text-[15px] font-semibold text-ink-500 mt-0.5">{item.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div {...fade(0.3)}>
          <div id="inscrever" className="flex justify-center">
            <motion.button
              onClick={() => open("free")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full max-w-[640px] text-center bg-green-600 hover:bg-green-700 text-white font-heading font-bold text-lg py-5 rounded-xl shadow-[0_4px_14px_0_rgba(22,163,74,0.35)] transition-all"
            >
              Sim, quero garantir a minha vaga grátis →
            </motion.button>
          </div>
          <p className="text-[14px] text-ink-400 mt-3">
            Sem spam. Acesso imediato por email. Dados protegidos (RGPD).
          </p>
        </motion.div>

        <motion.div {...fade(0.35)}>
          <div className="flex justify-center mt-4">
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
        </motion.div>
      </div>
    </section>
  );
};
