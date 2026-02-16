import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";

const freeFeatures = [
  "Webinar ao vivo (60 min) — do briefing à imagem pronta",
  "Demonstrações ao vivo (ferramentas + exemplos reais)",
  "Resumo PDF da sessão (checklist + passos)",
];

export const PricingCardsSection = () => {
  const { open } = useRegistrationModal();

  return (
    <section id="form-gratis" className="py-16 md:py-24 bg-off-white">
      <div className="container mx-auto px-4 sm:px-6 max-w-[920px]">
        <ScrollReveal>
          <h2 className="font-heading font-bold text-[24px] sm:text-[30px] md:text-[34px] tracking-[-0.01em] text-center text-ink-900 mb-10 md:mb-14">
            Como participar
          </h2>
        </ScrollReveal>

        <div className="max-w-[420px] mx-auto">
          <ScrollReveal>
            <div className="bg-background border border-border rounded-lg p-8 sm:p-10 flex flex-col shadow-card">
              <p className="font-heading font-semibold text-[14px] uppercase tracking-[0.08em] text-ink-500 mb-1">PARTICIPAÇÃO GRATUITA — €0</p>
              <p className="font-heading font-medium text-[12px] uppercase tracking-[0.1em] text-ink-400 mb-3">AO VIVO · 18 FEV · 10H00 · 60 MIN</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-heading font-extrabold text-4xl text-ink-900">€0</span>
                <span className="text-[12px] font-semibold text-green-600 bg-green-600/10 px-2 py-0.5 rounded-full">vaga garantida</span>
              </div>
              <p className="text-[14px] text-ink-500 font-medium mb-4">Para assistir ao vivo e aplicar o método no dia seguinte.</p>

              <div className="w-full h-px bg-border mb-6" />

              <ul className="space-y-3 mb-5 flex-1">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-[17px] text-ink-700">{f}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => open("free")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-heading font-bold text-base py-4 rounded-xl shadow-[0_4px_14px_0_rgba(22,163,74,0.35)] transition-all"
              >
                Sim, garantir vaga grátis!
              </motion.button>
              <p className="text-center text-[13px] text-ink-400 mt-2">Nota: a gravação está disponível apenas no Premium Pass.</p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
