import { ScrollReveal } from "./ScrollReveal";
import { CTAButton } from "./CTAButton";
import { Check, X, Video, PlayCircle } from "lucide-react";

export const PricingSection = () => (
  <section className="py-16 md:py-24 section-light">
    <div className="container mx-auto px-5 sm:px-6 max-w-4xl">
      <ScrollReveal>
        <p className="text-center text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest mb-2">Opções de participação</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 text-navy">
          Escolha como <span className="text-gradient">participar</span>
        </h2>
        <p className="text-center text-navy-light mb-10 md:mb-12 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
          Assista ao vivo gratuitamente, ou garanta acesso permanente à gravação.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free - Live */}
        <ScrollReveal delay={0}>
          <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-primary/20 shadow-lg shadow-primary/5 h-full flex flex-col relative">
            <div className="absolute -top-3 left-5 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full">
              RECOMENDADO
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Video className="w-5 h-5 text-primary shrink-0" />
              <h3 className="text-lg sm:text-xl font-bold text-navy">Ao Vivo</h3>
            </div>
            <p className="text-xs sm:text-sm text-navy-light mb-4">Quinta, 20 Fev • 19h00</p>
            <div className="mb-5">
              <span className="text-3xl sm:text-4xl font-bold text-gradient">Grátis</span>
            </div>

            <ul className="space-y-2.5 mb-6 flex-1">
              {[
                { text: "Webinar completo (90 min)", ok: true },
                { text: "Perguntas ao vivo no Q&A", ok: true },
                { text: "Kit IA Empresarial 2025", ok: true },
                { text: "3 Apps Web exclusivas", ok: true },
                { text: "50 Templates de Prompts", ok: true },
                { text: "Gravação para rever depois", ok: false },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-2 text-xs sm:text-sm">
                  {item.ok ? (
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-navy-light/30 mt-0.5 shrink-0" />
                  )}
                  <span className={item.ok ? "text-navy" : "text-navy-light/40"}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
            <CTAButton className="w-full" />
          </div>
        </ScrollReveal>

        {/* Paid - Recording */}
        <ScrollReveal delay={0.12}>
          <div className="bg-white rounded-2xl p-6 sm:p-8 card-light h-full flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <PlayCircle className="w-5 h-5 text-secondary shrink-0" />
              <h3 className="text-lg sm:text-xl font-bold text-navy">Gravação</h3>
            </div>
            <p className="text-xs sm:text-sm text-navy-light mb-4">Disponível após o webinar</p>
            <div className="mb-5">
              <span className="text-3xl sm:text-4xl font-bold text-navy">€15</span>
              <span className="text-xs sm:text-sm text-navy-light ml-2">único</span>
            </div>

            <ul className="space-y-2.5 mb-6 flex-1">
              {[
                "Gravação completa do webinar",
                "Ver e rever sem limite (1 ano)",
                "Kit IA Empresarial 2025",
                "3 Apps Web exclusivas",
                "50 Templates de Prompts",
                "Ideal se não pode estar ao vivo",
              ].map((text) => (
                <li key={text} className="flex items-start gap-2 text-xs sm:text-sm">
                  <Check className="w-4 h-4 text-secondary/50 mt-0.5 shrink-0" />
                  <span className="text-navy">{text}</span>
                </li>
              ))}
            </ul>

            <div className="bg-light-alt rounded-xl p-4 text-center">
              <p className="text-xs sm:text-sm text-navy-light">
                Disponível para compra após o webinar.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal>
        <p className="text-center text-xs sm:text-sm text-navy-light mt-8 max-w-md mx-auto leading-relaxed">
          💡 <strong className="text-navy">Dica:</strong> Inscreva-se agora (grátis). Se no dia não puder, terá a opção de adquirir a gravação.
        </p>
      </ScrollReveal>
    </div>
  </section>
);
