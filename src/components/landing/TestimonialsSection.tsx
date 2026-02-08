import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Implementámos as automações e reduzimos 12 horas semanais em tarefas repetitivas. A equipa está mais focada em estratégia.",
    name: "Ana Silva",
    role: "Diretora Marketing",
    sector: "Imobiliário • 45 colaboradores",
  },
  {
    quote: "O método de prompting permite-me fazer análises de concorrência em 30 minutos que antes demoravam meio dia.",
    name: "Pedro Costa",
    role: "Gestor Produto",
    sector: "Software B2B • 28 colaboradores",
  },
  {
    quote: "Focámo-nos nas 3 ferramentas certas. Eficiência aumentou 40% em 2 meses.",
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
    <section className="py-16 md:py-20 section-light-alt">
      <div className="container mx-auto px-5 sm:px-6 max-w-3xl">
        <ScrollReveal>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-10 text-navy">
            Resultados <span className="text-gradient">reais</span>
          </h2>
        </ScrollReveal>

        <div className="relative min-h-[200px] sm:min-h-[220px] mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="bg-white rounded-2xl p-6 sm:p-8 md:p-10 card-light relative"
            >
              <Quote className="absolute top-5 left-5 w-8 h-8 text-primary/8" />
              <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-5 relative z-10 italic text-navy/80">
                "{testimonials[current].quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-cta flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {testimonials[current].name[0]}
                </div>
                <div>
                  <p className="font-semibold text-navy text-sm">{testimonials[current].name}, {testimonials[current].role}</p>
                  <p className="text-xs text-navy-light">{testimonials[current].sector}</p>
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
              className={`h-2 rounded-full transition-all ${
                i === current ? "bg-primary w-6" : "bg-primary/15 w-2"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
