import { BarChart2, LayoutDashboard, Columns, Table, Trash2, LogOut, Menu, X, Zap, MessageSquare, Receipt, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { useWebinarContext } from "@/contexts/WebinarContext";
import { WEBINAR_CONFIG, CONSOLIDADO_COLOR, type WebinarContext as WebinarCtxType } from "@/config/webinarConfig";

export type CRMView = "dashboard" | "pipeline" | "tabela" | "faturacao" | "templates" | "comunicacao" | "lixo";
interface CRMSidebarProps {
  activeView: CRMView;
  onChangeView: (v: CRMView) => void;
  onLogout: () => void;
}

const NAV_ITEMS: { icon: typeof LayoutDashboard; label: string; view: CRMView }[] = [
  { icon: LayoutDashboard, label: "Dashboard", view: "dashboard" },
  { icon: Columns, label: "Pipeline", view: "pipeline" },
  { icon: Table, label: "Tabela", view: "tabela" },
  { icon: Receipt, label: "Faturação", view: "faturacao" },
  { icon: Zap, label: "Automações", view: "templates" },
  { icon: MessageSquare, label: "Comunicação", view: "comunicacao" },
  { icon: Trash2, label: "Lixo", view: "lixo" },
];

function getSidebarSubtitle(ctx: WebinarCtxType): string {
  if (ctx === "consolidado") return "Todos os Webinars";
  return WEBINAR_CONFIG[ctx].sidebarSubtitle;
}

const WEBINAR_OPTIONS: { key: WebinarCtxType; emoji: string; label: string; color: string }[] = [
  { key: "consolidado", emoji: "⊕", label: "Todos", color: CONSOLIDADO_COLOR },
  ...Object.entries(WEBINAR_CONFIG).map(([key, cfg]) => ({
    key: key as WebinarCtxType,
    emoji: cfg.emoji,
    label: cfg.label,
    color: cfg.color,
  })),
];

function SidebarContent({ activeView, onChangeView, onLogout }: CRMSidebarProps) {
  const { webinarContext, setWebinarContext } = useWebinarContext();
  const activeOption = WEBINAR_OPTIONS.find((o) => o.key === webinarContext) || WEBINAR_OPTIONS[0];

  return (
    <div className="flex flex-col h-full py-5 px-3">
      {/* Logo */}
      <div className="px-3 pb-3 mb-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <BarChart2 size={22} className="text-blue-300" />
          <span className="font-heading font-extrabold text-base text-white">WebinarCRM</span>
        </div>
      </div>

      {/* Webinar selector */}
      <div className="px-1 py-3 mb-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-[10px] font-bold uppercase tracking-wider mb-2 px-2" style={{ color: "rgba(255,255,255,0.30)" }}>
          Webinar
        </p>
        <div className="relative">
          <select
            value={webinarContext}
            onChange={(e) => setWebinarContext(e.target.value as WebinarCtxType)}
            className="w-full appearance-none rounded-md px-3 py-2 pr-8 text-[13px] font-semibold text-white cursor-pointer focus:outline-none focus:ring-1"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.10)",
              focusRingColor: activeOption.color,
            }}
          >
            {WEBINAR_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.emoji} {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "rgba(255,255,255,0.40)" }}
          />
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-md"
            style={{ background: activeOption.color }}
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 mt-3">
        {NAV_ITEMS.map((item) => {
          const active = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onChangeView(item.view)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: active ? "rgba(37,99,235,0.20)" : "transparent",
                color: active ? "#60A5FA" : "rgba(255,255,255,0.55)",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.80)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                }
              }}
            >
              <item.icon size={18} style={{ color: active ? "#60A5FA" : "rgba(255,255,255,0.35)" }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="mt-auto" />

      {/* Logout */}
      <button
        onClick={onLogout}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-colors"
        style={{ color: "rgba(255,255,255,0.30)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(239,68,68,0.15)";
          e.currentTarget.style.color = "#f87171";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "rgba(255,255,255,0.30)";
        }}
      >
        <LogOut size={18} />
        Sair
      </button>
    </div>
  );
}

export default function CRMSidebar(props: CRMSidebarProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (!isMobile) {
    return (
      <aside
        className="fixed left-0 top-0 h-screen w-[240px] z-40 overflow-y-auto"
        style={{ background: "#0F172A", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        <SidebarContent {...props} />
      </aside>
    );
  }

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg"
        style={{ background: "#0F172A" }}
        aria-label="Abrir menu"
      >
        <Menu size={22} className="text-white" />
      </button>

      {/* Overlay + Drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setOpen(false)}
          />
          <aside
            className="fixed left-0 top-0 h-screen w-[240px] z-50 overflow-y-auto"
            style={{ background: "#0F172A" }}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>
            <SidebarContent
              {...props}
              onChangeView={(v) => {
                props.onChangeView(v);
                setOpen(false);
              }}
            />
          </aside>
        </>
      )}
    </>
  );
}
