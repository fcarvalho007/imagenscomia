import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "A formação do Frederico na nossa equipa mudou completamente como abordamos criação de conteúdo. Implementámos as automações mostradas e reduzimos 12 horas semanais em tarefas repetitivas. A equipa está mais focada em estratégia.",
    name: "Ana Silva",
    role: "Diretora Marketing",
    company: "Imobiliária Lisboa",
    sector: "Imobiliário • 45 colaboradores",
  },
  {
    quote: "O método de prompting executivo que aprendi permite-me fazer análises de concorrência em 30 minutos que antes demoravam meio dia. O ROI foi imediato.",
    name: "Pedro Costa",
    role: "Gestor Produto",
    company: "SaaS PT",
    sector: "Software B2B • 28 colaboradores",
  },
  {
    quote: "Finalmente clareza sobre que ferramentas usar e porquê. Deixámos de experimentar tudo e focámo-nos nas 3 certas. Eficiência da equipa aumentou 40% em 2 meses.",
    name: "João Santos",
    role: "CEO",
    company: "Consultoria Porto",
    sector: "Consultoria Gestão • 15 colaboradores",
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
            Resultados de Formações Anteriores
          </h2>
        </ScrollReveal>

        {/* Carousel */}
        <div className="relative min-h-[280px] mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-2xl p-8 md:p-10 shadow-sm border border-border relative"
            >
              <Quote className="absolute top-6 left-6 w-10 h-10 text-primary/5" />
              <p className="text-lg leading-relaxed mb-6 relative z-10 italic text-foreground/90">
                "{testimonials[current].quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center text-white font-bold text-lg">
                  {testimonials[current].name[0]}
                </div>
                <div>
                  <p className="font-semibold">{testimonials[current].name}, {testimonials[current].role}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[current].company} • {testimonials[current].sector}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === current ? "bg-primary w-8" : "bg-primary/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
