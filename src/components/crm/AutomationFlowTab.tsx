import { useMemo, useState } from "react";
import { Users, Mail, CheckCircle2, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWebinarContext } from "@/contexts/WebinarContext";
import { WEBINAR_CONFIG, VIDEO_WEBINAR_DATE, type WebinarKey } from "@/config/webinarConfig";
import type { Inscrito } from "@/pages/crm/mockData";
import type { EmailStats } from "./FollowUpView";
import EmailRecipientsDrawer from "./modal/EmailRecipientsDrawer";

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
  onOpenEditor?: (templateKey: string) => void;
  emailStats?: EmailStats;
  emailStatsLoading?: boolean;
}

type TagType = "IMEDIATO" | "AGENDADO" | "ENVIADO" | "MANUAL" | "ERRO";

const TAG_STYLES: Record<TagType, { bg: string; color: string }> = {
  IMEDIATO: { bg: "#dcfce7", color: "#16a34a" },
  AGENDADO: { bg: "#dbeafe", color: "#1d4ed8" },
  ENVIADO: { bg: "#dcfce7", color: "#16a34a" },
  MANUAL: { bg: "#fef3c7", color: "#d97706" },
  ERRO: { bg: "#fee2e2", color: "#dc2626" },
};

const TAG_BORDER: Record<TagType, string> = {
  IMEDIATO: "#16a34a",
  AGENDADO: "#3b82f6",
  ENVIADO: "#16a34a",
  MANUAL: "#f59e0b",
  ERRO: "#ef4444",
};

interface NodeDef {
  type: "trigger" | "email" | "end";
  title: string;
  subtitle: string;
  templateKeyMatch: string[];
  conditionLabel?: string;
  isPostWebinar?: boolean;
  /** Hours offset from webinar start for send schedule. Negative = before, positive = after. null = immediate/skip pending */
  sendOffsetHours?: number | null;
}

function getNodes(webinar: WebinarKey): NodeDef[] {
  const cfg = WEBINAR_CONFIG[webinar];
  const name = cfg.label;
  const url = webinar === "video" ? "imagenscomia.com/video" : "imagenscomia.com";
  const nodes: NodeDef[] = [
    {
      type: "trigger",
      title: "Inscrição submetida",
      subtitle: `Webinar ${name} · ${url}`,
      templateKeyMatch: [],
    },
    {
      type: "email",
      title: "Confirmação imediata",
      subtitle: "Enviado automaticamente · segundos após inscrição",
      templateKeyMatch: ["confirmation"],
      sendOffsetHours: null, // immediate, skip pending
    },
  ];

  // Video-only: follow-up upgrade node
  if (webinar === "video") {
    nodes.push({
      type: "email",
      title: "Follow-up upgrade pré-webinar",
      subtitle: "48h após inscrição · só gratuitos · até 3 Mar",
      templateKeyMatch: ["video_followup_prewebinar"],
      conditionLabel: "CRON · ATÉ 3 MAR",
      sendOffsetHours: null,
    });
  }

  nodes.push(
    {
      type: "email",
      title: "Lembrete 48h",
      subtitle: "Enviado automaticamente · 48h antes do webinar",
      templateKeyMatch: ["reminder-48h", "reminder_48h"],
      conditionLabel: "48H ANTES DO WEBINAR",
      sendOffsetHours: -48,
    },
    {
      type: "email",
      title: "Lembrete 24h",
      subtitle: "Enviado automaticamente · 24h antes do webinar",
      templateKeyMatch: ["reminder-24h", "reminder_24h"],
      conditionLabel: "24H ANTES DO WEBINAR",
      sendOffsetHours: -24,
    },
    {
      type: "email",
      title: "Começa em 1 hora",
      subtitle: "Enviado automaticamente · 60 min antes do webinar",
      templateKeyMatch: ["reminder-1h", "reminder_1h"],
      conditionLabel: "1H ANTES DO WEBINAR",
      sendOffsetHours: -1,
    },
    {
      type: "email",
      title: "Email pós-webinar",
      subtitle: "Envio manual via CRM ou automático 3h após o webinar",
      templateKeyMatch: ["postwebinar", "post-webinar", "post_webinar"],
      conditionLabel: "APÓS O WEBINAR",
      isPostWebinar: true,
      sendOffsetHours: null, // manual, skip pending
    },
  );
  nodes.push({
    type: "end",
    title: "Fluxo concluído",
    subtitle: "Inscrito recebeu todos os emails do ciclo",
    templateKeyMatch: [],
  });

  return nodes;
}

