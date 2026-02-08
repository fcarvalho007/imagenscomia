import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { Lock } from "lucide-react";
import { CTAButton } from "./CTAButton";

const modules = [
  {
    emoji: "🎯",
    number: 1,
    title: "Panorama Ferramentas IA 2025",
    teaser: "Descubra as únicas 3 ferramentas que realmente importam para a sua empresa — e as 12 que pode ignorar completamente.",
    highlight: "Inclui: Matriz de decisão exclusiva",
  },
  {
    emoji: "📝",
    number: 2,
    title: "Prompting Executivo",
    teaser: "O método que transforma 8 horas de análise manual em 20 minutos de resultados confiáveis. Demonstração ao vivo com empresa real.",
    highlight: "Demo ao vivo + 10 templates",
    badge: "DEMO AO VIVO",
  },
  {
    emoji: "⚙️",
    number: 3,
    title: "Automações Sem Código",
    teaser: "Como montar automações que poupam 10-15 horas/semana — sem programador, sem equipa IT, do zero em 15 minutos.",
    highlight: "Construção ao vivo de automação completa",
    badge: "DEMO AO VIVO",
  },
];

export const ModulesSection = () => (
  <section className="py-20 bg-muted/30 grid-tron">
    <div className="container mx-auto px-4">
      <ScrollReveal>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
          <span className="text-gradient">3 Módulos</span> • 90 Minutos • Ao Vivo
        </h2>
        <p className="text-center text-muted-foreground mb-12">O que vai ser revelado no webinar</p>
      </ScrollReveal>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        {modules.map((mod, i) => (
          <ScrollReveal key={mod.number} delay={i * 0.15}>
            <motion.div
              whileHover={{ y: -8, boxShadow: "0 0 30px hsl(190 100% 50% / 0.2)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-card rounded-2xl p-8 neon-border hover:border-primary/50 transition-all h-full flex flex-col relative overflow-hidden"
            >
              {mod.badge && (
                <div className="absolute top-4 right-4 text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">
                  {mod.badge}
                </div>
              )}

              <div className="text-4xl mb-4">{mod.emoji}</div>
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Módulo {mod.number}</div>
              <h3 className="text-xl font-bold mb-4 text-foreground">{mod.title}</h3>

              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                {mod.teaser}
              </p>

              <div className="flex items-center gap-2 text-xs text-primary/80 bg-primary/5 rounded-lg p-3 border border-primary/10">
                <Lock className="w-3 h-3" />
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
