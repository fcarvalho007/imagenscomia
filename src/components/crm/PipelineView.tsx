import { useMemo, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Inscrito } from "@/pages/crm/mockData";
import { genderEmoji } from "@/lib/genderDetection";

interface PipelineViewProps {
  inscritos: Inscrito[];
  onSelectInscrito: (i: Inscrito) => void;
}

const PLAN_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  free: { bg: "hsl(var(--surface))", color: "hsl(var(--ink-400))", label: "Gratuito" },
  premium: { bg: "hsl(var(--blue-50))", color: "hsl(var(--blue-600))", label: "Premium" },
  masterclass: { bg: "rgba(124,58,237,0.1)", color: "#7C3AED", label: "MC" },
  bundle: { bg: "hsl(var(--green-50))", color: "hsl(var(--green-600))", label: "Bundle" },
  gravacao: { bg: "rgba(245,158,11,0.1)", color: "#D97706", label: "Gravação" },
  "gravacao-masterclass": { bg: "rgba(124,58,237,0.15)", color: "#7C3AED", label: "Grav+MC" },
};
const DEFAULT_PLAN_BADGE = { bg: "hsl(var(--surface))", color: "hsl(var(--ink-400))", label: "—" };

function formatDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${months[d.getMonth()]} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function pendingTimeLabel(upgradeClickedAt: string | null, timestamp: string): { text: string; color: string } | null {
  const ref = upgradeClickedAt || timestamp;
  const hours = (Date.now() - new Date(ref).getTime()) / 3600000;
  if (hours < 1) return { text: `Há ${Math.round(hours * 60)}min`, color: "hsl(var(--ink-400))" };
  if (hours < 6) return { text: `Há ${Math.round(hours)}h`, color: "hsl(var(--ink-400))" };
  if (hours < 24) return { text: `Há ${Math.round(hours)}h`, color: "#D97706" };
  const days = Math.floor(hours / 24);
  return { text: `Há ${days}d+`, color: "#DC2626" };
}

type Column = {
  title: string;
  color: string;
  filter: (i: Inscrito) => boolean;
};

const COLUMNS: Column[] = [
  { title: "Inscrito", color: "#64748B", filter: (i) => i.plan === "free" && i.step_reached < 5 && !i.follow_up },
  { title: "Flow Completo", color: "#64748B", filter: (i) => i.plan === "free" && i.step_reached === 5 && !i.follow_up },
  { title: "Premium Pass — €15", color: "#2563EB", filter: (i) => i.plan === "premium" && !i.follow_up },
  { title: "Masterclass — €57,81", color: "#7C3AED", filter: (i) => i.plan === "masterclass" && !i.follow_up },
  { title: "Bundle — €76,26", color: "#16A34A", filter: (i) => i.plan === "bundle" && !i.follow_up },
  { title: "Follow-up Necessário", color: "#D97706", filter: (i) => i.follow_up },
];

function PipelineCard({ inscrito, onSelectInscrito }: { inscrito: Inscrito; onSelectInscrito: (i: Inscrito) => void }) {
  const badge = PLAN_BADGE[inscrito.plan] || DEFAULT_PLAN_BADGE;
  return (
    <div
      className="bg-white border border-border rounded-[10px] p-3 shadow-card hover:shadow-card-md hover:-translate-y-px transition-all cursor-pointer"
      onClick={() => onSelectInscrito(inscrito)}
    >
      <span className="font-heading font-semibold text-[14px] text-ink-900 truncate block">
        {genderEmoji(inscrito.gender)} {inscrito.nome}
      </span>
      <p className="text-[11px] text-ink-400 mt-1 truncate">{inscrito.email}</p>
      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
        {inscrito.registration_source === "gravacao" && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-ink-100 text-ink-600">
            PÓS-WEBINAR
          </span>
        )}
        <span
          className="inline-block text-[11px] font-medium px-1.5 py-0.5 rounded-full"
          style={{ background: badge.bg, color: badge.color }}
        >
          {badge.label}
        </span>
        {inscrito.payment_status === "selected" && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
            Seleccionou e saiu
          </span>
        )}
        {inscrito.payment_status === "awaiting_payment" && (
          <>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
              Aguarda pgto
            </span>
            {(() => {
              const pt = pendingTimeLabel(inscrito.upgrade_clicked_at, inscrito.timestamp);
              return pt ? (
                <span className="text-[10px] font-semibold" style={{ color: pt.color }}>{pt.text}</span>
              ) : null;
            })()}
          </>
        )}
        {inscrito.payment_status === "paid" && inscrito.plan !== "free" && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
            Pago
          </span>
        )}
      </div>
      <p className="text-[11px] text-ink-400 mt-1">Inscrição a: {formatDate(inscrito.timestamp)}</p>
    </div>
  );
}

