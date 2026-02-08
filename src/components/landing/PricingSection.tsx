import { ScrollReveal } from "./ScrollReveal";
import { CTAButton } from "./CTAButton";
import { Check, Video, PlayCircle } from "lucide-react";

export const PricingSection = () => (
  <section className="py-20 bg-muted/30 grid-tron">
    <div className="container mx-auto px-4 max-w-4xl">
      <ScrollReveal>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          <span className="text-gradient">Duas formas</span> de participar
        </h2>
        <p className="text-center text-muted-foreground mb-12">Escolha a que melhor se adapta à sua agenda</p>
      </ScrollReveal>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Free - Live */}
        <ScrollReveal delay={0}>
          <div className="bg-card rounded-2xl p-8 neon-border hover:neon-glow transition-shadow h-full flex flex-col relative">
            <div className="absolute -top-3 left-6 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
              RECOMENDADO
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Video className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">Ao Vivo</h3>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gradient">Grátis</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Assistir ao webinar ao vivo",
                "Participar no Q&A interativo",
                "Kit IA Empresarial 2025",
                "3 Aplicações Web exclusivas",
                "50 Templates de Prompts",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <CTAButton className="w-full" />
          </div>
        </ScrollReveal>

        {/* Paid - Recording */}
        <ScrollReveal delay={0.15}>
          <div className="bg-card rounded-2xl p-8 border border-border hover:border-border/80 transition-shadow h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <PlayCircle className="w-6 h-6 text-muted-foreground" />
              <h3 className="text-xl font-bold">Gravação</h3>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">€15</span>
              <span className="text-sm text-muted-foreground ml-2">pagamento único</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Acesso à gravação completa",
                "Ver e rever quando quiser",
                "Kit IA Empresarial 2025",
                "3 Aplicações Web exclusivas",
                "50 Templates de Prompts",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-center text-xs text-muted-foreground">
              Disponível após o webinar para quem não pôde assistir ao vivo
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  </section>
);
