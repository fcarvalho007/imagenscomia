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
    q: "Quanto tempo para ver resultados?",
    a: "Primeiros resultados são praticamente imediatos, sabendo quais as ferramentas e o processo. O método completo leva 1 semana de prática gradual.",
  },
  {
    q: "Posso ver o webinar depois se não puder estar ao vivo?",
    a: "A gravação está disponível no Premium Pass (€15). A inscrição gratuita dá acesso ao vivo mas não inclui gravação — se faltares ao webinar, perdes o acesso ao conteúdo. O Premium garante acesso para sempre por €15, agora. Depois do webinar passa a custar €27.",
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
              <AccordionContent className="text-[16px] text-ink-500 leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollReveal>
    </div>
  </section>
);
