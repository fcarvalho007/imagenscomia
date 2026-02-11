import { ScrollReveal } from "./ScrollReveal";
import fredericoImg from "@/assets/frederico-carvalho.jpg";

const credentials = [
  { emoji: "🎓", title: "Professor Universitário", sub: "FEUC · Univ. Europeia · Univ. Autónoma · IPAM" },
  { emoji: "📚", title: "Autor", sub: "\"Marketing Digital para Empresas\" · \"Guia Essencial SEO\"" },
  { emoji: "🎙️", title: "Host Semanal · RFM", sub: "Podcast Marketing por Idiotas" },
  { emoji: "🏢", title: "Fundador e CEO", sub: "DIGITALFC · 700+ empresas · L'Oréal · BMW · 3M" },
];

const stats = [
  { number: "700+", label: "empresas" },
  { number: "29", label: "anos de experiência" },
  { number: "1 194", label: "avaliações 5★ Google" },
];

export const PresenterSection = () => (
  <section className="bg-white border-t border-border py-14 md:py-20 px-4">
    <div className="mx-auto max-w-[960px]">
      <div className="flex flex-col md:flex-row items-center gap-9 md:gap-16">
        {/* Photo column */}
        <ScrollReveal className="w-full md:w-[380px] shrink-0">
          <div className="relative rounded-[20px] overflow-hidden">
            <img
              src={fredericoImg}
              alt="Frederico Carvalho"
              loading="lazy"
              className="w-full h-[320px] md:h-[460px] object-cover object-top rounded-[20px]"
            />
            {/* Badge */}
            <div
              className="absolute bottom-5 left-5 rounded-xl px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              }}
            >
              <p className="font-heading font-bold text-[13px] text-ink-900">
                ⭐ 5,0 · 1 194 avaliações no Google
              </p>
              <p className="text-[12px] text-ink-500 mt-[2px]">
                Frederico Carvalho · DIGITALFC
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Text column */}
        <ScrollReveal delay={0.1} className="flex-grow w-full">
          <div className="text-center md:text-left">
            <p className="font-heading font-semibold text-[11px] uppercase tracking-[0.1em] text-blue-600 mb-2">
              QUEM APRESENTA
            </p>
            <h2 className="font-heading font-extrabold text-[26px] md:text-[32px] text-ink-900 mb-1">
              Frederico Carvalho
            </h2>
            <p className="font-medium text-[17px] text-ink-500 leading-[1.5] mb-7">
              29 anos a implementar marketing digital e IA
              <br />
              em empresas portuguesas
            </p>

            <div className="border-t border-border mb-7" />

            {/* Credentials grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-7">
              {credentials.map((c, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 bg-off-white border border-border rounded-[10px] p-3.5"
                >
                  <span className="text-[20px] leading-none shrink-0">{c.emoji}</span>
                  <div>
                    <p className="font-heading font-semibold text-[13px] text-ink-900">{c.title}</p>
                    <p className="text-[12px] text-ink-500">{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stat bar */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between flex-wrap gap-3">
              {stats.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  {i > 0 && (
                    <div className="w-px h-8 bg-blue-100 self-center" />
                  )}
                  <div className="flex flex-col items-center text-center px-1">
                    <span className="font-heading font-extrabold text-[22px] text-blue-600">{s.number}</span>
                    <span className="text-[12px] text-ink-500 mt-[1px]">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  </section>
);
