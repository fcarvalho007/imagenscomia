import { useMemo } from "react";
import { Users, Mail, AlertTriangle, Clock, LinkIcon, CheckCircle2, XCircle, Server, ShieldCheck, Timer } from "lucide-react";
import { Progress } from "@/components/ui/progress";
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
  onAlertClick: (filter: AuditFilter) => void;
}

function MetricCard({ label, value, sub, icon: Icon, muted }: { label: string; value: number; sub?: string; icon: any; muted?: boolean }) {
  return (
    <div
      className="rounded-xl border p-4 flex items-start gap-3"
      style={{
        background: muted ? "rgba(241,245,249,0.7)" : "#fff",
        borderColor: "rgba(0,0,0,0.06)",
        opacity: muted ? 0.6 : 1,
      }}
    >
      <div className="p-2 rounded-lg" style={{ background: muted ? "rgba(100,116,139,0.08)" : "rgba(37,99,235,0.08)" }}>
        <Icon size={18} style={{ color: muted ? "#94A3B8" : "#2563EB" }} />
      </div>
      <div>
        <p className="text-[22px] font-bold font-heading" style={{ color: "#0F172A" }}>{value}</p>
        <p className="text-[12px] font-medium" style={{ color: "#64748B" }}>{label}</p>
        {sub && <p className="text-[11px]" style={{ color: "#94A3B8" }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function FollowUpOverview({ inscritos, logs, logsLoading, onAlertClick }: Props) {
  const now = Date.now();
  const h24 = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const d7 = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Pipeline
  const pipeline = useMemo(() =>
    inscritos.filter(i => i.plan_selected && i.plan_selected !== "free" && !i.paid_at),
    [inscritos]
  );

  // Resend confirmed IDs
  const resendIds = useMemo(() =>
    new Set(logs.filter(l => l.provider === "resend" && l.status === "sent" && l.provider_message_id).map(l => l.registration_id)),
    [logs]
  );

  // Failed IDs (24h)
  const failedIds24 = useMemo(() =>
    new Set(logs.filter(l => l.status === "failed" && l.created_at >= h24).map(l => l.registration_id)),
    [logs, h24]
  );

  // Funnel
  const funnel = useMemo(() => {
    const stage0 = pipeline.filter(i => i.followup_stage === 0).length;
    const stage1 = pipeline.filter(i => i.followup_stage === 1).length;
    const stage2 = pipeline.filter(i => i.followup_stage === 2).length;
    const done = pipeline.filter(i => i.followup_stage >= 3).length;
    const dnc = pipeline.filter(i => i.do_not_contact).length;
    const paid = inscritos.filter(i => i.paid_at).length;
    const total = pipeline.length || 1;
    return { stage0, stage1, stage2, done, dnc, paid, total };
  }, [pipeline, inscritos]);

  // Email metrics
  const metrics = useMemo(() => {
    const resendConfirmed = (cutoff: string) => logs.filter(l => l.provider === "resend" && l.status === "sent" && l.provider_message_id && l.created_at >= cutoff).length;
    const failed = (cutoff: string) => logs.filter(l => l.status === "failed" && l.created_at >= cutoff).length;
    const internal = (cutoff: string) => logs.filter(l => l.provider === "internal" && l.status === "sent" && l.created_at >= cutoff).length;
    return {
      resend24: resendConfirmed(h24), resend7d: resendConfirmed(d7),
      failed24: failed(h24), failed7d: failed(d7),
      internal24: internal(h24), internal7d: internal(d7),
    };
  }, [logs, h24, d7]);

  // Coverage KPI
  const coverage = useMemo(() => {
    const total = pipeline.length || 1;
    const covered = pipeline.filter(i => resendIds.has(i.id)).length;
    const perStage = [0, 1, 2].map(s => {
      const stageList = pipeline.filter(i => i.followup_stage === s);
      const stageCovered = stageList.filter(i => resendIds.has(i.id)).length;
      return { stage: s, total: stageList.length, covered: stageCovered };
    });
    return { total, covered, pct: Math.round((covered / total) * 100), perStage };
  }, [pipeline, resendIds]);

  // SLA buckets
  const slaBuckets = useMemo(() => {
    const nowMs = Date.now();
    const nowISO = new Date().toISOString();
    const bucketDefs = [
      { label: "0–2h", minMs: 0, maxMs: 2 * 3600000 },
      { label: "2–12h", minMs: 2 * 3600000, maxMs: 12 * 3600000 },
      { label: "12–24h", minMs: 12 * 3600000, maxMs: 24 * 3600000 },
      { label: "24–48h", minMs: 24 * 3600000, maxMs: 48 * 3600000 },
      { label: "48h+", minMs: 48 * 3600000, maxMs: Infinity },
    ];
    return bucketDefs.map(b => {
      const inBucket = pipeline.filter(i => {
        const intentDate = i.upgrade_clicked_at || i.timestamp;
        if (!intentDate) return b.label === "48h+";
        const ageMs = nowMs - new Date(intentDate).getTime();
        return ageMs >= b.minMs && ageMs < b.maxMs;
      });
      const semResend = inBucket.filter(i => !resendIds.has(i.id)).length;
      const emAtraso = inBucket.filter(i => i.next_followup_at && i.next_followup_at < nowISO && !i.do_not_contact).length;
      return { label: b.label, total: inBucket.length, semResend, emAtraso };
    });
  }, [pipeline, resendIds]);

  // Per-template breakdown (7d, Resend confirmed)
  const templateBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of logs) {
      if (l.provider === "resend" && l.provider_message_id && l.created_at >= d7) {
        counts[l.template_key] = (counts[l.template_key] || 0) + 1;
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [logs, d7]);
  const maxTemplateCount = templateBreakdown.length > 0 ? templateBreakdown[0][1] : 1;

  // Protocol alerts
  const alerts = useMemo(() => {
    const noResend = pipeline.filter(i => !resendIds.has(i.id)).length;
    const withFailed = pipeline.filter(i => failedIds24.has(i.id)).length;
    const h48ago = new Date(now - 48 * 3600000).toISOString();
    const expiredLink = pipeline.filter(i => i.payment_link_created_at && i.payment_link_created_at < h48ago).length;
    const nowISO = new Date().toISOString();
    const overdue = pipeline.filter(i => i.next_followup_at && i.next_followup_at < nowISO && !i.do_not_contact).length;
    return { noResend, withFailed, expiredLink, overdue };
  }, [pipeline, resendIds, failedIds24, now]);

  const funnelCards = [
    { label: "Etapa 0", count: funnel.stage0, color: "#3B82F6" },
    { label: "Etapa 1", count: funnel.stage1, color: "#8B5CF6" },
    { label: "Etapa 2", count: funnel.stage2, color: "#F59E0B" },
    { label: "Concluído", count: funnel.done, color: "#10B981" },
    { label: "Não contactar", count: funnel.dnc, color: "#EF4444" },
    { label: "Pagos", count: funnel.paid, color: "#059669" },
  ];

  const alertItems = [
    { label: "Sem email Resend", count: alerts.noResend, icon: Mail, filter: { subTab: "pessoas" as const, semResend: true } },
    { label: "Com falha de email", count: alerts.withFailed, icon: XCircle, filter: { subTab: "envios" as const, status: "failed" as const, timeRange: "24h" as const } },
    { label: "Link expirado (48h+)", count: alerts.expiredLink, icon: LinkIcon, filter: { subTab: "pessoas" as const, linkExpirado: true } },
    { label: "Em atraso", count: alerts.overdue, icon: Clock, filter: { subTab: "pessoas" as const, emAtraso: true } },
  ];

  return (
    <div className="space-y-6">
      {/* Funnel */}
      <div>
        <h2 className="font-heading font-bold text-[15px] mb-3" style={{ color: "#0F172A" }}>
          <Users size={16} className="inline mr-1.5" style={{ color: "#2563EB" }} />
          Funil de follow-up
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {funnelCards.map(c => (
            <div key={c.label} className="rounded-xl border p-3" style={{ background: "#fff", borderColor: "rgba(0,0,0,0.06)" }}>
              <p className="text-[22px] font-bold font-heading" style={{ color: c.color }}>{c.count}</p>
              <p className="text-[12px] font-medium" style={{ color: "#64748B" }}>{c.label}</p>
              <Progress value={funnel.total > 0 ? (c.count / funnel.total) * 100 : 0} className="h-1.5 mt-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Coverage KPI */}
      <div>
        <h2 className="font-heading font-bold text-[15px] mb-3" style={{ color: "#0F172A" }}>
          <ShieldCheck size={16} className="inline mr-1.5" style={{ color: "#10B981" }} />
          Cobertura Resend
        </h2>
        <div className="rounded-xl border p-4" style={{ background: "#fff", borderColor: "rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-4 mb-3">
            <div className="text-[32px] font-bold font-heading" style={{ color: coverage.pct >= 80 ? "#10B981" : coverage.pct >= 50 ? "#F59E0B" : "#EF4444" }}>
              {coverage.pct}%
            </div>
            <div>
              <p className="text-[13px] font-medium" style={{ color: "#0F172A" }}>{coverage.covered} de {pipeline.length} com Resend confirmado</p>
              <p className="text-[11px]" style={{ color: "#94A3B8" }}>Pipeline pendente com ≥1 email confirmado via Resend</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {coverage.perStage.map(s => (
              <div key={s.stage} className="rounded-lg p-2" style={{ background: "#F8FAFC" }}>
                <p className="text-[11px] font-medium" style={{ color: "#64748B" }}>Etapa {s.stage}</p>
                <p className="text-[15px] font-bold" style={{ color: "#0F172A" }}>
                  {s.total > 0 ? Math.round((s.covered / s.total) * 100) : 0}%
                  <span className="text-[11px] font-normal ml-1" style={{ color: "#94A3B8" }}>{s.covered}/{s.total}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Email metrics */}
      <div>
        <h2 className="font-heading font-bold text-[15px] mb-3" style={{ color: "#0F172A" }}>
          <Mail size={16} className="inline mr-1.5" style={{ color: "#2563EB" }} />
          Métricas de email
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <MetricCard label="Enviados via Resend (7d)" value={metrics.resend7d} sub={`${metrics.resend24} nas últimas 24h`} icon={CheckCircle2} />
          <MetricCard label="Falhas (7d)" value={metrics.failed7d} sub={`${metrics.failed24} nas últimas 24h`} icon={XCircle} />
          <MetricCard label="Histórico legado (7d)" value={metrics.internal7d} sub={`${metrics.internal24} nas últimas 24h`} icon={Server} muted />
        </div>
      </div>

      {/* SLA by intent age */}
      <div>
        <h2 className="font-heading font-bold text-[15px] mb-3" style={{ color: "#0F172A" }}>
          <Timer size={16} className="inline mr-1.5" style={{ color: "#8B5CF6" }} />
          SLA por idade da intenção
        </h2>
        <div className="rounded-xl border overflow-hidden" style={{ background: "#fff", borderColor: "rgba(0,0,0,0.06)" }}>
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5" style={{ color: "#64748B" }}>Idade</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-center" style={{ color: "#64748B" }}>Total</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-center" style={{ color: "#64748B" }}>Sem Resend</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-center" style={{ color: "#64748B" }}>Em atraso</th>
              </tr>
            </thead>
            <tbody>
              {slaBuckets.map(b => (
                <tr key={b.label} className="border-t" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
                  <td className="px-4 py-2.5 text-[13px] font-medium" style={{ color: "#0F172A" }}>{b.label}</td>
                  <td className="px-4 py-2.5 text-[13px] text-center font-semibold" style={{ color: "#0F172A" }}>{b.total}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="text-[13px] font-semibold" style={{ color: b.semResend > 0 ? "#EF4444" : "#94A3B8" }}>{b.semResend}</span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="text-[13px] font-semibold" style={{ color: b.emAtraso > 0 ? "#F59E0B" : "#94A3B8" }}>{b.emAtraso}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-template breakdown */}
      {templateBreakdown.length > 0 && (
        <div>
          <h2 className="font-heading font-bold text-[15px] mb-3" style={{ color: "#0F172A" }}>
            Por template (Resend confirmado, 7d)
          </h2>
          <div className="rounded-xl border p-4 space-y-2" style={{ background: "#fff", borderColor: "rgba(0,0,0,0.06)" }}>
            {templateBreakdown.map(([key, count]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-[12px] font-mono w-[180px] truncate" style={{ color: "#64748B" }}>{key}</span>
                <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
                  <div className="h-full rounded-full" style={{ width: `${(count / maxTemplateCount) * 100}%`, background: "#3B82F6" }} />
                </div>
                <span className="text-[13px] font-bold w-8 text-right" style={{ color: "#0F172A" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Protocol alerts */}
      <div>
        <h2 className="font-heading font-bold text-[15px] mb-3" style={{ color: "#0F172A" }}>
          <AlertTriangle size={16} className="inline mr-1.5" style={{ color: "#F59E0B" }} />
          Cumprimento de protocolo
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {alertItems.map(a => (
            <button
              key={a.label}
              onClick={() => onAlertClick(a.filter)}
              className="rounded-xl border p-4 flex items-center gap-3 text-left transition-colors hover:border-blue-300"
              style={{
                background: a.count > 0 ? "rgba(254,243,199,0.4)" : "#fff",
                borderColor: a.count > 0 ? "rgba(245,158,11,0.3)" : "rgba(0,0,0,0.06)",
              }}
            >
              <a.icon size={20} style={{ color: a.count > 0 ? "#F59E0B" : "#94A3B8" }} />
              <div>
                <p className="text-[18px] font-bold font-heading" style={{ color: a.count > 0 ? "#92400E" : "#94A3B8" }}>{a.count}</p>
                <p className="text-[12px] font-medium" style={{ color: "#64748B" }}>{a.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
