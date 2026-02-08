import { ScrollReveal } from "./ScrollReveal";

const formadorEm = ["FEUC", "RFM", "CLICKSUMMIT"];
const trabalhouCom = ["L'Oréal", "BMW", "3M", "Impresa"];

export const FooterSection = () => (
  <footer className="py-16 bg-foreground text-background/80">
    <div className="container mx-auto px-4 max-w-4xl">
      {/* Logos */}
      <ScrollReveal>
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-wider text-background/40 mb-3">Formador em</p>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {formadorEm.map((name) => (
              <span key={name} className="px-4 py-2 rounded-lg bg-background/5 border border-background/10 text-sm">
                {name}
              </span>
            ))}
          </div>
          <p className="text-xs uppercase tracking-wider text-background/40 mb-3">Trabalhou com</p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {trabalhouCom.map((name) => (
              <span key={name} className="px-4 py-2 rounded-lg bg-background/5 border border-background/10 text-sm">
                {name}
              </span>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Institutional testimonial */}
      <ScrollReveal>
        <blockquote className="text-center max-w-2xl mx-auto mb-10 italic text-background/60">
          "Frederico combina rigor académico com pragmatismo empresarial. As suas formações transformam conceitos complexos de IA em aplicações práticas imediatas para negócios reais."
        </blockquote>
      </ScrollReveal>

      {/* Links */}
      <div className="flex flex-wrap justify-center gap-6 text-sm text-background/40 mb-6">
        <a href="#" className="hover:text-background/70 transition-colors">Privacidade</a>
        <a href="#" className="hover:text-background/70 transition-colors">Termos</a>
        <a href="#" className="hover:text-background/70 transition-colors">Contacto</a>
      </div>

      <p className="text-center text-xs text-background/30">
        © 2025 Frederico Carvalho • Marketing Digital & Inteligência Artificial
        <br />fredericocarvalho.pt
      </p>
    </div>
  </footer>
);
