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
    <div className="flex bg-white border border-border rounded-lg overflow-hidden text-[13px]">
      {ITEMS.map((it) => {
        const active = webinarContext === it.key;
        return (
          <button
            key={it.key}
            onClick={() => setWebinarContext(it.key)}
            className={`flex items-center gap-1 px-3 py-2 font-medium transition-colors ${
              active ? "text-white" : "text-ink-600 hover:bg-off-white"
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
