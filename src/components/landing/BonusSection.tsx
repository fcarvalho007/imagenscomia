import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";

const items = [
  {
    icon: "🖥️",
    title: "3 Aplicações Web Exclusivas",
    desc: "Analisador de Concorrência, Gerador de Prompts e Calculadora de ROI — prontas a usar.",
  },
  {
    icon: "📋",
    title: "50 Templates de Prompts",
    desc: "Para Marketing, Vendas, Operações e Gestão. Validados com empresas portuguesas.",
  },
  {
    icon: "✅",
    title: "Checklist de Decisão",
    desc: "Matriz visual: qual ferramenta usar para cada tipo de tarefa na sua empresa.",
  },
];

export const BonusSection = () => (
  <section className="py-16 md:py-20 section-dark grid-tron">
    <div className="container mx-auto px-5 sm:px-6 max-w-3xl">
      <ScrollReveal>
        <div className="text-center mb-8 md:mb-10">
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-4xl inline-block mb-3"
          >
            🎁
          </motion.span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            Kit IA Empresarial <span className="text-gradient">2025</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Incluído gratuitamente para todos os participantes — ao vivo ou com acesso à gravação.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="glass-gold rounded-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/8 rounded-full blur-3xl" />

          <div className="relative space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-muted-foreground line-through text-sm">€147</span>
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-0.5 rounded">GRÁTIS</span>
            </div>

            {items.map((item) => (
              <div key={item.title} className="bg-background/30 rounded-xl p-4 sm:p-5 border border-gold/10">
                <h4 className="font-semibold text-foreground text-sm sm:text-base mb-1">
                  {item.icon} {item.title}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}

            <p className="text-xs text-muted-foreground pt-3 border-t border-gold/10">
              Acesso enviado por email após inscrição.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
