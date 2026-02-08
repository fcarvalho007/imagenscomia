import { motion } from "framer-motion";
import { CheckCircle, Calendar, Clock } from "lucide-react";
import { CTAButton } from "./CTAButton";

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 4 + 4,
  delay: Math.random() * 2,
}));

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero grid-tron">
      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-px bg-primary/10 animate-scan-line" />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-primary/30"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [-20, 20, -20], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
        {/* Tron grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <line x1="20%" y1="0" x2="20%" y2="100%" stroke="hsl(190 100% 50%)" strokeWidth="0.5" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="hsl(190 100% 50%)" strokeWidth="0.5" />
          <line x1="80%" y1="0" x2="80%" y2="100%" stroke="hsl(190 100% 50%)" strokeWidth="0.5" />
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="hsl(190 100% 50%)" strokeWidth="0.5" />
          <line x1="0" y1="70%" x2="100%" y2="70%" stroke="hsl(190 100% 50%)" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        {/* Kicker */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-destructive/50 bg-destructive/10 text-destructive text-sm font-semibold tracking-wider mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          WEBINAR GRATUITO • AO VIVO • 90 MINUTOS
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl mx-auto mb-6"
        >
          <span className="text-gradient">Inteligência Artificial</span> para Empresas:
          <br />
          <span className="text-foreground/90">As 3 Ferramentas que Geram Resultados Reais</span>
          <br />
          <span className="text-lg md:text-2xl font-normal text-muted-foreground">(Mesmo Sem Equipa Técnica)</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Descubra como empresas portuguesas estão a transformar os seus resultados com IA — demonstrações práticas ao vivo que pode replicar no dia seguinte.
        </motion.p>

        {/* Date/Time */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <div className="flex items-center gap-2 neon-border rounded-xl px-6 py-3 bg-muted/30">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-semibold">Quinta-feira, 20 de Fevereiro de 2025</span>
          </div>
          <div className="flex items-center gap-2 neon-border rounded-xl px-6 py-3 bg-muted/30">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-semibold">19h00 – 20h30 (Hora de Lisboa)</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <CTAButton size="large" />
        </motion.div>

        {/* Trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground"
        >
          {["100% gratuito ao vivo", "Kit IA incluído", "Sem compromisso"].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-primary" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
