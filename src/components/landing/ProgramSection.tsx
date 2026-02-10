import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";

const systems = [
  {
    num: "01",
    title: "O Método do Prompt Perfeito",
    borderColor: "border-l-blue-600",
    desc: "A mesma ferramenta com o prompt errado gera lixo — com o prompt certo gera uma imagem utilizável em 3 minutos. Demo ao vivo com 5 tipos de imagem.",
    bullets: [
      "Estrutura de prompt em 4 camadas (qualquer ferramenta)",
      "App Gerador de Prompts exclusiva (acesso imediato)",
      "20 estruturas base testadas em contexto PT",
    ],
  },
  {
    num: "02",
    title: "Imagens para Redes Sociais e Anúncios",
    borderColor: "border-l-[#0891B2]",
    desc: "Criação ao vivo de 3 peças prontas a publicar — post LinkedIn, anúncio Facebook e imagem de produto — com consistência de marca, sem designer.",
    bullets: [
      "Workflow: briefing → prompt → imagem → publicação",
      "Templates para 8 formatos (feed, stories, anúncios, site)",
      "Checklist de consistência visual com IA",
    ],
  },
  {
    num: "03",
    title: "Escalar Produção Visual Sem Equipa",
    borderColor: "border-l-green-600",
    desc: "Como passar de 5 imagens por semana para 50 — com o mesmo tempo e sem mais custos. Construção ao vivo de um mini-workflow de produção.",
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
                <span className="font-heading font-extrabold text-[42px] text-ink-300/30 leading-none md:min-w-[60px] md:text-right">{s.num}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-heading font-semibold text-lg text-ink-900">{s.title}</h3>
                    <span className="shrink-0 bg-blue-50 text-blue-600 font-heading font-semibold text-[11px] px-2.5 py-1 rounded-full">
                      AO VIVO
                    </span>
                  </div>
                  <p className="text-[15px] text-ink-500 leading-relaxed mb-4">{s.desc}</p>
                  <p className="font-heading font-semibold text-[13px] text-ink-500 mb-2">O que levas:</p>
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
            href="#inscrever"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-heading font-bold text-base px-10 py-4 rounded-xl shadow-green transition-all"
          >
            Reservar lugar gratuito
          </motion.a>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
