import { ScrollReveal } from "./ScrollReveal";

const credentials = [
  { emoji: "🎓", title: "Professor Universitário", sub: "FEUC · Univ. Europeia · Univ. Autónoma" },
  { emoji: "📚", title: "Co-autor e Autor", sub: "Marketing Digital para Empresas · Guia Essencial SEO" },
  { emoji: "🎙️", title: "Host Semanal RFM", sub: "Podcast Marketing por Idiotas" },
  { emoji: "🏢", title: "Fundador e CEO", sub: "DIGITALFC · SMSonline.pt" },
  { emoji: "🏆", title: "700+ Projetos", sub: "L'Oréal · BMW · 3M · Impresa" },
  { emoji: "🎯", title: "20 Anos", sub: "Marketing Digital e SEO" },
];

export const PresenterSection = () => (
  <section className="py-16 md:py-24 bg-secondary-dark">
    <div className="container mx-auto px-5 sm:px-6 max-w-4xl">
      <ScrollReveal>
        <p className="text-xs font-heading font-semibold text-text-secondary uppercase tracking-[0.2em] mb-8 text-center md:text-left">
          Quem apresenta
        </p>
      </ScrollReveal>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 mb-10">
        {/* Avatar placeholder */}
        <ScrollReveal>
          <div className="w-36 h-36 md:w-48 md:h-48 rounded-full gradient-main flex items-center justify-center shrink-0">
            <span className="font-heading font-extrabold text-3xl md:text-4xl text-white">FC</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="text-center md:text-left">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl mb-2">
              Frederico Carvalho
            </h2>
            <p className="text-secondary text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-lg">
              20 anos a implementar marketing digital e sistemas IA em empresas portuguesas
            </p>
          </div>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {credentials.map((c, i) => (
          <ScrollReveal key={i} delay={i * 0.06}>
            <div className="glass-card glass-card-hover rounded-xl p-4 h-full">
              <div className="text-2xl mb-2">{c.emoji}</div>
              <p className="font-heading font-semibold text-sm text-foreground">{c.title}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{c.sub}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
