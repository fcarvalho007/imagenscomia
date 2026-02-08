import { ScrollReveal } from "./ScrollReveal";
import { CTAButton } from "./CTAButton";
import { Shield } from "lucide-react";

export const CTAFinalSection = () => (
  <section className="py-20 relative overflow-hidden">
    {/* Background glow */}
    <div className="absolute inset-0 gradient-hero grid-tron" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

    <div className="container mx-auto px-4 max-w-2xl text-center relative z-10">
      <ScrollReveal>
        <p className="text-xl md:text-2xl leading-relaxed mb-4 text-foreground/90">
          A diferença entre empresas que crescem e as que estagnam será a velocidade de adaptação à <span className="text-gradient font-bold">Inteligência Artificial</span>.
        </p>
        <p className="text-lg text-muted-foreground mb-4">
          90 minutos podem mudar como a sua empresa trabalha.
        </p>
        <p className="text-lg font-semibold mb-10 text-foreground">
          O investimento é zero. O risco é zero.
          <br /><span className="text-primary">O potencial é real.</span>
        </p>
      </ScrollReveal>

      <ScrollReveal>
        <CTAButton size="large" label="GARANTIR LUGAR GRATUITO" />
      </ScrollReveal>

      <ScrollReveal>
        <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          Sem spam • Dados protegidos RGPD • Pode cancelar até ao início
        </div>
      </ScrollReveal>
    </div>
  </section>
);
