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
    a: "Não. Este webinar foi desenhado para gestores e empresários, não para técnicos. Se sabes usar um browser, tens o suficiente.",
  },
  {
    q: "As ferramentas mostradas são pagas?",
    a: "Algumas têm versão gratuita, outras têm custo. Mostro opções para diferentes orçamentos e explico o que justifica cada investimento.",
  },
  {
    q: "Vou ter acesso à gravação?",
    a: "A gravação está disponível no Premium Pass (€15). A versão gratuita inclui o webinar ao vivo mas sem gravação posterior.",
  },
  {
    q: "O conteúdo aplica-se ao meu setor?",
    a: "Os 3 sistemas funcionam em qualquer empresa com mais de 2 pessoas. Mostro exemplos de marketing, serviços, imobiliário, comércio e indústria.",
  },
  {
    q: "Quanto tempo para implementar após o webinar?",
    a: "Os primeiros resultados surgem nas primeiras 48h. Os sistemas completos levam 1-2 semanas de implementação gradual.",
  },
  {
    q: "Haverá tentativa de venda durante o webinar?",
    a: "Sim — serei direto sobre isso. No final, apresento as opções de aprofundamento. Sem pressão. O conteúdo gratuito é completo por si mesmo.",
  },
];

export const FAQSection = () => (
  <section className="py-16 md:py-24 bg-primary-dark grid-pattern">
    <div className="container mx-auto px-5 sm:px-6 max-w-2xl">
      <ScrollReveal>
        <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-center mb-10 md:mb-14">
          Perguntas frequentes
        </h2>
      </ScrollReveal>

      <ScrollReveal>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="glass-card rounded-xl border-0 px-5 py-1 overflow-hidden"
            >
              <AccordionTrigger className="text-sm sm:text-base font-heading font-semibold text-foreground hover:no-underline text-left py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-text-secondary leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollReveal>
    </div>
  </section>
);
