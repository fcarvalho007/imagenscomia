import { useState, useMemo, useEffect } from "react";
import { User, Copy, ExternalLink, MessageSquare, Filter, X } from "lucide-react";
import { toast } from "sonner";
import type { Inscrito } from "@/pages/crm/mockData";
import type { AuditFilter } from "./FollowUpView";

interface MessageLog {
  id: string;
  registration_id: string;
  template_key: string;
  provider: string;
  status: string;
  provider_message_id: string | null;
  error: string | null;
  created_at: string;
}

interface Props {
  inscritos: Inscrito[];
  logs: MessageLog[];
  logsLoading: boolean;
  initialFilter: AuditFilter;
  onSelectInscrito: (i: Inscrito) => void;
}

type StageFilter = "all" | "0" | "1" | "2" | "3+";
type AgeBucket = "all" | "0-2h" | "2-12h" | "12-24h" | "24-48h" | "48h+";

function fmtRelative(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function fmtDateTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const PLAN_VALUES: Record<string, string> = {
  premium: "15€",
  masterclass: "47€",
  bundle: "57€",
};

export default function FollowUpPessoas({ inscritos, logs, logsLoading, initialFilter, onSelectInscrito }: Props) {
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");
  const [semResend, setSemResend] = useState(false);
  const [emAtraso, setEmAtraso] = useState(false);
  const [linkExpirado, setLinkExpirado] = useState(false);
  const [falhaEmail, setFalhaEmail] = useState(false);
  const [ageBucket, setAgeBucket] = useState<AgeBucket>("all");

  // Apply initial filter from alerts
  useEffect(() => {
    if (initialFilter.semResend) setSemResend(true);
    if (initialFilter.emAtraso) setEmAtraso(true);
    if (initialFilter.linkExpirado) setLinkExpirado(true);
    if (initialFilter.ageBucket) setAgeBucket(initialFilter.ageBucket as AgeBucket);
  }, [initialFilter]);

  const resendIds = useMemo(() =>
    new Set(logs.filter(l => l.provider === "resend" && l.status === "sent" && l.provider_message_id).map(l => l.registration_id)),
    [logs]
  );

  const failedIds24 = useMemo(() => {
    const cutoff = new Date(Date.now() - 24 * 3600000).toISOString();
    return new Set(logs.filter(l => l.status === "failed" && l.created_at >= cutoff).map(l => l.registration_id));
  }, [logs]);

  const nowISO = new Date().toISOString();
  const h48ago = new Date(Date.now() - 48 * 3600000).toISOString();

  const pipeline = useMemo(() =>
    inscritos.filter(i => i.plan_selected && i.plan_selected !== "free" && !i.paid_at),
    [inscritos]
  );

  const filtered = useMemo(() => {
    let list = pipeline;

    if (stageFilter !== "all") {
      if (stageFilter === "3+") list = list.filter(i => i.followup_stage >= 3);
      else list = list.filter(i => i.followup_stage === Number(stageFilter));
    }
    if (semResend) list = list.filter(i => !resendIds.has(i.id));
    if (emAtraso) list = list.filter(i => i.next_followup_at && i.next_followup_at < nowISO && !i.do_not_contact);
    if (linkExpirado) list = list.filter(i => i.payment_link_created_at && i.payment_link_created_at < h48ago);
    if (falhaEmail) list = list.filter(i => failedIds24.has(i.id));

    if (ageBucket !== "all") {
      const nowMs = Date.now();
      const bucketMs: Record<string, [number, number]> = {
        "0-2h": [0, 2 * 3600000],
        "2-12h": [2 * 3600000, 12 * 3600000],
        "12-24h": [12 * 3600000, 24 * 3600000],
        "24-48h": [24 * 3600000, 48 * 3600000],
        "48h+": [48 * 3600000, Infinity],
      };
      const [minMs, maxMs] = bucketMs[ageBucket];
      list = list.filter(i => {
        const intentDate = i.upgrade_clicked_at || i.timestamp;
        if (!intentDate) return ageBucket === "48h+";
        const ageMs = nowMs - new Date(intentDate).getTime();
        return ageMs >= minMs && ageMs < maxMs;
      });
    }

    return list;
  }, [pipeline, stageFilter, semResend, emAtraso, linkExpirado, falhaEmail, ageBucket, resendIds, failedIds24, nowISO, h48ago]);

  const hasFilters = stageFilter !== "all" || semResend || emAtraso || linkExpirado || falhaEmail || ageBucket !== "all";

  const clearFilters = () => {
    setStageFilter("all");
    setSemResend(false);
    setEmAtraso(false);
    setLinkExpirado(false);
    setFalhaEmail(false);
    setAgeBucket("all");
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copiado");
  };

  const getMotivo = (i: Inscrito): string => {
    if (i.do_not_contact) return "DNC";
    if (i.next_followup_at && i.next_followup_at < nowISO) return "Em atraso";
    if (!resendIds.has(i.id)) return "Sem Resend";
    if (i.payment_link_created_at && i.payment_link_created_at < h48ago) return "Link expirado";
    return "OK";
  };

  const motivoColor = (motivo: string) => {
    switch (motivo) {
      case "Em atraso": return { bg: "#FEF3C7", color: "#92400E" };
      case "Sem Resend": return { bg: "#FEE2E2", color: "#991B1B" };
      case "Link expirado": return { bg: "#FFEDD5", color: "#9A3412" };
      case "DNC": return { bg: "#F1F5F9", color: "#64748B" };
      default: return { bg: "#DCFCE7", color: "#166534" };
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={14} style={{ color: "#64748B" }} />

        {/* Stage chips */}
        {(["all", "0", "1", "2", "3+"] as StageFilter[]).map(s => (
          <button
            key={s}
            onClick={() => setStageFilter(s)}
            className="px-2.5 py-1 rounded-full text-[12px] font-medium transition-colors"
            style={{
              background: stageFilter === s ? "#2563EB" : "#F1F5F9",
              color: stageFilter === s ? "#fff" : "#64748B",
            }}
          >
            {s === "all" ? "Todas" : `Etapa ${s}`}
          </button>
        ))}

        <span className="w-px h-5" style={{ background: "#E2E8F0" }} />

        {/* Toggle filters */}
        {[
          { label: "Sem Resend", active: semResend, toggle: () => setSemResend(!semResend) },
          { label: "Em atraso", active: emAtraso, toggle: () => setEmAtraso(!emAtraso) },
          { label: "Link expirado", active: linkExpirado, toggle: () => setLinkExpirado(!linkExpirado) },
          { label: "Falha email", active: falhaEmail, toggle: () => setFalhaEmail(!falhaEmail) },
        ].map(f => (
          <button
            key={f.label}
            onClick={f.toggle}
            className="px-2.5 py-1 rounded-full text-[12px] font-medium transition-colors"
            style={{
              background: f.active ? "#FEF3C7" : "#F1F5F9",
              color: f.active ? "#92400E" : "#64748B",
              border: f.active ? "1px solid rgba(245,158,11,0.3)" : "1px solid transparent",
            }}
          >
            {f.label}
          </button>
        ))}

        {/* Age bucket dropdown */}
        <select
          value={ageBucket}
          onChange={e => setAgeBucket(e.target.value as AgeBucket)}
          className="px-2 py-1 rounded-lg text-[12px] border"
          style={{ borderColor: ageBucket !== "all" ? "#2563EB" : "#E2E8F0", color: "#0F172A" }}
        >
          <option value="all">Idade: todas</option>
          <option value="0-2h">0–2h</option>
          <option value="2-12h">2–12h</option>
          <option value="12-24h">12–24h</option>
          <option value="24-48h">24–48h</option>
          <option value="48h+">48h+</option>
        </select>

        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-[12px] font-medium" style={{ color: "#EF4444" }}>
            <X size={12} /> Limpar
          </button>
        )}
      </div>

      {/* Summary */}
      <p className="text-[13px] font-medium" style={{ color: "#64748B" }}>
        {filtered.length} pessoa{filtered.length !== 1 ? "s" : ""} no pipeline
        {hasFilters && <span style={{ color: "#94A3B8" }}> (filtrado de {pipeline.length})</span>}
      </p>

      {/* Mobile: cards; Desktop: table */}
      {/* Desktop table */}
      <div className="hidden sm:block rounded-xl border overflow-hidden" style={{ background: "#fff", borderColor: "rgba(0,0,0,0.06)" }}>
        <table className="w-full text-left">
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5" style={{ color: "#64748B" }}>Nome</th>
              <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5" style={{ color: "#64748B" }}>Plano</th>
              <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-center" style={{ color: "#64748B" }}>Etapa</th>
              <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5" style={{ color: "#64748B" }}>Último / Próximo</th>
              <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-center" style={{ color: "#64748B" }}>Resend</th>
              <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-center" style={{ color: "#64748B" }}>Motivo</th>
              <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-center" style={{ color: "#64748B" }}>Acções</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => {
              const motivo = getMotivo(i);
              const mc = motivoColor(motivo);
              return (
                <tr key={i.id} className="border-t" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
                  <td className="px-4 py-2.5">
                    <p className="text-[13px] font-medium" style={{ color: "#0F172A" }}>{i.nome}</p>
                    <p className="text-[11px]" style={{ color: "#94A3B8" }}>{i.email}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[12px] font-medium" style={{ color: "#0F172A" }}>{i.plan_selected}</span>
                    <span className="text-[11px] ml-1" style={{ color: "#94A3B8" }}>{PLAN_VALUES[i.plan_selected || ""] || ""}</span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: "#EFF6FF", color: "#2563EB" }}>
                      {i.followup_stage}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="text-[12px]" style={{ color: "#64748B" }}>
                      {fmtDateTime(i.last_followup_at)} → {i.next_followup_at ? fmtRelative(i.next_followup_at) : "—"}
                    </p>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="text-[12px] font-semibold" style={{ color: resendIds.has(i.id) ? "#10B981" : "#EF4444" }}>
                      {resendIds.has(i.id) ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: mc.bg, color: mc.color }}>
                      {motivo}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onSelectInscrito(i)} className="p-1 rounded hover:bg-blue-50 transition-colors" title="Abrir ficha">
                        <User size={14} style={{ color: "#2563EB" }} />
                      </button>
                      {i.last_payment_link && (
                        <>
                          <button onClick={() => copyLink(i.last_payment_link!)} className="p-1 rounded hover:bg-blue-50 transition-colors" title="Copiar link">
                            <Copy size={14} style={{ color: "#64748B" }} />
                          </button>
                          <a href={i.last_payment_link} target="_blank" rel="noopener" className="p-1 rounded hover:bg-blue-50 transition-colors" title="Abrir link">
                            <ExternalLink size={14} style={{ color: "#64748B" }} />
                          </a>
                        </>
                      )}
                      {i.whatsapp && (
                        <a href={`https://wa.me/${i.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="p-1 rounded hover:bg-green-50 transition-colors" title="WhatsApp">
                          <MessageSquare size={14} style={{ color: "#10B981" }} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[13px]" style={{ color: "#94A3B8" }}>
                  Nenhuma pessoa encontrada com os filtros actuais.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {filtered.map(i => {
          const motivo = getMotivo(i);
          const mc = motivoColor(motivo);
          return (
            <div key={i.id} className="rounded-xl border p-3" style={{ background: "#fff", borderColor: "rgba(0,0,0,0.06)" }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[13px] font-medium" style={{ color: "#0F172A" }}>{i.nome}</p>
                  <p className="text-[11px]" style={{ color: "#94A3B8" }}>{i.email}</p>
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: mc.bg, color: mc.color }}>
                  {motivo}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[12px]" style={{ color: "#64748B" }}>
                <span>{i.plan_selected} {PLAN_VALUES[i.plan_selected || ""] || ""}</span>
                <span>Etapa {i.followup_stage}</span>
                <span style={{ color: resendIds.has(i.id) ? "#10B981" : "#EF4444" }}>
                  Resend: {resendIds.has(i.id) ? "✓" : "✗"}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <button onClick={() => onSelectInscrito(i)} className="px-2 py-1 rounded text-[11px] font-medium" style={{ background: "#EFF6FF", color: "#2563EB" }}>
                  Ficha
                </button>
                {i.last_payment_link && (
                  <button onClick={() => copyLink(i.last_payment_link!)} className="px-2 py-1 rounded text-[11px] font-medium" style={{ background: "#F1F5F9", color: "#64748B" }}>
                    Link
                  </button>
                )}
                {i.whatsapp && (
                  <a href={`https://wa.me/${i.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="px-2 py-1 rounded text-[11px] font-medium" style={{ background: "#DCFCE7", color: "#166534" }}>
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center py-8 text-[13px]" style={{ color: "#94A3B8" }}>Nenhuma pessoa encontrada.</p>
        )}
      </div>
    </div>
  );
}
