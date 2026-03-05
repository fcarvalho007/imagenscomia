import { useMemo, useState, Fragment } from "react";
import { Users, Mail, CheckCircle2, Send, AlertTriangle, Smartphone, Loader2 } from "lucide-react";
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

type TagType = "IMEDIATO" | "AGENDADO" | "ENVIADO" | "MANUAL" | "ERRO" | "ACTIVO" | "ENCERRADO" | "A ENVIAR" | "NAO ENVIADO";

const TAG_STYLES: Record<TagType, { bg: string; color: string }> = {
  IMEDIATO: { bg: "#dcfce7", color: "#16a34a" },
  AGENDADO: { bg: "#dbeafe", color: "#1d4ed8" },
  ENVIADO: { bg: "#dcfce7", color: "#16a34a" },
  MANUAL: { bg: "#fef3c7", color: "#d97706" },
  ERRO: { bg: "#fee2e2", color: "#dc2626" },
  ACTIVO: { bg: "#fef3c7", color: "#d97706" },
  ENCERRADO: { bg: "#f1f5f9", color: "#64748b" },
  "A ENVIAR": { bg: "#fef3c7", color: "#d97706" },
  "NAO ENVIADO": { bg: "#fee2e2", color: "#dc2626" },
};

const TAG_BORDER: Record<TagType, string> = {
  IMEDIATO: "#16a34a",
  AGENDADO: "#3b82f6",
  ENVIADO: "#16a34a",
  MANUAL: "#f59e0b",
  ERRO: "#ef4444",
  ACTIVO: "#f59e0b",
  ENCERRADO: "#94a3b8",
  "A ENVIAR": "#f59e0b",
  "NAO ENVIADO": "#ef4444",
};

interface SmsSendConfig {
  planFilter: string[]; // e.g. ["free"] or ["premium"] or ["masterclass", "bundle"]
  webinarFilter: "current" | "all"; // "current" = only this webinar, "all" = both webinars
  smsText: string;
  requirePhone?: boolean;
}

interface NodeDef {
  type: "trigger" | "email" | "end";
  title: string;
  subtitle: string;
  templateKeyMatch: string[];
  conditionLabel?: string;
  isPostWebinar?: boolean;
  sendOffsetHours?: number | null;
  sectionDivider?: string;
  note?: string;
  customTag?: { label: string; bg: string; color: string };
  borderColorOverride?: string;
  infoBox?: string;
  isPaymentBlock?: boolean;
  iconEmoji?: string;
  channel?: "email" | "sms";
  smsSendConfig?: SmsSendConfig;
}

