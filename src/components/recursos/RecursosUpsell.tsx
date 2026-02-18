import { Check, Video, Zap, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const MASTERCLASS_URL = "https://imagenscomia.com/masterclass";

interface RecursosUpsellProps {
  hasMasterclass: boolean;
  compact?: boolean;
}

export default function RecursosUpsell({ hasMasterclass, compact = false }: RecursosUpsellProps) {
  if (hasMasterclass) {
    return (
      <div className={`bg-green-50 border border-green-100 rounded-2xl text-center ${compact ? "p-4" : "p-6"}`}>
        <div className={`bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 ${compact ? "w-8 h-8" : "w-10 h-10"}`}>
          <Check size={compact ? 16 : 20} className="text-green-600" />
        </div>
        <p className={`font-semibold text-gray-900 ${compact ? "text-sm" : ""}`}>Masterclass incluída ✓</p>
        {!compact && (
          <p className="text-sm text-gray-500 mt-1">
            Detalhes de acesso serão enviados por email próximamente.
          </p>
        )}
        {compact && (
          <p className="text-xs text-gray-400 mt-1">Acesso incluído no teu plano.</p>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
            Próximo passo
          </span>
        </div>
        <p className="text-sm font-bold text-gray-900 mb-0.5">Quer ir mais longe?</p>
        <p className="text-xs text-gray-500 mb-3">Masterclass — Imagem para Vídeo com IA</p>

        <ul className="space-y-2 mb-4">
          {[
            { Icon: Video, text: "De imagem a vídeo em minutos" },
            { Icon: Zap, text: "Prompts e exemplos prontos a usar" },
            { Icon: Users, text: "Sessão ao vivo + gravação incluída" },
          ].map(({ Icon, text }, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
              <Icon size={12} className="text-blue-600 shrink-0" />
              {text}
            </li>
          ))}
        </ul>

        <span className="inline-block text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium mb-3">
          5 de Março, quinta-feira · 10h00
        </span>

        <Button
          className="w-full gap-2 text-sm h-9"
          onClick={() => window.open(MASTERCLASS_URL, "_blank")}
        >
          Inscrição na Masterclass (3h)
          <ArrowRight size={14} />
        </Button>
      </div>
    );
  }

  return (
    <div className="border-2 border-[hsl(var(--border))] rounded-2xl p-6 bg-[hsl(var(--white))]">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-bold tracking-widest uppercase text-[hsl(var(--blue-600))] bg-[hsl(var(--blue-50))] border border-[hsl(var(--blue-100))] px-2.5 py-1 rounded-full">
          Próximo passo
        </span>
      </div>

      <h3 className="text-lg font-bold text-[hsl(var(--ink-900))] mb-1">
        Quer ir mais longe?
      </h3>
      <p className="text-[hsl(var(--ink-500))] text-sm mb-5">
        Masterclass — Imagem para Vídeo com IA
      </p>

      <ul className="space-y-3 mb-6">
        <li className="flex items-start gap-3">
          <div className="w-6 h-6 bg-[hsl(var(--blue-50))] rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <Video size={12} className="text-[hsl(var(--blue-600))]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[hsl(var(--ink-900))]">De imagem a vídeo em minutos</p>
            <p className="text-xs text-[hsl(var(--ink-400))]">Técnicas práticas para animar as tuas criações com IA</p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <div className="w-6 h-6 bg-[hsl(var(--blue-50))] rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <Zap size={12} className="text-[hsl(var(--blue-600))]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[hsl(var(--ink-900))]">Prompts e exemplos prontos a usar</p>
            <p className="text-xs text-[hsl(var(--ink-400))]">Biblioteca exclusiva com templates de vídeo para PT</p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <div className="w-6 h-6 bg-[hsl(var(--blue-50))] rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <Users size={12} className="text-[hsl(var(--blue-600))]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[hsl(var(--ink-900))]">Sessão ao vivo + gravação incluída</p>
            <p className="text-xs text-[hsl(var(--ink-400))]">Acesso à sessão e à gravação para rever quando quiseres</p>
          </div>
        </li>
      </ul>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs bg-[hsl(var(--amber-50))] text-[hsl(var(--amber-700))] border border-[hsl(var(--amber-200))] px-2.5 py-1 rounded-full font-medium">
          5 de Março, quinta-feira · 10h00
        </span>
      </div>

      <Button
        className="w-full gap-2"
        onClick={() => window.open(MASTERCLASS_URL, "_blank")}
      >
        Inscrição na Masterclass (3h)
        <ArrowRight size={16} />
      </Button>

      <p className="text-xs text-[hsl(var(--ink-400))] text-center mt-3">
        Grupo limitado. Vagas a esgotar.
      </p>
    </div>
  );
}
