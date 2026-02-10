import { ScrollReveal } from "./ScrollReveal";
import fredericoImg from "@/assets/frederico-carvalho.jpg";

const credentials = [
  { emoji: "🎓", title: "Professor Universitário", sub: "FEUC · Univ. Europeia · Univ. Autónoma" },
  { emoji: "📚", title: "Co-autor e Autor", sub: "Marketing Digital para Empresas · Guia Essencial SEO" },
  { emoji: "🎙️", title: "Host Semanal RFM", sub: "Podcast Marketing por Idiotas" },
  { emoji: "🏢", title: "Fundador e CEO", sub: "DIGITALFC · SMSonline.pt" },
];

export const PresenterSection = () => (
  <section className="py-16 md:py-24 bg-background border-t border-b border-border">
    <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 mb-10">
        {/* Avatar placeholder */}
        <ScrollReveal>
          <img
            src={fredericoImg}
            alt="Frederico Carvalho"
            loading="lazy"
            className="w-40 h-40 md:w-[200px] md:h-[200px] rounded-full object-cover border-[3px] border-blue-100 shrink-0"
          />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="text-center md:text-left">
            <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-blue-600 mb-2">
              QUEM APRESENTA
            </p>
            <h2 className="font-heading font-extrabold text-[22px] sm:text-[28px] md:text-[30px] text-ink-900 mb-2">
              Frederico Carvalho
            </h2>
            <p className="text-lg text-ink-500 font-medium leading-relaxed max-w-lg">
              17 anos a implementar marketing digital e IA em empresas portuguesas
            </p>
          </div>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {credentials.map((c, i) => (
          <ScrollReveal key={i} delay={i * 0.06}>
            <div className="bg-off-white border border-border rounded-md p-3.5 h-full">
              <div className="text-xl mb-1.5">{c.emoji}</div>
              <p className="font-heading font-semibold text-[13px] text-ink-900">{c.title}</p>
              <p className="text-xs text-ink-500 mt-0.5">{c.sub}</p>
            </div>
          </ScrollReveal>
        ))}
        {/* Card 5 spans 2 columns */}
        <ScrollReveal delay={0.24}>
          <div className="bg-off-white border border-border rounded-md p-3.5 sm:col-span-2">
            <div className="text-xl mb-1.5">🏆</div>
            <p className="font-heading font-semibold text-[13px] text-ink-900">
              17 anos · 700+ projetos · <span className="text-blue-600">L'Oréal</span> · <span className="text-blue-600">BMW</span> · <span className="text-blue-600">3M</span> · <span className="text-blue-600">Impresa</span>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  </section>
);
