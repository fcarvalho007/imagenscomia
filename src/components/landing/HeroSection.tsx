import { motion } from "framer-motion";
import { CheckCircle, Calendar, Clock } from "lucide-react";
import { CTAButton } from "./CTAButton";

const particles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 1,
  duration: Math.random() * 5 + 5,
  delay: Math.random() * 3,
}));

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden gradient-hero grid-tron">
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-primary/15"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [-10, 10, -10], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Glow orbs */}
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/4 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-secondary/4 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-5 sm:px-6 py-16 md:py-20 text-center max-w-3xl">
        {/* Kicker */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-destructive/30 bg-destructive/8 text-destructive text-xs sm:text-sm font-semibold tracking-wider mb-6 md:mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          WEBINAR GRATUITO • AO VIVO • 90 MIN
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-[1.15] mb-5 md:mb-6 px-2"
        >
          Como usar <span className="text-gradient">Inteligência Artificial</span>
          <br className="hidden sm:block" /> para fazer crescer a sua empresa
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-2"
        >
          3 ferramentas práticas, demonstrações ao vivo e um método testado com mais de 700 empresas portuguesas — tudo em 90 minutos.
        </motion.p>

        {/* Date/Time */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-8 md:mb-10"
        >
          <div className="flex items-center gap-2 neon-border rounded-xl px-4 py-2.5 bg-muted/20 text-sm">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span className="font-medium">Quinta, 20 de Fevereiro</span>
          </div>
          <div className="flex items-center gap-2 neon-border rounded-xl px-4 py-2.5 bg-muted/20 text-sm">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span className="font-medium">19h00 – 20h30 (Lisboa)</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <CTAButton size="large" />
        </motion.div>

        {/* Trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 mt-6 md:mt-8 text-xs sm:text-sm text-muted-foreground"
        >
          {["Inscrição gratuita", "Kit de ferramentas incluído", "Sem compromisso"].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-primary/60" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
