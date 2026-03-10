import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import FollowUpOverview from "./FollowUpOverview";
import FollowUpAudit from "./FollowUpAudit";
import FollowUpPessoas from "./FollowUpPessoas";
import FollowUpPessoasVideo from "./FollowUpPessoasVideo";
import TemplatesView from "./TemplatesView";
import AutomationFlowTab from "./AutomationFlowTab";
import EmailEditorPanel, { type EmailTemplate } from "./EmailEditorPanel";
import type { Inscrito } from "@/pages/crm/mockData";
import { useWebinarContext } from "@/contexts/WebinarContext";
import { CalendarDays, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export type EmailStats = Record<string, { sent: number; failed: number }>;

export interface AuditFilter {
  timeRange?: "24h" | "7d" | "all";
  provider?: "resend" | "internal" | "all";
  status?: "sent" | "failed" | "queued" | "all";
  templateKey?: string;
  confirmedOnly?: boolean;
  subTab?: "pessoas" | "envios";
  semResend?: boolean;
  emAtraso?: boolean;
  linkExpirado?: boolean;
  ageBucket?: string;
}

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
  onSelectInscrito: (i: Inscrito) => void;
}

const TABS = [
  { key: "fluxo", label: "Fluxo" },
  { key: "metricas", label: "Métricas" },
  { key: "pessoas", label: "Pessoas" },
  { key: "templates", label: "Templates" },
] as const;

type TabKey = typeof TABS[number]["key"];

const TEMPLATE_KEYS = [
  "video_confirmation", "video_followup_prewebinar", "video_reminder_48h", "video_reminder_24h", "video_reminder_1h", "video_postwebinar",
  "video_postwebinar_day1", "video_postwebinar_day3", "video_postwebinar_closing",
  "video_payment_premium", "video_payment_masterclass",
  "video_recursos_premium", "video_recursos_masterclass", "video_recursos_bundle",
  "video_masterclass_thankyou", "video_masterclass_day1", "video_masterclass_day3",
  "video_mc_sales_invite", "video_mc_sales_closing", "video_qa_reminder",
  "imagens_confirmation", "imagens_reminder_48h", "imagens_reminder_24h", "imagens_reminder_1h", "imagens_postwebinar",
];

