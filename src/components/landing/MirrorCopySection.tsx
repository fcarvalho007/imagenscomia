import { ScrollReveal } from "./ScrollReveal";

const points = [
  "Precisa de imagens profissionais para redes sociais e anúncios sem depender de designer",
  "Sabe que a IA pode fazer muito mais, mas ninguém mostrou como aplicar ao negócio",
  "Quer consistência visual na marca sem orçamento para agência criativa",
];

export const MirrorCopySection = () => (
  <section className="py-12 md:py-16 bg-background">
    <div className="container mx-auto px-4 sm:px-6 max-w-[760px]">
      <ScrollReveal>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-[2px] bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full" />
          <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-blue-600">
            ESTE WEBINAR É PARA QUEM:
          </p>
        </div>
      </ScrollReveal>

      <div className="space-y-3 mb-8">
        {points.map((p, i) => (
          <ScrollReveal key={i} delay={i * 0.08}>
            <div className="flex items-start gap-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-heading font-bold flex items-center justify-center shrink-0 mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-[16px] text-ink-700 leading-relaxed">{p}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

    </div>
  </section>
);
