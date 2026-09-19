import { BarChart2, LayoutDashboard, Columns, Table, Trash2, LogOut, Menu, X, Zap, MessageSquare, Receipt, ChevronDown, BookOpen } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { useWebinarContext } from "@/contexts/WebinarContext";
import { WEBINAR_CONFIG, CONSOLIDADO_COLOR, type WebinarContext as WebinarCtxType } from "@/config/webinarConfig";

import { EDITIONS } from "@/lib/course/contract";
import { editionNames } from "@/lib/course/editions";

export type CRMView = "dashboard" | "pipeline" | "tabela" | "faturacao" | "templates" | "comunicacao" | "lixo" | "recursos";
interface CRMSidebarProps {
  activeView: CRMView;
  onChangeView: (v: CRMView) => void;
  onLogout: () => void;
  course?: { edition: string; onEditionChange: (edition: string) => void };
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

function SidebarContent({ activeView, onChangeView, onLogout, course }: CRMSidebarProps) {
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
          Projeto
        </p>
        <div className="relative">
          <select
            aria-label="Projeto"
            value={course ? "curso-ia" : webinarContext}
            onChange={(e) => { if (e.target.value === "curso-ia") window.location.assign("/crm?project=curso-ia"); else if(course) window.location.assign("/crm?webinar="+e.target.value); else setWebinarContext(e.target.value as WebinarCtxType); }}
            className="w-full appearance-none rounded-md px-3 py-2 pr-8 text-[13px] font-semibold text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <option value="curso-ia">Curso de IA</option>
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
            style={{ background: course ? "#60A5FA" : activeOption.color }}
          />
        </div>
      </div>

      {course && <div className="px-1 py-3">
        <label htmlFor="course-edition" className="block text-xs font-semibold text-white/60 mb-2 px-2">Edição</label>
        <select aria-label="Edição" id="course-edition" value={course.edition} onChange={e=>course.onEditionChange(e.target.value)} className="w-full rounded-md px-3 py-2 text-sm text-white bg-white/10 border border-white/10">
          <option value="">Todas as edições</option>{EDITIONS.map(id=><option key={id} value={id}>{editionNames[id]}</option>)}
        </select>
      </div>}
      {/* Nav */}
      <nav className="flex flex-col gap-1 mt-3">
        {(course ? [...NAV_ITEMS.filter(item=>item.view!=="lixo"), {icon:BookOpen,label:"Recursos",view:"recursos" as CRMView}] : NAV_ITEMS).map((item) => {
          const active = activeView === item.view;
          return (
            <button
              key={item.view}
              aria-current={active ? "page" : undefined}
              onClick={() => onChangeView(item.view)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-blue-600/20 text-blue-300' : 'text-white/55 hover:bg-white/5 hover:text-white/80'}`}

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
