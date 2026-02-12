import { ScrollReveal } from "./ScrollReveal";
import fredericoImg from "@/assets/frederico-carvalho.jpg";

const credentials = [
  { emoji: "🎓", title: "Professor Universitário", sub: "Universidade de Coimbra (FEUC) · Univ. Europeia (IPAM) · Univ. Autónoma · Univ. Aveiro" },
  { emoji: "📚", title: "Autor", sub: "\"Guia Essencial SEO\" e Co-Autor \"Marketing Digital para Empresas\"" },
  { emoji: "🎙️", title: "Host Semanal · RFM", sub: "Podcast Marketing por Idiotas" },
  { emoji: "🏢", title: "Fundador e CEO", sub: "DIGITALFC consultoria com auditoria digital a mais de 700+ empresas. L'Oréal. BMW. 3M" },
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
              <p className="font-heading font-bold text-[14px] text-ink-900">
                ⭐ 5,0 · 1 194 avaliações no Google
              </p>
              <p className="text-[14px] text-ink-500 mt-[2px]">
                Frederico Carvalho · DIGITALFC
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Text column */}
        <ScrollReveal delay={0.1} className="flex-grow w-full">
          <div className="text-center md:text-left">
            <p className="font-heading font-semibold text-[14px] uppercase tracking-[0.1em] text-blue-600 mb-2">
              QUEM APRESENTA
            </p>
            <h2 className="font-heading font-extrabold text-[26px] md:text-[32px] text-ink-900 mb-1">
              Frederico Carvalho
            </h2>
            <p className="font-medium text-[17px] text-ink-500 leading-[1.5] mb-7">
              20 anos de experiência em marketing digital para empresas
            </p>

            <div className="border-t border-border mb-7" />

            {/* Credentials grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {credentials.map((c, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 bg-off-white border border-border rounded-[10px] p-3.5"
                >
                  <span className="text-[20px] leading-none shrink-0">{c.emoji}</span>
                  <div>
                    <p className="font-heading font-semibold text-[14px] text-ink-900">{c.title}</p>
                    <p className="text-[14px] text-ink-500">{c.sub}</p>
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
