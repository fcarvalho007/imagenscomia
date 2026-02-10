import { ScrollReveal } from "./ScrollReveal";
import { Check, X } from "lucide-react";

const forWhom = [
  "Responsável de marketing que precisa de mais imagens sem aumentar orçamento de agência",
  "Empresário ou PME que faz o próprio marketing e quer resultados profissionais",
  "Gestor de e-commerce com necessidade de imagens de produto escaláveis",
  "Criador de conteúdo que quer consistência visual sem depender de designer",
  "Quem já tentou IA para imagens mas ficou frustrado e quer perceber onde falhou",
];

const notFor = [
  { main: "Designer profissional à procura de IA técnica avançada", sub: "este webinar é para quem não tem formação em design" },
  { main: "Quem procura ferramenta mágica sem método", sub: "há método. Ensino o método." },
];

export const AudienceSection = () => (
  <section className="py-12 md:py-24 bg-off-white">
    <div className="container mx-auto px-4 sm:px-6 max-w-[800px]">
      <ScrollReveal>
        <h2 className="font-heading font-bold text-[22px] sm:text-[28px] md:text-[30px] tracking-[-0.01em] text-center text-ink-900 mb-10 md:mb-14">
          Para quem é este webinar
        </h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* For whom */}
        <div>
          <div className="border-t-[3px] border-t-green-600 pt-4 mb-4">
            <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-green-600">
              CERTO PARA TI SE:
            </p>
          </div>
          <div className="space-y-3.5">
            {forWhom.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0 font-bold" />
                  <p className="text-[16px] text-ink-700">{item}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Not for */}
        <div>
          <div className="border-t-[3px] border-t-border-strong pt-4 mb-4">
            <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-ink-400">
              NÃO É PARA TI SE:
            </p>
          </div>
          <div className="space-y-3.5">
            {notFor.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
                <div className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-ink-400 mt-0.5 shrink-0" />
                  <p className="text-[16px] text-ink-500">
                    {item.main}
                    <br />
                    <span className="text-[13px]">({item.sub})</span>
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);
