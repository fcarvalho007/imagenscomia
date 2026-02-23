import { useWebinarContext } from "@/contexts/WebinarContext";
import { WEBINAR_CONFIG, CONSOLIDADO_COLOR, type WebinarContext as WebinarCtxType } from "@/config/webinarConfig";

const ITEMS: { key: WebinarCtxType; emoji: string; label: string; activeColor: string }[] = [
  { key: "imagens", emoji: "📷", label: "Imagens", activeColor: WEBINAR_CONFIG.imagens.color },
  { key: "video", emoji: "🎬", label: "Vídeo", activeColor: WEBINAR_CONFIG.video.color },
  { key: "consolidado", emoji: "⊕", label: "Todos", activeColor: CONSOLIDADO_COLOR },
];

export default function WebinarSwitcherBar() {
  const { webinarContext, setWebinarContext } = useWebinarContext();

  return (
    <div className="flex gap-1 p-1 rounded-lg border border-[#e5e7eb]" style={{ background: "rgba(0,0,0,0.04)" }}>
      {ITEMS.map((it) => {
        const active = webinarContext === it.key;
        return (
          <button
            key={it.key}
            onClick={() => setWebinarContext(it.key)}
            className={`flex items-center gap-1 rounded-[6px] px-3 py-[5px] text-xs font-semibold transition-colors ${
              active ? "text-white" : "text-[#888] hover:text-[#333]"
            }`}
            style={active ? { background: it.activeColor } : undefined}
          >
            <span>{it.emoji}</span>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