function matchTemplate(templateKey: string, patterns: string[]): boolean {
  const k = templateKey.toLowerCase();
  return patterns.some((p) => k.includes(p));
}

function getTag(node: NodeDef, webinarPast: boolean, hasSentLogs: boolean, webinar: WebinarKey): TagType | null {
  if (node.type === "trigger" || node.type === "end") return null;
  if (node.templateKeyMatch.some((p) => p.includes("confirmation"))) {
    return webinarPast ? "ENVIADO" : "IMEDIATO";
  }
  if (node.isPostWebinar) {
    if (hasSentLogs) return "ENVIADO";
    if (webinar === "video" && !webinarPast) return "MANUAL";
    if (webinarPast) return "MANUAL";
    return "AGENDADO";
  }
  if (webinarPast) return hasSentLogs ? "ENVIADO" : "ENVIADO";
  return "AGENDADO";
}

/* ─── Status Bar ─── */
function StatusBar({ logs, webinar, emailStats }: { logs: MessageLog[]; webinar?: WebinarKey; emailStats?: EmailStats }) {
  const hasStats = emailStats && Object.keys(emailStats).length > 0;
  const isConsolidado = !webinar;

  let totalSent = 0;
  let totalFailed = 0;
  let imgSent = 0, imgFailed = 0, vidSent = 0, vidFailed = 0;

  if (hasStats) {
    for (const [key, val] of Object.entries(emailStats)) {
      if (webinar && !key.startsWith(webinar)) continue;
      totalSent += val.sent;
      totalFailed += val.failed;
      if (isConsolidado) {
        if (key.startsWith("imagens_") || key.startsWith("followup_")) {
          imgSent += val.sent; imgFailed += val.failed;
        } else if (key.startsWith("video_")) {
          vidSent += val.sent; vidFailed += val.failed;
        }
      }
    }
  } else {
    totalSent = logs.filter((l) => l.provider === "resend" && l.status === "sent").length;
    totalFailed = logs.filter((l) => l.status === "failed").length;
  }

  const total = totalSent + totalFailed;
  const failRate = total > 0 ? totalFailed / total : 0;

  const isImagensPast = WEBINAR_CONFIG.imagens.startDate.getTime() < Date.now();

  let statusText: string;
  if (webinar === "imagens" || (!webinar && isImagensPast)) {
    statusText = "✅ Ciclo completo — webinar realizado a 18 Fev";
  } else {
    statusText = "⏰ Próximo envio: Lembrete 48h · 3 Mar às 10h00";
  }
  if (webinar === "video") {
    const videoPast = WEBINAR_CONFIG.video.startDate.getTime() < Date.now();
    statusText = videoPast
      ? "✅ Ciclo completo — webinar realizado"
      : "⏰ Próximo envio: Lembrete 48h · 3 Mar às 10h00";
  }

  let badgeColor = "#16a34a";
  let badgeLabel = "🟢 Sistema operacional";
  if (failRate > 0.15) {
    badgeColor = "#ef4444";
    badgeLabel = "🔴 Sistema com falhas";
  } else if (failRate > 0.05) {
    badgeColor = "#f59e0b";
    badgeLabel = "🟠 Atenção requerida";
  }

  const sentLabel = isConsolidado
    ? `📧 ${totalSent} enviados (${imgSent} IMG · ${vidSent} VID)`
    : `📧 ${totalSent} emails enviados`;
  const failLabel = isConsolidado
    ? `❌ ${totalFailed} falhas (${imgFailed} IMG · ${vidFailed} VID)`
    : `❌ ${totalFailed} falhas`;

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-6"
      style={{
        background: `${badgeColor}08`,
        border: `1px solid ${badgeColor}26`,
        borderRadius: 8,
        padding: "10px 16px",
        fontSize: 12,
      }}
    >
      <span style={{ color: badgeColor }}>{badgeLabel}</span>
      <span style={{ color: "#94A3B8" }}>·</span>
      <span>{sentLabel}</span>
      <span style={{ color: "#94A3B8" }}>·</span>
      <span style={{ color: totalFailed > 0 ? "#ef4444" : undefined }}>{failLabel}</span>
      <span style={{ color: "#94A3B8" }}>·</span>
      <span>{statusText}</span>
    </div>
  );
}

