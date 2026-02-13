import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";

const systems = [
  {
    num: "01",
    title: "Ferramentas certas (sem confusão)",
    borderColor: "border-l-blue-600",
    desc: "Antes de escolher a ferramenta, convém perceber o que funciona hoje.",
    bullets: [
      "Comparações rápidas entre ferramentas gratuitas e pagas",
      "Lista curada para guardar nos favoritos",
    ],
    deliverable: "Mapa de decisão rápido para escolher a ferramenta certa.",
  },
  {
    num: "02",
    title: "Instruções profissionais (do briefing ao resultado)",
    borderColor: "border-l-[#0891B2]",
    desc: "Em contexto empresarial, uma instrução bem escrita muda tudo.",
    bullets: [
      "Passo a passo para transformar briefing em instrução reutilizável",
      "Checklist anti-erros: o que faz a IA falhar e como corrigir",
    ],
    deliverable: "Instruções-base e um método consistente para qualquer marca.",
  },
  {
    num: "03",
    title: "Imagens para redes sociais e anúncios (prontas a usar)",
    borderColor: "border-l-green-600",
    desc: "Criar imagens é fácil. Criar imagens que funcionam é outra conversa.",
    bullets: [
      "Do objetivo ao criativo: formatos, variações e consistência",
      "Como sair com peças prontas a publicar em minutos",
    ],
    deliverable: "Processo simples para produzir criativos com qualidade.",
  },
];

export const ProgramSection = () => {
  const { open } = useRegistrationModal();
  return (
  <section className="py-16 md:py-24 bg-off-white">
    <div className="container mx-auto px-4 sm:px-6 max-w-[960px]">
      <ScrollReveal>
        <p className="font-heading font-semibold text-[14px] uppercase tracking-[0.08em] text-blue-600 text-center mb-2">
          PROGRAMA
        </p>
        <h2 className="font-heading font-bold text-[24px] sm:text-[30px] md:text-[34px] tracking-[-0.01em] text-center text-ink-900 mb-2">
          O que se aprende em 60 minutos
        </h2>
        <p className="text-[17px] text-ink-500 text-center mb-12 max-w-lg mx-auto">
          3 blocos práticos. Demos ao vivo. Resultados no dia seguinte.
        </p>
      </ScrollReveal>

      <div className="space-y-6">
        {systems.map((s, i) => (
          <ScrollReveal key={i} delay={i * 0.1}>
            <div className={`bg-background border border-border ${s.borderColor} border-l-4 rounded-r-lg p-7 shadow-card`}>
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <span className="font-heading font-extrabold text-[42px] text-[hsl(262,83%,58%)]/15 leading-none md:min-w-[60px] md:text-right">{s.num}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-heading font-semibold text-lg text-ink-900">{s.title}</h3>
                    <span className="shrink-0 bg-blue-50 text-blue-600 font-heading font-semibold text-[14px] px-2.5 py-1 rounded-full">
                      AO VIVO
                    </span>
                  </div>
                  <p className="text-[17px] text-ink-500 leading-relaxed mb-4">{s.desc}</p>
                  <div className="space-y-1.5 mb-3">
                    {s.bullets.map((b) => (
                      <p key={b} className="text-[15px] text-ink-700 flex items-start gap-2">
                        <span className="text-blue-600 shrink-0">→</span>
                        {b}
                      </p>
                    ))}
                  </div>
                  <p className="text-[14px] font-medium text-green-700 bg-green-50 border border-green-100 rounded-md px-3 py-1.5 inline-block">
                    {s.deliverable}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal>
        <div className="text-center mt-10">
          <motion.button
            onClick={() => open("free")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block bg-gradient-to-r from-neon-purple to-blue-600 text-white font-heading font-bold text-base px-10 py-4 rounded-xl shadow-neon-purple transition-all"
          >
            Sim, assistir grátis!
          </motion.button>
        </div>
      </ScrollReveal>
    </div>
  </section>
  );
};
