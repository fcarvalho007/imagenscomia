import { useRef } from "react";
import { Calendar, Clock, Timer, GraduationCap } from "lucide-react";
import { motion, useMotionValue, useAnimationFrame, useTransform } from "framer-motion";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";
import ElectricBorder from "./ElectricBorder";
import FloatingLines from "./FloatingLines";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const progress = useMotionValue(0);
  const elapsed = useRef(0);
  const lastTime = useRef<number | null>(null);
  const duration = 8000;

  useAnimationFrame((time) => {
    if (lastTime.current === null) { lastTime.current = time; return; }
    elapsed.current += time - lastTime.current;
    lastTime.current = time;
    const cycle = elapsed.current % (duration * 2);
    progress.set(cycle < duration ? (cycle / duration) * 100 : 100 - ((cycle - duration) / duration) * 100);
  });

  const bgPos = useTransform(progress, (p) => `${p}% 50%`);

  return (
    <motion.span
      className={className}
      style={{
        backgroundImage: "linear-gradient(to right, #60A5FA, #A78BFA, #34D399, #60A5FA)",
        backgroundSize: "300% 100%",
        backgroundPosition: bgPos,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        display: "inline",
      }}
    >
      {children}
    </motion.span>
  );
}

export const HeroSection = () => {
  const { open } = useRegistrationModal();

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #06091A 0%, #0B1230 50%, #080E22 100%)",
      }}
    >
      {/* FloatingLines background */}
      <FloatingLines
        linesGradient={["#0F2A4A", "#1A3A6B", "#2563EB", "#1A3A6B"]}
        enabledWaves={["bottom"]}
        lineCount={[6]}
        lineDistance={[5]}
        animationSpeed={0.25}
        interactive={true}
        bendRadius={3.0}
        bendStrength={-0.2}
        mouseDamping={0.03}
        parallax={true}
        parallaxStrength={0.05}
        mixBlendMode="screen"
        bottomWavePosition={{ x: 1.0, y: -1.2, rotate: -0.5 }}
      />

      {/* Content — single centered column */}
      <div
        className="relative z-10 mx-auto pt-12 pb-14 md:pt-[72px] md:pb-[80px] px-6 md:px-10"
        style={{ maxWidth: 700, textAlign: "center" }}
      >
        {/* Badge */}
        <motion.div {...fade(0.05)}>
          <div className="mb-4">
            <span
              className="inline-block backdrop-blur-sm font-heading uppercase tracking-[0.12em] px-5 py-2 rounded-full"
              style={{
                background: "rgba(37,99,235,0.15)",
                border: "1px solid rgba(37,99,235,0.30)",
                color: "#93C5FD",
                fontSize: 11,
                fontWeight: 600,
                boxShadow: "0 0 12px rgba(59,130,246,0.35), 0 0 32px rgba(59,130,246,0.15), 0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              WEBINAR GRATUITO
            </span>
          </div>
        </motion.div>

        {/* H1 */}
        <motion.div {...fade(0.1)}>
          <h1 style={{ maxWidth: 700, margin: "0 auto" }}>
            <span
              className="block font-heading"
              style={{
                color: "#F8FAFC",
                fontWeight: 800,
                fontSize: "clamp(36px, 5.5vw, 52px)",
                lineHeight: 1.12,
                letterSpacing: "-0.025em",
                textShadow: "0 2px 40px rgba(0,0,0,0.5)",
              }}
            >
              Aprende a Criar Imagens<br />Profissionais com IA
            </span>
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.div {...fade(0.15)}>
          <p style={{ fontSize: 18, fontWeight: 400, marginTop: 16, marginBottom: 28, color: "#CBD5E1" }}>
            Em 60 minutos ao vivo:{" "}
            <GradientText className="font-heading font-semibold">
              do briefing à imagem pronta a publicar.
            </GradientText>
          </p>
        </motion.div>

        {/* 4 Spec badges — horizontal flex */}
        <motion.div {...fade(0.25)}>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
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
                  className="rounded-xl px-3 py-3 flex flex-col items-center gap-1"
                  style={{
                    background: "rgba(6, 9, 26, 0.75)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(37,99,235,0.20)",
                    minWidth: 130,
                  }}
                >
                  <Icon className="w-5 h-5 shrink-0" style={{ color: "#60A5FA" }} />
                  <div className="text-center">
                    <span className="block uppercase tracking-wide" style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)" }}>{item.label}</span>
                    <span className="block mt-0.5" style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC" }}>{item.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...fade(0.3)}>
          <div id="inscrever">
            <ElectricBorder
              color="#22C55E"
              speed={0.8}
              chaos={0.08}
              borderRadius={10}
              style={{ display: "inline-block", width: "100%", maxWidth: 400 }}
            >
              <button
                onClick={() => open("free")}
                style={{
                  background: "#16A34A",
                  color: "#fff",
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  padding: "16px 32px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Sim, quero garantir a minha vaga grátis
              </button>
            </ElectricBorder>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.30)", marginTop: 10 }}>
            Sem spam. Acesso imediato por email. Dados protegidos (RGPD).
          </p>
        </motion.div>

        {/* Google Reviews badge */}
        <motion.div {...fade(0.35)}>
          <div className="mt-4">
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
                  <span className="font-heading font-bold" style={{ fontSize: 14, color: "#F8FAFC" }}>5,0</span>
                  <span style={{ fontSize: 13, lineHeight: 1, color: "#FBBC05" }}>★★★★★</span>
                </div>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.50)" }}>1 194 avaliações no Google</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
