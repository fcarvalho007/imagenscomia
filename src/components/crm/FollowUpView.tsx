import { useState, useEffect, useMemo, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import FollowUpOverview from "./FollowUpOverview";
import FollowUpAudit from "./FollowUpAudit";
import FollowUpPessoas from "./FollowUpPessoas";
import TemplatesView from "./TemplatesView";
import type { Inscrito } from "@/pages/crm/mockData";
import { useWebinarContext } from "@/contexts/WebinarContext";
import { CalendarDays } from "lucide-react";

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

export default function FollowUpView({ inscritos, onSelectInscrito }: Props) {
  const [activeTab, setActiveTab] = useState("overview");
  const [auditFilter, setAuditFilter] = useState<AuditFilter>({});
  const [auditSubTab, setAuditSubTab] = useState<"pessoas" | "envios">("pessoas");
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const { webinarContext } = useWebinarContext();

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    const { data } = await supabase
      .from("message_logs")
      .select("id, registration_id, template_key, provider, status, provider_message_id, error, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (data) setLogs(data as MessageLog[]);
    setLogsLoading(false);
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Template send counts (7d, Resend confirmed)
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
    setActiveTab("audit");
  }, []);

  const handleViewSends = useCallback((templateKey: string) => {
    goToAudit({ templateKey, provider: "resend", confirmedOnly: true, subTab: "envios" });
  }, [goToAudit]);

  // Empty state for video with no subscribers
  if (webinarContext === "video" && inscritos.filter(i => i.status === "activo").length === 0) {
    return (
      <div className="p-7 max-sm:p-4 min-h-screen" style={{ background: "#F8FAFC" }}>
        <div className="mb-5">
          <h1 className="font-heading font-bold text-[22px]" style={{ color: "#0F172A" }}>Follow-up</h1>
          <p className="text-sm" style={{ color: "#64748B" }}>Funil, métricas de envio, lista de pessoas e templates do follow-up automático.</p>
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
      <div className="mb-5">
        <h1 className="font-heading font-bold text-[22px]" style={{ color: "#0F172A" }}>Follow-up</h1>
        <p className="text-sm" style={{ color: "#64748B" }}>Funil, métricas de envio, lista de pessoas e templates do follow-up automático.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-5 bg-white border" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
          <TabsTrigger value="overview" className="text-[13px]">Visão Geral</TabsTrigger>
          <TabsTrigger value="audit" className="text-[13px]">Pessoas & Auditoria</TabsTrigger>
          <TabsTrigger value="templates" className="text-[13px]">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <FollowUpOverview
            inscritos={inscritos}
            logs={logs}
            logsLoading={logsLoading}
            onAlertClick={goToAudit}
          />
        </TabsContent>

        <TabsContent value="audit">
          {/* Inner sub-tabs: Pessoas + Envios */}
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
            <FollowUpPessoas
              inscritos={inscritos}
              logs={logs}
              logsLoading={logsLoading}
              initialFilter={auditFilter}
              onSelectInscrito={onSelectInscrito}
            />
          ) : (
            <FollowUpAudit
              inscritos={inscritos}
              logs={logs}
              logsLoading={logsLoading}
              initialFilter={auditFilter}
              onSelectInscrito={onSelectInscrito}
            />
          )}
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesView
            onViewSends={handleViewSends}
            templateSendCounts={templateSendCounts}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