function getNodes(webinar: WebinarKey): NodeDef[] {
  if (webinar === "imagens") {
    return [
      {
        type: "trigger",
        title: "Inscrição submetida",
        subtitle: "Webinar Imagens IA · imagenscomia.com",
        templateKeyMatch: [],
      },
      {
        type: "email",
        title: "Confirmação imediata",
        subtitle: "Enviado automaticamente · segundos após inscrição",
        templateKeyMatch: ["confirmation"],
        sendOffsetHours: null,
      },
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
        sendOffsetHours: null,
      },
      {
        type: "end",
        title: "Fluxo concluído",
        subtitle: "Inscrito recebeu todos os emails do ciclo",
        templateKeyMatch: [],
      },
    ];
  }

  // ── VIDEO: 12 nodes + end, 4 sections ──
  const now = new Date();
  const followupCutoff = new Date("2026-03-03T23:59:59Z");
  const isFollowupActive = now <= followupCutoff;

  return [
    // ── SECTION 1: PRÉ-WEBINAR ──
    {
      type: "trigger",
      title: "Inscrição submetida",
      subtitle: "Webinar Vídeo com IA · imagenscomia.com/video",
      templateKeyMatch: [],
      sectionDivider: "PRÉ-WEBINAR",
      iconEmoji: "👤",
      borderColorOverride: "#8b5cf6",
    },
    {
      type: "email",
      title: "Confirmação imediata",
      subtitle: "Enviado automaticamente · segundos após inscrição",
      templateKeyMatch: ["confirmation"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#10b981",
      note: "Tem variantes A/B/C/D para participantes do webinar Imagens",
    },
    {
      type: "email",
      title: "Follow-up upgrade",
      subtitle: "48h após inscrição · só gratuitos · só até 3 Mar",
      templateKeyMatch: ["video_followup_prewebinar"],
      sendOffsetHours: null,
      iconEmoji: "⏳",
      borderColorOverride: "#f59e0b",
      customTag: isFollowupActive
        ? { label: "CRON · ATÉ 3 MAR", bg: "#fef3c7", color: "#d97706" }
        : { label: "ENCERRADO", bg: "#f1f5f9", color: "#64748b" },
    },
    {
      type: "email",
      title: "Lembrete 48h",
      subtitle: "Enviado automaticamente · 48h antes do webinar",
      templateKeyMatch: ["reminder-48h", "reminder_48h", "video_reminder_48h"],
      conditionLabel: "48H ANTES DO WEBINAR",
      sendOffsetHours: -48,
      iconEmoji: "✉️",
      borderColorOverride: "#3b82f6",
    },
    {
      type: "email",
      title: "Lembrete 24h",
      subtitle: "Enviado automaticamente · 24h antes do webinar",
      templateKeyMatch: ["reminder-24h", "reminder_24h", "video_reminder_24h"],
      conditionLabel: "24H ANTES DO WEBINAR",
      sendOffsetHours: -24,
      iconEmoji: "✉️",
      borderColorOverride: "#3b82f6",
    },
    {
      type: "email",
      title: "Começa em 1 hora",
      subtitle: "Enviado automaticamente · 60 min antes do webinar",
      templateKeyMatch: ["reminder-1h", "reminder_1h", "video_reminder_1h"],
      conditionLabel: "1H ANTES DO WEBINAR",
      sendOffsetHours: -1,
      iconEmoji: "✉️",
      borderColorOverride: "#3b82f6",
    },
    // ── SECTION 2: CONFIRMAÇÕES DE COMPRA ──
    {
      type: "email",
      title: "Confirmação de compra — Premium Pass",
      subtitle: "Gravação HD · Pack · Q&A 10 Mar · link calendário",
      templateKeyMatch: ["video_payment_premium"],
      sendOffsetHours: null,
      sectionDivider: "CONFIRMAÇÕES DE COMPRA",
      isPaymentBlock: true,
      iconEmoji: "🎬",
      borderColorOverride: "#16a34a",
      customTag: { label: "AUTOMÁTICO · PÓS-PAGAMENTO", bg: "#dcfce7", color: "#16a34a" },
    },
    {
      type: "email",
      title: "Confirmação de compra — Masterclass",
      subtitle: "Masterclass 12 Mar · 10h00 · link calendário",
      templateKeyMatch: ["video_payment_masterclass"],
      sendOffsetHours: null,
      isPaymentBlock: true,
      iconEmoji: "🎓",
      borderColorOverride: "#7c3aed",
      customTag: { label: "AUTOMÁTICO · PÓS-PAGAMENTO", bg: "#f3e8ff", color: "#7c3aed" },
    },
    // ── SECTION 3: APÓS O WEBINAR ──
    {
      type: "email",
      title: "Email pós-webinar",
      subtitle: "Envio manual ou automático · 3h após o webinar",
      templateKeyMatch: ["postwebinar", "post-webinar", "post_webinar", "video_postwebinar"],
      isPostWebinar: true,
      sendOffsetHours: null,
      sectionDivider: "APÓS O WEBINAR",
      iconEmoji: "✉️",
      borderColorOverride: "#f59e0b",
      note: "Só para quem assistiu ao vivo (attended_live_at)",
    },
    {
      type: "email",
      title: "Email pós-webinar — Dia 1",
      subtitle: "6 de Março · 13h00 · todos os inscritos gratuitos",
      templateKeyMatch: ["video_postwebinar_day1"],
      sendOffsetHours: null,
      iconEmoji: "📧",
      borderColorOverride: "#f59e0b",
      customTag: { label: "6 MAR · 13H", bg: "#fef3c7", color: "#d97706" },
      note: "Inclui quem não assistiu ao vivo",
    },
    {
      type: "email",
      title: "Email pós-webinar — Dia 3",
      subtitle: "8 de Março · 10h00 · quem não comprou",
      templateKeyMatch: ["video_postwebinar_day3"],
      sendOffsetHours: null,
      iconEmoji: "📧",
      borderColorOverride: "#f59e0b",
      customTag: { label: "8 MAR · 10H", bg: "#fef3c7", color: "#d97706" },
    },
    // ── SMS NODES ──
    {
      type: "email",
      title: "SMS pós-webinar",
      subtitle: "Envio manual · todos os inscritos com telefone",
      templateKeyMatch: ["sms_postwebinar"],
      sendOffsetHours: null,
      iconEmoji: "📱",
      borderColorOverride: "#8b5cf6",
      customTag: { label: "MANUAL", bg: "#fef3c7", color: "#d97706" },
      channel: "sms",
      smsSendConfig: {
        planFilter: ["free"],
        webinarFilter: "current",
        smsText: "O webinar Video com IA ja decorreu! Acede ao workbook e materiais em imagenscomia.com/recursos — Frederico Carvalho",
        requirePhone: true,
      },
    },
    // ── SECTION 4: FECHO DE LEADS ──
    {
      type: "email",
      title: "Email de fecho",
      subtitle: "10 de Março · 10h00 · após sequência sem compra",
      templateKeyMatch: ["video_postwebinar_closing"],
      sendOffsetHours: null,
      sectionDivider: "FECHO DE LEADS",
      iconEmoji: "🔴",
      borderColorOverride: "#ef4444",
      customTag: { label: "10 MAR · MARCA COMO PERDIDO", bg: "#fee2e2", color: "#dc2626" },
      infoBox: "Após envio deste email, o lead é marcado como 'perdido' no CRM com a data de fecho registada.",
    },
    // ── SMS REMINDERS ──
    {
      type: "email",
      title: "SMS lembrete Q&A — 10 Mar",
      subtitle: "30 min antes · Premium Pass (imagens + vídeo)",
      templateKeyMatch: ["sms_reminder_qa"],
      sendOffsetHours: null,
      iconEmoji: "📱",
      borderColorOverride: "#3b82f6",
      customTag: { label: "10 MAR · 14H00", bg: "#dbeafe", color: "#1d4ed8" },
      channel: "sms",
      smsSendConfig: {
        planFilter: ["premium"],
        webinarFilter: "all",
        smsText: "Lembrete: a sessao Q&A comeca as 14:30. O link de acesso foi enviado por email. Ate ja! — Frederico",
        requirePhone: true,
      },
    },
    {
      type: "email",
      title: "SMS lembrete Masterclass — 12 Mar",
      subtitle: "30 min antes · Masterclass + Bundle (imagens + vídeo)",
      templateKeyMatch: ["sms_reminder_masterclass"],
      sendOffsetHours: null,
      iconEmoji: "📱",
      borderColorOverride: "#7c3aed",
      customTag: { label: "12 MAR · 09H30", bg: "#f3e8ff", color: "#7c3aed" },
      channel: "sms",
      smsSendConfig: {
        planFilter: ["masterclass", "bundle"],
        webinarFilter: "all",
        smsText: "Lembrete: a Masterclass comeca as 10:00. O link de acesso foi enviado por email. Ate ja! — Frederico",
        requirePhone: true,
      },
    },
    // ── END ──
    {
      type: "end",
      title: "Fluxo concluído",
      subtitle: "Inscrito recebeu todos os emails do ciclo",
      templateKeyMatch: [],
    },
  ];
}

