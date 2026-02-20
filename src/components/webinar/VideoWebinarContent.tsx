import { CheckCircle2 } from "lucide-react";

const bullets = [
  "Como escolher a ferramenta certa para criar vídeo com IA",
  "Processo prático: do briefing ao primeiro clip",
  "Checklist para manter consistência sem complicar",
];

export const VideoWebinarContent = () => (
  <div>
    <section>
      <h2 className="font-heading font-bold text-[20px] sm:text-[22px] text-slate-900 mb-5">
        O que vai aprender <span className="text-slate-400 font-normal text-[16px]">(em 60 min)</span>
      </h2>
      <ul className="space-y-3">
        {bullets.map((text, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-[16px] sm:text-[17px] text-slate-700 leading-relaxed">{text}</span>
          </li>
        ))}
      </ul>
    </section>
  </div>
);
