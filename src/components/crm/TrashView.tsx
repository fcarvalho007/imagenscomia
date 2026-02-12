import { useMemo, useState, useCallback } from "react";
import { Search, Trash2, X, AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Inscrito } from "@/pages/crm/mockData";
import { genderEmoji } from "@/lib/genderDetection";

interface TrashViewProps {
  inscritos: Inscrito[];
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

const GRADIENTS = [
  "linear-gradient(135deg,#1e3a5f,#3b82f6)",
  "linear-gradient(135deg,#064e3b,#10b981)",
  "linear-gradient(135deg,#7c2d12,#f97316)",
  "linear-gradient(135deg,#1e1b4b,#7c3aed)",
  "linear-gradient(135deg,#0c4a6e,#0284c7)",
  "linear-gradient(135deg,#134e4a,#0d9488)",
];

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${months[d.getMonth()]} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

const PLAN_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  free: { bg: "hsl(var(--surface))", color: "hsl(var(--ink-400))", label: "Gratuito" },
  premium: { bg: "hsl(var(--blue-50))", color: "hsl(var(--blue-600))", label: "Premium" },
  masterclass: { bg: "rgba(124,58,237,0.1)", color: "#7C3AED", label: "MC" },
  bundle: { bg: "hsl(var(--green-50))", color: "hsl(var(--green-600))", label: "Bundle" },
};

export default function TrashView({ inscritos, onDelete, onRestore }: TrashViewProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const archived = useMemo(() => inscritos.filter((i) => i.status === "arquivado"), [inscritos]);

  const filtered = useMemo(() => {
    if (!search.trim()) return archived;
    const q = search.toLowerCase();
    return archived.filter((i) => i.nome.toLowerCase().includes(q) || i.email.toLowerCase().includes(q));
  }, [archived, search]);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const allSelected = filtered.length > 0 && filtered.every((i) => selected.has(i.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  };

  const handleBulkDelete = () => {
    if (!confirm(`Eliminar definitivamente ${selected.size} inscrito(s)? Esta acção é irreversível.`)) return;
    selected.forEach((id) => onDelete(id));
    setSelected(new Set());
  };

  const handleDelete = (id: string, nome: string) => {
    if (!confirm(`Eliminar definitivamente "${nome}"? Esta acção é irreversível.`)) return;
    onDelete(id);
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
  };

  return (
    <div className="p-7 max-sm:p-4 bg-off-white min-h-screen">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Trash2 size={20} className="text-ink-400" />
          <h1 className="font-heading font-bold text-[22px] text-ink-900">Lixo</h1>
        </div>
        <p className="text-sm text-ink-500">{archived.length} inscrito(s) arquivado(s)</p>
      </div>

      {archived.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <Trash2 size={40} className="mx-auto text-ink-200 mb-3" />
          <p className="text-ink-500 font-medium">Sem inscritos arquivados</p>
          <p className="text-sm text-ink-400 mt-1">Os inscritos arquivados aparecem aqui para eliminação definitiva.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2.5 mb-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar..."
                className="pl-9 pr-3 py-2 text-sm bg-white border border-border rounded-lg w-[240px] outline-none focus:ring-1 focus:ring-blue-300"
              />
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-off-white border-b-2 border-border">
                    <th className="px-3 py-3 w-10">
                      <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="Seleccionar todos" />
                    </th>
                    <th className="px-4 py-3 text-left font-heading font-semibold text-xs text-ink-500 uppercase tracking-wider">Nome</th>
                    <th className="px-4 py-3 text-left font-heading font-semibold text-xs text-ink-500 uppercase tracking-wider max-md:hidden">Email</th>
                    <th className="px-4 py-3 text-left font-heading font-semibold text-xs text-ink-500 uppercase tracking-wider">Plano</th>
                    <th className="px-4 py-3 text-left font-heading font-semibold text-xs text-ink-500 uppercase tracking-wider">Inscrição</th>
                    <th className="px-4 py-3 w-[180px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((i) => {
                    const badge = PLAN_BADGE[i.plan];
                    const gradIdx = parseInt(i.id, 10) % GRADIENTS.length;
                    const isSelected = selected.has(i.id);
                    return (
                      <tr key={i.id} className={`border-b border-border transition-colors ${isSelected ? "bg-red-50/50" : "hover:bg-off-white"}`}>
                        <td className="px-3 py-3">
                          <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(i.id)} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white font-heading font-bold text-[11px] opacity-50"
                              style={{ background: GRADIENTS[gradIdx] }}
                            >
                              {getInitials(i.nome)}
                            </div>
                            <span className="font-semibold text-[14px] text-ink-700">{genderEmoji(i.gender)} {i.nome}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-ink-500 max-md:hidden">{i.email}</td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-ink-500">{formatDate(i.timestamp)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => onRestore(i.id)}
                              className="text-[12px] font-medium px-3 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              Restaurar
                            </button>
                            <button
                              onClick={() => handleDelete(i.id, i.nome)}
                              className="text-[12px] font-medium px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-5 py-3 rounded-[14px] animate-in slide-in-from-bottom duration-200"
          style={{ background: "#0F172A", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}
        >
          <span className="font-heading font-semibold text-[14px] text-white">{selected.size} seleccionados</span>
          <div className="h-5" style={{ borderLeft: "1px solid rgba(255,255,255,0.15)" }} />
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 text-[13px] font-medium text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 size={14} /> Eliminar definitivamente
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-1" style={{ color: "rgba(255,255,255,0.40)" }}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
