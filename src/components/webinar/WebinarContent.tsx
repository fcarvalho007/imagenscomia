import { CheckCircle2 } from "lucide-react";

const bullets = [
  "Como escolher a ferramenta certa (gratuita ou paga) para cada objetivo",
  "Variáveis que mudam o resultado: estilo, consistência e controlo",
  "Prompts práticos para criar imagens com aspeto profissional",
  "Checklist para acelerar produção sem perder qualidade",
  "Erros comuns que fazem tudo parecer 'stock' ou genérico",
];

export const WebinarContent = () => (
  <div className="mt-8 md:mt-10">
    {/* What you'll learn */}
    <section>
      <h2 className="font-heading font-bold text-[20px] sm:text-[22px] text-ink-900 mb-5">
        O que vai aprender <span className="text-ink-400 font-normal text-[16px]">(em 75 min)</span>
      </h2>
      <ul className="space-y-3">
        {bullets.map((text, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-[16px] sm:text-[17px] text-ink-700 leading-relaxed">{text}</span>
          </li>
        ))}
      </ul>
    </section>
  </div>
);
