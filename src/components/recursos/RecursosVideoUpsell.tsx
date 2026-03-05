import { Check, Video, Zap, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Props {
  hasMasterclass: boolean;
  compact?: boolean;
}

export default function RecursosVideoUpsell({ hasMasterclass, compact = false }: Props) {
  const navigate = useNavigate();

  if (hasMasterclass) {
    return (
      <div className={`bg-green-50 border-2 border-green-200 rounded-2xl text-center shadow-sm ${compact ? "p-4" : "p-6"}`}>
        <div className={`bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 ${compact ? "w-8 h-8" : "w-10 h-10"}`}>
          <Check size={compact ? 16 : 20} className="text-green-600" />
        </div>
        <p className={`font-semibold text-gray-900 ${compact ? "text-sm" : ""}`}>Masterclass incluída ✓</p>
        {compact ? (
          <p className="text-xs text-gray-400 mt-1">Acesso incluído no teu plano.</p>
        ) : (
          <p className="text-sm text-gray-500 mt-1">Detalhes de acesso serão enviados por email próximamente.</p>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-md p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold tracking-widest uppercase text-white bg-white/20 border border-white/30 px-2 py-0.5 rounded-full">
            Próximo passo
          </span>
        </div>
        <p className="text-sm font-bold text-white mb-0.5">Quer ir mais longe?</p>
        <p className="text-xs text-green-100 mb-3">Masterclass — Produção de Vídeo com IA</p>

        <ul className="space-y-2 mb-4">
          {[
            { Icon: Video, text: "De briefing a clip publicável" },
            { Icon: Zap, text: "Ferramentas e workflows avançados" },
            { Icon: Users, text: "Sessão ao vivo + acesso à gravação" },
          ].map(({ Icon, text }, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-green-100">
              <Icon size={12} className="text-white shrink-0" />
              {text}
            </li>
          ))}
        </ul>

        <span className="inline-block text-[10px] bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full font-medium mb-3">
          12 de Março, quinta-feira · 10h00
        </span>

        <Button
          className="w-full gap-2 text-sm h-9 bg-white text-green-700 hover:bg-green-50"
          onClick={() => navigate("/upgrade-video")}
        >
          Inscrição na Masterclass
          <ArrowRight size={14} />
        </Button>
      </div>
    );
  }

  return (
    <div className="border-2 border-green-200 rounded-2xl p-6 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-bold tracking-widest uppercase text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
          Próximo passo
        </span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">Quer ir mais longe?</h3>
      <p className="text-gray-500 text-sm mb-5">Masterclass — Produção de Vídeo com IA</p>

      <ul className="space-y-3 mb-6">
        {[
          { Icon: Video, title: "De briefing a clip publicável", desc: "Método completo de produção de vídeo com IA" },
          { Icon: Zap, title: "Ferramentas e workflows avançados", desc: "Templates e prompts prontos a usar" },
          { Icon: Users, title: "Sessão ao vivo + acesso à gravação", desc: "Acesso à sessão e gravação para rever" },
        ].map(({ Icon, title, desc }, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <Icon size={12} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{title}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          </li>
        ))}
      </ul>

      <span className="inline-block text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium mb-4">
        12 de Março, quinta-feira · 10h00
      </span>

      <Button className="w-full gap-2 bg-green-600 hover:bg-green-700" onClick={() => navigate("/upgrade-video")}>
        Inscrição na Masterclass
        <ArrowRight size={16} />
      </Button>
      <p className="text-xs text-gray-400 text-center mt-3">Grupo limitado. Vagas a esgotar.</p>
    </div>
  );
}
