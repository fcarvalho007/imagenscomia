import { ScrollReveal } from "./ScrollReveal";

const slots = [
  { n: 1, gradient: "linear-gradient(135deg, #1e3a5f, #3b82f6)", ratio: "4/5", tag: "Post Instagram", category: "redes-sociais" },
  { n: 2, gradient: "linear-gradient(135deg, #064e3b, #10b981)", ratio: "16/9", tag: "LinkedIn Banner", category: "linkedin" },
  { n: 3, gradient: "linear-gradient(135deg, #7c2d12, #f97316)", ratio: "1/1", tag: "Imagem de Produto", category: "produto" },
  { n: 4, gradient: "linear-gradient(135deg, #1e1b4b, #7c3aed)", ratio: "9/16", tag: "Story Instagram", category: "redes-sociais" },
  { n: 5, gradient: "linear-gradient(135deg, #0c4a6e, #0284c7)", ratio: "4/3", tag: "Anúncio Facebook", category: "anuncios" },
  { n: 6, gradient: "linear-gradient(135deg, #134e4a, #0d9488)", ratio: "3/2", tag: "E-commerce", category: "ecommerce" },
  { n: 7, gradient: "linear-gradient(135deg, #18181b, #52525b)", ratio: "1/1", tag: "Branding", category: "branding" },
  { n: 8, gradient: "linear-gradient(135deg, #1a1a2e, #e11d48)", ratio: "2/3", tag: "Newsletter Header", category: "newsletter" },
];

export const GallerySection = () => {

  return (
    <section id="galeria-exemplos" className="bg-off-white py-14 md:py-20 px-4">
      {/* <!-- GALERIA DE EXEMPLOS — 8 slots para imagens reais
        Para substituir cada placeholder:
        1. Carregar imagem em /public/galeria/
        2. No slot correspondente, substituir o div placeholder por:
           <img src="/galeria/nome-ficheiro.jpg" alt="[descrição]" ... />
        Os aspect-ratios e tags de categoria mantêm-se.
      --> */}
      <div className="mx-auto max-w-[1080px]">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="font-heading font-semibold text-[11px] uppercase tracking-[0.1em] text-blue-600 mb-2.5">
              EXEMPLOS REAIS
            </p>
            <h2 className="font-heading font-extrabold text-2xl md:text-[32px] text-ink-900">
              Imagens criadas com o método
            </h2>
            <p className="text-base text-ink-500 mt-2 max-w-[560px] mx-auto">
              Todas as imagens foram criadas com IA — sem designer, sem agência, em menos de 3 minutos cada.
            </p>
          </div>
        </ScrollReveal>


        {/* Masonry grid */}
        <div
          id="galeria-grid"
          style={{ columnCount: 3, columnGap: 16 }}
        >
          {/* Responsive column count via CSS */}
          <style>{`
            @media (max-width: 1023px) {
              #galeria-grid { column-count: 2 !important; column-gap: 14px !important; }
            }
            @media (max-width: 767px) {
              #galeria-grid { column-count: 2 !important; column-gap: 10px !important; }
            }
          `}</style>
          {slots.map((slot, i) => (
            <ScrollReveal key={slot.n} delay={i * 0.04}>
              <div
                className="relative rounded-xl overflow-hidden cursor-pointer mb-4 transition-transform duration-200 hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] group"
                style={{ breakInside: "avoid" }}
                data-slot={`galeria-${String(slot.n).padStart(2, "0")}`}
                data-category={slot.category}
              >
                {/* Placeholder */}
                <div
                  className="flex flex-col items-center justify-center"
                  style={{
                    background: slot.gradient,
                    aspectRatio: slot.ratio,
                  }}
                >
                  <span className="text-3xl mb-1">🖼️</span>
                  <span className="text-[13px] text-white/60">
                    Imagem {slot.n}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }}
                />

                {/* Tag */}
                <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/95 rounded-md px-2.5 py-[5px]">
                  <span className="font-medium text-[12px] text-ink-700">
                    {slot.tag}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
