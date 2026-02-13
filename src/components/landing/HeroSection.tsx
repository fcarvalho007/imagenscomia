import { useState, useRef } from "react";
import { Calendar, Clock, Timer, GraduationCap } from "lucide-react";
import { motion, useMotionValue, useAnimationFrame, useTransform } from "framer-motion";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";
import CardSwap, { Card } from "./CardSwap";
import ElectricBorder from "./ElectricBorder";

import imgPorto from "@/assets/galeria/6_frederico_carvalho_porto_ribeirinha.jpeg";
import imgBolsa from "@/assets/galeria/8_frederico_carvalho_bolsa_mulher.png";
import imgSapatos from "@/assets/galeria/7_frederico_carvalho_sapatos.jpeg";
import imgCappucino from "@/assets/galeria/5_frederico_carvalho_cappucino_background.jpeg";

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

      {/* Two-column grid */}
      <div
        className="relative z-10 mx-auto"
        style={{
          maxWidth: 1100,
          display: "grid",
          gridTemplateColumns: "1fr",
          alignItems: "center",
          padding: "60px 24px",
        }}
      >
        {/* Desktop: two columns */}
        <style>{`
          @media (min-width: 1024px) {
            .hero-grid { grid-template-columns: 1fr 1fr !important; padding: 80px 40px !important; }
          }
          @media (max-width: 767px) {
            .hero-cardswap-col { display: none !important; }
          }
        `}</style>
        <div
          className="hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            alignItems: "center",
            gap: 40,
          }}
        >
          {/* LEFT COLUMN — Content */}
          <div style={{ textAlign: "left" }}>
            {/* Badge */}
            <motion.div {...fade(0.05)}>
              <div className="mb-5">
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
              <h1 className="mb-3">
                <span
                  className="block font-heading leading-[1.15] tracking-[-0.02em]"
                  style={{
                    color: "#F8FAFC",
                    fontWeight: 800,
                    fontSize: "clamp(32px, 4vw, 44px)",
                    textShadow: "0 2px 40px rgba(0,0,0,0.5)",
                  }}
                >
                  Aprende a Criar Imagens Profissionais com IA
                </span>
              </h1>
            </motion.div>

            {/* Subheadline with GradientText */}
            <motion.div {...fade(0.15)}>
              <p style={{ fontSize: 18, fontWeight: 400, marginTop: 12, marginBottom: 28, color: "#CBD5E1" }}>
                Em 60 minutos ao vivo:{" "}
                <GradientText className="font-heading font-semibold">
                  do briefing à imagem pronta a publicar.
                </GradientText>
              </p>
            </motion.div>

            {/* 4 Spec badges */}
            <motion.div {...fade(0.25)}>
              <div className="grid grid-cols-2 gap-2 max-w-[480px] mb-8">
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
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
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

            {/* CTA with ElectricBorder */}
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
                    Sim, quero garantir a minha vaga grátis →
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

          {/* RIGHT COLUMN — CardSwap (hidden on mobile) */}
          <div
            className="hero-cardswap-col"
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: 440,
            }}
          >
            <style>{`
              @media (max-width: 1023px) {
                .hero-cardswap-col { height: 320px !important; }
              }
            `}</style>
            <CardSwap
              width={280}
              height={340}
              cardDistance={50}
              verticalDistance={60}
              delay={3500}
              pauseOnHover={true}
              skewAmount={4}
              easing="elastic"
            >
              <Card style={{ overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)" }}>
                <img src={imgPorto} alt="Imagem IA — porto vista rio" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Card>
              <Card style={{ overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)" }}>
                <img src={imgBolsa} alt="Imagem IA — carteira linho" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Card>
              <Card style={{ overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)" }}>
                <img src={imgSapatos} alt="Imagem IA — sapatos couro" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Card>
              <Card style={{ overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)" }}>
                <img src={imgCappucino} alt="Imagem IA — café latte" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Card>
            </CardSwap>
            <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.35)", marginTop: 16, textAlign: "center", position: "absolute", bottom: 0, left: 0, right: 0 }}>
              Criadas com IA — sem designer
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
