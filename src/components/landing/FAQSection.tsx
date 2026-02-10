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
    a: "Não. Este webinar é para gestores e empresários, não para técnicos. Se sabes usar um browser, tens o suficiente.",
  },
  {
    q: "As ferramentas mostradas são pagas?",
    a: "Algumas têm versão gratuita, outras têm custo. Mostro opções para diferentes orçamentos e explico o que justifica cada investimento.",
  },
  {
    q: "Vou ter acesso à gravação?",
    a: "A gravação está disponível no Premium Pass (€15). A versão gratuita inclui o webinar ao vivo mas sem acesso à gravação depois.",
  },
  {
    q: "O conteúdo aplica-se ao meu setor?",
    a: "Sim. Os sistemas mostrados funcionam em qualquer empresa. Mostro exemplos de marketing, e-commerce, serviços, imobiliário e comércio.",
  },
  {
    q: "Quanto tempo para ver resultados?",
    a: "Primeiros resultados nas primeiras 48 horas. O método completo leva 1 a 2 semanas de prática gradual.",
  },
  {
    q: "Haverá tentativa de venda durante o webinar?",
    a: "Sim — serei direto sobre isso. No final, apresento as opções de aprofundamento. Sem pressão. O conteúdo gratuito é completo por si mesmo.",
  },
];

export const FAQSection = () => (
  <section className="py-16 md:py-24 bg-off-white">
    <div className="container mx-auto px-4 sm:px-6 max-w-[680px]">
      <ScrollReveal>
        <h2 className="font-heading font-bold text-[22px] sm:text-[28px] md:text-[30px] tracking-[-0.01em] text-center text-ink-900 mb-10 md:mb-14">
          Perguntas frequentes
        </h2>
      </ScrollReveal>

      <ScrollReveal>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-background border border-border rounded-lg px-5 py-1 overflow-hidden"
            >
              <AccordionTrigger className="text-base font-heading font-semibold text-ink-900 hover:no-underline text-left py-5 [&[data-state=open]>svg]:text-blue-600 [&>svg]:text-blue-600">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] text-ink-500 leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollReveal>
    </div>
  </section>
);
