import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { Sparkles } from "lucide-react";
import { CTAButton } from "./CTAButton";

const modules = [
  {
    emoji: "🎯",
    number: 1,
    title: "As Ferramentas Certas",
    teaser: "Quais são as 3 ferramentas de IA que realmente interessam à sua empresa — e porquê as outras 12 são uma perda de tempo e dinheiro.",
    highlight: "Inclui: Matriz de decisão exclusiva",
  },
  {
    emoji: "📝",
    number: 2,
    title: "Resultados em Minutos",
    teaser: "Um método prático que transforma horas de trabalho manual em minutos. Vai ver acontecer ao vivo, com um caso real de uma empresa portuguesa.",
    highlight: "Demonstração ao vivo + templates",
    badge: "DEMO AO VIVO",
  },
  {
    emoji: "⚙️",
    number: 3,
    title: "Automatizar Sem Código",
    teaser: "Como poupar 10 a 15 horas por semana com automações simples — sem precisar de programador ou equipa técnica. Construção ao vivo em 15 minutos.",
    highlight: "Construção ao vivo de automação",
    badge: "DEMO AO VIVO",
  },
];

export const ModulesSection = () => (
  <section className="py-24 section-light grid-tron-light">
    <div className="container mx-auto px-4">
      <ScrollReveal>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-navy">
          O que vai <span className="text-gradient">descobrir</span>
        </h2>
        <p className="text-center text-navy-light mb-12 max-w-xl mx-auto leading-relaxed">
          3 módulos práticos com demonstrações ao vivo — sai do webinar com ferramentas prontas a aplicar
        </p>
      </ScrollReveal>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
        {modules.map((mod, i) => (
          <ScrollReveal key={mod.number} delay={i * 0.12}>
            <motion.div
              whileHover={{ y: -6, boxShadow: "0 4px 20px hsl(320 80% 60% / 0.1), 0 8px 30px hsl(230 25% 10% / 0.08)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white rounded-2xl p-7 card-light transition-all h-full flex flex-col relative overflow-hidden"
            >
              {mod.badge && (
                <div className="absolute top-4 right-4 text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                  {mod.badge}
                </div>
              )}

              <div className="text-3xl mb-3">{mod.emoji}</div>
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Módulo {mod.number}</div>
              <h3 className="text-lg font-bold mb-3 text-navy">{mod.title}</h3>

              <p className="text-navy-light text-sm leading-relaxed mb-5 flex-1">
                {mod.teaser}
              </p>

              <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 rounded-lg p-3 border border-primary/10">
                <Sparkles className="w-3 h-3" />
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
