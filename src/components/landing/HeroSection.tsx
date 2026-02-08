import { motion } from "framer-motion";
import { CheckCircle, Calendar, Clock } from "lucide-react";
import { CTAButton } from "./CTAButton";

const particles = Array.from({ length: 25 }, (_, i) => ({
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
      {/* Subtle scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-px bg-primary/5 animate-scan-line" />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-primary/20"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [-15, 15, -15], opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Glow orbs */}
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-20 text-center max-w-4xl">
        {/* Kicker */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-destructive/40 bg-destructive/10 text-destructive text-sm font-semibold tracking-wider mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          WEBINAR GRATUITO • AO VIVO • 90 MINUTOS
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.15] mb-6"
        >
          Como usar <span className="text-gradient">Inteligência Artificial</span>
          <br className="hidden md:block" /> para fazer crescer a sua empresa
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          3 ferramentas práticas, demonstrações ao vivo e um método testado com mais de 700 empresas portuguesas — tudo em 90 minutos.
        </motion.p>

        {/* Date/Time */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
        >
          <div className="flex items-center gap-2 neon-border rounded-xl px-5 py-3 bg-muted/30 text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-medium">Quinta, 20 de Fevereiro de 2025</span>
          </div>
          <div className="flex items-center gap-2 neon-border rounded-xl px-5 py-3 bg-muted/30 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-medium">19h00 – 20h30 (Lisboa)</span>
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
          className="flex flex-wrap items-center justify-center gap-5 mt-8 text-sm text-muted-foreground"
        >
          {["Inscrição gratuita", "Kit de ferramentas incluído", "Sem compromisso"].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-primary/70" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
