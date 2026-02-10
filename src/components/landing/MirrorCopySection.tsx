import { Calendar, Clock, Users } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const points = [
  "Já tentaste gerar imagens com IA mas os resultados ficaram longe do que querias",
  "Precisas de imagens para redes sociais ou anúncios e o stock fotográfico não representa a marca",
  "Queres produzir mais conteúdo visual sem depender de terceiros para cada peça",
];

export const MirrorCopySection = () => (
  <section className="py-12 md:py-16 bg-background">
    <div className="container mx-auto px-4 sm:px-6 max-w-[680px]">
      <ScrollReveal>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-0.5 bg-blue-600 rounded-full" />
          <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-blue-600">
            ESTE WEBINAR É PARA TI SE:
          </p>
        </div>
      </ScrollReveal>

      <div className="space-y-3 mb-8">
        {points.map((p, i) => (
          <ScrollReveal key={i} delay={i * 0.08}>
            <div className="flex items-start gap-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-heading font-bold flex items-center justify-center shrink-0 mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-[15px] text-ink-700 leading-relaxed">{p}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <div className="w-full h-px bg-border my-8" />

      <ScrollReveal>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            Quarta, 18 Fev
          </span>
          <span className="text-blue-600">·</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            10h00
          </span>
          <span className="text-blue-600">·</span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            75 minutos
          </span>
          <span className="text-blue-600">·</span>
          <span className="font-semibold text-blue-600">Gratuito</span>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
