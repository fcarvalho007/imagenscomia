import { CheckCircle2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const bullets = [
  "Como escolher a ferramenta certa (gratuita ou paga) para cada objetivo",
  "Variáveis que mudam o resultado: estilo, consistência e controlo",
  "Prompts práticos para criar imagens com aspeto profissional",
  "Checklist para acelerar produção sem perder qualidade",
  "Erros comuns que fazem tudo parecer 'stock' ou genérico",
];

const faqs = [
  {
    q: "Preciso de conhecimentos técnicos?",
    a: "Não. Se sabes usar o WhatsApp, consegues criar imagens com este método. Tudo é mostrado passo a passo.",
  },
  {
    q: "Vou ter acesso à gravação?",
    a: "A gravação está disponível para quem tem o Premium Pass (€15 + IVA). A versão gratuita inclui apenas o webinar ao vivo.",
  },
  {
    q: "Que ferramentas vão ser usadas?",
    a: "Ferramentas gratuitas e pagas — com uma seleção orientada ao objetivo. Inclui a app criada especificamente para este método.",
  },
];

export const WebinarContent = () => (
  <div className="mt-8 md:mt-10">
    {/* What you'll learn */}
    <section className="mb-10">
      <h2 className="font-heading font-bold text-[20px] sm:text-[22px] text-ink-900 mb-5">
        O que vai aprender <span className="text-ink-400 font-normal text-[16px]">(em 75 min)</span>
      </h2>
      <ul className="space-y-3">
        {bullets.map((text, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-[16px] sm:text-[17px] text-ink-700 leading-relaxed">{text}</span>
          </li>
        ))}
      </ul>
    </section>

    {/* FAQ */}
    <section>
      <h2 className="font-heading font-bold text-[20px] sm:text-[22px] text-ink-900 mb-4">
        Perguntas frequentes
      </h2>
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, i) => (
          <AccordionItem
            key={i}
            value={`faq-${i}`}
            className="bg-white border border-border rounded-lg px-5 py-1 overflow-hidden"
          >
            <AccordionTrigger className="text-[16px] font-heading font-semibold text-ink-900 hover:no-underline text-left py-4 [&[data-state=open]>svg]:text-blue-600 [&>svg]:text-blue-600">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-[16px] text-ink-500 leading-relaxed pb-4">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  </div>
);
