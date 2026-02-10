import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";

const systems = [
  {
    num: "01",
    title: "O Método do Prompt Perfeito",
    borderColor: "border-l-blue-600",
    desc: "Há uma diferença entre gerar uma imagem e gerar a imagem certa. Vou mostrar ao vivo o que separa um resultado amador de um resultado profissional.",
    bullets: [
      "Demo ao vivo com 5 tipos de imagem diferentes",
      "Acesso a uma app exclusiva que constrói prompts por ti",
    ],
  },
  {
    num: "02",
    title: "Imagens para Redes Sociais e Anúncios",
    borderColor: "border-l-[#0891B2]",
    desc: "Vou criar 3 peças prontas a publicar em direto — e vais perceber como podes fazer o mesmo para a tua marca, em minutos.",
    bullets: [
      "Do briefing à imagem publicável, passo a passo",
      "Funciona para feed, stories, anúncios e site",
    ],
  },
  {
    num: "03",
    title: "Escalar Produção Visual Sem Equipa",
    borderColor: "border-l-green-600",
    desc: "Como passar de 5 imagens por semana para 50 — com o mesmo tempo e sem mais custos.",
    bullets: [
      "Processo de produção em lote com IA",
      "App Calculadora: custo IA vs designer externo",
      "Mapa de decisão: quando usar IA, quando contratar",
    ],
  },
];

export const ProgramSection = () => (
  <section className="py-16 md:py-24 bg-background">
    <div className="container mx-auto px-4 sm:px-6 max-w-[720px]">
      <ScrollReveal>
        <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-blue-600 text-center mb-2">
          PROGRAMA
        </p>
        <h2 className="font-heading font-bold text-[22px] sm:text-[28px] md:text-[30px] tracking-[-0.01em] text-center text-ink-900 mb-2">
          O que vais aprender em 75 minutos
        </h2>
        <p className="text-[17px] text-ink-500 text-center mb-12 max-w-lg mx-auto">
          3 sistemas práticos. Demos ao vivo. Sais a criar imagens no dia seguinte.
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
                    <span className="shrink-0 bg-blue-50 text-blue-600 font-heading font-semibold text-[11px] px-2.5 py-1 rounded-full">
                      AO VIVO
                    </span>
                  </div>
                  <p className="text-[16px] text-ink-500 leading-relaxed mb-4">{s.desc}</p>
                  <div className="space-y-1.5">
                    {s.bullets.map((b) => (
                      <p key={b} className="text-sm text-ink-700 flex items-start gap-2">
                        <span className="text-blue-600 shrink-0">→</span>
                        {b}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal>
        <div className="text-center mt-10">
          <motion.a
            href="#form-gratis"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block bg-gradient-to-r from-neon-purple to-blue-600 text-white font-heading font-bold text-base px-10 py-4 rounded-xl shadow-neon-purple transition-all"
          >
            Reservar lugar gratuito
          </motion.a>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
