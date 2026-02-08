import { ScrollReveal } from "./ScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";
import { GraduationCap, BookOpen, Mic } from "lucide-react";

const credentials = [
  { emoji: "👨‍🏫", title: "Professor SEO", lines: ["Faculdade de Economia", "Universidade de Coimbra"] },
  { emoji: "📚", title: "Autor", lines: ['"Guia Essencial SEO"', '"Marketing Digital para Empresas"'] },
  { emoji: "🎙️", title: "Host", lines: ['"Marketing por Idiotas"', "Podcast RFM (semanal)"] },
];

const Counter = ({ end, suffix, label }: { end: number; suffix: string; label: string }) => {
  const { count, ref } = useCountUp(end);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-gradient">{count}{suffix}</div>
      <div className="text-muted-foreground mt-1 text-sm">{label}</div>
    </div>
  );
};

export const CredibilitySection = () => (
  <section className="py-20 bg-muted/30 grid-tron">
    <div className="container mx-auto px-4">
      <ScrollReveal>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
          Ministrado por <span className="text-gradient">Frederico Carvalho</span>
        </h2>
        <p className="text-center text-muted-foreground text-lg mb-12">
          Professor, Autor Best-Seller e Consultor de Empresas Líderes
        </p>
      </ScrollReveal>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
        {credentials.map((cred, i) => (
          <ScrollReveal key={cred.title} delay={i * 0.15}>
            <div className="text-center p-6 rounded-2xl bg-card neon-border hover:neon-glow transition-shadow">
              <div className="text-4xl mb-3">{cred.emoji}</div>
              <h3 className="font-bold text-lg mb-2 text-foreground">{cred.title}</h3>
              {cred.lines.map((line) => (
                <p key={line} className="text-muted-foreground text-sm">{line}</p>
              ))}
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto text-sm">
          20 anos experiência digital • Fundador CLICKSUMMIT • Consultor L'Oréal, BMW, 3M, Impresa
          <br />Formou equipas de <span className="text-primary font-semibold">700+ empresas</span> em Portugal
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
        <Counter end={700} suffix="+" label="Empresas Formadas" />
        <Counter end={20} suffix="" label="Anos Experiência" />
        <Counter end={97} suffix="%" label="Satisfação" />
      </div>
    </div>
  </section>
);