export default function FollowUpView({ inscritos, onSelectInscrito }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("fluxo");
  const [auditFilter, setAuditFilter] = useState<AuditFilter>({});
  const [auditSubTab, setAuditSubTab] = useState<"pessoas" | "envios">("pessoas");
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const { webinarContext } = useWebinarContext();
  const [backfillDone, setBackfillDone] = useState(false);
  const [backfillLoading, setBackfillLoading] = useState(false);

  // Email templates state
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [emailStats, setEmailStats] = useState<EmailStats>({});
  const [emailStatsLoading, setEmailStatsLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    const { data } = await supabase
      .from("message_logs")
      .select("id, registration_id, template_key, provider, status, provider_message_id, error, created_at")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (data) setLogs(data as MessageLog[]);
    setLogsLoading(false);
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Fetch email templates
  useEffect(() => {
    supabase
      .from("email_templates")
      .select("template_key, name, subject, html_body, updated_at, updated_by")
      .in("template_key", TEMPLATE_KEYS)
      .then(({ data }) => {
        if (data) setEmailTemplates(data as EmailTemplate[]);
      });
  }, []);

  // Fetch email send logs stats
  useEffect(() => {
    setEmailStatsLoading(true);
    supabase
      .from("email_send_logs")
      .select("email_key, status, webinar")
      .limit(10000)
      .then(({ data }) => {
        if (data) {
          const stats: EmailStats = {};
          for (const row of data) {
            const key = `${row.webinar}_${row.email_key}`;
            if (!stats[key]) stats[key] = { sent: 0, failed: 0 };
            if (row.status === "sent") stats[key].sent++;
            else if (row.status === "failed") stats[key].failed++;
          }
          setEmailStats(stats);
        }
        setEmailStatsLoading(false);
      });
  }, []);

  const templateSendCounts = useMemo(() => {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const counts: Record<string, number> = {};
    for (const l of logs) {
      if (l.provider === "resend" && l.status === "sent" && l.provider_message_id && l.created_at >= cutoff) {
        counts[l.template_key] = (counts[l.template_key] || 0) + 1;
      }
    }
    return counts;
  }, [logs]);

  const goToAudit = useCallback((filter: AuditFilter) => {
    setAuditFilter(filter);
    setAuditSubTab(filter.subTab || "envios");
    setActiveTab("pessoas");
  }, []);

  const handleViewSends = useCallback((templateKey: string) => {
    goToAudit({ templateKey, provider: "resend", confirmedOnly: true, subTab: "envios" });
  }, [goToAudit]);

  const handleOpenEditor = useCallback((templateKey: string) => {
    const tpl = emailTemplates.find((t) => t.template_key === templateKey);
    if (tpl) {
      setSelectedTemplate(tpl);
    } else {
      toast.error("Template não configurado");
    }
  }, [emailTemplates]);

  const handleEditorSaved = useCallback((updated: EmailTemplate) => {
    setEmailTemplates((prev) => prev.map((t) => (t.template_key === updated.template_key ? updated : t)));
    setSelectedTemplate(updated);
  }, []);

  // Empty state for video with no subscribers
  if (webinarContext === "video" && inscritos.filter(i => i.status === "activo").length === 0) {
    return (
      <div className="p-7 max-sm:p-4 min-h-screen" style={{ background: "#F8FAFC" }}>
        <div className="mb-5">
          <h1 className="font-heading font-bold text-[22px]" style={{ color: "#0F172A" }}>Automações de Email</h1>
          <p className="text-sm" style={{ color: "#64748B" }}>Fluxo de emails automáticos, estado dos envios e edição de templates</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <CalendarDays size={40} className="mx-auto mb-3" style={{ color: "#94A3B8" }} />
          <p className="font-heading font-bold text-[16px]" style={{ color: "#0F172A" }}>Webinar Vídeo a 2 de Março</p>
          <p className="text-[13px] mt-2" style={{ color: "#94A3B8" }}>Follow-up aparecerá aqui após as primeiras inscrições</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-7 max-sm:p-4 min-h-screen" style={{ background: "#F8FAFC" }}>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className="font-heading font-bold text-[22px]" style={{ color: "#0F172A" }}>Automações de Email</h1>
          <p className="text-sm" style={{ color: "#64748B" }}>Fluxo de emails automáticos, estado dos envios e edição de templates</p>
        </div>
        <div className="flex items-center gap-2">
          {webinarContext === "video" && (
            <Button
              variant="outline"
              size="sm"
              disabled={backfillDone || backfillLoading}
              onClick={async () => {
                if (!window.confirm("Vais enviar video_confirmation a ~18 pessoas que nunca receberam este email. Continuar?")) return;
                setBackfillLoading(true);
                try {
                  const { data, error } = await supabase.functions.invoke("backfill-video-confirmations");
                  if (error) throw error;
                  toast.success(`✅ ${data.sent} emails enviados · ${data.failed} falhas · ${data.skipped} já enviados`);
                  setBackfillDone(true);
                  fetchLogs();
                } catch (err: any) {
                  toast.error("Erro no backfill: " + (err?.message || "desconhecido"));
                } finally {
                  setBackfillLoading(false);
                }
              }}
              className="text-xs gap-1.5"
            >
              <AlertTriangle size={14} />
              {backfillDone ? "Backfill concluído" : backfillLoading ? "A enviar…" : "Reenviar confirmações em falta"}
            </Button>
          )}
          
        </div>
      </div>

      {/* Pill tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto whitespace-nowrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
            style={{
              background: activeTab === tab.key ? "#2563EB" : "transparent",
              color: activeTab === tab.key ? "#fff" : "#64748B",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "fluxo" && (
        <AutomationFlowTab
          inscritos={inscritos}
          logs={logs}
          logsLoading={logsLoading}
          onOpenEditor={handleOpenEditor}
          emailStats={emailStats}
          emailStatsLoading={emailStatsLoading}
        />
      )}

      {activeTab === "metricas" && (
        <FollowUpOverview
          inscritos={inscritos}
          logs={logs}
          logsLoading={logsLoading}
          onAlertClick={goToAudit}
          webinarContext={webinarContext}
        />
      )}

      {activeTab === "pessoas" && (
        <>
          <div className="flex gap-1 mb-4">
            <button
              onClick={() => setAuditSubTab("pessoas")}
              className="px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors"
              style={{
                background: auditSubTab === "pessoas" ? "#2563EB" : "transparent",
                color: auditSubTab === "pessoas" ? "#fff" : "#64748B",
              }}
            >
              Pessoas
            </button>
            <button
              onClick={() => setAuditSubTab("envios")}
              className="px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors"
              style={{
                background: auditSubTab === "envios" ? "#2563EB" : "transparent",
                color: auditSubTab === "envios" ? "#fff" : "#64748B",
              }}
            >
              Envios
            </button>
          </div>

          {auditSubTab === "pessoas" ? (
            webinarContext === "video" ? (
              <FollowUpPessoasVideo
                inscritos={inscritos}
                onSelectInscrito={onSelectInscrito}
              />
            ) : (
              <FollowUpPessoas
                inscritos={inscritos}
                logs={logs}
                logsLoading={logsLoading}
                initialFilter={auditFilter}
                onSelectInscrito={onSelectInscrito}
              />
            )
          ) : (
            <FollowUpAudit
              inscritos={inscritos}
              logs={logs}
              logsLoading={logsLoading}
              initialFilter={auditFilter}
              onSelectInscrito={onSelectInscrito}
            />
          )}
        </>
      )}

      {activeTab === "templates" && (
        <TemplatesView
          onViewSends={handleViewSends}
          templateSendCounts={templateSendCounts}
        />
      )}

      {/* Email Editor Panel */}
      <EmailEditorPanel
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        onSaved={handleEditorSaved}
      />
    </div>
  );
}
