import { ScrollReveal } from "./ScrollReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Preciso de conhecimentos técnicos?",
    a: "Não. O webinar é para profissionais de negócio. Se usa email e navegador, consegue implementar tudo o que será mostrado.",
  },
  {
    q: "Preciso de pagar ferramentas IA?",
    a: "Não. Várias demonstrações usam versões gratuitas. Será mostrado o que funciona grátis e quando compensa investir.",
  },
  {
    q: "E se não puder assistir ao vivo?",
    a: "Pode adquirir a gravação por €15 após o webinar. Quem assistir ao vivo recebe tudo gratuitamente.",
  },
  {
    q: "Haverá tentativa de venda?",
    a: "Transparência total: no final há informação sobre workshops opcionais (€37-47). 85% do webinar é conteúdo educativo. Zero pressão.",
  },
  {
    q: "O conteúdo aplica-se ao meu setor?",
    a: "Sim. As ferramentas são transversais: serviços, retalho, consultoria, indústria, B2B e B2C.",
  },
  {
    q: "Quanto tempo para implementar?",
    a: "30 minutos a 2 horas por automação. O objetivo é sair com pelo menos 1 ferramenta aplicável no dia seguinte.",
  },
];

export const FAQSection = () => (
  <section className="py-16 md:py-20 section-light">
    <div className="container mx-auto px-5 sm:px-6 max-w-2xl">
      <ScrollReveal>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-10 text-navy">
          Perguntas <span className="text-gradient">frequentes</span>
        </h2>
      </ScrollReveal>

      <ScrollReveal>
        <Accordion type="single" collapsible className="space-y-2.5">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-white rounded-xl border border-light-border px-5 sm:px-6 overflow-hidden data-[state=open]:border-primary/15 data-[state=open]:shadow-sm transition-all"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-4 sm:py-5 text-navy text-sm sm:text-base">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-navy-light leading-relaxed pb-4 sm:pb-5 text-sm">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollReveal>
    </div>
  </section>
);
