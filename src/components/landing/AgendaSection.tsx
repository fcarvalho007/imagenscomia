import { ScrollReveal } from "./ScrollReveal";

const agenda = [
  {
    time: "19h00 - 19h20",
    duration: "20min",
    title: "MÓDULO 1: Panorama Ferramentas IA 2025",
    items: [
      "Estado IA em Portugal: o que funciona vs hype",
      "As 3 ferramentas core (e as 12 que pode ignorar)",
      "Matriz decisão: qual ferramenta para que tarefa",
      "Investimento real vs retorno esperado",
    ],
  },
  {
    time: "19h20 - 19h45",
    duration: "25min",
    title: "MÓDULO 2: Prompting Executivo (Demo ao Vivo)",
    items: [
      'Método "Triple-Check" para resultados confiáveis',
      "DEMO: Análise concorrência empresarial real",
      "Templates prompts: análise, relatórios, briefings",
      "Como validar outputs IA antes de usar",
    ],
  },
  {
    time: "19h45 - 20h10",
    duration: "25min",
    title: "MÓDULO 3: Automações Marketing (Demo ao Vivo)",
    items: [
      "3 automações alto impacto (sem código)",
      "DEMO: Lead → qualificação → email → CRM",
      "Ferramentas automação (quando usar cada)",
      "ROI: calcular retorno vs investimento",
    ],
  },
  {
    time: "20h10 - 20h30",
    duration: "20min",
    title: "Q&A + Próximos Passos",
    items: [
      "Perguntas participantes ao vivo",
      "Recursos implementação",
      "Acesso Kit IA Empresarial 2025",
      "Informação workshops aprofundamento (opcional)",
    ],
  },
];

export const AgendaSection = () => (
  <section className="py-20 bg-muted/50">
    <div className="container mx-auto px-4 max-w-3xl">
      <ScrollReveal>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Agenda Webinar (90 minutos)
        </h2>
      </ScrollReveal>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-primary/20" />

        <div className="space-y-8">
          {agenda.map((block, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="relative pl-12 md:pl-20">
                {/* Dot */}
                <div className="absolute left-2.5 md:left-6.5 top-2 w-3 h-3 rounded-full bg-primary border-2 border-background" />

                <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="font-bold text-primary">{block.time}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{block.duration}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-3">{block.title}</h3>
                  <ul className="space-y-1.5">
                    {block.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);
