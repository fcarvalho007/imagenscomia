import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";

const bonuses = [
  {
    title: "3 Aplicações Web Funcionais (exclusivas)",
    items: ["Analisador Concorrência Inteligente", "Gerador Prompts Executivos", "Calculadora ROI Automação"],
  },
  {
    title: "50 Templates Prompts Testados",
    items: ["Marketing, Vendas, Operações, Gestão"],
  },
  {
    title: 'Checklist "Ferramenta Certa para Cada Tarefa"',
    items: ["Matriz decisão visual"],
  },
  {
    title: "Gravação Completa Webinar",
    items: ["Acesso durante 1 ano"],
  },
];

export const BonusSection = () => (
  <section className="py-20">
    <div className="container mx-auto px-4 max-w-3xl">
      <ScrollReveal>
        <div className="glass-gold rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/20 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl"
              >
                🎁
              </motion.span>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">KIT IA EMPRESARIAL 2025</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-muted-foreground line-through">Valor: €147</span>
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">GRÁTIS</span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">Incluído no webinar gratuito:</p>

            <div className="space-y-6">
              {bonuses.map((bonus, i) => (
                <div key={i}>
                  <h3 className="font-semibold mb-2 flex items-start gap-2">
                    <span className="text-gold">→</span>
                    {bonus.title}
                  </h3>
                  <ul className="ml-6 space-y-1">
                    {bonus.items.map((item, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mt-8 pt-6 border-t border-gold/20">
              Acesso enviado automaticamente após inscrição.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