function matchTemplate(templateKey: string, patterns: string[]): boolean {
  const k = templateKey.toLowerCase();
  return patterns.some((p) => k.includes(p));
}

function getTag(node: NodeDef, webinarPast: boolean, hasSentLogs: boolean, webinar: WebinarKey): TagType | null {
  if (node.type === "trigger" || node.type === "end") return null;
  // Video nodes use customTag — skip generic tag logic
  if (webinar === "video" && node.customTag) return null;
  if (node.templateKeyMatch.some((p) => p.includes("confirmation"))) {
    return "IMEDIATO";
  }
  if (node.isPostWebinar) {
    if (hasSentLogs) return "ENVIADO";
    if (webinarPast) return "MANUAL";
    return "AGENDADO";
  }
  // Reminder nodes for video: dynamic based on date
  if (webinar === "video" && node.sendOffsetHours != null) {
    const sendDate = new Date(WEBINAR_CONFIG.video.startDate.getTime() + node.sendOffsetHours * 60 * 60 * 1000);
    const now = new Date();
    const sendDay = sendDate.toDateString();
    const today = now.toDateString();
    if (sendDay === today) return "A ENVIAR";
    if (sendDate.getTime() > now.getTime()) return "AGENDADO";
    return "ENVIADO";
  }
  if (webinarPast) return hasSentLogs ? "ENVIADO" : "ENVIADO";
  return "AGENDADO";
}

