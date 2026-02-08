import { ScrollReveal } from "./ScrollReveal";
import { Check, X } from "lucide-react";

const forWhom = [
  "Empresários e gestores de PMEs (10-200 colaboradores)",
  "Diretores e profissionais de Marketing que precisam aumentar produção de conteúdo sem aumentar equipa",
  "Responsáveis Comerciais que querem automatizar follow-up de leads mantendo personalização",
  "Gestores de Produto/Operações que procuram eficiência através de automação inteligente",
  "Quem já usa ChatGPT ocasionalmente mas sente que não aproveita o potencial da ferramenta",
];

const notFor = [
  "Developers ou técnicos que procuram IA técnica avançada (conteúdo é prático, aplicável, não sobre programação)",
  "Quem procura soluções mágicas sem implementação (IA acelera processos, não substitui estratégia)",
  "Grandes empresas com +500 colaboradores (exemplos focados em realidade de PMEs portuguesas)",
];

export const AudienceSection = () => (
  <section className="py-20 bg-muted/50">
    <div className="container mx-auto px-4 max-w-3xl">
      <ScrollReveal>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Este webinar é adequado para:
        </h2>
      </ScrollReveal>

      <div className="space-y-3 mb-12">
        {forWhom.map((item, i) => (
          <ScrollReveal key={i} delay={i * 0.08}>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
              <Check className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <p>{item}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal>
        <h3 className="text-xl font-bold text-center mb-6 text-muted-foreground">Não é para:</h3>
      </ScrollReveal>

      <div className="space-y-3">
        {notFor.map((item, i) => (
          <ScrollReveal key={i} delay={i * 0.08}>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
              <X className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <p className="text-muted-foreground">{item}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
