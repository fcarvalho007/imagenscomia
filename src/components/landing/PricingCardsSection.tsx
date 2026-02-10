import { motion } from "framer-motion";
import { Check, AlertTriangle, Gift } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";

const freeFeatures = [
  "Webinar ao vivo (75 min)",
  "Demonstração ao vivo",
  "Resumo PDF da sessão",
];

const premiumFeatures = [
  { main: "Gravação da sessão (30 dias)", sub: "" },
  { main: "Sessão Q&A exclusiva em grupo — 60 min", sub: "" },
  { main: "Guia completo de prompts (30+ páginas)", sub: "" },
];

export const PricingCardsSection = () => {
  const { open } = useRegistrationModal();

  return (
    <section id="form-gratis" className="py-16 md:py-24 bg-off-white">
      <div className="container mx-auto px-4 sm:px-6 max-w-[920px]">
        <ScrollReveal>
          <h2 className="font-heading font-bold text-[22px] sm:text-[28px] md:text-[30px] tracking-[-0.01em] text-center text-ink-900 mb-10 md:mb-14">
            Como participar
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto">
          {/* Free card - first on mobile */}
          <ScrollReveal>
            <div className="bg-background border border-border rounded-lg p-8 h-full flex flex-col shadow-card">
              <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-ink-500 mb-1">PARTICIPAÇÃO GRATUITA — €0</p>
              <span className="font-heading font-extrabold text-4xl text-ink-900 mb-1">€0</span>
              <p className="text-[12px] text-ink-500 font-medium mb-4">Ideal para quem vai estar ao vivo</p>

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

          {/* Premium card */}
          <ScrollReveal delay={0.12}>
            <div id="form-premium" className="bg-background border-2 border-blue-600 rounded-lg p-8 h-full flex flex-col relative shadow-blue">
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[11px] font-heading font-semibold px-4 py-1.5 rounded-full uppercase tracking-[0.05em]">
                Mais completo
              </span>

              <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-blue-600 mb-1">PREMIUM PASS — €15 + IVA</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-heading font-extrabold text-4xl text-ink-900">€15</span>
                <span className="text-sm text-ink-400">+ IVA</span>
              </div>
              
              <p className="text-[12px] text-blue-600 font-medium mb-4">Ideal para quem quer rever e aplicar depois</p>

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
                onClick={() => open("free")}
                className="w-full bg-gradient-to-r from-blue-600 to-neon-cyan text-white font-heading font-bold text-base py-4 rounded-xl shadow-neon-cyan transition-all"
              >
                Garantir Premium €15
              </motion.button>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <p className="text-center text-[14px] text-ink-500 italic mt-6 max-w-[560px] mx-auto">
            O Premium é recomendado para aplicação prática depois do evento.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6 max-w-[560px] mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-amber-600" />
              <span className="font-heading font-bold text-[15px] text-ink-900">Ou ganha Premium grátis</span>
            </div>
            <p className="text-[13px] text-ink-600 mb-4">
              Inscrição gratuita + convite a 2 pessoas. Se ambas se registarem, o Premium Pass (€15+IVA) fica desbloqueado sem qualquer custo.
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
