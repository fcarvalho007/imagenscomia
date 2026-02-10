import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";

const freeFeatures = [
  "Webinar ao vivo (75 minutos)",
  "3 demos práticas ao vivo",
  "Apps IA básicas incluídas",
  "Resumo PDF da sessão",
  "Grupo WhatsApp do evento",
  "Certificado digital",
];

const premiumFeatures = [
  "Gravação HD vitalícia (grátis: sem gravação)",
  "Sessão Q&A em grupo (60 min, exclusiva pós-webinar)",
  "Guia completo de ferramentas (PDF 30+ páginas)",
  "Apps IA em early access (antes de todos)",
  "Prioridade nas perguntas Q&A ao vivo",
];

export const PricingCardsSection = () => {
  const { open } = useRegistrationModal();

  return (
    <section id="form-gratis" className="py-16 md:py-24 bg-primary-dark grid-pattern">
      <div className="container mx-auto px-5 sm:px-6 max-w-4xl">
        <ScrollReveal>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-center mb-10 md:mb-14">
            Escolhe como participar
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 max-w-3xl mx-auto">
          {/* Free card */}
          <ScrollReveal>
            <div className="glass-card rounded-2xl p-6 sm:p-8 h-full flex flex-col">
              <h3 className="font-heading font-extrabold text-lg sm:text-xl mb-1">GRATUITO</h3>
              <p className="font-mono text-2xl sm:text-3xl text-text-secondary mb-5">€0</p>

              <ul className="space-y-2.5 mb-6 flex-1">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-cta-free mt-0.5 shrink-0" />
                    <span className="text-text-muted">{f}</span>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-text-secondary italic mb-4">
                Nota: sem acesso a gravação após o webinar
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={open}
                className="w-full bg-cta-free hover:bg-cta-free-hover text-white font-heading font-bold text-sm py-4 rounded-xl glow-green transition-all"
              >
                INSCREVER GRÁTIS
              </motion.button>
            </div>
          </ScrollReveal>

          {/* Premium card */}
          <ScrollReveal delay={0.12}>
            <div id="form-premium" className="glass-card rounded-2xl p-6 sm:p-8 h-full flex flex-col relative border-primary/30 glow-blue">
              <span className="absolute -top-3 right-5 gradient-main text-white text-[10px] font-heading font-semibold px-3 py-1 rounded-full">
                RECOMENDADO
              </span>

              <h3 className="font-heading font-extrabold text-lg sm:text-xl mb-1 text-gradient">PREMIUM PASS 🔥</h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-mono text-2xl sm:text-3xl text-cta-premium font-bold">€15</span>
                <span className="text-xs text-text-secondary line-through">€27</span>
              </div>
              <p className="text-xs text-text-secondary italic mb-5">TUDO do gratuito, mais:</p>

              <ul className="space-y-2.5 mb-5 flex-1">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-cta-premium mt-0.5 shrink-0" />
                    <span className="text-text-muted">{f}</span>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-urgency mb-1">⏰ Preço sobe após 18 Fev</p>
              <p className="text-xs text-text-secondary mb-4">👥 Vagas Premium limitadas</p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={open}
                className="w-full bg-cta-premium hover:bg-cta-premium-hover text-white font-heading font-bold text-sm py-4 rounded-xl glow-amber transition-all"
              >
                GARANTIR PREMIUM €15+iva
              </motion.button>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <p className="text-center text-xs text-text-secondary mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span>✓ Sem compromisso</span>
            <span>✓ Dados protegidos RGPD</span>
            <span>✓ Reembolso garantido 14 dias</span>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};
