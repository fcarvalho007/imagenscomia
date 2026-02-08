import { ScrollReveal } from "./ScrollReveal";
import { CTAButton } from "./CTAButton";
import { Shield } from "lucide-react";

export const CTAFinalSection = () => (
  <section className="py-16 md:py-24 relative overflow-hidden section-dark">
    <div className="absolute inset-0 gradient-hero grid-tron" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl" />

    <div className="container mx-auto px-5 sm:px-6 max-w-2xl text-center relative z-10">
      <ScrollReveal>
        <p className="text-lg sm:text-xl md:text-2xl leading-relaxed mb-3 text-foreground/90">
          A diferença entre empresas que crescem e as que estagnam será a velocidade com que adotam <span className="text-gradient font-bold">IA</span>.
        </p>
        <p className="text-sm sm:text-base text-muted-foreground mb-8 md:mb-10 leading-relaxed">
          90 minutos. Zero custo. Ferramentas prontas a usar amanhã.
        </p>
      </ScrollReveal>

      <ScrollReveal>
        <CTAButton size="large" label="INSCREVER-ME GRATUITAMENTE" />
      </ScrollReveal>

      <ScrollReveal>
        <div className="flex items-center justify-center gap-2 mt-5 text-xs sm:text-sm text-muted-foreground">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          Sem spam • Dados protegidos (RGPD) • Cancelamento livre
        </div>
      </ScrollReveal>
    </div>
  </section>
);
