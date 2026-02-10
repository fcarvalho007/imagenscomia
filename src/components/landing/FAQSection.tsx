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
    a: "Não. Se consegues usar o WhatsApp, consegues criar imagens com este método. Vou mostrar passo a passo, do zero.",
  },
  {
    q: "As ferramentas mostradas são pagas?",
    a: "Mostro opções gratuitas e pagas. A maior parte do que ensino funciona com ferramentas gratuitas (incluindo a app que criei especificamente para este método).",
  },
  {
    q: "Vou ter acesso à gravação?",
    a: "A gravação está disponível no Premium Pass (€15). A versão gratuita inclui o webinar ao vivo mas sem acesso à gravação depois.",
  },
  {
    q: "Quanto tempo para ver resultados?",
    a: "No dia seguinte ao webinar já consegues criar as tuas primeiras imagens profissionais. Participantes anteriores relatam criação de 5-10 imagens utilizáveis na primeira semana.",
  },
  {
    q: "Posso ver o webinar depois se não puder estar ao vivo?",
    a: "A gravação está disponível no Premium Pass (€15+IVA). A inscrição gratuita dá acesso ao vivo mas não inclui gravação — quem faltar ao webinar, perde o acesso ao conteúdo. O Premium garante acesso vitalício por €15+IVA agora. Depois do webinar passa a custar €27+IVA.",
  },
  {
    q: "Isto funciona com ferramentas gratuitas?",
    a: "Sim. A maior parte do método funciona com ferramentas gratuitas, incluindo a aplicação criada especificamente para este webinar. Também são mostradas opções pagas para quem quiser ir mais longe.",
  },
  {
    q: "O que é exatamente o 'Guia de prompts' e para que serve?",
    a: "É um documento PDF com mais de 30 páginas de prompts testados em contexto empresarial português. Cada prompt está organizado por tipo de imagem (produto, redes sociais, anúncios) e inclui instruções de personalização para qualquer marca.",
  },
];

export const FAQSection = () => (
  <section className="py-16 md:py-24 bg-off-white">
    <div className="container mx-auto px-4 sm:px-6 max-w-[760px]">
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
