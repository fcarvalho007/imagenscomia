import { XCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";

const transformations = [
  {
    before: "Horas a tentar ferramentas sem resultado concreto",
    after: "Método reproduzível para qualquer imagem em minutos",
  },
  {
    before: "Imagens genéricas que não representam a tua marca",
    after: "Consistência visual da marca em todas as peças",
  },
  {
    before: "Dependência de terceiros para cada peça de conteúdo",
    after: "Autonomia total — crias quando precisas, sem esperar",
  },
];

export const TransformationSection = () => {
  const { open } = useRegistrationModal();

  return (
    <section className="py-10 md:py-16 bg-off-white">
      <div className="container mx-auto px-4 sm:px-6 max-w-[720px]">
        <ScrollReveal>
          <p className="font-body font-semibold text-[12px] uppercase tracking-[0.1em] text-blue-600 text-center">
            DEPOIS DO WEBINAR
          </p>
          <h2 className="font-heading font-extrabold text-[26px] md:text-[32px] text-ink-900 text-center mt-2 mb-8">
            O que muda em 60 minutos
          </h2>
        </ScrollReveal>

        <div className="space-y-2.5">
          {transformations.map((t, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <div className="flex items-center gap-4 bg-background border border-border rounded-xl px-5 py-4">
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span className="text-[14px] text-ink-500 line-through flex-1">{t.before}</span>
                <ArrowRight className="w-4 h-4 text-ink-300 shrink-0" />
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <span className="text-[14px] font-semibold text-ink-800 flex-1">{t.after}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.25}>
          <div className="flex justify-center mt-6">
            <motion.button
              onClick={() => open("free")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto text-center bg-green-600 hover:bg-green-700 text-white font-heading font-bold text-lg px-8 py-4 rounded-xl shadow-[0_4px_14px_0_rgba(22,163,74,0.35)] transition-all"
            >
              Sim, quero garantir a minha vaga grátis
            </motion.button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
