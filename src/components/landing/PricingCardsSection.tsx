import { motion } from "framer-motion";
import { Check, AlertTriangle, Gift } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";

const freeFeatures = [
  "Webinar ao vivo (75 minutos)",
  "Demos ao vivo",
  "Acesso a aplicações especializadas",
  "Resumo PDF da sessão",
  "Grupo WhatsApp do evento",
  "Certificado digital",
];

const premiumFeatures = [
  { main: "Gravação HD vitalícia", sub: "" },
  { main: "Sessão Q&A em grupo — 60 minutos", sub: "exclusiva, após o webinar" },
  { main: "Guia completo de prompts por tipo de imagem", sub: "PDF 30+ páginas, testado em contexto empresarial" },
  { main: "App Gerador de Prompts em early access", sub: "acesso antes de todos os participantes" },
];

export const PricingCardsSection = () => {
  const { open } = useRegistrationModal();

  return (
    <section id="form-gratis" className="py-16 md:py-24 bg-off-white">
      <div className="container mx-auto px-4 sm:px-6 max-w-[920px]">
        <ScrollReveal>
          <h2 className="font-heading font-bold text-[22px] sm:text-[28px] md:text-[30px] tracking-[-0.01em] text-center text-ink-900 mb-10 md:mb-14">
            Escolhe como participar
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto">
          {/* Premium card - first on mobile */}
          <ScrollReveal>
            <div id="form-premium" className="bg-background border-2 border-blue-600 rounded-lg p-8 h-full flex flex-col relative shadow-blue order-first md:order-last">
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[11px] font-heading font-semibold px-4 py-1.5 rounded-full uppercase tracking-[0.05em]">
                RECOMENDADO
              </span>

              <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-blue-600 mb-1">PREMIUM PASS</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-heading font-extrabold text-4xl text-ink-900">€15</span>
              </div>
              <p className="text-sm text-ink-400 line-through mb-6">€27 depois do webinar</p>

              <div className="w-full h-px bg-border-strong mb-6" />

              <div className="bg-green-50 border border-green-100 rounded-md p-3 mb-4 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-sm text-green-700 font-medium">Inclui tudo da participação gratuita</p>
              </div>

              <ul className="space-y-3 mb-5 flex-1">
                {premiumFeatures.map((f) => (
                  <li key={f.main}>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[16px] font-medium text-ink-900">{f.main}</span>
                        {f.sub && <p className="text-[13px] text-ink-500 pl-0 mt-0.5">{f.sub}</p>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>




              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => open("premium")}
                className="w-full bg-gradient-to-r from-blue-600 to-neon-cyan text-white font-heading font-bold text-base py-4 rounded-xl shadow-neon-cyan transition-all"
              >
                Garantir Premium €15
              </motion.button>
            </div>
          </ScrollReveal>

          {/* Free card */}
          <ScrollReveal delay={0.12}>
            <div className="bg-background border border-border rounded-lg p-8 h-full flex flex-col shadow-card order-last md:order-first">
              <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-ink-500 mb-1">PARTICIPAÇÃO GRATUITA</p>
              <span className="font-heading font-extrabold text-4xl text-ink-900 mb-6">€0</span>

              <div className="w-full h-px bg-border mb-6" />

              <ul className="space-y-3 mb-5 flex-1">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-[16px] text-ink-700">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-surface rounded-md p-3 mb-4 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[13px] text-ink-500">Nota: sem acesso a gravação após o webinar</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => open("free")}
                className="w-full bg-gradient-to-r from-neon-purple to-blue-600 text-white font-heading font-bold text-base py-4 rounded-xl shadow-neon-purple transition-all"
              >
                Inscrever grátis
              </motion.button>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6 max-w-[560px] mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-amber-600" />
              <span className="font-heading font-bold text-[15px] text-ink-900">Ou ganha Premium grátis</span>
            </div>
            <p className="text-[13px] text-ink-600 mb-4">
              Inscreve-te grátis e convida 2 amigos. Se ambos se registarem, ganhas o Premium Pass (€15) sem pagar nada.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => open("free")}
              className="bg-gradient-to-r from-neon-purple to-blue-600 text-white font-heading font-bold text-sm px-6 py-3 rounded-xl shadow-neon-purple transition-all"
            >
              Inscrever e receber link de convite
            </motion.button>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-center text-[13px] text-ink-400 mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
            <span>✓ Sem compromisso</span>
            <span>✓ RGPD</span>
            <span>✓ Reembolso 14 dias</span>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};
