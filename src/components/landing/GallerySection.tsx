import { ScrollReveal } from "./ScrollReveal";

import imgPorto from "@/assets/galeria/6_frederico_carvalho_porto_ribeirinha.jpeg";
import imgEscritorio from "@/assets/galeria/1_frederico_carvalho_escritorio_1.jpeg";
import imgSerum from "@/assets/galeria/3_frederico_carvalho_serum_exemplo.jpeg";
import imgBolsa from "@/assets/galeria/8_frederico_carvalho_bolsa_mulher.png";
import imgCama from "@/assets/galeria/2_frederico_carvalho_na_cama_1.png";
import imgSapatos from "@/assets/galeria/7_frederico_carvalho_sapatos.jpeg";
import imgCappucino from "@/assets/galeria/5_frederico_carvalho_cappucino_background.jpeg";
import imgCaricatura from "@/assets/galeria/4_frederico_carvalho_caricatura.jpeg";

const slots = [
  { n: 1, image: imgPorto, ratio: "4/5", tag: "Post Instagram", alt: "Post Instagram — vista ribeirinha do Porto", category: "redes-sociais" },
  { n: 2, image: imgEscritorio, ratio: "16/9", tag: "LinkedIn Banner", alt: "LinkedIn Banner — escritório profissional", category: "linkedin" },
  { n: 3, image: imgSerum, ratio: "1/1", tag: "Imagem de Produto", alt: "Imagem de Produto — sérum cosmético", category: "produto" },
  { n: 4, image: imgBolsa, ratio: "9/16", tag: "Story Instagram", alt: "Story Instagram — bolsa de mulher", category: "redes-sociais" },
  { n: 5, image: imgCama, ratio: "4/3", tag: "Anúncio Facebook", alt: "Anúncio Facebook — lifestyle na cama", category: "anuncios" },
  { n: 6, image: imgSapatos, ratio: "3/2", tag: "E-commerce", alt: "E-commerce — sapatos elegantes", category: "ecommerce" },
  { n: 7, image: imgCappucino, ratio: "1/1", tag: "Branding", alt: "Branding — cappuccino artístico", category: "branding" },
  { n: 8, image: imgCaricatura, ratio: "2/3", tag: "Newsletter Header", alt: "Newsletter Header — caricatura ilustrada", category: "newsletter" },
];

export const GallerySection = () => {
  return (
    <section id="galeria-exemplos" className="bg-off-white py-14 md:py-20 px-4">
      <div className="mx-auto max-w-[1080px]">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="font-heading font-semibold text-[11px] uppercase tracking-[0.1em] text-blue-600 mb-2.5">
              EXEMPLOS REAIS
            </p>
            <h2 className="font-heading font-extrabold text-2xl md:text-[32px] text-ink-900">
              Imagens criadas com método
            </h2>
            <p className="text-base text-ink-500 mt-2 max-w-[560px] mx-auto">
              Todas as imagens foram criadas com IA — sem designer, sem agência, em menos de 3 minutos cada.
            </p>
          </div>
        </ScrollReveal>

        {/* Masonry grid */}
        <div id="galeria-grid" style={{ columnCount: 3, columnGap: 16 }}>
          <style>{`
            @media (max-width: 1023px) { #galeria-grid { column-count: 2 !important; column-gap: 14px !important; } }
            @media (max-width: 767px) { #galeria-grid { column-count: 2 !important; column-gap: 10px !important; } }
          `}</style>
          {slots.map((slot, i) => (
            <ScrollReveal key={slot.n} delay={i * 0.04}>
              <div
                className="relative rounded-xl overflow-hidden cursor-pointer mb-4 transition-transform duration-200 hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] group"
                style={{ breakInside: "avoid" }}
                data-slot={`galeria-${String(slot.n).padStart(2, "0")}`}
                data-category={slot.category}
              >
                <img
                  src={slot.image}
                  alt={slot.alt}
                  loading="lazy"
                  className="w-full object-cover"
                  style={{ aspectRatio: slot.ratio }}
                />

              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
