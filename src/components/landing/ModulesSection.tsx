import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { Target, FileText, Settings } from "lucide-react";

const modules = [
  {
    icon: Target,
    emoji: "🎯",
    number: 1,
    title: "Panorama Ferramentas IA 2025",
    topics: [
      "As 3 ferramentas essenciais (ChatGPT, Claude, ferramentas específicas)",
      "Quais usar para cada tipo de tarefa (conteúdo, análise, automação)",
      "Erros comuns de empresas portuguesas ao implementar IA",
      "Custo real vs ROI: quando compensa investir",
    ],
    result: 'Matriz decisão "Que ferramenta para que tarefa"',
  },
  {
    icon: FileText,
    emoji: "📝",
    number: 2,
    title: "Prompting Executivo (Demonstração ao Vivo)",
    topics: [
      'Método "Triple-Check" para prompts empresariais confiáveis',
      "Como transformar dados brutos em análises executivas",
      "Template de prompts para: análise concorrência, relatórios, briefings, pesquisa mercado",
    ],
    demo: "Análise de concorrente que levaria 8 horas manual → 20 minutos com método estruturado",
    result: "10 templates de prompts prontos a usar",
  },
  {
    icon: Settings,
    emoji: "⚙️",
    number: 3,
    title: "Automações Marketing Sem Código",
    topics: [
      "3 automações que poupam 10-15 horas/semana",
      "Como funciona automação sem programador nem IT",
      "Lead novo → qualificação automática → email → CRM (workflow completo)",
      "ROI real: investimento vs tempo poupado",
    ],
    demo: "Construção de automação do zero em 15 minutos",
    result: "Template automação pronto a replicar",
  },
];

export const ModulesSection = () => (
  <section className="py-20 bg-muted/50">
    <div className="container mx-auto px-4">
      <ScrollReveal>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
          3 Módulos Práticos • 90 Minutos • Demonstrações ao Vivo
        </h2>
        <p className="text-center text-muted-foreground mb-12">Conteúdo aplicável desde o primeiro dia</p>
      </ScrollReveal>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {modules.map((mod, i) => (
          <ScrollReveal key={mod.number} delay={i * 0.15}>
            <motion.div
              whileHover={{ y: -8, rotateX: 3 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:shadow-[0_20px_40px_rgba(79,70,229,0.15)] transition-shadow h-full flex flex-col"
            >
              <div className="text-4xl mb-4">{mod.emoji}</div>
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Módulo {mod.number}</div>
              <h3 className="text-xl font-bold mb-4">{mod.title}</h3>

              <ul className="space-y-2 mb-6 flex-1">
                {mod.topics.map((topic, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">→</span>
                    {topic}
                  </li>
                ))}
              </ul>

              {mod.demo && (
                <div className="bg-primary/5 rounded-xl p-3 mb-4 text-sm">
                  <span className="font-semibold text-primary">Demo ao vivo:</span>{" "}
                  <span className="text-muted-foreground">{mod.demo}</span>
                </div>
              )}

              <div className="bg-muted rounded-xl p-3 text-sm">
                <span className="font-semibold">Resultado prático:</span>{" "}
                <span className="text-muted-foreground">{mod.result}</span>
              </div>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
