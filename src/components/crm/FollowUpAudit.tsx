import { useState, useMemo, useEffect } from "react";
import { Copy, ExternalLink, Filter, Link as LinkIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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

const TEMPLATE_LABELS: Record<string, string> = {
  followup_stage_0: "Stage 0 — Lembrete",
  followup_stage_1: "Stage 1 — Reforço",
  followup_stage_2: "Stage 2 — Urgência",
  followup_backlog_checkin: "Backlog — Check-in",
  followup_backlog_weak: "Backlog — Fraco",
  followup_final_before_event: "Final pré-evento",
  reminder_manual: "Lembrete manual",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${months[d.getMonth()]} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    sent: { bg: "rgba(16,185,129,0.12)", color: "#059669" },
    failed: { bg: "rgba(239,68,68,0.12)", color: "#DC2626" },
    queued: { bg: "rgba(245,158,11,0.12)", color: "#D97706" },
  };
  const s = styles[status] || styles.queued;
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

function ProviderBadge({ provider }: { provider: string }) {
  const isResend = provider === "resend";
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{
        background: isResend ? "rgba(37,99,235,0.1)" : "rgba(100,116,139,0.1)",
        color: isResend ? "#2563EB" : "#94A3B8",
      }}
    >
      {provider}
    </span>
  );
}

