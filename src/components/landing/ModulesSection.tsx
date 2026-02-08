import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { Sparkles } from "lucide-react";
import { CTAButton } from "./CTAButton";

const modules = [
  {
    number: 1,
    title: "As Ferramentas Certas",
    teaser: "Quais são as 3 ferramentas de IA que realmente interessam — e porquê as outras são perda de tempo.",
    highlight: "Matriz de decisão exclusiva",
  },
  {
    number: 2,
    title: "Resultados em Minutos",
    teaser: "Um método que transforma horas de trabalho em minutos. Vai ver ao vivo, com caso real português.",
    highlight: "Demo ao vivo + templates",
    badge: "AO VIVO",
  },
  {
    number: 3,
    title: "Automatizar Sem Código",
    teaser: "Como poupar 10-15h por semana com automações simples — sem programador. Construção ao vivo.",
    highlight: "Automação construída em 15 min",
    badge: "AO VIVO",
  },
];

export const ModulesSection = () => (
  <section className="py-16 md:py-24 section-light">
    <div className="container mx-auto px-5 sm:px-6">
      <ScrollReveal>
        <p className="text-center text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest mb-2">Programa</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 text-navy">
          O que vai descobrir em 90 minutos
        </h2>
        <p className="text-center text-navy-light mb-10 md:mb-12 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
          3 módulos práticos — sai com ferramentas prontas a usar no dia seguinte
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-4xl mx-auto mb-10 md:mb-12">
        {modules.map((mod, i) => (
          <ScrollReveal key={mod.number} delay={i * 0.1}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-2xl p-6 sm:p-7 card-light transition-all h-full flex flex-col relative overflow-hidden"
            >
              {mod.badge && (
                <span className="absolute top-4 right-4 text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                  {mod.badge}
                </span>
              )}

              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Módulo {mod.number}</div>
              <h3 className="text-base sm:text-lg font-bold mb-2 text-navy">{mod.title}</h3>

              <p className="text-navy-light text-sm leading-relaxed mb-4 flex-1">
                {mod.teaser}
              </p>

              <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 rounded-lg p-2.5 border border-primary/10">
                <Sparkles className="w-3 h-3 shrink-0" />
                {mod.highlight}
              </div>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal>
        <div className="text-center">
          <CTAButton />
        </div>
      </ScrollReveal>
    </div>
  </section>
);
