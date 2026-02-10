import { Play } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

export const HeroSection = () => (
  <section className="py-16 md:py-24 bg-background">
    <div className="container mx-auto px-4 sm:px-6 max-w-[800px] text-center">
      <ScrollReveal>
        <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-blue-600 mb-4">
          WEBINAR GRATUITO · 18 FEVEREIRO
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <h1 className="font-heading font-extrabold text-[28px] sm:text-[36px] md:text-[40px] leading-[1.15] tracking-[-0.02em] text-ink-900 mb-4">
          Como Criar Imagens Profissionais com IA para a Tua Empresa —{" "}
          <span className="relative inline-block">
            Sem Designer
            <span className="absolute left-0 -bottom-1 w-full h-1 bg-blue-600 rounded-full" />
          </span>
        </h1>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <p className="text-lg text-ink-500 font-medium max-w-[560px] mx-auto mt-4 mb-10">
          O método que transforma um briefing em imagem utilizável em menos de 3 minutos. Demonstrado ao vivo.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.3}>
        <div className="max-w-[640px] mx-auto aspect-video bg-surface rounded-xl border border-border shadow-card-md flex flex-col items-center justify-center gap-3">
          <div className="w-[60px] h-[60px] rounded-full bg-blue-600 flex items-center justify-center">
            <Play className="w-6 h-6 text-white ml-1" fill="white" />
          </div>
          <p className="text-xs text-ink-400">Pré-visualização · 90 segundos</p>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
