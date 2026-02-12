import { ScrollReveal } from "./ScrollReveal";
import presenterBg from "@/assets/presenter-bg.png";

const credentials = [
  { emoji: "🎓", title: "Professor Universitário", sub: "Universidade de Coimbra (FEUC) · Univ. Europeia (IPAM) · Univ. Autónoma · Univ. Aveiro" },
  { emoji: "📚", title: "Autor", sub: "\"Guia Essencial SEO\" e Co-Autor \"Marketing Digital para Empresas\"" },
  { emoji: "🎙️", title: "Host Semanal · RFM", sub: "Podcast Marketing por Idiotas" },
  { emoji: "🏢", title: "Fundador e CEO", sub: "DIGITALFC consultoria com auditoria digital a mais de 700+ empresas. L'Oréal. BMW. 3M" },
];

export const PresenterSection = () => (
  <section className="relative overflow-hidden min-h-[500px]">
    {/* Background image */}
    <img
      src={presenterBg}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-cover object-right"
    />

    {/* Gradient overlay — left opaque, right transparent (desktop) */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.25) 70%, transparent 100%)",
      }}
    />
    {/* Mobile: stronger overlay */}
    <div
      className="absolute inset-0 md:hidden"
      style={{ background: "rgba(0,0,0,0.55)" }}
    />

    {/* Content */}
    <div className="relative z-10 mx-auto max-w-[960px] px-4 py-14 md:py-20">
      <ScrollReveal className="max-w-[520px]">
        <p className="font-heading font-semibold text-[14px] uppercase tracking-[0.1em] text-blue-300 mb-2">
          QUEM APRESENTA
        </p>
        <h2 className="font-heading font-extrabold text-[26px] md:text-[32px] text-white mb-1">
          Frederico Carvalho
        </h2>
        <p className="font-medium text-[17px] text-white/80 leading-[1.5] mb-7">
          20 anos na área do marketing digital em empresas
        </p>

        {/* Credentials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {credentials.map((c, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-[10px] p-3.5"
            >
              <span className="text-[20px] leading-none shrink-0">{c.emoji}</span>
              <div>
                <p className="font-heading font-semibold text-[14px] text-white">{c.title}</p>
                <p className="text-[14px] text-white/70">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Google badge */}
        <div
          className="inline-block rounded-xl px-4 py-3"
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
      </ScrollReveal>
    </div>
  </section>
);
