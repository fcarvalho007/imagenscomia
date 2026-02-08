import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Implementámos as automações mostradas e reduzimos 12 horas semanais em tarefas repetitivas. A equipa está mais focada em estratégia.",
    name: "Ana Silva",
    role: "Diretora Marketing",
    sector: "Imobiliário • 45 colaboradores",
  },
  {
    quote: "O método de prompting permite-me fazer análises de concorrência em 30 minutos que antes demoravam meio dia. ROI imediato.",
    name: "Pedro Costa",
    role: "Gestor Produto",
    sector: "Software B2B • 28 colaboradores",
  },
  {
    quote: "Deixámos de experimentar tudo e focámo-nos nas 3 ferramentas certas. Eficiência aumentou 40% em 2 meses.",
    name: "João Santos",
    role: "CEO",
    sector: "Consultoria • 15 colaboradores",
  },
];

export const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % testimonials.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Resultados <span className="text-gradient">Reais</span>
          </h2>
        </ScrollReveal>

        <div className="relative min-h-[220px] mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-2xl p-8 md:p-10 neon-border relative"
            >
              <Quote className="absolute top-6 left-6 w-10 h-10 text-primary/10" />
              <p className="text-lg leading-relaxed mb-6 relative z-10 italic text-foreground/80">
                "{testimonials[current].quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full gradient-cta flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {testimonials[current].name[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonials[current].name}, {testimonials[current].role}</p>
                  <p className="text-sm text-muted-foreground">{testimonials[current].sector}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === current ? "bg-primary w-8 neon-glow" : "bg-primary/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