/* ─── Tag Badge ─── */
function TagBadge({ tag }: { tag: TagType }) {
  const s = TAG_STYLES[tag];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 9,
        padding: "2px 8px",
        borderRadius: 20,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
    >
      {tag}
    </span>
  );
}

/* ─── Single Timeline ─── */
function Timeline({
  webinar,
  inscritos,
  logs,
  onOpenEditor,
  emailStats,
  emailStatsLoading,
  onClickSentCount,
}: {
  webinar: WebinarKey;
  inscritos: Inscrito[];
  logs: MessageLog[];
  onOpenEditor?: (templateKey: string) => void;
  emailStats?: EmailStats;
  emailStatsLoading?: boolean;
  onClickSentCount?: (emailKey: string, title: string, webinar: WebinarKey) => void;
}) {
  const [sendingPost, setSendingPost] = useState(false);
  const nodes = useMemo(() => getNodes(webinar), [webinar]);
  const now = Date.now();
  const webinarPast = WEBINAR_CONFIG[webinar].startDate.getTime() < now;
  const showSendNow = webinar === "video" && now > VIDEO_WEBINAR_DATE.getTime();

  const inscritosCount = inscritos.filter((i) => {
    if (webinar === "video") return i.webinar === "video";
    return !i.webinar || i.webinar === "imagens";
  }).length;

  // Count sent/failed per node — prefer emailStats from email_send_logs
  const nodeCounts = useMemo(() => {
    const result: Record<number, { sent: number; failed: number }> = {};
    for (let idx = 0; idx < nodes.length; idx++) {
      const n = nodes[idx];
      if (n.type !== "email") continue;

      // Derive email_key from templateKeyMatch
      const rawKey = n.templateKeyMatch[0]?.replace(/-/g, "_").replace("stage_0", "confirmation") || "";
      const statsKey = `${webinar}_${rawKey}`;

      if (emailStats && emailStats[statsKey]) {
        result[idx] = emailStats[statsKey];
      } else {
        // Fallback to message_logs
        let sent = 0, failed = 0;
        for (const l of logs) {
          if (matchTemplate(l.template_key, n.templateKeyMatch)) {
            if (l.status === "sent") sent++;
            if (l.status === "failed") failed++;
          }
        }
        result[idx] = { sent, failed };
      }
    }
    return result;
  }, [nodes, logs, emailStats, webinar]);

  const handleSendPostWebinar = async () => {
    if (!confirm("Confirmar envio do email pós-webinar a todos os inscritos?")) return;
    setSendingPost(true);
    try {
      const { error } = await supabase.functions.invoke("send-video-postwebinar", {
        body: { manual: true },
      });
      if (error) throw error;
      toast.success("Email pós-webinar enviado com sucesso");
    } catch (e: any) {
      toast.error("Erro ao enviar: " + (e.message || "erro desconhecido"));
    } finally {
      setSendingPost(false);
    }
  };

  return (
    <div className="relative max-w-[800px] mx-auto">
      {nodes.map((node, idx) => {
        const isLast = idx === nodes.length - 1;
         const tag = getTag(node, webinarPast, (nodeCounts[idx]?.sent ?? 0) > 0, webinar);
         const counts = nodeCounts[idx];
         const hasFailed = (counts?.failed ?? 0) > 0;
         const isFollowupPrewebinar = node.templateKeyMatch.includes("video_followup_prewebinar");
         const borderColor =
           node.type === "trigger"
             ? "#7c3aed"
             : node.type === "end"
             ? "#94A3B8"
             : hasFailed
             ? "#ef4444"
             : isFollowupPrewebinar
             ? "#f59e0b"
             : tag
             ? TAG_BORDER[tag]
             : "#e2e8f0";
        return (
          <div key={idx}>
            {/* Condition label */}
            {node.conditionLabel && (
              <div className="flex items-center justify-center py-2">
                <span
                  style={{
                    fontSize: 11,
                    color: "#aaa",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  {node.conditionLabel}
                </span>
              </div>
            )}

            {/* Dashed connector line */}
            {idx > 0 && !node.conditionLabel && (
              <div className="flex justify-center">
                <div style={{ width: 1, height: 24, borderLeft: "2px dashed #e2e8f0" }} />
              </div>
            )}
            {node.conditionLabel && (
              <div className="flex justify-center">
                <div style={{ width: 1, height: 8, borderLeft: "2px dashed #e2e8f0" }} />
              </div>
            )}

            {/* Node card */}
            <div
              style={{
                background: node.type === "end" ? "#F8FAFC" : "white",
                border: "1px solid #e2e8f0",
                borderLeft: `4px solid ${borderColor}`,
                borderRadius: 10,
                padding: "16px 20px",
              }}
              className="flex justify-between items-start gap-4"
            >
              {/* Left */}
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: borderColor }}
                >
                  {node.type === "trigger" && <Users size={20} />}
                  {node.type === "email" && <Mail size={18} />}
                  {node.type === "end" && <CheckCircle2 size={20} />}
                </div>
                <div className="min-w-0">
                  <p
                    className="font-heading font-bold"
                    style={{ fontSize: node.type === "trigger" ? 15 : 14, color: "#0F172A" }}
                  >
                    {node.title}
                  </p>
                  <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{node.subtitle}</p>
                  {tag && (
                    <div className="mt-2">
                      <TagBadge tag={tag} />
                    </div>
                  )}
                </div>
              </div>

              {/* Right */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                {node.type === "trigger" && (
                  <span style={{ fontSize: 12, color: "#888" }}>{inscritosCount} inscrições</span>
                )}
                {node.type === "email" && emailStatsLoading && (
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>
                    <span className="inline-flex gap-0.5">
                      <span className="animate-pulse">·</span>
                      <span className="animate-pulse" style={{ animationDelay: "150ms" }}>·</span>
                      <span className="animate-pulse" style={{ animationDelay: "300ms" }}>·</span>
                    </span>
                  </span>
                )}
                {node.type === "email" && !emailStatsLoading && counts && (
                  <div className="flex flex-col items-end gap-0.5">
                    {counts.sent > 0 ? (
                      <button
                        onClick={() => {
                          const rawKey = node.templateKeyMatch[0]?.replace(/-/g, "_").replace("stage_0", "confirmation") || "";
                          onClickSentCount?.(rawKey, node.title, webinar);
                        }}
                        className="text-[12px] font-medium hover:underline cursor-pointer"
                        style={{ color: "#2563EB", textDecoration: "underline" }}
                      >
                        {counts.sent} enviados
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: "#999" }}>0 enviados</span>
                    )}
                    <span className="flex items-center gap-1" style={{ fontSize: 12, color: counts.failed > 0 ? "#ef4444" : "#999" }}>
                      {counts.failed > 0 && <AlertTriangle size={11} />}
                      {counts.failed} falhas
                    </span>
                    {/* Pending indicator */}
                    {node.sendOffsetHours != null && (() => {
                      const sendDate = new Date(WEBINAR_CONFIG[webinar].startDate.getTime() + node.sendOffsetHours! * 60 * 60 * 1000);
                      const sendPassed = Date.now() > sendDate.getTime();
                      const pending = inscritosCount - counts.sent - counts.failed;
                      if (inscritosCount === 0) {
                        return <span style={{ fontSize: 11, color: "#aaa" }}>— Sem inscritos ainda</span>;
                      }
                      if (!sendPassed && pending > 0) {
                        return <span style={{ fontSize: 11, color: "#3b82f6" }}>→ {pending} por receber</span>;
                      }
                      if (sendPassed && pending <= 0 && counts.sent > 0) {
                        return <span style={{ fontSize: 11, color: "#16a34a" }}>✓ Todos receberam</span>;
                      }
                      return null;
                    })()}
                  </div>
                )}
                {node.type === "email" && !node.isPostWebinar && (
                  <button
                    onClick={() => {
                      const emailKey = node.templateKeyMatch[0]?.replace(/-/g, "_") || "";
                      const tplKey = `${webinar}_${emailKey.replace("stage_0", "confirmation")}`;
                      onOpenEditor?.(tplKey);
                    }}
                    className="text-[12px] font-medium hover:underline"
                    style={{ color: "#2563EB" }}
                  >
                    Ver email →
                  </button>
                )}
                {node.isPostWebinar && (
                  <div className="flex flex-col items-end gap-1">
                    <button
                      onClick={() => onOpenEditor?.(`${webinar}_postwebinar`)}
                      className="text-[12px] font-medium hover:underline"
                      style={{ color: "#2563EB" }}
                    >
                      Ver email →
                    </button>
                    {showSendNow && (
                      <button
                        onClick={handleSendPostWebinar}
                        disabled={sendingPost}
                        className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        style={{ background: "#16a34a", color: "#fff" }}
                      >
                        <Send size={12} />
                        {sendingPost ? "Enviando..." : "Enviar agora →"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Line after node */}
            {!isLast && (
              <div className="flex justify-center">
                <div style={{ width: 1, height: 24, borderLeft: "2px dashed #e2e8f0" }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─── */
export default function AutomationFlowTab({ inscritos, logs, logsLoading, onOpenEditor, emailStats, emailStatsLoading }: Props) {
  const { webinarContext } = useWebinarContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerEmailKey, setDrawerEmailKey] = useState("");
  const [drawerTitle, setDrawerTitle] = useState("");
  const [drawerWebinar, setDrawerWebinar] = useState<WebinarKey | "consolidado">("video");

  const handleClickSentCount = (emailKey: string, title: string, webinar: WebinarKey) => {
    setDrawerEmailKey(emailKey);
    setDrawerTitle(title);
    setDrawerWebinar(webinarContext === "consolidado" ? "consolidado" : webinar);
    setDrawerOpen(true);
  };

  if (logsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span style={{ color: "#94A3B8", fontSize: 14 }}>A carregar dados…</span>
      </div>
    );
  }

  const drawer = (
    <EmailRecipientsDrawer
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      emailKey={drawerEmailKey}
      webinar={drawerWebinar}
      emailTitle={drawerTitle}
    />
  );

  if (webinarContext === "consolidado") {
    return (
      <div>
        <StatusBar logs={logs} emailStats={emailStats} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="font-heading font-bold text-[15px] mb-4" style={{ color: "#0F172A" }}>
              📷 Imagens IA · 18 Fev 2026
            </h3>
             <Timeline webinar="imagens" inscritos={inscritos} logs={logs} onOpenEditor={onOpenEditor} emailStats={emailStats} emailStatsLoading={emailStatsLoading} onClickSentCount={handleClickSentCount} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-[15px] mb-4" style={{ color: "#0F172A" }}>
              🎬 Vídeo IA · 2 Mar 2026
            </h3>
            <Timeline webinar="video" inscritos={inscritos} logs={logs} onOpenEditor={onOpenEditor} emailStats={emailStats} emailStatsLoading={emailStatsLoading} onClickSentCount={handleClickSentCount} />
          </div>
        </div>
        {drawer}
      </div>
    );
  }

  const webinar = webinarContext as WebinarKey;

  return (
    <div>
      <StatusBar logs={logs} webinar={webinar} emailStats={emailStats} />
      <Timeline webinar={webinar} inscritos={inscritos} logs={logs} onOpenEditor={onOpenEditor} emailStats={emailStats} emailStatsLoading={emailStatsLoading} onClickSentCount={handleClickSentCount} />
      {drawer}
    </div>
  );
}
