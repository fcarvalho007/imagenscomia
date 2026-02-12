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
    a: "Não. Se consegue usar o WhatsApp, consegue criar imagens com este método. Tudo é mostrado passo a passo, do zero.",
  },
  {
    q: "As ferramentas mostradas são pagas?",
    a: "São mostradas opções gratuitas e pagas. A maior parte do método funciona com ferramentas gratuitas, incluindo a app criada especificamente para este webinar.",
  },
  {
    q: "Vou ter acesso à gravação?",
    a: "A gravação está disponível no Premium Pass (€15). A versão gratuita inclui o webinar ao vivo mas sem acesso à gravação depois.",
  },
  {
    q: "Quanto tempo para ver resultados?",
    a: "No dia seguinte ao webinar já é possível criar as primeiras imagens profissionais. Participantes anteriores relatam 5 a 10 imagens utilizáveis na primeira semana.",
  },
  {
    q: "Posso ver o webinar depois se não puder estar ao vivo?",
    a: "A gravação está disponível no Premium Pass (€15+IVA). A inscrição gratuita dá acesso ao vivo mas não inclui gravação. O Premium garante acesso vitalício por €15+IVA agora. Depois do webinar passa a custar €27+IVA.",
  },
  {
    q: "Isto funciona com ferramentas gratuitas?",
    a: "Sim. A maior parte do método funciona com ferramentas gratuitas. Também são mostradas opções pagas para quem quiser ir mais longe.",
  },
  {
    q: "O que é exatamente o 'Guia de prompts' e para que serve?",
    a: "É um PDF com mais de 30 páginas de instruções testadas em contexto empresarial português. Cada instrução está organizada por tipo de imagem (produto, redes sociais, anúncios) e inclui personalização para qualquer marca.",
  },
  {
    q: "Precisa de imagens para hoje. Isto ajuda?",
    a: "O webinar ensina um método aplicável no próprio dia. Após a sessão, é possível criar imagens prontas a publicar em minutos usando as ferramentas e instruções demonstradas.",
  },
  {
    q: "Isto substitui designer ou sessão fotográfica?",
    a: "Não substitui por completo, mas cobre a grande maioria das necessidades do dia a dia: redes sociais, anúncios, apresentações. Para necessidades muito específicas, o designer continua a ser útil.",
  },
];

export const FAQSection = () => (
  <section className="py-16 md:py-24 bg-background">
    <div className="container mx-auto px-4 sm:px-6 max-w-[760px]">
      <ScrollReveal>
        <h2 className="font-heading font-bold text-[24px] sm:text-[30px] md:text-[34px] tracking-[-0.01em] text-center text-ink-900 mb-10 md:mb-14">
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
              <AccordionTrigger className="text-[17px] font-heading font-semibold text-ink-900 hover:no-underline text-left py-5 [&[data-state=open]>svg]:text-blue-600 [&>svg]:text-blue-600">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-[17px] text-ink-500 leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollReveal>
    </div>
  </section>
);
