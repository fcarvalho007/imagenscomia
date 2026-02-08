import { ScrollReveal } from "./ScrollReveal";
import { CTAButton } from "./CTAButton";
import { Shield } from "lucide-react";

export const CTAFinalSection = () => (
  <section className="py-24 relative overflow-hidden section-dark">
    <div className="absolute inset-0 gradient-hero grid-tron" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl" />

    <div className="container mx-auto px-4 max-w-2xl text-center relative z-10">
      <ScrollReveal>
        <p className="text-xl md:text-2xl leading-relaxed mb-4 text-foreground/90">
          Em 2025, a diferença entre empresas que crescem e as que estagnam será a velocidade com que adotam <span className="text-gradient font-bold">Inteligência Artificial</span>.
        </p>
        <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
          90 minutos. Zero custo. Ferramentas prontas a usar no dia seguinte.
        </p>
      </ScrollReveal>

      <ScrollReveal>
        <CTAButton size="large" label="INSCREVER-ME GRATUITAMENTE" />
      </ScrollReveal>

      <ScrollReveal>
        <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          Sem spam • Dados protegidos (RGPD) • Pode cancelar a qualquer momento
        </div>
      </ScrollReveal>
    </div>
  </section>
);