/* ─── Section Divider ─── */
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{ background: "#d1d5db" }} />
      <span
        style={{
          fontSize: 10,
          color: "#9ca3af",
          letterSpacing: 2,
          textTransform: "uppercase",
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: "#d1d5db" }} />
    </div>
  );
}

/* ─── Tag Badge ─── */
function TagBadge({ tag, pulse }: { tag: TagType; pulse?: boolean }) {
  const s = TAG_STYLES[tag];
  return (
    <span
      className={pulse ? "animate-pulse" : ""}
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

/* ─── Custom Tag Badge ─── */
function CustomTagBadge({ tag }: { tag: { label: string; bg: string; color: string } }) {
  return (
    <span
      style={{
        background: tag.bg,
        color: tag.color,
        fontSize: 9,
        padding: "2px 8px",
        borderRadius: 20,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
    >
      {tag.label}
    </span>
  );
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
  const [sendingSmsKey, setSendingSmsKey] = useState<string | null>(null);
  const [smsResult, setSmsResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [editingSmsKey, setEditingSmsKey] = useState<string | null>(null);
  const [editedSmsText, setEditedSmsText] = useState("");
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

      // For SMS nodes, count from message_logs with channel=sms
      if (n.channel === "sms") {
        let sent = 0, failed = 0;
        for (const l of logs) {
          if (matchTemplate(l.template_key, n.templateKeyMatch)) {
            if (l.status === "sent") sent++;
            if (l.status === "failed") failed++;
          }
        }
        result[idx] = { sent, failed };
        continue;
      }

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

  const handleBulkSms = async (node: NodeDef, customText?: string) => {
    const config = node.smsSendConfig;
    if (!config) return;
    const templateKey = node.templateKeyMatch[0] || "sms_manual";
    const smsText = customText || config.smsText;

    // Get eligible recipients
    let eligible = inscritos.filter((i) => {
      if (!i.whatsapp) return false;
      if (i.do_not_contact) return false;
      if (config.webinarFilter === "current" && i.webinar !== webinar) return false;
      const plan = i.plan || "free";
      return config.planFilter.includes(plan);
    });

    if (eligible.length === 0) {
      toast.error("Nenhum destinatário elegível com telefone encontrado.");
      return;
    }

    if (!confirm(`Enviar SMS a ${eligible.length} pessoa(s)?\n\nTexto:\n"${smsText}"`)) return;

    setSendingSmsKey(templateKey);
    setEditingSmsKey(null);
    setSmsResult(null);
    const adminEmail = sessionStorage.getItem("crm_admin_email") || "";
    let sent = 0, failed = 0;

    for (const person of eligible) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sms`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-crm-admin-email": adminEmail,
            },
            body: JSON.stringify({
              to: person.whatsapp,
              text: smsText,
              provider: "egoi",
              registrationId: person.id,
            }),
          }
        );
        const data = await res.json();
        if (data.success) {
          sent++;
        } else {
          failed++;
          console.warn(`SMS failed for ${person.nome}:`, data.error);
        }
      } catch (err) {
        failed++;
        console.error(`SMS error for ${person.nome}:`, err);
      }
    }

    setSendingSmsKey(null);
    setSmsResult({ sent, failed, total: eligible.length });
    if (failed === 0) {
      toast.success(`✅ ${sent} SMS enviados com sucesso!`);
    } else {
      toast.warning(`📱 ${sent} enviados, ${failed} falharam de ${eligible.length} total`);
    }
  };

  // Group payment block nodes
  const paymentBlockIndices = nodes.reduce<number[]>((acc, n, i) => {
    if (n.isPaymentBlock) acc.push(i);
    return acc;
  }, []);

  const renderNodeCard = (node: NodeDef, idx: number) => {
    const tag = getTag(node, webinarPast, (nodeCounts[idx]?.sent ?? 0) > 0, webinar);
    const counts = nodeCounts[idx];
    const hasFailed = (counts?.failed ?? 0) > 0;

    const borderColor = node.borderColorOverride
      || (node.type === "trigger" ? "#7c3aed"
        : node.type === "end" ? "#94A3B8"
          : hasFailed ? "#ef4444"
            : tag ? TAG_BORDER[tag] : "#e2e8f0");

    const iconElement = node.iconEmoji ? (
      <span className="flex-shrink-0 mt-0.5 text-base leading-none">{node.iconEmoji}</span>
    ) : (
      <div className="flex-shrink-0 mt-0.5" style={{ color: borderColor }}>
        {node.type === "trigger" && <Users size={20} />}
        {node.type === "email" && <Mail size={18} />}
        {node.type === "end" && <CheckCircle2 size={20} />}
      </div>
    );

    return (
      <div
        style={{
          background: node.type === "end" ? "#F8FAFC" : "white",
          border: "1px solid #e2e8f0",
          borderLeft: `4px solid ${borderColor}`,
          borderRadius: 10,
          padding: "14px 16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
        className="flex justify-between items-start gap-4"
      >
        {/* Left */}
        <div className="flex items-start gap-3 min-w-0">
          {iconElement}
          <div className="min-w-0">
            <p className="font-heading font-bold" style={{ fontSize: node.type === "trigger" ? 15 : 14, color: "#111827" }}>
              {node.title}
            </p>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{node.subtitle}</p>
            {node.note && (
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, fontStyle: "italic" }}>{node.note}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {node.customTag && <CustomTagBadge tag={node.customTag} />}
              {tag && !node.customTag && <TagBadge tag={tag} pulse={tag === "A ENVIAR"} />}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0" style={{ minWidth: 100 }}>
          {node.type === "trigger" && (
            <span style={{ fontSize: 12, color: "#888" }}>{inscritosCount} inscrições</span>
          )}

          {/* SMS node right side */}
          {node.channel === "sms" && (
            <div className="flex flex-col items-end gap-1" style={{ maxWidth: 280 }}>
              {counts && counts.sent > 0 && (
                <span className="text-[13px] font-semibold" style={{ color: "#7c3aed" }}>
                  {counts.sent} enviados
                </span>
              )}
              {counts && counts.failed > 0 && (
                <span className="flex items-center gap-1" style={{ fontSize: 12, color: "#ef4444" }}>
                  <AlertTriangle size={11} />
                  {counts.failed} falhas
                </span>
              )}
              {editingSmsKey === node.templateKeyMatch[0] ? (
                <div className="flex flex-col gap-1.5 w-full mt-1">
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded text-[12px] leading-snug resize-y"
                    rows={3}
                    value={editedSmsText}
                    onChange={(e) => setEditedSmsText(e.target.value)}
                  />
                  <div className="flex gap-1.5 justify-end">
                    <button
                      onClick={() => setEditingSmsKey(null)}
                      className="text-[11px] px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleBulkSms(node, editedSmsText)}
                      className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded text-white"
                      style={{ background: "#16a34a" }}
                    >
                      <Send size={10} />
                      Confirmar envio
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingSmsKey(node.templateKeyMatch[0]);
                    setEditedSmsText(node.smsSendConfig?.smsText || "");
                  }}
                  disabled={sendingSmsKey === node.templateKeyMatch[0]}
                  className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors mt-1"
                  style={{ background: sendingSmsKey === node.templateKeyMatch[0] ? "#94a3b8" : "#16a34a", color: "#fff" }}
                >
                  {sendingSmsKey === node.templateKeyMatch[0] ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      <Smartphone size={12} />
                      Enviar SMS agora →
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Email node right side */}
          {node.type === "email" && !node.channel?.startsWith("sms") && emailStatsLoading && (
            <span style={{ fontSize: 12, color: "#94A3B8" }}>
              <span className="inline-flex gap-0.5">
                <span className="animate-pulse">·</span>
                <span className="animate-pulse" style={{ animationDelay: "150ms" }}>·</span>
                <span className="animate-pulse" style={{ animationDelay: "300ms" }}>·</span>
              </span>
            </span>
          )}
          {node.type === "email" && node.channel !== "sms" && !emailStatsLoading && counts && (
            <div className="flex flex-col items-end gap-0.5">
              {counts.sent > 0 ? (
                <button
                  onClick={() => {
                    const rawKey = node.templateKeyMatch[0]?.replace(/-/g, "_").replace("stage_0", "confirmation") || "";
                    onClickSentCount?.(rawKey, node.title, webinar);
                  }}
                  className="text-[13px] font-semibold hover:underline cursor-pointer"
                  style={{ color: "#1e40af" }}
                >
                  {counts.sent} enviados
                </button>
              ) : (
                <span style={{ fontSize: 12, color: "#9ca3af" }}>0 enviados</span>
              )}
              <span className="flex items-center gap-1" style={{ fontSize: 12, color: counts.failed > 0 ? "#ef4444" : "#9ca3af" }}>
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
          {node.type === "email" && node.channel !== "sms" && !node.isPostWebinar && (
            <button
              onClick={() => {
                const emailKey = node.templateKeyMatch[0]?.replace(/-/g, "_") || "";
                const cleaned = emailKey.replace("stage_0", "confirmation");
                const tplKey = cleaned.startsWith(`${webinar}_`) ? cleaned : `${webinar}_${cleaned}`;
                onOpenEditor?.(tplKey);
              }}
              className="text-[11px] font-medium hover:underline"
              style={{ color: "#6b7280" }}
            >
              Ver email →
            </button>
          )}
          {node.isPostWebinar && (
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={() => onOpenEditor?.(`${webinar}_postwebinar`)}
                className="text-[11px] font-medium hover:underline"
                style={{ color: "#6b7280" }}
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
    );
  };

  // Render connector line
  const Connector = ({ height = 12 }: { height?: number }) => (
    <div className="flex justify-center">
      <div style={{ width: 2, height, borderLeft: "2px dashed #e5e7eb" }} />
    </div>
  );

  return (
    <div className="relative max-w-[800px] mx-auto">
      {nodes.map((node, idx) => {
        const isLast = idx === nodes.length - 1;
        const isFirstPayment = paymentBlockIndices[0] === idx;
        const isInPaymentBlock = paymentBlockIndices.includes(idx);
        const isLastPayment = paymentBlockIndices[paymentBlockIndices.length - 1] === idx;

        // If this node is inside payment block but not the first, skip — rendered inside block
        if (isInPaymentBlock && !isFirstPayment) return null;

        return (
          <Fragment key={idx}>
            {/* Section divider */}
            {node.sectionDivider && (
              <>
                {idx > 0 && <Connector height={8} />}
                <SectionDivider label={node.sectionDivider} />
              </>
            )}

            {/* Condition label */}
            {node.conditionLabel && !node.sectionDivider && (
              <div className="flex items-center justify-center py-2">
                <span style={{ fontSize: 9, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>
                  {node.conditionLabel}
                </span>
              </div>
            )}

            {/* Connector before node */}
            {idx > 0 && !node.sectionDivider && <Connector />}

            {/* Payment block wrapper */}
            {isFirstPayment ? (
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <p style={{ fontSize: 9, color: "#3b82f6", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
                  ENVIADO APÓS PAGAMENTO CONFIRMADO
                </p>
                <div className="space-y-2">
                  {paymentBlockIndices.map((pIdx) => (
                    <Fragment key={pIdx}>
                      {renderNodeCard(nodes[pIdx], pIdx)}
                    </Fragment>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {renderNodeCard(node, idx)}
                {/* Info box */}
                {node.infoBox && (
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 8,
                      padding: "10px 12px",
                      marginTop: 8,
                      fontSize: 12,
                      color: "#991b1b",
                    }}
                  >
                    {node.infoBox}
                  </div>
                )}
              </>
            )}

            {/* Connector after node */}
            {!isLast && <Connector />}
          </Fragment>
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
