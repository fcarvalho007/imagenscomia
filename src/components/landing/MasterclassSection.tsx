import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const features = [
  "Implementação dos 3 sistemas em profundidade",
  "Exercícios práticos com a tua empresa real",
  "Apps completas (versão avançada)",
  "50 prompts testados com casos uso concretos",
  "Gravação vitalícia",
  "Certificado de participação",
];

export const MasterclassSection = () => (
  <section className="py-16 md:py-24 bg-secondary-dark border-t border-white/[0.04]">
    <div className="container mx-auto px-5 sm:px-6 max-w-3xl text-center">
      <ScrollReveal>
        <span className="inline-block gradient-main text-white font-heading font-semibold text-xs px-4 py-2 rounded-full mb-6">
          PRÓXIMO NÍVEL
        </span>
        <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-gradient mb-2">
          Quer ir mais fundo?
        </h2>
        <p className="text-text-secondary text-sm sm:text-base mb-10">
          Para quem quer implementar, não só compreender.
        </p>
      </ScrollReveal>

      <ScrollReveal>
        <div className="glass-card rounded-2xl p-6 sm:p-8 border-primary/30 glow-blue text-left max-w-xl mx-auto">
          <span className="inline-block bg-badge text-foreground font-heading font-semibold text-[10px] px-3 py-1 rounded-full mb-3">
            MASTERCLASS ONLINE AO VIVO
          </span>
          <h3 className="font-heading font-bold text-lg sm:text-xl text-foreground mb-1">
            IA Empresarial: Implementação Passo a Passo
          </h3>
          <p className="text-xs text-text-secondary mb-5">
            Data a anunciar · Online · 3 horas · Máximo 30 participantes
          </p>

          <div className="w-full h-px bg-white/[0.06] mb-5" />

          <ul className="space-y-2.5 mb-5">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <Check className="w-4 h-4 text-cta-premium mt-0.5 shrink-0" />
                <span className="text-text-muted">{f}</span>
              </li>
            ))}
          </ul>

          <div className="w-full h-px bg-white/[0.06] mb-5" />

          <p className="text-[10px] text-text-secondary uppercase tracking-wider font-heading mb-1">
            PRÉ-RESERVA (só para inscritos hoje):
          </p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-mono text-3xl font-bold text-cta-premium">€37</span>
            <span className="text-xs text-text-secondary">+ IVA</span>
          </div>
          <p className="text-xs text-text-secondary mb-5">
            Preço normal: <span className="line-through">€47 + IVA</span>
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-cta-premium hover:bg-cta-premium-hover text-white font-heading font-bold text-sm py-4 rounded-xl glow-amber transition-all mb-3"
          >
            PRÉ-RESERVAR MASTERCLASS €37
          </motion.button>

          <p className="text-xs text-urgency text-center">
            ⏰ Preço de pré-reserva só até 18 Fev · 🔒 Máximo 30 vagas
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <a href="#inscrever" className="inline-block mt-6 text-sm text-text-secondary hover:text-text-muted transition-colors cursor-pointer">
          Saltar, só quero o webinar →
        </a>
      </ScrollReveal>
    </div>
  </section>
);
