import { ScrollReveal } from "./ScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";

const credentials = [
  { emoji: "👨‍🏫", title: "Professor Universitário", desc: "Faculdade de Economia, Universidade de Coimbra" },
  { emoji: "📚", title: "Autor Best-Seller", desc: "\"Guia Essencial SEO\" e \"Marketing Digital para Empresas\"" },
  { emoji: "🎙️", title: "Host Podcast RFM", desc: "\"Marketing por Idiotas\" — semanalmente na RFM" },
];

const Counter = ({ end, suffix, label }: { end: number; suffix: string; label: string }) => {
  const { count, ref } = useCountUp(end);
  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient">{count}{suffix}</div>
      <div className="text-navy-light mt-1 text-xs sm:text-sm">{label}</div>
    </div>
  );
};

export const CredibilitySection = () => (
  <section className="py-16 md:py-20 section-light">
    <div className="container mx-auto px-5 sm:px-6">
      <ScrollReveal>
        <p className="text-center text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest mb-2">Quem apresenta</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2 text-navy">
          Frederico Carvalho
        </h2>
        <p className="text-center text-navy-light text-sm sm:text-base mb-10 md:mb-12 leading-relaxed max-w-lg mx-auto">
          20 anos em marketing digital • Consultor L'Oréal, BMW, 3M • Fundador CLICKSUMMIT
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto mb-10 md:mb-14">
        {credentials.map((cred, i) => (
          <ScrollReveal key={cred.title} delay={i * 0.1}>
            <div className="text-center p-5 sm:p-6 rounded-2xl card-light transition-all">
              <div className="text-3xl mb-2">{cred.emoji}</div>
              <h3 className="font-bold text-sm sm:text-base mb-1 text-navy">{cred.title}</h3>
              <p className="text-navy-light text-xs sm:text-sm leading-relaxed">{cred.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-md sm:max-w-lg mx-auto">
        <Counter end={700} suffix="+" label="Empresas" />
        <Counter end={20} suffix="" label="Anos Exp." />
        <Counter end={97} suffix="%" label="Satisfação" />
      </div>
    </div>
  </section>
);
