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
    a: "Não. O webinar foi desenhado para empresários e profissionais de negócio. Se consegue usar email e navegador, consegue implementar o que será mostrado.",
  },
  {
    q: "É necessário pagar ferramentas IA para participar?",
    a: "Não. Várias demonstrações usam versões gratuitas. Será mostrado o que funciona grátis e quando compensa investir em versões pagas.",
  },
  {
    q: "E se não puder assistir ao vivo?",
    a: "A gravação completa estará disponível por €15 para quem não conseguir assistir ao vivo. Quem participar ao vivo recebe tudo gratuitamente.",
  },
  {
    q: "Haverá tentativa de venda?",
    a: "Transparência total: no final será apresentada informação sobre workshops opcionais (€37-47). 85% do webinar é conteúdo educativo puro. Zero pressão.",
  },
  {
    q: "O conteúdo aplica-se ao meu setor?",
    a: "Sim. As ferramentas e métodos são transversais: serviços, retalho, consultoria, indústria, B2B e B2C. Os exemplos cobrem vários setores.",
  },
  {
    q: "Quanto tempo preciso para implementar depois?",
    a: "30 minutos a 2 horas por automação/método. O objetivo é sair com pelo menos 1 ferramenta aplicável no dia seguinte.",
  },
  {
    q: "O Kit IA fica acessível para sempre?",
    a: "Sim. As 3 aplicações web, templates e checklist ficam acessíveis permanentemente. A gravação tem acesso de 1 ano.",
  },
];

export const FAQSection = () => (
  <section className="py-20 bg-muted/30 grid-tron">
    <div className="container mx-auto px-4 max-w-3xl">
      <ScrollReveal>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Questões <span className="text-gradient">Frequentes</span>
        </h2>
      </ScrollReveal>

      <ScrollReveal>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-card rounded-xl border border-border px-6 overflow-hidden data-[state=open]:neon-border"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-5 text-foreground">
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
