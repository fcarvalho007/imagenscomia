import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";

const systems = [
  {
    num: "01",
    title: "IA para Decisões Executivas",
    accentClass: "bg-primary",
    desc: "Uma análise de concorrência completa que demora normalmente 6-8 horas — feita em menos de 20 minutos, ao vivo, durante a sessão.",
    bullets: [
      "Método de análise competitiva com IA",
      "App Analisador exclusiva (acesso imediato)",
      "Processo replicável para qualquer mercado",
    ],
  },
  {
    num: "02",
    title: "IA para Produção de Conteúdo",
    accentClass: "bg-secondary",
    desc: "De 3 publicações por semana para 12 — sem agência, sem designer, sem copywriter a tempo inteiro. Demonstração com caso real português.",
    bullets: [
      "Workflow de produção de conteúdo escalável",
      "App Gerador de Prompts para imagens e copy",
      "Templates adaptados ao mercado português",
    ],
  },
  {
    num: "03",
    title: "IA para Automação de Processos",
    accentClass: "gradient-main",
    desc: "Construção ao vivo de uma automação que poupa 10-15 horas por semana — sem programador, sem código complexo.",
    bullets: [
      "Workflow pronto a implementar",
      "App Calculadora de ROI de automações",
      "Mapa das automações de alto impacto",
    ],
  },
];

export const ProgramSection = () => (
  <section className="py-16 md:py-24 bg-secondary-dark">
    <div className="container mx-auto px-5 sm:px-6 max-w-3xl">
      <ScrollReveal>
        <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-center mb-2 text-gradient">
          O que vais descobrir em 75 minutos
        </h2>
        <p className="text-sm sm:text-base text-text-secondary text-center mb-10 md:mb-14 max-w-lg mx-auto">
          3 sistemas práticos. Demos ao vivo. Sais com ferramentas prontas a usar no dia seguinte.
        </p>
      </ScrollReveal>

      <div className="space-y-5 md:space-y-6">
        {systems.map((s, i) => (
          <ScrollReveal key={i} delay={i * 0.1}>
            <div className="glass-card rounded-2xl p-5 sm:p-7 relative overflow-hidden">
              {/* Left accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.accentClass} rounded-l-2xl`} />

              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-secondary/50 text-xl font-bold">{s.num}</span>
                  <h3 className="font-heading font-bold text-base sm:text-lg text-foreground">{s.title}</h3>
                </div>
                <span className="shrink-0 bg-badge border border-badge-border text-foreground font-heading font-semibold text-[10px] px-2.5 py-1 rounded-full">
                  AO VIVO
                </span>
              </div>

              <p className="text-sm text-text-secondary leading-relaxed mb-4 pl-0 sm:pl-10">{s.desc}</p>

              <div className="space-y-1.5 pl-0 sm:pl-10">
                <p className="text-xs text-text-muted font-heading font-semibold uppercase tracking-wider mb-1">O que levas:</p>
                {s.bullets.map((b) => (
                  <p key={b} className="text-sm text-text-muted flex items-start gap-2">
                    <span className="text-secondary shrink-0">→</span>
                    {b}
                  </p>
                ))}
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
            className="inline-block bg-cta-free hover:bg-cta-free-hover text-white font-heading font-bold text-sm px-10 py-4 rounded-xl glow-green transition-all"
          >
            RESERVAR LUGAR GRATUITO
          </motion.a>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
