import { useMemo } from "react";
import { Users, Mail, AlertTriangle, Clock, LinkIcon, Ban, CheckCircle2, XCircle, Server } from "lucide-react";
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

  // Funnel — only unpaid with intent
  const pipeline = useMemo(() => {
    const withIntent = inscritos.filter(i => i.plan_selected && i.plan_selected !== "free" && !i.paid_at);
    const stage0 = withIntent.filter(i => i.followup_stage === 0).length;
    const stage1 = withIntent.filter(i => i.followup_stage === 1).length;
    const stage2 = withIntent.filter(i => i.followup_stage === 2).length;
    const done = withIntent.filter(i => i.followup_stage >= 3).length;
    const dnc = withIntent.filter(i => i.do_not_contact).length;
    const paid = inscritos.filter(i => i.paid_at).length;
    const total = withIntent.length || 1;
    return { stage0, stage1, stage2, done, dnc, paid, total };
  }, [inscritos]);

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
    const withIntent = inscritos.filter(i => i.plan_selected && i.plan_selected !== "free" && !i.paid_at);
    const resendIds = new Set(logs.filter(l => l.provider === "resend" && l.status === "sent" && l.provider_message_id).map(l => l.registration_id));
    const noResend = withIntent.filter(i => !resendIds.has(i.id)).length;
    const failedIds = new Set(logs.filter(l => l.status === "failed" && l.created_at >= h24).map(l => l.registration_id));
    const withFailed = withIntent.filter(i => failedIds.has(i.id)).length;
    const h48ago = new Date(now - 48 * 60 * 60 * 1000).toISOString();
    const expiredLink = withIntent.filter(i => i.payment_link_created_at && i.payment_link_created_at < h48ago).length;
    const nowISO = new Date().toISOString();
    const overdue = withIntent.filter(i => i.next_followup_at && i.next_followup_at < nowISO && !i.do_not_contact).length;
    return { noResend, withFailed, expiredLink, overdue };
  }, [inscritos, logs, h24, now]);

  const funnelCards = [
    { label: "Etapa 0", count: pipeline.stage0, color: "#3B82F6" },
    { label: "Etapa 1", count: pipeline.stage1, color: "#8B5CF6" },
    { label: "Etapa 2", count: pipeline.stage2, color: "#F59E0B" },
    { label: "Concluído", count: pipeline.done, color: "#10B981" },
    { label: "Não contactar", count: pipeline.dnc, color: "#EF4444" },
    { label: "Pagos", count: pipeline.paid, color: "#059669" },
  ];

  const alertItems = [
    { label: "Sem email Resend", count: alerts.noResend, icon: Mail, filter: { provider: "resend" as const, status: "sent" as const } },
    { label: "Com falha de email", count: alerts.withFailed, icon: XCircle, filter: { status: "failed" as const, timeRange: "24h" as const } },
    { label: "Link expirado (48h+)", count: alerts.expiredLink, icon: LinkIcon, filter: {} },
    { label: "Em atraso", count: alerts.overdue, icon: Clock, filter: {} },
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
              <Progress value={pipeline.total > 0 ? (c.count / pipeline.total) * 100 : 0} className="h-1.5 mt-2" />
            </div>
          ))}
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
          <MetricCard label="Logs internos (7d)" value={metrics.internal7d} sub={`${metrics.internal24} nas últimas 24h`} icon={Server} muted />
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
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(count / maxTemplateCount) * 100}%`, background: "#3B82F6" }}
                  />
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
