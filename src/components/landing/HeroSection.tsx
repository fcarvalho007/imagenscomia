import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";

const badges = [
  { emoji: "⏱", text: "75 minutos" },
  { emoji: "💻", text: "Online ao vivo" },
  { emoji: "🎓", text: "Gratuito" },
  { emoji: "📅", text: "18 Fevereiro 10h" },
];

export const HeroSection = () => (
  <section className="py-16 md:py-24 bg-gradient-to-b from-[hsl(222,47%,5%)] to-[hsl(217,33%,11%)]">
    <div className="container mx-auto px-5 sm:px-6 max-w-3xl text-center">
      <ScrollReveal>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-[3.5rem] leading-[1.15] mb-4">
          Como Usar <span className="text-gradient">Inteligência Artificial</span>
          <br className="hidden sm:block" /> para Fazer Crescer a Tua Empresa
        </h1>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <p className="font-heading font-semibold text-secondary text-base sm:text-lg md:text-xl mb-5">
          3 Sistemas Reais, Demonstrados ao Vivo.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
          Não teoria. Não hype. Sistemas que empresas portuguesas já usam para poupar horas e acelerar resultados.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.3}>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {badges.map((b) => (
            <span
              key={b.text}
              className="inline-flex items-center gap-1.5 bg-badge text-foreground border border-badge-border rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-heading font-semibold"
            >
              <span>{b.emoji}</span> {b.text}
            </span>
          ))}
        </div>
      </ScrollReveal>
    </div>
  </section>
);
