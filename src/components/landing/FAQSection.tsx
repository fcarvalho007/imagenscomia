import { ScrollReveal } from "./ScrollReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Preciso de conhecimentos técnicos para acompanhar?",
    a: "Não. O webinar foi desenhado para empresários e profissionais de negócio, não para técnicos. Se consegue usar email e navegador, consegue acompanhar e implementar o que será mostrado.",
  },
  {
    q: "É necessário pagar ferramentas IA para participar?",
    a: "Não é necessário. Várias demonstrações usam versões gratuitas de ferramentas. Será mostrado o que funciona grátis e quando compensa investir em versões pagas (com análise ROI).",
  },
  {
    q: "E se não for possível assistir ao vivo?",
    a: "A gravação completa será enviada a todos os inscritos com acesso durante 1 ano. No entanto, recomenda-se presença ao vivo para aproveitar Q&A e interação directa.",
  },
  {
    q: "Haverá tentativa de venda de outros produtos?",
    a: "Sim, total transparência: no final será apresentada informação sobre workshops de aprofundamento (€37-47, opcionais). Mas 85% do webinar é conteúdo puro educativo. Zero pressão comercial.",
  },
  {
    q: "O conteúdo aplica-se ao meu setor específico?",
    a: "As ferramentas e métodos mostrados são transversais: funcionam para serviços, retalho, consultoria, indústria, B2B e B2C. Os exemplos cobrem vários setores incluindo imobiliário, consultoria, software e serviços.",
  },
  {
    q: "Quanto tempo de implementação será necessário depois?",
    a: "As demonstrações são práticas e replicáveis. Tempo estimado para implementar cada automação/método mostrado: 30 minutos a 2 horas. O objetivo é sair com pelo menos 1 ferramenta aplicável no dia seguinte.",
  },
  {
    q: "O Kit IA Empresarial 2025 fica acessível permanentemente?",
    a: "Sim. As 3 aplicações web, templates e checklist ficam acessíveis de forma permanente. A gravação do webinar tem acesso de 1 ano.",
  },
];

export const FAQSection = () => (
  <section className="py-20 bg-muted/50">
    <div className="container mx-auto px-4 max-w-3xl">
      <ScrollReveal>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Questões Frequentes</h2>
      </ScrollReveal>

      <ScrollReveal>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-card rounded-xl border border-border px-6 overflow-hidden"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollReveal>
    </div>
  </section>
);
