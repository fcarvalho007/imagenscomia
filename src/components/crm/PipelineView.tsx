import { useMemo, useState } from "react";
import { Search, MessageSquare, StickyNote, ExternalLink, MessageCircle } from "lucide-react";
import type { Inscrito } from "@/pages/crm/mockData";

interface PipelineViewProps {
  inscritos: Inscrito[];
  onSelectInscrito: (i: Inscrito) => void;
}

const GRADIENTS = [
  "linear-gradient(135deg,#1e3a5f,#3b82f6)",
  "linear-gradient(135deg,#064e3b,#10b981)",
  "linear-gradient(135deg,#7c2d12,#f97316)",
  "linear-gradient(135deg,#1e1b4b,#7c3aed)",
  "linear-gradient(135deg,#0c4a6e,#0284c7)",
  "linear-gradient(135deg,#134e4a,#0d9488)",
];

const PLAN_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  free: { bg: "hsl(var(--surface))", color: "hsl(var(--ink-400))", label: "Gratuito" },
  premium: { bg: "hsl(var(--blue-50))", color: "hsl(var(--blue-600))", label: "Premium" },
  masterclass: { bg: "rgba(124,58,237,0.1)", color: "#7C3AED", label: "MC" },
  bundle: { bg: "hsl(var(--green-50))", color: "hsl(var(--green-600))", label: "Bundle" },
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${months[d.getMonth()]} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
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
  { title: "Bundle — €72,81", color: "#16A34A", filter: (i) => i.plan === "bundle" && !i.follow_up },
  { title: "Follow-up Necessário", color: "#D97706", filter: (i) => i.follow_up },
];

export default function PipelineView({ inscritos, onSelectInscrito }: PipelineViewProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const active = inscritos.filter((i) => i.status === "activo");
    if (!search.trim()) return active;
    const q = search.toLowerCase();
    return active.filter((i) => i.nome.toLowerCase().includes(q) || i.email.toLowerCase().includes(q));
  }, [inscritos, search]);

  return (
    <div className="p-7 max-sm:p-4 bg-off-white min-h-screen">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className="font-heading font-bold text-[22px] text-ink-900">Pipeline</h1>
          <p className="text-sm text-ink-500">Visão kanban dos inscritos por estado</p>
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

      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const items = filtered.filter(col.filter);
          const colRevenue = items.reduce((s, i) => s + i.valor, 0);
          return (
            <div key={col.title} className="min-w-[220px] max-w-[240px] flex-shrink-0">
              {/* Column header */}
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

              {/* Cards */}
              <div className="bg-surface/50 border-x border-b border-border rounded-b-lg p-2 min-h-[200px] space-y-2">
                {items.map((inscrito) => {
                  const badge = PLAN_BADGE[inscrito.plan];
                  const gradIdx = parseInt(inscrito.id, 10) % GRADIENTS.length;
                  return (
                    <div
                      key={inscrito.id}
                      className="bg-white border border-border rounded-[10px] p-3.5 shadow-card hover:shadow-card-md hover:-translate-y-px transition-all cursor-pointer relative group"
                      onClick={() => onSelectInscrito(inscrito)}
                    >
                      {/* Name */}
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white font-heading font-bold text-[11px]"
                          style={{ background: GRADIENTS[gradIdx] }}
                        >
                          {getInitials(inscrito.nome)}
                        </div>
                        <span className="font-heading font-semibold text-[13px] text-ink-900 truncate">
                          {inscrito.nome}
                        </span>
                      </div>

                      {/* Email */}
                      <p className="text-[11px] text-ink-400 mt-1.5 truncate">{inscrito.email}</p>

                      {/* Badges */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span
                          className="text-[11px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {badge.label}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-surface text-ink-500">
                          Passo {inscrito.step_reached}/5
                        </span>
                      </div>

                      {/* Duvida */}
                      {inscrito.duvida && (
                        <div className="flex items-center gap-1 mt-2">
                          <MessageSquare size={12} className="text-ink-400 shrink-0" />
                          <span className="text-[11px] text-ink-400 truncate max-w-[160px]">
                            {inscrito.duvida}
                          </span>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-ink-400">{formatDate(inscrito.timestamp)}</span>
                        <div className="flex items-center gap-1">
                          <StickyNote
                            size={12}
                            style={{ color: inscrito.notas.length > 0 ? "hsl(var(--amber-500))" : "hsl(var(--ink-300))" }}
                          />
                          <ExternalLink size={12} className="text-ink-300 hover:text-blue-600" />
                        </div>
                      </div>
                      {/* WhatsApp hover button */}
                      {inscrito.whatsapp && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://wa.me/${inscrito.whatsapp.replace(/\D/g, "")}`, "_blank");
                          }}
                          className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1 px-2 py-1 rounded-lg text-white text-[11px]"
                          style={{ background: "#25D366", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                          title="WhatsApp directo"
                        >
                          <MessageCircle size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