export default function PipelineView({ inscritos, onSelectInscrito }: PipelineViewProps) {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "webinar" | "gravacao">("all");
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set([COLUMNS[0].title]));
  const isMobile = useIsMobile();

  const visibleColumns = useMemo(() => {
    let cols = COLUMNS;
    if (sourceFilter === "gravacao") {
      cols = cols
        .filter((c) => c.title !== "Inscrito" && c.title !== "Flow Completo")
        .map((c) =>
          c.title === "Premium Pass — €15" ? { ...c, title: "Premium Pass — €27" } : c
        );
    }
    return cols;
  }, [sourceFilter]);

  const filtered = useMemo(() => {
    let active = inscritos.filter((i) => i.status === "activo");
    if (sourceFilter !== "all") active = active.filter((i) => i.registration_source === sourceFilter);
    if (!search.trim()) return active;
    const q = search.toLowerCase();
    return active.filter((i) => i.nome.toLowerCase().includes(q) || i.email.toLowerCase().includes(q));
  }, [inscritos, search, sourceFilter]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  return (
    <div className="p-7 max-sm:p-4 bg-off-white min-h-screen">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className="font-heading font-bold text-[22px] text-ink-900">Pipeline</h1>
          <p className="text-sm text-ink-500">Visão kanban dos inscritos por estado</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white border border-border rounded-lg overflow-hidden text-[13px]">
            {(["all", "webinar", "gravacao"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setSourceFilter(f)}
                className={`px-3 py-2 font-medium transition-colors ${sourceFilter === f ? "bg-blue-600 text-white" : "text-ink-600 hover:bg-off-white"}`}
              >
                {f === "all" ? "Todos" : f === "webinar" ? "Pré-webinar" : "Pós-webinar"}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar inscrito..."
              className="pl-9 pr-3 py-2 text-sm bg-white border border-border rounded-lg w-[240px] outline-none focus:ring-1 focus:ring-blue-300"
            />
          </div>
        </div>
      </div>

      {isMobile ? (
        /* ── MOBILE: Accordion layout ── */
        <div className="space-y-2">
          {visibleColumns.map((col) => {
            const items = filtered.filter(col.filter);
            const colRevenue = items.reduce((s, i) => s + i.valor, 0);
            const isOpen = openSections.has(col.title);
            return (
              <div key={col.title} className="bg-white border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection(col.title)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: col.color }} />
                    <span className="font-heading font-semibold text-[13px] text-ink-700">{col.title}</span>
                    <span
                      className="font-heading font-bold text-[11px] px-1.5 py-0.5 rounded-full"
                      style={{ background: `${col.color}26`, color: col.color }}
                    >
                      {items.length}
                    </span>
                    <span className="text-[11px] font-medium" style={{ color: col.color, opacity: 0.7 }}>
                      €{colRevenue.toFixed(2)}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className="text-ink-400 transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 space-y-2">
                    {items.length === 0 ? (
                      <p className="text-[12px] text-ink-400 text-center py-4">Sem inscritos</p>
                    ) : (
                      items.map((inscrito) => (
                        <PipelineCard key={inscrito.id} inscrito={inscrito} onSelectInscrito={onSelectInscrito} />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ── DESKTOP: Kanban horizontal ── */
        <div className="flex gap-3 overflow-x-auto pb-4">
          {visibleColumns.map((col) => {
            const items = filtered.filter(col.filter);
            const colRevenue = items.reduce((s, i) => s + i.valor, 0);
            return (
              <div key={col.title} className="min-w-[220px] max-w-[240px] flex-shrink-0">
                <div className="rounded-t-lg overflow-hidden">
                  <div className="h-1" style={{ background: col.color }} />
                  <div className="px-3 pt-2.5 pb-2 bg-white border-x border-border">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-semibold text-[13px] text-ink-700">{col.title}</span>
                      <span
                        className="font-heading font-bold text-xs px-2 py-0.5 rounded-full"
                        style={{ background: `${col.color}26`, color: col.color }}
                      >
                        {items.length}
                      </span>
                    </div>
                    <p className="text-[12px] font-medium mt-0.5" style={{ color: col.color, opacity: 0.8 }}>
                      €{colRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="bg-surface/50 border-x border-b border-border rounded-b-lg p-2 min-h-[200px] space-y-2">
                  {items.map((inscrito) => (
                    <PipelineCard key={inscrito.id} inscrito={inscrito} onSelectInscrito={onSelectInscrito} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