export default function FollowUpAudit({ inscritos, logs, logsLoading, initialFilter, onSelectInscrito }: Props) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "all">(initialFilter.timeRange || "7d");
  const [provider, setProvider] = useState<"resend" | "internal" | "all">(initialFilter.provider || "all");
  const [status, setStatus] = useState<"sent" | "failed" | "queued" | "all">(initialFilter.status || "all");
  const [templateKey, setTemplateKey] = useState(initialFilter.templateKey || "");
  const [confirmedOnly, setConfirmedOnly] = useState(initialFilter.confirmedOnly || false);

  // Sync with initialFilter changes
  useEffect(() => {
    if (initialFilter.timeRange) setTimeRange(initialFilter.timeRange);
    if (initialFilter.provider) setProvider(initialFilter.provider);
    if (initialFilter.status) setStatus(initialFilter.status);
    if (initialFilter.templateKey !== undefined) setTemplateKey(initialFilter.templateKey);
    if (initialFilter.confirmedOnly !== undefined) setConfirmedOnly(initialFilter.confirmedOnly);
  }, [initialFilter]);

  const inscritoMap = useMemo(() => {
    const m = new Map<string, Inscrito>();
    for (const i of inscritos) m.set(i.id, i);
    return m;
  }, [inscritos]);

  const templateKeys = useMemo(() => [...new Set(logs.map(l => l.template_key))].sort(), [logs]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoff = timeRange === "24h" ? new Date(now - 24*60*60*1000).toISOString()
      : timeRange === "7d" ? new Date(now - 7*24*60*60*1000).toISOString() : "";

    return logs.filter(l => {
      if (cutoff && l.created_at < cutoff) return false;
      if (provider !== "all" && l.provider !== provider) return false;
      if (status !== "all" && l.status !== status) return false;
      if (templateKey && l.template_key !== templateKey) return false;
      if (confirmedOnly && !l.provider_message_id) return false;
      return true;
    });
  }, [logs, timeRange, provider, status, templateKey, confirmedOnly]);

  // Summary
  const resendConfirmed = filtered.filter(l => l.provider === "resend" && l.status === "sent" && l.provider_message_id).length;
  const failedCount = filtered.filter(l => l.status === "failed").length;

  const copyText = (text: string) => { navigator.clipboard.writeText(text); };

  const chipClass = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-[12px] font-medium cursor-pointer transition-colors border ${
      active ? "border-blue-400 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"
    }`;
  const chipBg = (active: boolean) => active ? "rgba(37,99,235,0.08)" : "rgba(241,245,249,0.8)";

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-xl border" style={{ background: "#fff", borderColor: "rgba(0,0,0,0.06)" }}>
        <span className="text-[13px] font-medium" style={{ color: "#0F172A" }}>
          Resend confirmados: <strong className="text-blue-600">{resendConfirmed}</strong>
        </span>
        <span className="text-[13px]" style={{ color: "#94A3B8" }}>|</span>
        <span className="text-[13px] font-medium" style={{ color: "#0F172A" }}>
          Falhas: <strong style={{ color: failedCount > 0 ? "#DC2626" : "#94A3B8" }}>{failedCount}</strong>
        </span>
        <span className="text-[13px]" style={{ color: "#94A3B8" }}>|</span>
        <span className="text-[13px]" style={{ color: "#64748B" }}>
          Total: {filtered.length}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter size={14} style={{ color: "#94A3B8" }} />
        {(["24h", "7d", "all"] as const).map(v => (
          <button key={v} className={chipClass(timeRange === v)} style={{ background: chipBg(timeRange === v) }} onClick={() => setTimeRange(v)}>
            {v === "all" ? "Tudo" : v}
          </button>
        ))}
        <span className="w-px h-5" style={{ background: "#E2E8F0" }} />
        {(["all", "resend", "internal"] as const).map(v => (
          <button key={v} className={chipClass(provider === v)} style={{ background: chipBg(provider === v) }} onClick={() => setProvider(v)}>
            {v === "all" ? "Todos" : v}
          </button>
        ))}
        <span className="w-px h-5" style={{ background: "#E2E8F0" }} />
        {(["all", "sent", "failed", "queued"] as const).map(v => (
          <button key={v} className={chipClass(status === v)} style={{ background: chipBg(status === v) }} onClick={() => setStatus(v)}>
            {v === "all" ? "Todos" : v}
          </button>
        ))}
        <span className="w-px h-5" style={{ background: "#E2E8F0" }} />
        <select
          value={templateKey}
          onChange={e => setTemplateKey(e.target.value)}
          className="text-[12px] border rounded-lg px-2 py-1.5"
          style={{ borderColor: "#E2E8F0", color: "#64748B" }}
        >
          <option value="">Todos templates</option>
          {templateKeys.map(k => <option key={k} value={k}>{TEMPLATE_LABELS[k] || k}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-[12px] cursor-pointer" style={{ color: "#64748B" }}>
          <input type="checkbox" checked={confirmedOnly} onChange={() => setConfirmedOnly(!confirmedOnly)} className="rounded" />
          Só confirmados
        </label>
      </div>

      {/* Table / Cards */}
      {logsLoading ? (
        <p className="text-[13px] py-8 text-center" style={{ color: "#94A3B8" }}>A carregar logs...</p>
      ) : filtered.length === 0 ? (
        <p className="text-[13px] py-8 text-center" style={{ color: "#94A3B8" }}>Nenhum registo encontrado.</p>
      ) : isMobile ? (
        /* Mobile cards */
        <div className="space-y-2">
          {filtered.slice(0, 100).map(l => {
            const reg = inscritoMap.get(l.registration_id);
            return (
              <div key={l.id} className="rounded-xl border p-3" style={{ background: "#fff", borderColor: "rgba(0,0,0,0.06)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-medium" style={{ color: "#0F172A" }}>{reg?.nome || "—"}</span>
                  <span className="text-[11px]" style={{ color: "#94A3B8" }}>{fmtDate(l.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <ProviderBadge provider={l.provider} />
                  <StatusBadge status={l.status} />
                </div>
                <p className="text-[12px] font-mono" style={{ color: "#64748B" }}>{TEMPLATE_LABELS[l.template_key] || l.template_key}</p>
                {l.error && <p className="text-[11px] mt-1" style={{ color: "#DC2626" }}>{l.error}</p>}
                {reg && (
                  <button
                    onClick={() => onSelectInscrito(reg)}
                    className="text-[12px] font-medium mt-2"
                    style={{ color: "#2563EB" }}
                  >
                    Abrir ficha →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop table */
        <div className="rounded-xl border overflow-hidden" style={{ background: "#fff", borderColor: "rgba(0,0,0,0.06)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color: "#64748B" }}>Data</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color: "#64748B" }}>Nome</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color: "#64748B" }}>Template</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color: "#64748B" }}>Provider</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color: "#64748B" }}>Status</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color: "#64748B" }}>ID Msg</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color: "#64748B" }}>Erro</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color: "#64748B" }}>Acções</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map(l => {
                  const reg = inscritoMap.get(l.registration_id);
                  return (
                    <tr key={l.id} className="border-b last:border-0 hover:bg-blue-50/30" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
                      <td className="px-4 py-2.5 text-[12px]" style={{ color: "#64748B" }}>{fmtDate(l.created_at)}</td>
                      <td className="px-4 py-2.5">
                        <p className="text-[13px] font-medium" style={{ color: "#0F172A" }}>{reg?.nome || "—"}</p>
                        <p className="text-[11px]" style={{ color: "#94A3B8" }}>{reg?.email || l.registration_id.slice(0, 8)}</p>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] font-mono" style={{ color: "#64748B" }}>
                        {TEMPLATE_LABELS[l.template_key] || l.template_key}
                      </td>
                      <td className="px-4 py-2.5"><ProviderBadge provider={l.provider} /></td>
                      <td className="px-4 py-2.5"><StatusBadge status={l.status} /></td>
                      <td className="px-4 py-2.5">
                        {l.provider_message_id ? (
                          <button
                            onClick={() => copyText(l.provider_message_id!)}
                            className="flex items-center gap-1 text-[11px] font-mono hover:text-blue-600 transition-colors"
                            style={{ color: "#94A3B8" }}
                            title={l.provider_message_id}
                          >
                            {l.provider_message_id.slice(0, 12)}… <Copy size={10} />
                          </button>
                        ) : <span className="text-[11px]" style={{ color: "#CBD5E1" }}>—</span>}
                      </td>
                      <td className="px-4 py-2.5 max-w-[150px]">
                        {l.error ? (
                          <span className="text-[11px] truncate block" style={{ color: "#DC2626" }} title={l.error}>
                            {l.error.slice(0, 40)}{l.error.length > 40 ? "…" : ""}
                          </span>
                        ) : <span className="text-[11px]" style={{ color: "#CBD5E1" }}>—</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          {reg && (
                            <button
                              onClick={() => onSelectInscrito(reg)}
                              className="text-[11px] font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                              style={{ color: "#2563EB" }}
                            >
                              Ficha
                            </button>
                          )}
                          {reg?.last_payment_link && (
                            <button
                              onClick={() => copyText(reg.last_payment_link!)}
                              className="text-[11px] px-2 py-1 rounded-md hover:bg-slate-50 transition-colors"
                              style={{ color: "#64748B" }}
                              title="Copiar link de pagamento"
                            >
                              <LinkIcon size={12} className="inline" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
