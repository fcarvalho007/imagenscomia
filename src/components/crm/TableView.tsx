import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { Search, Download, ChevronsUpDown, ChevronUp, ChevronDown, ExternalLink, Star, Archive, Trash2, X, Filter, CheckCircle2, AlertTriangle, Clock, Send, FileCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Inscrito } from "@/pages/crm/mockData";
import { genderEmoji } from "@/lib/genderDetection";
import { getTemplateLabel, fmtTimeAgo, type LastEmailInfo } from "./templateLabels";
import SendPaymentModal from "./modal/SendPaymentModal";
import { useWebinarContext } from "@/contexts/WebinarContext";
import WebinarBadge from "./WebinarBadge";
import WebinarSwitcherBar from "./WebinarSwitcherBar";

interface TableViewProps {
  inscritos: Inscrito[];
  onSelectInscrito: (i: Inscrito) => void;
  onToggleFollowUp?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  fetchFailedEmailIds?: () => Promise<Set<string>>;
  lastEmailMap?: Map<string, LastEmailInfo>;
  onUpdateStepReached?: (id: string, step: 1 | 2 | 3 | 4 | 5) => Promise<void>;
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

const VALOR_COLORS: Record<number, string> = {
  0: "hsl(var(--ink-400))",
  15: "hsl(var(--blue-600))",
  57.81: "#7C3AED",
  76.26: "hsl(var(--green-600))",
};

function pendingTimeLabel(upgradeClickedAt: string | null, timestamp: string): { text: string; color: string } | null {
  const ref = upgradeClickedAt || timestamp;
  const hours = (Date.now() - new Date(ref).getTime()) / 3600000;
  if (hours < 1) return { text: `${Math.round(hours * 60)}min`, color: "hsl(var(--ink-400))" };
  if (hours < 6) return { text: `${Math.round(hours)}h`, color: "hsl(var(--ink-400))" };
  if (hours < 24) return { text: `${Math.round(hours)}h`, color: "#D97706" };
  const days = Math.floor(hours / 24);
  return { text: `${days}d+`, color: "#DC2626" };
}

function fmtRelativeShort(iso: string): string | null {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return null;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

type SortKey = "nome" | "email" | "whatsapp" | "plan" | "valor" | "step_reached" | "timestamp";
type QuickFilter = null | "awaiting" | "expired_link" | "failed_email" | "do_not_contact" | "backlog_36h" | "no_resend" | "em_atraso";

export default function TableView({ inscritos, onSelectInscrito, onToggleFollowUp, onArchive, onDelete, fetchFailedEmailIds, lastEmailMap, onUpdateStepReached }: TableViewProps) {
  const { webinarContext } = useWebinarContext();
  const isConsolidado = webinarContext === "consolidado";
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [stepFilter, setStepFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
  const [stepDropdownId, setStepDropdownId] = useState<string | null>(null);
  const [sendPaymentInscrito, setSendPaymentInscrito] = useState<Inscrito | null>(null);
  const stepDropdownRef = useRef<HTMLDivElement>(null);
  const PER_PAGE = 100;

  // Fetch failed email IDs once on mount
  useEffect(() => {
    if (fetchFailedEmailIds) {
      fetchFailedEmailIds().then(setFailedIds);
    }
  }, [fetchFailedEmailIds]);

  const active = useMemo(() => inscritos.filter((i) => i.status === "activo"), [inscritos]);

  // Quick filter counts
  const counts = useMemo(() => {
    const now = Date.now();
    const h48 = 48 * 60 * 60 * 1000;
    const h36 = 36 * 60 * 60 * 1000;
    const nowISO = new Date().toISOString();
    const unpaidIntent = active.filter((i) => !i.paid_at && i.plan_selected && i.plan_selected !== "free");
    return {
      awaiting: unpaidIntent.length,
      expired_link: active.filter((i) => !i.paid_at && i.payment_link_created_at && (now - new Date(i.payment_link_created_at).getTime()) > h48).length,
      failed_email: active.filter((i) => failedIds.has(i.id)).length,
      do_not_contact: active.filter((i) => i.do_not_contact).length,
      backlog_36h: unpaidIntent.filter((i) => {
        const ref = i.upgrade_clicked_at || i.timestamp;
        return (now - new Date(ref).getTime()) > h36;
      }).length,
      no_resend: lastEmailMap ? unpaidIntent.filter((i) => {
        const info = lastEmailMap.get(i.id);
        return !info || info.provider !== "resend" || !info.provider_message_id;
      }).length : 0,
      em_atraso: active.filter((i) => i.next_followup_at && i.next_followup_at < nowISO && !i.do_not_contact).length,
    };
  }, [active, failedIds, lastEmailMap]);

  const filtered = useMemo(() => {
    let list = active;

    // Quick filters
    if (quickFilter === "awaiting") {
      list = list.filter((i) => !i.paid_at && i.plan_selected && i.plan_selected !== "free");
    } else if (quickFilter === "expired_link") {
      const h48 = 48 * 60 * 60 * 1000;
      list = list.filter((i) => !i.paid_at && i.payment_link_created_at && (Date.now() - new Date(i.payment_link_created_at).getTime()) > h48);
    } else if (quickFilter === "failed_email") {
      list = list.filter((i) => failedIds.has(i.id));
    } else if (quickFilter === "do_not_contact") {
      list = list.filter((i) => i.do_not_contact);
    } else if (quickFilter === "no_resend") {
      list = list.filter((i) => {
        if (i.paid_at || !i.plan_selected || i.plan_selected === "free") return false;
        if (!lastEmailMap) return false;
        const info = lastEmailMap.get(i.id);
        return !info || info.provider !== "resend" || !info.provider_message_id;
      });
    } else if (quickFilter === "em_atraso") {
      const nowISO = new Date().toISOString();
      list = list.filter((i) => i.next_followup_at && i.next_followup_at < nowISO && !i.do_not_contact);
    } else if (quickFilter === "backlog_36h") {
      const h36 = 36 * 60 * 60 * 1000;
      list = list.filter((i) => {
        if (i.paid_at || !i.plan_selected || i.plan_selected === "free") return false;
        const ref = i.upgrade_clicked_at || i.timestamp;
        return (Date.now() - new Date(ref).getTime()) > h36;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.nome.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || (i.whatsapp && i.whatsapp.includes(q)));
    }
    if (planFilter !== "all") list = list.filter((i) => i.plan === planFilter);
    if (paymentFilter !== "all") list = list.filter((i) => i.payment_status === paymentFilter);
    if (stepFilter !== "all") list = list.filter((i) => i.step_reached === Number(stepFilter));

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "nome" || sortKey === "email" || sortKey === "plan") {
        cmp = (a[sortKey] as string).localeCompare(b[sortKey] as string);
      } else if (sortKey === "valor" || sortKey === "step_reached") {
        cmp = (a[sortKey] as number) - (b[sortKey] as number);
      } else {
        cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [active, search, planFilter, paymentFilter, stepFilter, sortKey, sortDir, quickFilter, failedIds, lastEmailMap]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown size={12} className="inline ml-1 text-ink-300" />;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="inline ml-1 text-blue-600" />
      : <ChevronDown size={12} className="inline ml-1 text-blue-600" />;
  };

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allPageSelected = paged.length > 0 && paged.every((i) => selected.has(i.id));
  const somePageSelected = paged.some((i) => selected.has(i.id));

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        paged.forEach((i) => next.delete(i.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        paged.forEach((i) => next.add(i.id));
        return next;
      });
    }
  };

  const exportCSV = (ids?: Set<string>) => {
    const BOM = "\uFEFF";
    const header = "Primeiro Nome;Resto do Nome;Email;WhatsApp;Plano;Valor;Passo;Dúvida;Inscrição;Notas";
    const source = ids ? filtered.filter((i) => ids.has(i.id)) : filtered;
    const rows = source.map((i) =>
      [i.primeiro_nome, i.resto_nome, i.email, i.whatsapp, i.plan, `€${i.valor}`, `${i.step_reached}/5`, `"${i.duvida}"`, i.timestamp, i.notas.length].join(";")
    );
    const csv = BOM + header + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "inscritos_crm.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkFollowUp = () => {
    if (!onToggleFollowUp) return;
    selected.forEach((id) => onToggleFollowUp(id));
    setSelected(new Set());
  };

  const handleBulkArchive = () => {
    if (!onArchive) return;
    if (!confirm(`Arquivar ${selected.size} inscritos?`)) return;
    selected.forEach((id) => onArchive(id));
    setSelected(new Set());
  };

  const toggleQuickFilter = (f: QuickFilter) => {
    setQuickFilter((prev) => prev === f ? null : f);
    setPage(0);
  };

  const chipClass = (f: QuickFilter) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors cursor-pointer select-none ${
      quickFilter === f
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white text-ink-600 border-border hover:bg-off-white"
    }`;

  return (
    <div className="p-7 max-sm:p-4 bg-off-white min-h-screen">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className="font-heading font-bold text-[22px] text-ink-900">Tabela</h1>
          <p className="text-sm text-ink-500">{active.length} inscritos no total</p>
        </div>
        <WebinarSwitcherBar />
      </div>

      {/* Quick Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button className={chipClass("awaiting")} onClick={() => toggleQuickFilter("awaiting")}>
          <Filter size={12} /> Aguardam pagamento
          <span className="text-[10px] opacity-70">({counts.awaiting})</span>
        </button>
        <button className={chipClass("expired_link")} onClick={() => toggleQuickFilter("expired_link")}>
          <Filter size={12} /> Link expirado
          <span className="text-[10px] opacity-70">({counts.expired_link})</span>
        </button>
        <button className={chipClass("failed_email")} onClick={() => toggleQuickFilter("failed_email")}>
          <Filter size={12} /> Falhas de email
          <span className="text-[10px] opacity-70">({counts.failed_email})</span>
        </button>
        <button className={chipClass("do_not_contact")} onClick={() => toggleQuickFilter("do_not_contact")}>
          <Filter size={12} /> Não contactar
          <span className="text-[10px] opacity-70">({counts.do_not_contact})</span>
        </button>
        <button className={chipClass("backlog_36h")} onClick={() => toggleQuickFilter("backlog_36h")}>
          <Filter size={12} /> Backlog 36h+
          <span className="text-[10px] opacity-70">({counts.backlog_36h})</span>
        </button>
        {lastEmailMap && (
          <button className={chipClass("no_resend")} onClick={() => toggleQuickFilter("no_resend")}>
            <Filter size={12} /> Sem Resend confirmado
            <span className="text-[10px] opacity-70">({counts.no_resend})</span>
          </button>
        )}
        <button className={chipClass("em_atraso")} onClick={() => toggleQuickFilter("em_atraso")}>
          <Filter size={12} /> Em atraso
          <span className="text-[10px] opacity-70">({counts.em_atraso})</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2.5 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Pesquisar nome, email ou telefone..."
            className="pl-9 pr-3 py-2 text-sm bg-white border border-border rounded-lg w-[260px] outline-none focus:ring-1 focus:ring-blue-300"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(0); }}
          className="bg-white border border-border rounded-lg py-2 px-3 text-sm outline-none"
        >
          <option value="all">Todos os planos</option>
          <option value="free">Gratuito</option>
          <option value="premium">Premium</option>
          <option value="masterclass">Masterclass</option>
          <option value="bundle">Bundle</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value); setPage(0); }}
          className="bg-white border border-border rounded-lg py-2 px-3 text-sm outline-none"
        >
          <option value="all">Todos os estados</option>
          <option value="selected">Seleccionou e saiu</option>
          <option value="awaiting_payment">Aguarda pagamento</option>
          <option value="paid">Pago</option>
          <option value="free">Gratuito</option>
        </select>
        <select
          value={stepFilter}
          onChange={(e) => { setStepFilter(e.target.value); setPage(0); }}
          className="bg-white border border-border rounded-lg py-2 px-3 text-sm outline-none"
        >
          <option value="all">Todos os passos</option>
          {[1,2,3,4,5].map((s) => <option key={s} value={s}>Passo {s}</option>)}
        </select>
        <button onClick={() => exportCSV()} className="flex items-center gap-1.5 bg-white border border-border rounded-lg py-2 px-3 text-sm font-medium text-ink-700 hover:bg-off-white">
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-off-white border-b-2 border-border">
                <th className="px-3 py-3 w-10">
                  <Checkbox
                    checked={allPageSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Seleccionar todos"
                    {...(somePageSelected && !allPageSelected ? { "data-state": "indeterminate" } : {})}
                  />
                </th>
                {isConsolidado && (
                  <th className="px-3 py-3 text-left font-heading font-semibold text-xs text-ink-500 uppercase tracking-wider min-w-[60px]">
                    Webinar
                  </th>
                )}
                {([
                  { key: "nome" as SortKey, label: "Nome", cls: "min-w-[180px]" },
                  { key: "email" as SortKey, label: "Email", cls: "min-w-[200px] max-md:hidden" },
                  { key: "whatsapp" as SortKey, label: "WhatsApp", cls: "min-w-[140px] max-md:hidden" },
                  { key: "plan" as SortKey, label: "Plano", cls: "min-w-[100px]" },
                  { key: "valor" as SortKey, label: "Valor", cls: "min-w-[80px]" },
                  { key: "step_reached" as SortKey, label: "Passo", cls: "min-w-[80px]" },
                ] as const).map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left font-heading font-semibold text-xs text-ink-500 uppercase tracking-wider cursor-pointer select-none ${col.cls}`}
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}<SortIcon col={col.key} />
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-heading font-semibold text-xs text-ink-500 uppercase tracking-wider min-w-[80px] max-lg:hidden">Origem</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-xs text-ink-500 uppercase tracking-wider min-w-[200px] max-lg:hidden">Dúvida</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-xs text-ink-500 uppercase tracking-wider min-w-[110px] cursor-pointer select-none" onClick={() => toggleSort("timestamp")}>
                  Inscrição<SortIcon col="timestamp" />
                </th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-xs text-ink-500 uppercase tracking-wider min-w-[60px]">Notas</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-xs text-ink-500 uppercase tracking-wider min-w-[70px]" title="Fatura enviada ao cliente">Fatura</th>
                <th className="px-4 py-3 w-[50px]"></th>
              </tr>
            </thead>
            <tbody>
              {paged.map((i) => {
                const badge = PLAN_BADGE[i.plan] || DEFAULT_PLAN_BADGE;
                const isSelected = selected.has(i.id);
                const showFollowupBadges = !i.paid_at && i.plan !== "free" && i.plan_selected && i.plan_selected !== "free";
                const nextRel = i.next_followup_at ? fmtRelativeShort(i.next_followup_at) : null;
                return (
                  <tr
                    key={i.id}
                    className={`border-b border-border hover:bg-off-white cursor-pointer transition-colors ${isSelected ? "bg-blue-50" : ""}`}
                    onClick={() => onSelectInscrito(i)}
                  >
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(i.id)} aria-label={`Seleccionar ${i.nome}`} />
                    </td>
                    {isConsolidado && (
                      <td className="px-3 py-3">
                        <WebinarBadge webinar={i.webinar} />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className="font-semibold text-[15px] text-ink-900">{genderEmoji(i.gender)} {i.nome}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-700 max-md:hidden">{i.email}</td>
                    <td className="px-4 py-3 text-ink-600 max-md:hidden">{i.whatsapp}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>
                          {badge.label}
                        </span>
                        {i.payment_status === "selected" && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                            Seleccionou e saiu
                          </span>
                        )}
                        {i.payment_status === "awaiting_payment" && (
                          <>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                              Aguarda pgto
                            </span>
                            {(() => {
                              const pt = pendingTimeLabel(i.upgrade_clicked_at, i.timestamp);
                              return pt ? (
                                <span className="text-[10px] font-semibold" style={{ color: pt.color }}>{pt.text}</span>
                              ) : null;
                            })()}
                          </>
                        )}
                        {i.payment_status === "paid" && i.plan !== "free" && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                            Pago
                          </span>
                        )}
                        {/* Follow-up badges */}
                        {showFollowupBadges && (
                          <>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-surface text-ink-500 border border-border">
                              Follow-up {Math.min(i.followup_stage, 3)}/3
                            </span>
                            {nextRel && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-surface text-ink-400 border border-border">
                                Próx. {nextRel}
                              </span>
                            )}
                          </>
                        )}
                        {/* Last email badge */}
                        {lastEmailMap && (() => {
                          const info = lastEmailMap.get(i.id);
                          if (!info) return null;
                          const isConfirmed = info.provider === "resend" && info.provider_message_id;
                          const isFailed = info.status === "failed";
                          return (
                            <span className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full border" style={{
                              background: isConfirmed ? "rgba(16,185,129,0.08)" : isFailed ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)",
                              borderColor: isConfirmed ? "rgba(16,185,129,0.2)" : isFailed ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)",
                              color: isConfirmed ? "#059669" : isFailed ? "#DC2626" : "#D97706",
                            }}>
                              {isConfirmed ? <CheckCircle2 size={9} /> : isFailed ? <AlertTriangle size={9} /> : <Clock size={9} />}
                              {getTemplateLabel(info.template_key).split("—")[0].trim()} · {fmtTimeAgo(info.created_at)}
                            </span>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-heading font-bold text-[13px]" style={{ color: VALOR_COLORS[i.valor] || "hsl(var(--ink-400))" }}>
                        €{i.valor}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative" ref={stepDropdownId === i.id ? stepDropdownRef : undefined}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!onUpdateStepReached) return;
                            setStepDropdownId(stepDropdownId === i.id ? null : i.id);
                          }}
                          className={`flex items-center gap-1.5 ${onUpdateStepReached ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                          title={onUpdateStepReached ? "Clique para alterar estágio" : undefined}
                        >
                          <div className="w-12 h-1 rounded-full bg-surface overflow-hidden">
                            <div className="h-full rounded-full bg-blue-600" style={{ width: `${(i.step_reached / 5) * 100}%` }} />
                          </div>
                          <span className="text-xs text-ink-500">{i.step_reached}/5</span>
                        </button>
                        {stepDropdownId === i.id && onUpdateStepReached && (
                          <div
                            className="absolute z-50 top-full left-0 mt-1 bg-white border border-border rounded-xl shadow-lg overflow-hidden"
                            style={{ minWidth: 120 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {([1, 2, 3, 4, 5] as const).map((step) => (
                              <button
                                key={step}
                                onClick={async () => {
                                  setStepDropdownId(null);
                                  await onUpdateStepReached(i.id, step);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-off-white transition-colors ${i.step_reached === step ? "font-semibold text-blue-600" : "text-ink-700"}`}
                              >
                                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: i.step_reached === step ? "#2563EB" : "#CBD5E1" }}>
                                  {i.step_reached === step && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                </div>
                                Passo {step}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-lg:hidden">
                      <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${i.registration_source === "gravacao" ? "bg-ink-100 text-ink-700" : "bg-surface text-ink-400"}`}>
                        {i.registration_source === "gravacao" ? "Gravação" : "Webinar"}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-lg:hidden">
                      {i.duvida ? (
                        <span className="text-xs text-ink-700 block truncate max-w-[200px]" title={i.duvida}>
                          {i.duvida.length > 60 ? i.duvida.slice(0, 60) + "…" : i.duvida}
                        </span>
                      ) : (
                        <span className="text-ink-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-500">{formatDate(i.timestamp)}</td>
                    <td className="px-4 py-3">
                      {i.notas.length > 0 ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                          {i.notas.length}
                        </span>
                      ) : (
                        <span className="text-ink-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {i.invoice_sent ? (
                        <span title="Fatura enviada" className="inline-flex">
                          <FileCheck size={16} className="text-green-600" />
                        </span>
                      ) : (
                        <span className="text-ink-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {!i.paid_at && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setSendPaymentInscrito(i); }}
                            className="text-ink-400 hover:text-blue-600 transition-colors"
                            title="Enviar link de pagamento"
                            aria-label="Enviar link de pagamento"
                          >
                            <Send size={15} />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelectInscrito(i); }}
                          className="text-ink-400 hover:text-blue-600 transition-colors"
                          title="Ver ficha"
                          aria-label="Ver ficha"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
            <span className="text-ink-400">
              Mostrando {page * PER_PAGE + 1}-{Math.min((page + 1) * PER_PAGE, filtered.length)} de {filtered.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 rounded border border-border text-ink-700 disabled:opacity-40 hover:bg-off-white"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 rounded border border-border text-ink-700 disabled:opacity-40 hover:bg-off-white"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-5 py-3 rounded-[14px] animate-in slide-in-from-bottom duration-200"
          style={{ background: "#0F172A", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}
        >
          <span className="font-heading font-semibold text-[14px] text-white">{selected.size} seleccionados</span>
          <div className="h-5" style={{ borderLeft: "1px solid rgba(255,255,255,0.15)" }} />
          <button onClick={() => exportCSV(selected)} className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.80)" }}>
            <Download size={14} /> Exportar
          </button>
          <button onClick={handleBulkFollowUp} className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.80)" }}>
            <Star size={14} /> Follow-up
          </button>
          <button onClick={handleBulkArchive} className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.80)" }}>
            <Archive size={14} /> Arquivar
          </button>
          {onDelete && (
            <button
              onClick={() => {
                if (!confirm(`Eliminar definitivamente ${selected.size} inscrito(s)? Esta acção é irreversível.`)) return;
                selected.forEach((id) => onDelete(id));
                setSelected(new Set());
              }}
              className="flex items-center gap-1.5 text-[13px] font-medium text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 size={14} /> Eliminar
            </button>
          )}
          <button onClick={() => setSelected(new Set())} className="ml-1" style={{ color: "rgba(255,255,255,0.40)" }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* SendPaymentModal */}
      {sendPaymentInscrito && (
        <SendPaymentModal
          inscrito={sendPaymentInscrito}
          onClose={() => setSendPaymentInscrito(null)}
        />
      )}
    </div>
  );
}

