import { BarChart2, LayoutDashboard, Columns, Table, Trash2, LogOut, Menu, X, Zap } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export type CRMView = "dashboard" | "pipeline" | "tabela" | "templates" | "lixo";
interface CRMSidebarProps {
  activeView: CRMView;
  onChangeView: (v: CRMView) => void;
  onLogout: () => void;
}

const NAV_ITEMS: { icon: typeof LayoutDashboard; label: string; view: CRMView }[] = [
  { icon: LayoutDashboard, label: "Dashboard", view: "dashboard" },
  { icon: Columns, label: "Pipeline", view: "pipeline" },
  { icon: Table, label: "Tabela", view: "tabela" },
  { icon: Zap, label: "Follow-up", view: "templates" },
  { icon: Trash2, label: "Lixo", view: "lixo" },
];

function SidebarContent({ activeView, onChangeView, onLogout }: CRMSidebarProps) {
  return (
    <div className="flex flex-col h-full py-5 px-3">
      {/* Logo */}
      <div className="px-3 pb-5 mb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <BarChart2 size={22} className="text-blue-300" />
          <span className="font-heading font-extrabold text-base text-white">WebinarCRM</span>
        </div>
        <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
          18 Fev · Imagens IA
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
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

      {/* Event badge */}
      <div
        className="rounded-lg p-2.5 mb-2 mx-1"
        style={{ background: "rgba(22,163,74,0.12)", border: "1px solid rgba(22,163,74,0.20)" }}
      >
        <p className="font-heading font-semibold text-xs" style={{ color: "#4ADE80" }}>
          🗓 18 Fev · 10h00
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>
          Ao vivo · 7 dias
        </p>
      </div>

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
