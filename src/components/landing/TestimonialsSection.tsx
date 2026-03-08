import { ScrollReveal } from "./ScrollReveal";

const testimonials = [
  {
    initials: "MR", gradient: "linear-gradient(135deg, #1e3a5f, #3b82f6)",
    name: "Maria Rocha", role: "2 críticas",
    quote: "As aulas do prof Frederico Carvalho foram extremanente produtivas e a sua excelente pedagogia torna conteúdos complexos em algo simples, prático e aplicável. Recomendo vivamente.",
  },
  {
    initials: "RF", gradient: "linear-gradient(135deg, #064e3b, #10b981)",
    name: "Ricardo Fernandes", role: "3 críticas · 2 fotos",
    quote: "O Frederico é muito conhecedor dos seus temas, tem uma forma muito natural de passar essa informação e não deixa que nada falte a quem está do outro lado. Continuação de um excelente trabalho!",
  },
  {
    initials: "RB", gradient: "linear-gradient(135deg, #7c2d12, #f97316)",
    name: "Rui Brito", role: "Guia local · 18 críticas · 1 foto",
    quote: "Já fiz mais do que uma formação com o Frederico e é realmente uma mais valia o conhecimento que se adquire, com casos práticos e muito boa interação com os formandos. Materiais de apoio muito profissionais e formação adaptada ao contexto da empresa. Recomendo 100%",
  },
  {
    initials: "DR", gradient: "linear-gradient(135deg, #1e1b4b, #7c3aed)",
    name: "Dilen Ratanji", role: "Guia local · 71 críticas · 106 fotos",
    quote: "Profissional de excelência! Prático, assertivo e altamente competente!",
  },
  {
    initials: "AA", gradient: "linear-gradient(135deg, #0c4a6e, #0284c7)",
    name: "Ana Amaral", role: "4 críticas",
    quote: "Cuidado, preparação, organização que se resume em excelência! Parabéns!",
  },
  {
    initials: "JC", gradient: "linear-gradient(135deg, #134e4a, #0d9488)",
    name: "Joao Correia", role: "Guia local · 47 críticas · 45 fotos",
    quote: "Top só isso",
  },
];

export const TestimonialsSection = () => (
  <section id="testemunhos" style={{ background: "#0f172a" }} className="py-14 md:py-20 px-4">
    {/* <!-- TESTEMUNHOS — 6 cards para substituir por avaliações reais do Google
      Fonte: https://g.co/kgs/fredericocarvalho (ou Google My Business)
      Substituir: nome, cargo/empresa, texto da citação e gradiente do avatar.
      Manter estrutura HTML dos cards exactamente como está.
    --> */}
    <div className="mx-auto max-w-[1080px]">
      {/* Header */}
      <ScrollReveal>
        <div className="text-center mb-12">
          <p className="font-heading font-semibold text-[14px] uppercase tracking-[0.1em] mb-2.5" style={{ color: "rgba(99,179,237,0.9)" }}>
            O QUE DIZEM
          </p>
          <h2 className="font-heading font-extrabold text-[24px] sm:text-[30px] md:text-[34px] text-white">
            O que dizem sobre o Frederico
          </h2>

          {/* Google badge */}
          <div className="inline-flex items-center gap-2 mt-3 rounded-full px-4 py-2" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-semibold text-sm text-white">5,0 <span style={{ color: "#FBBC05" }}>★★★★★</span></span>
            <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.6)" }}>· 1 194 avaliações<span className="hidden sm:inline"> verificadas no Google</span></span>
          </div>
        </div>
      </ScrollReveal>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {testimonials.map((t, i) => (
          <ScrollReveal key={i} delay={i * 0.06}>
            <div
              className="rounded-2xl p-6 transition-colors duration-200 h-full flex flex-col"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.10)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
              }}
            >
              {/* Top */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: t.gradient }}
                  >
                    <span className="font-heading font-bold text-xs text-white/80">{t.initials}</span>
                  </div>
                  <div>
                    <p className="font-heading font-bold text-sm text-white">{t.name}</p>
                    <p className="text-[14px] mt-[1px]" style={{ color: "rgba(255,255,255,0.5)" }}>{t.role}</p>
                  </div>
                </div>
                <span className="font-heading font-extrabold text-5xl leading-none -mt-2" style={{ color: "rgba(99,179,237,0.25)" }}>"</span>
              </div>

              {/* Quote */}
              <p className="text-[17px] leading-[1.65] mb-4 flex-grow" style={{ color: "rgba(255,255,255,0.80)" }}>
                {t.quote}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-[14px]" style={{ color: "#FBBC05" }}>★★★★★</span>
                <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.35)" }}>Google Reviews</span>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
