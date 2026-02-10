import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const features = [
  { main: "Implementação dos 3 sistemas com a tua empresa real", sub: "" },
  { main: "50 prompts testados por tipo de imagem e ferramenta", sub: "produto, pessoas, arquitetura, infografias, anúncios" },
  { main: "Casos uso passo-a-passo com resultados reais PT", sub: "" },
  { main: "App completa Gerador de Prompts (versão avançada)", sub: "" },
  { main: "Gravação vitalícia", sub: "" },
  { main: "Certificado de participação", sub: "" },
];

export const MasterclassSection = () => (
  <section className="py-16 md:py-24 bg-background border-t border-border">
    <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center">
      <ScrollReveal>
        <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-blue-600 mb-2">
          PRÓXIMO NÍVEL
        </p>
        <h2 className="font-heading font-bold text-[22px] sm:text-[28px] md:text-[30px] tracking-[-0.01em] text-ink-900 mb-2">
          Quer ir mais fundo?
        </h2>
        <p className="text-[17px] text-ink-500 mb-10">
          Para quem quer implementar, não só aprender.
        </p>
      </ScrollReveal>

      <ScrollReveal>
        <div className="bg-off-white border border-border-strong border-t-[3px] border-t-blue-600 rounded-lg p-8 text-left max-w-[560px] mx-auto shadow-card-md">
          <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-blue-600 mb-2">
            MASTERCLASS ONLINE AO VIVO
          </p>
          <h3 className="font-heading font-bold text-xl text-ink-900 mb-1">
            IA para Imagens: Implementação Completa
          </h3>
          <p className="text-[13px] text-ink-400 mt-1.5">
            Data a anunciar · Online · 3 horas · Máximo 30 participantes
          </p>

          <div className="w-full h-px bg-border my-6" />

          <ul className="space-y-3 mb-6">
            {features.map((f) => (
              <li key={f.main}>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[15px] font-medium text-ink-900">{f.main}</span>
                    {f.sub && <p className="text-[13px] text-ink-500 mt-0.5">{f.sub}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="w-full h-px bg-border my-6" />

          <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-blue-600 mb-1">
            PRÉ-RESERVA
          </p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-heading font-extrabold text-[32px] text-ink-900">€37</span>
            <span className="text-sm text-ink-500">+ IVA</span>
          </div>
          <p className="text-sm text-ink-400 mb-5">
            Preço normal: <span className="line-through">€47 + IVA</span>
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-base py-4 rounded-xl shadow-blue transition-all mb-3"
          >
            Pré-reservar Masterclass €37
          </motion.button>

          <p className="text-[13px] text-ink-400 text-center">
            ⏰ Pré-reserva só até 18 Fev · 🔒 Máximo 30 vagas
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <a href="#inscrever" className="inline-block mt-6 text-sm text-ink-400 hover:text-ink-700 transition-colors cursor-pointer">
          Saltar, só quero o webinar →
        </a>
      </ScrollReveal>
    </div>
  </section>
);
