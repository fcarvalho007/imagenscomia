import { motion } from "framer-motion";
import { CheckCircle, Calendar, Clock } from "lucide-react";

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 4 + 4,
  delay: Math.random() * 2,
}));

export const HeroSection = () => {
  const scrollToForm = () => {
    document.getElementById("cta-final")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white/10"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [-20, 20, -20], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
        {/* Connection lines SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <line x1="10%" y1="20%" x2="30%" y2="40%" stroke="white" strokeWidth="1" />
          <line x1="70%" y1="10%" x2="50%" y2="50%" stroke="white" strokeWidth="1" />
          <line x1="80%" y1="60%" x2="60%" y2="80%" stroke="white" strokeWidth="1" />
          <line x1="20%" y1="70%" x2="40%" y2="90%" stroke="white" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 text-center text-primary-foreground">
        {/* Kicker */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/90 text-destructive-foreground text-sm font-semibold tracking-wider mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
          WEBINAR GRATUITO • AO VIVO • 90 MINUTOS
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl mx-auto mb-6"
        >
          Inteligência Artificial para Empresas:
          <br />
          <span className="text-white/90">As 3 Ferramentas que Geram Resultados Reais</span>
          <br />
          <span className="text-lg md:text-2xl font-normal text-white/70">(Mesmo Sem Equipa Técnica)</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Webinar revela como empresas portuguesas estão a reduzir custos, acelerar produção e automatizar marketing com Inteligência Artificial — demonstrações práticas, ferramentas específicas, casos reais.
        </motion.p>

        {/* Date/Time */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3">
            <Calendar className="w-5 h-5" />
            <span className="font-semibold">Quinta-feira, 20 de Fevereiro de 2025</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">19h00 – 20h30 (Hora de Lisboa)</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          whileHover={{ y: -3, boxShadow: "0 20px 40px rgba(79, 70, 229, 0.4)" }}
          whileTap={{ scale: 0.97 }}
          onClick={scrollToForm}
          className="gradient-cta text-white font-bold text-lg px-12 py-5 rounded-xl shadow-2xl animate-pulse-glow transition-all"
        >
          RESERVAR LUGAR GRATUITO
        </motion.button>

        {/* Trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-white/70"
        >
          {["100% gratuito", "Gravação incluída", "Sem compromisso"].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-400" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
