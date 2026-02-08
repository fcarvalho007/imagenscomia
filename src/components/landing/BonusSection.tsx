import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";

export const BonusSection = () => (
  <section className="py-24">
    <div className="container mx-auto px-4 max-w-3xl">
      <ScrollReveal>
        <div className="text-center mb-10">
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl inline-block mb-4"
          >
            🎁
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            O que recebe ao <span className="text-gradient">inscrever-se</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Todos os participantes — ao vivo ou com acesso à gravação — recebem o Kit IA Empresarial 2025, um conjunto de ferramentas práticas prontas a usar.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="glass-gold rounded-2xl p-8 md:p-10 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold">Kit IA Empresarial 2025</h3>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground line-through text-sm">€147</span>
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">INCLUÍDO</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Incluído gratuitamente na sua inscrição</p>

            <div className="space-y-4">
              <div className="bg-background/40 rounded-xl p-5 border border-gold/10">
                <h4 className="font-semibold text-foreground mb-1">🖥️ 3 Aplicações Web Funcionais</h4>
                <p className="text-sm text-muted-foreground">
                  Ferramentas online exclusivas, desenvolvidas de propósito para este webinar: Analisador de Concorrência com IA, Gerador de Prompts para decisões executivas, e Calculadora de ROI para automações.
                </p>
              </div>

              <div className="bg-background/40 rounded-xl p-5 border border-gold/10">
                <h4 className="font-semibold text-foreground mb-1">📋 50 Templates de Prompts Testados</h4>
                <p className="text-sm text-muted-foreground">
                  Prompts prontos a copiar e usar em Marketing, Vendas, Operações e Gestão. Validados com empresas reais portuguesas.
                </p>
              </div>

              <div className="bg-background/40 rounded-xl p-5 border border-gold/10">
                <h4 className="font-semibold text-foreground mb-1">✅ Checklist Visual de Decisão</h4>
                <p className="text-sm text-muted-foreground">
                  Matriz que mostra qual ferramenta de IA usar para cada tipo de tarefa na sua empresa, sem adivinhas.
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-gold/15">
              Acesso enviado automaticamente por email após inscrição.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
