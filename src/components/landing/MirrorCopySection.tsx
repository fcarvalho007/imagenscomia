import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";

const points = [
  "Já tentaste gerar imagens com IA mas os resultados ficaram longe do que querias",
  "Precisas de imagens para redes sociais ou anúncios e o stock fotográfico não representa a marca",
  "Queres produzir mais conteúdo visual sem depender de terceiros para cada peça",
];

export const MirrorCopySection = () => (
  <section className="py-12 md:py-16 bg-off-white border-b border-border">
    <div className="container mx-auto px-4 sm:px-6 max-w-[680px]">
      <ScrollReveal>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-0.5 bg-blue-600 rounded-full" />
          <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-blue-600">
            ESTE WEBINAR É PARA TI SE:
          </p>
        </div>
      </ScrollReveal>

      <div className="space-y-4 mb-8">
        {points.map((p, i) => (
          <ScrollReveal key={i} delay={i * 0.08}>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-heading font-bold shrink-0 mt-0.5">→</span>
              <p className="text-base text-ink-700">{p}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <div className="w-full h-px bg-border my-8" />

      <ScrollReveal>
        <p className="text-center text-sm text-ink-500 font-medium mb-8">
          Quarta <span className="text-blue-600">·</span> 18 de Fevereiro <span className="text-blue-600">·</span> 10h00 <span className="text-blue-600">·</span> 75 minutos <span className="text-blue-600">·</span> Gratuito
        </p>
      </ScrollReveal>

      <ScrollReveal>
        <div id="inscrever" className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <motion.a
            href="#form-gratis"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto text-center bg-green-600 hover:bg-green-700 text-white font-heading font-bold text-base px-8 py-4 rounded-xl shadow-green transition-all"
          >
            Inscrever grátis
          </motion.a>
          <motion.a
            href="#form-premium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto text-center bg-amber-500 hover:bg-amber-600 text-white font-heading font-bold text-base px-8 py-4 rounded-xl shadow-amber transition-all"
          >
            Premium Pass €15 →
          </motion.a>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
