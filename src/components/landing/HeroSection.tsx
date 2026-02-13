import { Calendar, Clock, Timer, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

export const HeroSection = () => {
  const { open } = useRegistrationModal();

  return (
    <section
      className="relative overflow-hidden py-16 md:py-24"
      style={{ background: "linear-gradient(135deg, #080c14 0%, #0d1525 60%, #0a1020 100%)" }}
    >
      {/* Prism background */}
      <div className="hero-prism-bg">
        <div className="prism prism-1" />
        <div className="prism prism-2" />
        <div className="prism prism-3" />
        <div className="prism prism-4" />
        <div className="prism prism-5" />
      </div>

      {/* Central light */}
      <div
        className="absolute pointer-events-none z-0"
        style={{
          top: "40%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 300,
          background: "radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0.03) 40%, transparent 70%)",
        }}
      />

      {/* Bottom separator */}
      <div
        className="absolute bottom-0 left-0 w-full pointer-events-none z-[1]"
        style={{
          height: 80,
          background: "linear-gradient(to bottom, transparent 0%, #F8FAFC 100%)",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-[960px] text-center">
        {/* Badge */}
        <motion.div {...fade(0.05)}>
          <div className="flex justify-center mb-5">
            <span
              className="inline-block backdrop-blur-sm font-heading font-bold text-[13px] uppercase tracking-[0.12em] px-5 py-2 rounded-full"
              style={{
                background: "rgba(37,99,235,0.15)",
                border: "1px solid rgba(37,99,235,0.30)",
                color: "#93C5FD",
                boxShadow: "0 0 12px rgba(59,130,246,0.35), 0 0 32px rgba(59,130,246,0.15), 0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              WEBINAR GRATUITO
            </span>
          </div>
        </motion.div>

        <motion.div {...fade(0.1)}>
          <h1 className="mb-3">
            <span
              className="block font-heading font-extrabold text-[28px] sm:text-[40px] md:text-[48px] leading-[1.15] tracking-[-0.02em]"
              style={{ color: "#F8FAFC", textShadow: "0 2px 40px rgba(0,0,0,0.5)" }}
            >
              Aprende a Criar Imagens Profissionais com IA
            </span>
          </h1>
        </motion.div>

        <motion.div {...fade(0.15)}>
          <p
            className="font-heading font-bold text-[17px] sm:text-[20px] md:text-[24px] mb-6"
            style={{ color: "#60A5FA" }}
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
                <div
                  key={idx}
                  className="rounded-xl px-4 py-5 flex flex-col items-center gap-1.5"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <Icon className="w-6 h-6 shrink-0" style={{ color: "#60A5FA" }} />
                  <div className="text-center">
                    <span className="block text-[13px] font-bold uppercase tracking-wide" style={{ color: "#94A3B8" }}>{item.label}</span>
                    <span className="block text-[15px] font-semibold mt-0.5" style={{ color: "#CBD5E1" }}>{item.value}</span>
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
          <p className="text-[14px] mt-3" style={{ color: "rgba(255,255,255,0.40)" }}>
            Sem spam. Acesso imediato por email. Dados protegidos (RGPD).
          </p>
        </motion.div>

        <motion.div {...fade(0.35)}>
          <div className="flex justify-center mt-4">
            <div
              className="inline-flex items-center gap-[10px] rounded-[10px] px-[14px] py-[8px]"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <div className="w-px h-[18px] mx-[2px]" style={{ background: "rgba(255,255,255,0.10)" }} />
              <div className="flex flex-col gap-px">
                <div className="flex items-center gap-1">
                  <span className="font-heading font-bold text-[14px]" style={{ color: "#F8FAFC" }}>5,0</span>
                  <span className="text-[13px] leading-none" style={{ color: '#FBBC05' }}>★★★★★</span>
                </div>
                <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.50)" }}>1 194 avaliações no Google</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
