import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";

const bonuses = [
  { title: "3 Aplicações Web Exclusivas", desc: "Analisador Concorrência, Gerador Prompts, Calculadora ROI" },
  { title: "50 Templates Prompts Testados", desc: "Marketing, Vendas, Operações, Gestão" },
  { title: "Checklist Decisão Visual", desc: "Ferramenta certa para cada tarefa" },
  { title: "Gravação Completa", desc: "Acesso durante 1 ano" },
];

export const BonusSection = () => (
  <section className="py-20">
    <div className="container mx-auto px-4 max-w-3xl">
      <ScrollReveal>
        <div className="glass-gold rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />

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
                  <span className="text-muted-foreground line-through text-sm">Valor: €147</span>
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">GRÁTIS</span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {bonuses.map((bonus, i) => (
                <div key={i} className="bg-background/30 rounded-xl p-4 border border-gold/10">
                  <h3 className="font-semibold text-sm text-foreground mb-1">{bonus.title}</h3>
                  <p className="text-xs text-muted-foreground">{bonus.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-gold/15">
              Acesso enviado automaticamente após inscrição.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
