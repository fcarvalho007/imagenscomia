import { useMemo, useState, useEffect, Fragment, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Users, Mail, CheckCircle2, Send, AlertTriangle, Smartphone, Loader2, ChevronDown, Upload } from "lucide-react";
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
  planFilter: string[];
  webinarFilter: "current" | "all";
  smsText: string;
  requirePhone?: boolean;
  requirePaid?: boolean;
}

interface AudienceFilter {
  planFilter?: string[];
  requirePaid?: boolean;
  requirePhone?: boolean;
  excludePaid?: boolean;
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
  audienceFilter?: AudienceFilter;
  dayGroup?: string;
  edgeFunctionName?: string;
}

/* ─── Day Group Configuration ─── */
interface DayGroupConfig {
  label: string;
  number: string;
  borderColor: string;
  bgColor: string;
}

const DAY_GROUP_CONFIG: Record<string, DayGroupConfig> = {
  pre: { label: "PRÉ-WEBINAR", number: "0", borderColor: "#3b82f6", bgColor: "#f8fafc" },
  compra: { label: "CONFIRMAÇÕES DE COMPRA", number: "✓", borderColor: "#16a34a", bgColor: "#f0fdf4" },
  d0: { label: "DIA DO WEBINAR", number: "D", borderColor: "#8b5cf6", bgColor: "#faf5ff" },
  d1: { label: "DIA 1 — 6 MARÇO", number: "1", borderColor: "#f59e0b", bgColor: "#fffbeb" },
  d3: { label: "DIA 3 — 8 MARÇO", number: "3", borderColor: "#f59e0b", bgColor: "#fffbeb" },
  d5: { label: "DIA 5 — FECHO", number: "5", borderColor: "#ef4444", bgColor: "#fef2f2" },
  end: { label: "", number: "", borderColor: "#94a3b8", bgColor: "transparent" },
  // imagens webinar
  img_pre: { label: "PRÉ-WEBINAR", number: "0", borderColor: "#3b82f6", bgColor: "#f8fafc" },
  img_post: { label: "APÓS O WEBINAR", number: "D", borderColor: "#f59e0b", bgColor: "#fffbeb" },
  // post-event
  post_start: { label: "INSCRIÇÃO PÓS-EVENTO", number: "0", borderColor: "#f59e0b", bgColor: "#fffbeb" },
  post_convert: { label: "SEQUÊNCIA DE CONVERSÃO", number: "→", borderColor: "#3b82f6", bgColor: "#f8fafc" },
  post_close: { label: "FECHO", number: "✕", borderColor: "#ef4444", bgColor: "#fef2f2" },
  post_paid: { label: "CLIENTES PAGOS", number: "€", borderColor: "#16a34a", bgColor: "#f0fdf4" },
  // masterclass
  mc_reminder: { label: "DIA DA MASTERCLASS · 12 MARÇO", number: "⏰", borderColor: "#3b82f6", bgColor: "#eff6ff" },
  mc_thankyou: { label: "PÓS-MASTERCLASS · 12 MARÇO", number: "0", borderColor: "#16a34a", bgColor: "#f0fdf4" },
  mc_d1: { label: "DIA 1 — 13 MARÇO", number: "1", borderColor: "#f59e0b", bgColor: "#fffbeb" },
  mc_d3: { label: "DIA 3 — 15 MARÇO · FECHO", number: "3", borderColor: "#ef4444", bgColor: "#fef2f2" },
  // masterclass sales
  mc_sell_invite: { label: "CONVITE · 9 MARÇO", number: "1", borderColor: "#8b5cf6", bgColor: "#faf5ff" },
  mc_sell_push: { label: "PUSH · 10 MARÇO", number: "2", borderColor: "#f59e0b", bgColor: "#fffbeb" },
  mc_sell_close: { label: "VÉSPERA · 11 MARÇO", number: "3", borderColor: "#ef4444", bgColor: "#fef2f2" },
  // Q&A
  post_qa: { label: "Q&A · 10 MARÇO · 14H30", number: "6", borderColor: "#3b82f6", bgColor: "#eff6ff" },
};

function computeEligible(node: NodeDef, inscritos: Inscrito[]): number {
  if (node.type === "trigger" || node.type === "end") return -1;

  if (node.channel === "sms" && node.smsSendConfig) {
    const cfg = node.smsSendConfig;
    return inscritos.filter((i) => {
      if (cfg.requirePhone && !i.whatsapp) return false;
      if (i.do_not_contact) return false;
      if (cfg.requirePaid && !i.paid_at && !i.premium_granted_at) return false;
      const plan = i.plan || "free";
      return cfg.planFilter.includes(plan);
    }).length;
  }

  const f = node.audienceFilter;
  if (!f) return inscritos.length;

  return inscritos.filter((i) => {
    if (i.do_not_contact) return false;
    if (f.planFilter && f.planFilter.length > 0) {
      const plan = i.plan || "free";
      if (!f.planFilter.includes(plan)) return false;
    }
    if (f.requirePaid && !i.paid_at && !i.premium_granted_at) return false;
    if (f.excludePaid && (i.paid_at || i.premium_granted_at)) return false;
    if (f.requirePhone && !i.whatsapp) return false;
    return true;
  }).length;
}

function getNodes(webinar: WebinarKey): NodeDef[] {
  if (webinar === "imagens") {
    return [
      {
        type: "trigger",
        title: "Inscrição submetida",
        subtitle: "Webinar Imagens IA · imagenscomia.com",
        templateKeyMatch: [],
        dayGroup: "img_pre",
      },
      {
        type: "email",
        title: "Confirmação imediata",
        subtitle: "Enviado automaticamente · segundos após inscrição",
        templateKeyMatch: ["confirmation"],
        sendOffsetHours: null,
        audienceFilter: {},
        dayGroup: "img_pre",
      },
      {
        type: "email",
        title: "Lembrete 48h",
        subtitle: "Enviado automaticamente · 48h antes do webinar",
        templateKeyMatch: ["reminder-48h", "reminder_48h"],
        conditionLabel: "48H ANTES DO WEBINAR",
        sendOffsetHours: -48,
        audienceFilter: {},
        dayGroup: "img_pre",
      },
      {
        type: "email",
        title: "Lembrete 24h",
        subtitle: "Enviado automaticamente · 24h antes do webinar",
        templateKeyMatch: ["reminder-24h", "reminder_24h"],
        conditionLabel: "24H ANTES DO WEBINAR",
        sendOffsetHours: -24,
        audienceFilter: {},
        dayGroup: "img_pre",
      },
      {
        type: "email",
        title: "Começa em 1 hora",
        subtitle: "Enviado automaticamente · 60 min antes do webinar",
        templateKeyMatch: ["reminder-1h", "reminder_1h"],
        conditionLabel: "1H ANTES DO WEBINAR",
        sendOffsetHours: -1,
        audienceFilter: {},
        dayGroup: "img_pre",
      },
      {
        type: "email",
        title: "Email pós-webinar",
        subtitle: "Envio manual via CRM ou automático 3h após o webinar",
        templateKeyMatch: ["postwebinar", "post-webinar", "post_webinar"],
        conditionLabel: "APÓS O WEBINAR",
        isPostWebinar: true,
        sendOffsetHours: null,
        audienceFilter: { planFilter: ["free"] },
        dayGroup: "img_post",
      },
      {
        type: "end",
        title: "Fluxo concluído",
        subtitle: "Inscrito recebeu todos os emails do ciclo",
        templateKeyMatch: [],
        dayGroup: "end",
      },
    ];
  }

  // ── VIDEO ──
  const now = new Date();
  const followupCutoff = new Date("2026-03-03T23:59:59Z");
  const isFollowupActive = now <= followupCutoff;

  return [
    // ── PRÉ-WEBINAR ──
    {
      type: "trigger",
      title: "Inscrição submetida",
      subtitle: "Webinar Vídeo com IA · imagenscomia.com/video",
      templateKeyMatch: [],
      iconEmoji: "👤",
      borderColorOverride: "#8b5cf6",
      dayGroup: "pre",
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
      audienceFilter: {},
      dayGroup: "pre",
    },
    {
      type: "email",
      title: "Follow-up upgrade",
      subtitle: "48h após inscrição · só gratuitos · só até 3 Mar",
      templateKeyMatch: ["video_followup_prewebinar"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#f59e0b",
      customTag: isFollowupActive
        ? { label: "CRON · ATÉ 3 MAR", bg: "#fef3c7", color: "#d97706" }
        : { label: "ENCERRADO", bg: "#f1f5f9", color: "#64748b" },
      audienceFilter: { planFilter: ["free"], excludePaid: true },
      dayGroup: "pre",
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
      audienceFilter: {},
      dayGroup: "pre",
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
      audienceFilter: {},
      dayGroup: "pre",
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
      audienceFilter: {},
      dayGroup: "pre",
    },
    // ── CONFIRMAÇÕES DE COMPRA ──
    {
      type: "email",
      title: "Confirmação de compra — Premium Pass",
      subtitle: "Sessão 70min · Workbook · GEMs · Áudio · link calendário",
      templateKeyMatch: ["video_payment_premium"],
      sendOffsetHours: null,
      isPaymentBlock: true,
      iconEmoji: "✉️",
      borderColorOverride: "#16a34a",
      customTag: { label: "AUTOMÁTICO · PÓS-PAGAMENTO", bg: "#dcfce7", color: "#16a34a" },
      audienceFilter: { planFilter: ["premium"], requirePaid: true },
      dayGroup: "compra",
    },
    {
      type: "email",
      title: "Confirmação de compra — Masterclass",
      subtitle: "Masterclass 12 Mar · 10h–13h · gravação incluída",
      templateKeyMatch: ["video_payment_masterclass"],
      sendOffsetHours: null,
      isPaymentBlock: true,
      iconEmoji: "✉️",
      borderColorOverride: "#7c3aed",
      customTag: { label: "AUTOMÁTICO · PÓS-PAGAMENTO", bg: "#f3e8ff", color: "#7c3aed" },
      audienceFilter: { planFilter: ["masterclass", "bundle"], requirePaid: true },
      dayGroup: "compra",
    },
    // ── APÓS O WEBINAR — DIA 0 ──
    {
      type: "email",
      title: "Email pós-webinar",
      subtitle: "Envio manual ou automático · 3h após o webinar",
      templateKeyMatch: ["postwebinar", "post-webinar", "post_webinar", "video_postwebinar"],
      isPostWebinar: true,
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#f59e0b",
      note: "Enviado a todos os inscritos gratuitos",
      audienceFilter: { planFilter: ["free"] },
      edgeFunctionName: "send-video-postwebinar",
      dayGroup: "d0",
    },
    // ── DIA 1 ──
    {
      type: "email",
      title: "Email pós-webinar — Dia 1",
      subtitle: "6 de Março · 12h30 · todos os inscritos gratuitos",
      templateKeyMatch: ["video_postwebinar_day1"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#f59e0b",
      customTag: { label: "6 MAR · 12H30", bg: "#fef3c7", color: "#d97706" },
      note: "Inclui quem não assistiu ao vivo",
      audienceFilter: { planFilter: ["free"], excludePaid: true },
      edgeFunctionName: "send-video-postwebinar-day1",
      dayGroup: "d1",
    },
    {
      type: "email",
      channel: "sms",
      title: "SMS follow-up — Dia 1",
      subtitle: "6 de Março · 12h45 · inscritos gratuitos com telefone",
      templateKeyMatch: ["sms_followup_day1"],
      sendOffsetHours: null,
      iconEmoji: "📱",
      borderColorOverride: "#f59e0b",
      customTag: { label: "6 MAR · 12H45", bg: "#fef3c7", color: "#d97706" },
      smsSendConfig: {
        planFilter: ["free"],
        webinarFilter: "current",
        smsText: "Bom dia. O documento resumo do webinar Video com IA foi enviado agora por email. Acesso premium + Sessao completa video em: imagenscomia.com/comprar",
        requirePhone: true,
      },
      audienceFilter: { planFilter: ["free"], excludePaid: true },
      dayGroup: "d1",
    },
    {
      type: "email",
      title: "Recursos — Premium Pass",
      subtitle: "10 clientes · acesso gravação + materiais · upsell Masterclass",
      templateKeyMatch: ["video_recursos_premium"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#16a34a",
      customTag: { label: "MANUAL · CLIENTES PREMIUM", bg: "#dcfce7", color: "#16a34a" },
      note: "Acesso à gravação + workbook + guia GEMs + áudio · upsell Masterclass 12 Mar",
      audienceFilter: { planFilter: ["premium"], requirePaid: true },
      edgeFunctionName: "send-video-recursos-access",
      dayGroup: "d1",
    },
    {
      type: "email",
      title: "Recursos — Masterclass",
      subtitle: "2 clientes · confirmação Masterclass 12 Mar · upsell gravação",
      templateKeyMatch: ["video_recursos_masterclass"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#7c3aed",
      customTag: { label: "MANUAL · CLIENTES MASTERCLASS", bg: "#ede9fe", color: "#7c3aed" },
      note: "Confirmação Masterclass 12 Mar 10h00 · upsell Premium Pass (gravação + materiais)",
      audienceFilter: { planFilter: ["masterclass"], requirePaid: true },
      edgeFunctionName: "send-video-recursos-access",
      dayGroup: "d1",
    },
    {
      type: "email",
      title: "Recursos — Bundle",
      subtitle: "5 clientes · acesso completo · gravação + Masterclass 12 Mar",
      templateKeyMatch: ["video_recursos_bundle"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#0ea5e9",
      customTag: { label: "MANUAL · CLIENTES BUNDLE", bg: "#e0f2fe", color: "#0ea5e9" },
      note: "Acesso completo: gravação + materiais + Masterclass 12 Mar · sem upsell",
      audienceFilter: { planFilter: ["bundle"], requirePaid: true },
      dayGroup: "d1",
    },
    // ── SMS RECURSOS POR PLANO (still day 1) ──
    {
      type: "email",
      title: "SMS Recursos — Premium Pass",
      subtitle: "Envio manual · clientes Premium com telefone",
      templateKeyMatch: ["sms_recursos_premium"],
      sendOffsetHours: null,
      iconEmoji: "📱",
      borderColorOverride: "#16a34a",
      customTag: { label: "MANUAL · SMS PREMIUM", bg: "#dcfce7", color: "#16a34a" },
      channel: "sms",
      smsSendConfig: {
        planFilter: ["premium"],
        webinarFilter: "current",
        smsText: "Ola! Ja tens acesso a gravacao (70min), workbook e guia GEMs em imagenscomia.com/recursos-video — usa o email de registo. Ate ja! — Frederico",
        requirePhone: true,
        requirePaid: true,
      },
      dayGroup: "d1",
    },
    {
      type: "email",
      title: "SMS Recursos — Masterclass",
      subtitle: "Envio manual · clientes Masterclass com telefone",
      templateKeyMatch: ["sms_recursos_masterclass"],
      sendOffsetHours: null,
      iconEmoji: "📱",
      borderColorOverride: "#7c3aed",
      customTag: { label: "MANUAL · SMS MASTERCLASS", bg: "#ede9fe", color: "#7c3aed" },
      channel: "sms",
      smsSendConfig: {
        planFilter: ["masterclass"],
        webinarFilter: "current",
        smsText: "Ola! A Masterclass e na quinta, 12 de Marco, as 10h. O link sera enviado na vespera por email. Confirma no teu calendario: calendar.app.google/qX6CxAwxafWHNEaYA — Frederico",
        requirePhone: true,
        requirePaid: true,
      },
      dayGroup: "d1",
    },
    {
      type: "email",
      title: "SMS Recursos — Bundle",
      subtitle: "Envio manual · clientes Bundle com telefone",
      templateKeyMatch: ["sms_recursos_bundle"],
      sendOffsetHours: null,
      iconEmoji: "📱",
      borderColorOverride: "#0ea5e9",
      customTag: { label: "MANUAL · SMS BUNDLE", bg: "#e0f2fe", color: "#0ea5e9" },
      channel: "sms",
      smsSendConfig: {
        planFilter: ["bundle"],
        webinarFilter: "current",
        smsText: "Ola! Ja tens acesso a gravacao e materiais em imagenscomia.com/recursos-video — usa o email de registo. A Masterclass e quinta 12 Mar as 10h (link na vespera). Ate ja! — Frederico",
        requirePhone: true,
        requirePaid: true,
      },
      dayGroup: "d1",
    },
    // ── DIA 3 ──
    {
      type: "email",
      title: "Email pós-webinar — Dia 3",
      subtitle: "8 de Março · 10h00 · quem não comprou",
      templateKeyMatch: ["video_postwebinar_day3"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#f59e0b",
      customTag: { label: "8 MAR · 10H", bg: "#fef3c7", color: "#d97706" },
      audienceFilter: { planFilter: ["free"], excludePaid: true },
      dayGroup: "d3",
    },
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
        smsText: "Ola! Ja viste a gravacao do webinar Video com IA? Tens 70min de conteudo pratico disponivel em imagenscomia.com/video — Frederico",
        requirePhone: true,
      },
      dayGroup: "d3",
    },
    // ── DIA 5 — FECHO ──
    {
      type: "email",
      title: "Email de fecho",
      subtitle: "10 de Março · 10h00 · após sequência sem compra",
      templateKeyMatch: ["video_postwebinar_closing"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#ef4444",
      customTag: { label: "10 MAR · MARCA COMO PERDIDO", bg: "#fee2e2", color: "#dc2626" },
      infoBox: "Após envio deste email, o lead é marcado como 'perdido' no CRM com a data de fecho registada.",
      audienceFilter: { planFilter: ["free"], excludePaid: true },
      dayGroup: "d5",
    },
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
        planFilter: ["premium", "bundle"],
        webinarFilter: "all",
        smsText: "Lembrete: a sessao Q&A comeca as 14:30. O link de acesso foi enviado por email. Ate ja! — Frederico",
        requirePhone: true,
        requirePaid: true,
      },
      dayGroup: "d5",
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
        requirePaid: true,
      },
      dayGroup: "d5",
    },
    // ── END ──
    {
      type: "end",
      title: "Fluxo concluído",
      subtitle: "Inscrito recebeu todos os emails do ciclo",
      templateKeyMatch: [],
      dayGroup: "end",
    },
  ];
}

/* ─── MASTERCLASS NODES (video only) ─── */
function getMasterclassNodes(): NodeDef[] {
  return [
    {
      type: "trigger",
      title: "📽 Masterclass Vídeo · 12 Março",
      subtitle: "Participantes pagos · Masterclass + Bundle",
      templateKeyMatch: [],
      iconEmoji: "🎬",
      borderColorOverride: "#16a34a",
      dayGroup: "mc_thankyou",
    },
    {
      type: "email",
      title: "Email Reminder — Masterclass hoje às 10h",
      subtitle: "12 de Março · 9h00 · 1h antes da sessão",
      templateKeyMatch: ["video_masterclass_reminder"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#1d4ed8",
      customTag: { label: "12 MAR · 9H00", bg: "#dbeafe", color: "#1d4ed8" },
      audienceFilter: { planFilter: ["masterclass", "bundle"], requirePaid: true },
      dayGroup: "mc_reminder",
    },
    {
      type: "email",
      channel: "sms",
      title: "SMS Reminder — Masterclass hoje",
      subtitle: "12 de Março · 9h00 · 1h antes da sessão",
      templateKeyMatch: ["sms_masterclass_reminder"],
      sendOffsetHours: null,
      iconEmoji: "📱",
      borderColorOverride: "#1d4ed8",
      customTag: { label: "12 MAR · MANUAL · SMS", bg: "#dbeafe", color: "#1d4ed8" },
      smsSendConfig: {
        planFilter: ["masterclass", "bundle"],
        webinarFilter: "current",
        smsText: "Bom dia! A Masterclass Video com IA comeca hoje as 10h. Link de acesso enviado por email. Ate ja! — Frederico",
        requirePhone: true,
        requirePaid: true,
      },
      dayGroup: "mc_reminder",
    },
    {
      type: "email",
      title: "Email pós-Masterclass — Obrigado",
      subtitle: "12 de Março · 14h · enviado imediatamente após o fim",
      templateKeyMatch: ["video_masterclass_thankyou"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#16a34a",
      customTag: { label: "12 MAR · AUTOMÁTICO", bg: "#dcfce7", color: "#16a34a" },
      audienceFilter: { planFilter: ["masterclass", "bundle"], requirePaid: true },
      dayGroup: "mc_thankyou",
    },
    {
      type: "email",
      title: "Email MC+24h — Recursos + Avaliação",
      subtitle: "14 de Março · 10h · gravação + recursos + avaliação Google",
      templateKeyMatch: ["video_masterclass_day1"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#f59e0b",
      customTag: { label: "13 MAR · 10H", bg: "#fef3c7", color: "#d97706" },
      note: "Inclui link para gravação da Masterclass e pedido de avaliação Google",
      audienceFilter: { planFilter: ["masterclass", "bundle"], requirePaid: true },
      dayGroup: "mc_d1",
    },
    {
      type: "email",
      channel: "sms",
      title: "SMS MC+24h — Lembrete avaliação",
      subtitle: "13 de Março · 11h · só quem tem telefone",
      templateKeyMatch: ["sms_masterclass_day1"],
      sendOffsetHours: null,
      iconEmoji: "📱",
      borderColorOverride: "#f59e0b",
      customTag: { label: "13 MAR · MANUAL · SMS", bg: "#fef3c7", color: "#d97706" },
      smsSendConfig: {
        planFilter: ["masterclass", "bundle"],
        webinarFilter: "current",
        smsText: "FC: A gravação da Masterclass já está disponível. Acede em imagenscomia.com/recursos-video — Frederico",
        requirePhone: true,
        requirePaid: true,
      },
      dayGroup: "mc_d1",
    },
    {
      type: "email",
      title: "Email MC+72h — Fecho + próximos passos",
      subtitle: "15 de Março · 10h · final da sequência",
      templateKeyMatch: ["video_masterclass_day3"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#ef4444",
      customTag: { label: "15 MAR · FECHO", bg: "#fee2e2", color: "#dc2626" },
      note: "Email de fechamento com recursos finais e próximos passos",
      audienceFilter: { planFilter: ["masterclass", "bundle"], requirePaid: true },
      dayGroup: "mc_d3",
    },
    {
      type: "end",
      title: "Sequência Masterclass concluída",
      subtitle: "Participante recebeu todos os emails pós-Masterclass",
      templateKeyMatch: [],
      dayGroup: "end",
    },
  ];
}

/* ─── MASTERCLASS SALES NODES (video only) ─── */
function getMasterclassSalesNodes(): NodeDef[] {
  return [
    {
      type: "trigger",
      title: "🎯 Venda Masterclass — Push Comercial",
      subtitle: "Inscritos gratuitos · sem compra",
      templateKeyMatch: [],
      iconEmoji: "🎯",
      borderColorOverride: "#8b5cf6",
      dayGroup: "mc_sell_invite",
    },
    {
      type: "email",
      title: "Email 1 — Convite Masterclass",
      subtitle: "9 de Março · 10h · valor da sessão + early bird",
      templateKeyMatch: ["video_mc_sales_invite"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#8b5cf6",
      customTag: { label: "9 MAR · 10H", bg: "#f3e8ff", color: "#7c3aed" },
      note: "Apresenta o Premium Pass e a Masterclass como oportunidade para quem ainda não comprou",
      audienceFilter: { planFilter: ["free"], excludePaid: true },
      dayGroup: "mc_sell_invite",
    },
    {
      type: "email",
      channel: "sms",
      title: "SMS — Lembrete Masterclass",
      subtitle: "10 de Março · 11h · inscritos gratuitos com telefone",
      templateKeyMatch: ["sms_mc_sales_reminder"],
      sendOffsetHours: null,
      iconEmoji: "📱",
      borderColorOverride: "#f59e0b",
      customTag: { label: "10 MAR · MANUAL · SMS", bg: "#fef3c7", color: "#d97706" },
      smsSendConfig: {
        planFilter: ["free"],
        webinarFilter: "current",
        smsText: "Ola! A Masterclass Video com IA e na quinta 12 Mar as 10h. Sessao ao vivo de 3h + Premium Pass incluido no Bundle em imagenscomia.com/comprar — Frederico",
        requirePhone: true,
      },
      dayGroup: "mc_sell_push",
    },
    {
      type: "email",
      title: "Email 2 — Última oportunidade",
      subtitle: "11 de Março · 10h · urgência + prova social",
      templateKeyMatch: ["video_mc_sales_closing"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#ef4444",
      customTag: { label: "11 MAR · ÚLTIMO EMAIL", bg: "#fee2e2", color: "#dc2626" },
      note: "Último push antes da Masterclass · inclui testemunhos e contagem regressiva",
      audienceFilter: { planFilter: ["free"], excludePaid: true },
      dayGroup: "mc_sell_close",
    },
    {
      type: "end",
      title: "Masterclass 12 Mar · 10h",
      subtitle: "Fim da sequência de venda — conversão ou não",
      templateKeyMatch: [],
      dayGroup: "end",
    },
  ];
}

/* ─── POST-EVENT NODES (video only) ─── */
function getPostEventNodes(): NodeDef[] {
  return [
    {
      type: "trigger",
      title: "Inscrição pós-evento",
      subtitle: "Webinar já decorreu · inscrição via /video",
      templateKeyMatch: [],
      iconEmoji: "👤",
      borderColorOverride: "#f59e0b",
      dayGroup: "post_start",
    },
    {
      type: "email",
      title: "Confirmação imediata",
      subtitle: "Enviado automaticamente · segundos após inscrição · inclui link de upgrade",
      templateKeyMatch: ["video_confirmation"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#10b981",
      customTag: { label: "AUTOMÁTICO · IMEDIATO", bg: "#dcfce7", color: "#16a34a" },
      audienceFilter: {},
      dayGroup: "post_start",
    },
    // ── SEQUÊNCIA DE CONVERSÃO ──
    {
      type: "email",
      title: "Email Day 1 — Sessão prática + Premium Pass",
      subtitle: "24h após inscrição · sessão 70min + materiais de apoio",
      templateKeyMatch: ["video_postwebinar_day1"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#f59e0b",
      customTag: { label: "AUTOMÁTICO · 24H", bg: "#fef3c7", color: "#d97706" },
      note: "Enviado automaticamente 24h após inscrição para quem não comprou",
      audienceFilter: { planFilter: ["free"], excludePaid: true },
      dayGroup: "post_convert",
    },
    {
      type: "email",
      title: "Email Day 3 — Última oportunidade",
      subtitle: "72h após inscrição · reforço de urgência",
      templateKeyMatch: ["video_postwebinar_day3"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#f59e0b",
      customTag: { label: "AUTOMÁTICO · 72H", bg: "#fef3c7", color: "#d97706" },
      audienceFilter: { planFilter: ["free"], excludePaid: true },
      dayGroup: "post_convert",
    },
    {
      type: "email",
      title: "SMS follow-up pós-inscrição",
      subtitle: "Envio manual · gratuitos com telefone",
      templateKeyMatch: ["sms_postwebinar_post"],
      sendOffsetHours: null,
      iconEmoji: "📱",
      borderColorOverride: "#8b5cf6",
      customTag: { label: "MANUAL · SMS", bg: "#fef3c7", color: "#d97706" },
      channel: "sms",
      smsSendConfig: {
        planFilter: ["free"],
        webinarFilter: "current",
        smsText: "Ola! Tens uma sessao pratica de 70min sobre video com IA a tua espera em imagenscomia.com/video — Frederico",
        requirePhone: true,
      },
      dayGroup: "post_convert",
    },
    {
      type: "email",
      title: "Email de fecho — Marca como perdido",
      subtitle: "5 dias após inscrição · lead marcado como perdido",
      templateKeyMatch: ["video_postwebinar_closing"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#ef4444",
      customTag: { label: "AUTOMÁTICO · 5 DIAS", bg: "#fee2e2", color: "#dc2626" },
      infoBox: "Após envio deste email, o lead é marcado como 'perdido' no CRM com a data de fecho registada.",
      audienceFilter: { planFilter: ["free"], excludePaid: true },
      dayGroup: "post_close",
    },
    // ── CLIENTES PAGOS ──
    {
      type: "email",
      title: "Confirmação de compra — Premium Pass",
      subtitle: "Sessão 70min · Workbook · GEMs · Áudio",
      templateKeyMatch: ["video_payment_premium"],
      sendOffsetHours: null,
      isPaymentBlock: true,
      iconEmoji: "✉️",
      borderColorOverride: "#16a34a",
      customTag: { label: "AUTOMÁTICO · PÓS-PAGAMENTO", bg: "#dcfce7", color: "#16a34a" },
      audienceFilter: { planFilter: ["premium"], requirePaid: true },
      dayGroup: "post_paid",
    },
    {
      type: "email",
      title: "Confirmação de compra — Masterclass",
      subtitle: "Masterclass 12 Mar · 10h–13h · gravação incluída",
      templateKeyMatch: ["video_payment_masterclass"],
      sendOffsetHours: null,
      isPaymentBlock: true,
      iconEmoji: "✉️",
      borderColorOverride: "#7c3aed",
      customTag: { label: "AUTOMÁTICO · PÓS-PAGAMENTO", bg: "#f3e8ff", color: "#7c3aed" },
      audienceFilter: { planFilter: ["masterclass", "bundle"], requirePaid: true },
      dayGroup: "post_paid",
    },
    // ── ACESSO AOS RECURSOS ──
    {
      type: "email",
      title: "Recursos — Premium Pass",
      subtitle: "Sessão 70min · Workbook · GEMs · Áudio · upsell Masterclass",
      templateKeyMatch: ["video_recursos_premium"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#16a34a",
      customTag: { label: "MANUAL · CLIENTES PREMIUM", bg: "#dcfce7", color: "#16a34a" },
      audienceFilter: { planFilter: ["premium"], requirePaid: true },
      dayGroup: "post_paid",
    },
    {
      type: "email",
      title: "Recursos — Masterclass",
      subtitle: "Masterclass 12 Mar · 10h–13h · upsell Premium Pass",
      templateKeyMatch: ["video_recursos_masterclass"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#7c3aed",
      customTag: { label: "MANUAL · CLIENTES MASTERCLASS", bg: "#ede9fe", color: "#7c3aed" },
      audienceFilter: { planFilter: ["masterclass"], requirePaid: true },
      dayGroup: "post_paid",
    },
    {
      type: "email",
      title: "Recursos — Bundle",
      subtitle: "Acesso completo · 5 recursos + Masterclass 12 Mar",
      templateKeyMatch: ["video_recursos_bundle"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#0ea5e9",
      customTag: { label: "MANUAL · CLIENTES BUNDLE", bg: "#e0f2fe", color: "#0ea5e9" },
      audienceFilter: { planFilter: ["bundle"], requirePaid: true },
      dayGroup: "post_paid",
    },
    {
      type: "email",
      title: "SMS Acesso aos recursos",
      subtitle: "Envio manual · clientes pagos com telefone",
      templateKeyMatch: ["sms_recursos_post"],
      sendOffsetHours: null,
      iconEmoji: "📱",
      borderColorOverride: "#8b5cf6",
      customTag: { label: "MANUAL · SMS", bg: "#fef3c7", color: "#d97706" },
      channel: "sms",
      smsSendConfig: {
        planFilter: ["premium", "masterclass", "bundle"],
        webinarFilter: "current",
        smsText: "Ola! Ja tens acesso a sessao completa (70min), workbook, guia GEMs e audio em imagenscomia.com/recursos-video — usa o email de registo. Ate ja! — Frederico",
        requirePhone: true,
        requirePaid: true,
      },
      dayGroup: "post_paid",
    },
    // ── Q&A · 10 MARÇO ──
    {
      type: "email",
      title: "Email lembrete Q&A",
      subtitle: "10 de Março · 13h · clientes pagos",
      templateKeyMatch: ["video_qa_reminder"],
      sendOffsetHours: null,
      iconEmoji: "✉️",
      borderColorOverride: "#3b82f6",
      customTag: { label: "10 MAR · 13H", bg: "#dbeafe", color: "#1d4ed8" },
      audienceFilter: { planFilter: ["premium", "bundle"], requirePaid: true },
      dayGroup: "post_qa",
    },
    {
      type: "email",
      title: "SMS lembrete Q&A",
      subtitle: "10 de Março · 13h · clientes pagos com telefone",
      templateKeyMatch: ["sms_reminder_qa_post"],
      sendOffsetHours: null,
      iconEmoji: "📱",
      borderColorOverride: "#3b82f6",
      customTag: { label: "10 MAR · 13H · SMS", bg: "#dbeafe", color: "#1d4ed8" },
      channel: "sms",
      smsSendConfig: {
        planFilter: ["premium", "bundle"],
        webinarFilter: "current",
        smsText: "Lembrete: a sessao Q&A comeca as 14:30. Entra aqui: https://us02web.zoom.us/j/88370994509?jst=3 — Frederico",
        requirePhone: true,
        requirePaid: true,
      },
      dayGroup: "post_qa",
    },
    {
      type: "end",
      title: "Conversão concluída",
      subtitle: "Inscrito pós-evento recebeu confirmação, pagou e tem acesso",
      templateKeyMatch: [],
      dayGroup: "end",
    },
  ];
}

function matchTemplate(templateKey: string, patterns: string[]): boolean {
  const k = templateKey.toLowerCase();
  return patterns.some((p) => k === p);
}

function getTag(node: NodeDef, webinarPast: boolean, hasSentLogs: boolean, webinar: WebinarKey): TagType | null {
  if (node.type === "trigger" || node.type === "end") return null;
  if (webinar === "video" && node.customTag) return null;
  if (node.templateKeyMatch.some((p) => p.includes("confirmation"))) {
    return "IMEDIATO";
  }
  if (node.isPostWebinar) {
    if (hasSentLogs) return "ENVIADO";
    if (webinarPast) return "MANUAL";
    return "AGENDADO";
  }
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

/* ─── Day Group Container ─── */
function DayGroupContainer({
  groupKey,
  children,
}: {
  groupKey: string;
  children: React.ReactNode;
}) {
  const config = DAY_GROUP_CONFIG[groupKey];
  if (!config || groupKey === "end") {
    return <>{children}</>;
  }

  return (
    <div
      className="overflow-hidden"
      style={{
        background: config.bgColor,
        borderLeft: `4px solid ${config.borderColor}`,
        borderRadius: 12,
        padding: "16px 12px 12px",
        position: "relative",
      }}
    >
      {/* Header with cinematic number */}
      <div className="flex items-center gap-4 mb-4">
        <span
          style={{
            fontSize: 48,
            fontWeight: 800,
            lineHeight: 1,
            color: `${config.borderColor}20`,
            fontFamily: "'Montserrat', 'Inter', system-ui, sans-serif",
            userSelect: "none",
            minWidth: 40,
            textAlign: "center",
          }}
        >
          {config.number}
        </span>
        <span
          style={{
            fontSize: 11,
            color: config.borderColor,
            letterSpacing: 2,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          {config.label}
        </span>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

/* ─── Arrow Connector between groups ─── */
function ArrowConnector() {
  return (
    <div className="flex flex-col items-center py-1">
      <div style={{ width: 2, height: 16, background: "#cbd5e1" }} />
      <ChevronDown size={18} style={{ color: "#cbd5e1", marginTop: -4 }} />
    </div>
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
  flowSubTab,
}: {
  webinar: WebinarKey;
  inscritos: Inscrito[];
  logs: MessageLog[];
  onOpenEditor?: (templateKey: string) => void;
  emailStats?: EmailStats;
  emailStatsLoading?: boolean;
  onClickSentCount?: (emailKey: string, title: string, webinar: WebinarKey) => void;
  flowSubTab?: "pre" | "post" | "mc" | "mc_sell";
}) {
  const [sendingPost, setSendingPost] = useState(false);
  const [sendingSmsKey, setSendingSmsKey] = useState<string | null>(null);
  const [smsResult, setSmsResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [smsDetailedResults, setSmsDetailedResults] = useState<Array<{ name: string; phone: string; success: boolean; error?: string }>>([]);
  const [showSmsReport, setShowSmsReport] = useState(false);
  const [importingSmsKey, setImportingSmsKey] = useState<string | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const pendingImportKey = useRef<string>("");
  const [editingSmsKey, setEditingSmsKey] = useState<string | null>(null);
  const [editedSmsText, setEditedSmsText] = useState("");

  const SMS_DRAFT_VERSION = 2;
  const [customSmsTexts, setCustomSmsTexts] = useState<Record<string, string>>(() => {
    try {
      const storedVersion = localStorage.getItem("crm_sms_drafts_version");
      if (storedVersion !== String(SMS_DRAFT_VERSION)) {
        localStorage.removeItem("crm_sms_drafts");
        localStorage.setItem("crm_sms_drafts_version", String(SMS_DRAFT_VERSION));
        return {};
      }
      const stored = localStorage.getItem("crm_sms_drafts");
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  const saveCustomSmsText = (key: string, text: string) => {
    const updated = { ...customSmsTexts, [key]: text };
    setCustomSmsTexts(updated);
    localStorage.setItem("crm_sms_drafts", JSON.stringify(updated));
  };

  const resetCustomSmsText = (key: string) => {
    const updated = { ...customSmsTexts };
    delete updated[key];
    setCustomSmsTexts(updated);
    localStorage.setItem("crm_sms_drafts", JSON.stringify(updated));
  };
  const isPostTab = flowSubTab === "post";
  const isMcTab = flowSubTab === "mc";
  const isMcSellTab = flowSubTab === "mc_sell";
  const nodes = useMemo(() => isMcSellTab ? getMasterclassSalesNodes() : isMcTab ? getMasterclassNodes() : isPostTab ? getPostEventNodes() : getNodes(webinar), [webinar, isPostTab, isMcTab, isMcSellTab]);
  const now = Date.now();
  const webinarPast = WEBINAR_CONFIG[webinar].startDate.getTime() < now;
  const showSendNow = webinar === "video" && now > VIDEO_WEBINAR_DATE.getTime() && !isPostTab;

  const POST_EVENT_CUTOFF = new Date("2026-03-05T11:00:00Z").getTime();
  const filteredInscritos = useMemo(() => {
    if (isMcSellTab) {
      return inscritos.filter((i) => {
        if (i.webinar !== "video") return false;
        const plan = i.plan || "free";
        if (plan !== "premium") return false;
        return !!(i.paid_at || i.premium_granted_at);
      });
    }
    if (isMcTab) {
      return inscritos.filter((i) => {
        if (i.webinar !== "video") return false;
        const plan = i.plan || "free";
        if (!["masterclass", "bundle"].includes(plan)) return false;
        return !!(i.paid_at || i.premium_granted_at);
      });
    }
    if (!isPostTab) return inscritos;
    return inscritos.filter((i) => {
      if (i.webinar !== "video") return false;
      const created = new Date(i.timestamp).getTime();
      return created >= POST_EVENT_CUTOFF;
    });
  }, [inscritos, isPostTab, isMcTab, isMcSellTab]);

  const inscritosCount = filteredInscritos.filter((i) => {
    if (webinar === "video") return i.webinar === "video";
    return !i.webinar || i.webinar === "imagens";
  }).length;

  const nodeCounts = useMemo(() => {
    const result: Record<number, { sent: number; failed: number }> = {};
    for (let idx = 0; idx < nodes.length; idx++) {
      const n = nodes[idx];
      if (n.type !== "email") continue;

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

      const rawKey = n.templateKeyMatch[0]?.replace(/-/g, "_").replace("stage_0", "confirmation") || "";
      const stripped = rawKey.startsWith(`${webinar}_`) ? rawKey.slice(webinar.length + 1) : rawKey;
      const statsKey = `${webinar}_${stripped}`;

      if (emailStats && emailStats[statsKey]) {
        result[idx] = emailStats[statsKey];
      } else {
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
    const smsText = customText || customSmsTexts[templateKey] || config.smsText;

    let eligible = filteredInscritos.filter((i) => {
      if (!i.whatsapp) return false;
      if (i.do_not_contact) return false;
      if (config.webinarFilter === "current" && i.webinar !== webinar) return false;
      if (config.requirePaid && !i.paid_at && !i.premium_granted_at) return false;
      const plan = i.plan || "free";
      return config.planFilter.includes(plan);
    });

    // Dedup: skip recipients who already received this SMS successfully
    const { data: alreadySent } = await supabase
      .from("message_logs")
      .select("registration_id")
      .eq("template_key", templateKey)
      .eq("channel", "sms")
      .eq("status", "sent");

    if (alreadySent && alreadySent.length > 0) {
      const sentIds = new Set(alreadySent.map((m) => m.registration_id));
      eligible = eligible.filter((p) => !sentIds.has(p.id));
    }

    if (eligible.length === 0) {
      toast.error("Todos os destinatários elegíveis já receberam este SMS.");
      return;
    }

    if (!confirm(`Enviar SMS a ${eligible.length} pessoa(s)?\n\nTexto:\n"${smsText}"`)) return;

    setSendingSmsKey(templateKey);
    setEditingSmsKey(null);
    setSmsResult(null);
    setSmsDetailedResults([]);
    const { data: { session } } = await supabase.auth.getSession();
    const adminEmail = session?.user?.email || "";
    let sent = 0, failed = 0;
    const details: Array<{ name: string; phone: string; success: boolean; error?: string }> = [];

    for (const person of eligible) {
      try {
        const { data, error } = await supabase.functions.invoke("send-sms", {
          body: {
            to: person.whatsapp,
            text: smsText,
            provider: "egoi",
            registrationId: person.id,
          },
          headers: { "x-crm-admin-email": adminEmail },
        });
        if (error) {
          failed++;
          details.push({ name: person.nome || person.whatsapp!, phone: person.whatsapp!, success: false, error: error.message });
        } else if (data?.success) {
          sent++;
          details.push({ name: person.nome || person.whatsapp!, phone: person.whatsapp!, success: true });
        } else {
          failed++;
          details.push({ name: person.nome || person.whatsapp!, phone: person.whatsapp!, success: false, error: data?.error || "Erro desconhecido" });
        }
      } catch (err: any) {
        failed++;
        details.push({ name: person.nome || person.whatsapp!, phone: person.whatsapp!, success: false, error: err.message });
      }
    }

    setSendingSmsKey(null);
    setSmsResult({ sent, failed, total: eligible.length });
    setSmsDetailedResults(details);
    setShowSmsReport(true);
    if (failed === 0) {
      toast.success(`✅ ${sent} SMS enviados com sucesso!`);
    } else {
      toast.warning(`📱 ${sent} enviados, ${failed} falharam de ${eligible.length} total`);
    }
  };

  const handleCsvImport = async (file: File, templateKey: string) => {
    setImportingSmsKey(templateKey);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        toast.error("CSV vazio ou sem dados");
        setImportingSmsKey(null);
        return;
      }

      // Parse semicolon-delimited CSV (skip header)
      const rows = lines.slice(1).map((line) => {
        const cols = line.split(";");
        return {
          phone: cols[0]?.replace(/"/g, "").trim() || "",
          status: cols[4]?.replace(/"/g, "").trim() || "",
          timestamp: cols[3]?.replace(/"/g, "").trim() || "",
        };
      }).filter((r) => r.phone.length > 0);

      const { data: { session } } = await supabase.auth.getSession();
      const adminEmail = session?.user?.email || "";

      const { data, error } = await supabase.functions.invoke("backfill-sms-logs", {
        body: { rows, templateKey },
        headers: { "x-crm-admin-email": adminEmail },
      });

      if (error) throw error;

      const result = data as { matched: number; unmatched: number; skipped: number; inserted: number; errors: string[] };
      toast.success(
        `Importação concluída: ${result.inserted} inseridos, ${result.skipped} já existentes, ${result.unmatched} sem match`
      );
    } catch (err: any) {
      toast.error("Erro na importação: " + (err.message || "erro desconhecido"));
    } finally {
      setImportingSmsKey(null);
      if (csvInputRef.current) csvInputRef.current.value = "";
    }
  };

  const renderNodeCard = (node: NodeDef, idx: number, insideGroup: boolean) => {
    const tag = getTag(node, webinarPast, (nodeCounts[idx]?.sent ?? 0) > 0, webinar);
    const counts = nodeCounts[idx];
    const hasFailed = (counts?.failed ?? 0) > 0;
    const eligible = computeEligible(node, filteredInscritos);

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
          border: `1px solid ${insideGroup ? "#f1f5f9" : "#e2e8f0"}`,
          borderLeft: insideGroup ? `1px solid ${insideGroup ? "#f1f5f9" : "#e2e8f0"}` : `4px solid ${borderColor}`,
          borderRadius: insideGroup ? 8 : 10,
          padding: insideGroup ? "12px 14px" : "14px 16px",
          boxShadow: insideGroup ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
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
            {eligible >= 0 && (
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                👥 {eligible} elegíveis{counts && counts.sent > 0 ? ` · ${counts.sent} contactados` : ""}
              </p>
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
          {node.channel === "sms" && (() => {
            const tplKey = node.templateKeyMatch[0] || "sms_manual";
            const defaultText = node.smsSendConfig?.smsText || "";
            const currentText = customSmsTexts[tplKey] || defaultText;
            const isEditing = editingSmsKey === tplKey;
            const isSending = sendingSmsKey === tplKey;
            const isCustomized = !!customSmsTexts[tplKey];

            return (
              <div className="flex flex-col items-end gap-1.5 max-sm:items-start max-sm:w-full" style={{ maxWidth: 300 }}>
                {counts && (
                  counts.sent > 0 ? (
                    <span className="text-[13px] font-semibold" style={{ color: "#7c3aed" }}>
                      {counts.sent} enviados
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>0 enviados</span>
                  )
                )}
                {counts && (
                  counts.failed > 0 ? (
                    <span className="flex items-center gap-1" style={{ fontSize: 12, color: "#ef4444" }}>
                      <AlertTriangle size={11} />
                      {counts.failed} falhas
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>0 falhas</span>
                  )
                )}

                {isEditing ? (
                  <div className="flex flex-col gap-1.5 w-full mt-1">
                    <textarea
                      className="w-full p-2 border rounded text-[12px] leading-snug resize-y"
                      style={{ borderColor: "#d1d5db", background: "#fafafa" }}
                      rows={3}
                      value={editedSmsText}
                      onChange={(e) => setEditedSmsText(e.target.value.slice(0, 160))}
                      autoFocus
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: editedSmsText.length > 144 ? "#f87171" : "#9ca3af" }}>
                        {editedSmsText.length}/160
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setEditingSmsKey(null)}
                          className="text-[11px] px-2 py-1 rounded border"
                          style={{ borderColor: "#d1d5db", color: "#6b7280" }}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            if (editedSmsText.trim() === defaultText) {
                              resetCustomSmsText(tplKey);
                            } else {
                              saveCustomSmsText(tplKey, editedSmsText.trim());
                            }
                            setEditingSmsKey(null);
                            toast.success("Texto SMS gravado");
                          }}
                          className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded text-white"
                          style={{ background: "#2563eb" }}
                        >
                          💾 Gravar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="relative group w-full mt-1 cursor-pointer"
                    onClick={() => {
                      setEditingSmsKey(tplKey);
                      setEditedSmsText(currentText);
                    }}
                  >
                    <div
                      className="rounded p-2 text-[11px] leading-relaxed"
                      style={{
                        background: isCustomized ? "#eff6ff" : "#f8fafc",
                        border: `1px solid ${isCustomized ? "#93c5fd" : "#e2e8f0"}`,
                        color: "#374151",
                        minHeight: 40,
                      }}
                    >
                      {currentText}
                    </div>
                    <span
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                      style={{ color: "#6b7280" }}
                    >
                      ✏️
                    </span>
                    {isCustomized && (
                      <span className="text-[9px] mt-0.5 block" style={{ color: "#3b82f6" }}>
                        ✎ Texto personalizado
                      </span>
                    )}
                  </div>
                )}

                <button
                  onClick={() => handleBulkSms(node, currentText)}
                  disabled={isSending}
                  className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: isSending ? "#94a3b8" : "#16a34a", color: "#fff" }}
                >
                  {isSending ? (
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

                {/* CSV Import button */}
                <button
                  onClick={() => {
                    pendingImportKey.current = tplKey;
                    csvInputRef.current?.click();
                  }}
                  disabled={importingSmsKey === tplKey}
                  className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-lg transition-colors border"
                  style={{
                    borderColor: importingSmsKey === tplKey ? "#94a3b8" : "#d1d5db",
                    color: importingSmsKey === tplKey ? "#94a3b8" : "#6b7280",
                    background: "white",
                  }}
                >
                  {importingSmsKey === tplKey ? (
                    <>
                      <Loader2 size={11} className="animate-spin" />
                      Importando…
                    </>
                  ) : (
                    <>
                      <Upload size={11} />
                      Importar relatório CSV
                    </>
                  )}
                </button>
              </div>
            );
          })()}

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
                     const emailKey = rawKey.includes("masterclass") || rawKey.includes("mc_sales")
                       ? rawKey
                       : rawKey.startsWith(`${webinar}_`) ? rawKey.slice(webinar.length + 1) : rawKey;
                     onClickSentCount?.(emailKey, node.title, webinar);
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

  // Group nodes by dayGroup
  const groups = useMemo(() => {
    const result: { groupKey: string; nodes: { node: NodeDef; idx: number }[] }[] = [];
    let currentGroup: { groupKey: string; nodes: { node: NodeDef; idx: number }[] } | null = null;

    for (let idx = 0; idx < nodes.length; idx++) {
      const node = nodes[idx];
      const gk = node.dayGroup || "ungrouped";

      if (!currentGroup || currentGroup.groupKey !== gk) {
        currentGroup = { groupKey: gk, nodes: [] };
        result.push(currentGroup);
      }
      currentGroup.nodes.push({ node, idx });
    }
    return result;
  }, [nodes]);

  return (
    <div className="relative max-w-[800px] mx-auto">
      {/* Hidden CSV file input */}
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && pendingImportKey.current) {
            handleCsvImport(file, pendingImportKey.current);
          }
        }}
      />
      {groups.map((group, gIdx) => {
        const isLastGroup = gIdx === groups.length - 1;
        const isEndGroup = group.groupKey === "end";
        const hasGroupContainer = DAY_GROUP_CONFIG[group.groupKey] && !isEndGroup;

        return (
          <Fragment key={gIdx}>
            {/* Arrow connector between groups */}
            {gIdx > 0 && <ArrowConnector />}

            {hasGroupContainer ? (
              <DayGroupContainer groupKey={group.groupKey}>
                {group.nodes.map(({ node, idx }, nIdx) => (
                  <Fragment key={idx}>
                    {renderNodeCard(node, idx, true)}
                    {/* Info box */}
                    {node.infoBox && (
                      <div
                        style={{
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          borderRadius: 8,
                          padding: "10px 12px",
                          fontSize: 12,
                          color: "#991b1b",
                        }}
                      >
                        {node.infoBox}
                      </div>
                    )}
                  </Fragment>
                ))}
              </DayGroupContainer>
            ) : (
              // Ungrouped or end nodes — render individually
              group.nodes.map(({ node, idx }, nIdx) => (
                <Fragment key={idx}>
                  {nIdx > 0 && (
                    <div className="flex justify-center">
                      <div style={{ width: 2, height: 12, borderLeft: "2px dashed #e5e7eb" }} />
                    </div>
                  )}
                  {renderNodeCard(node, idx, false)}
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
                </Fragment>
              ))
            )}
          </Fragment>
        );
      })}
      <Sheet open={showSmsReport} onOpenChange={(v) => !v && setShowSmsReport(false)}>
        <SheetContent side="right" className="w-full sm:w-[400px] sm:max-w-[400px] flex flex-col p-0">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
            <SheetTitle className="text-[15px]">📱 Relatório SMS</SheetTitle>
            <SheetDescription className="text-[12px]">Resultado do envio em lote</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {smsDetailedResults.map((r, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-b-0">
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={{ background: r.success ? "#f0f4ff" : "#fee2e2", color: r.success ? "#1e40af" : "#ef4444" }}
                >
                  {r.name[0]?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold truncate" style={{ color: "#0F172A" }}>{r.name}</p>
                  <p className="text-[11px] truncate" style={{ color: "#94A3B8" }}>{r.phone}</p>
                  {!r.success && r.error && (
                    <p className="text-[10px] mt-0.5" style={{ color: "#ef4444" }}>{r.error}</p>
                  )}
                </div>
                <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: r.success ? "#16a34a" : "#ef4444" }} />
              </div>
            ))}
          </div>
          <div className="border-t border-border px-5 py-3" style={{ fontSize: 12 }}>
            <span className="text-muted-foreground">
              {smsResult?.sent ?? 0} enviados · {smsResult?.failed ?? 0} falharam · {smsResult?.total ?? 0} total
            </span>
          </div>
        </SheetContent>
      </Sheet>
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
  const [flowSubTab, setFlowSubTab] = useState<"pre" | "post" | "mc" | "mc_sell">("pre");

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

  const SUB_TABS = [
    { key: "pre" as const, label: "Pré-Webinar", emoji: "📡", activeBg: "#1e40af" },
    { key: "post" as const, label: "Pós-Evento", emoji: "🕐", activeBg: "#f59e0b" },
    { key: "mc" as const, label: "Masterclass", emoji: "📽", activeBg: "#16a34a" },
    { key: "mc_sell" as const, label: "Venda MC", emoji: "🎯", activeBg: "#7c3aed" },
  ];

  const SubTabPills = () => (
    <div className="flex items-center gap-1.5 mb-5">
      {SUB_TABS.map((tab) => {
        const isActive = flowSubTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => setFlowSubTab(tab.key)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all"
            style={{
              background: isActive ? tab.activeBg : "#f1f5f9",
              color: isActive ? "#fff" : "#64748b",
              border: `1px solid ${isActive ? "transparent" : "#e2e8f0"}`,
            }}
          >
            {tab.emoji} {tab.label}
          </button>
        );
      })}
    </div>
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
            <SubTabPills />
            <Timeline webinar="video" inscritos={inscritos} logs={logs} onOpenEditor={onOpenEditor} emailStats={emailStats} emailStatsLoading={emailStatsLoading} onClickSentCount={handleClickSentCount} flowSubTab={flowSubTab} />
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
      {webinar === "video" && <SubTabPills />}
      <Timeline webinar={webinar} inscritos={inscritos} logs={logs} onOpenEditor={onOpenEditor} emailStats={emailStats} emailStatsLoading={emailStatsLoading} onClickSentCount={handleClickSentCount} flowSubTab={webinar === "video" ? flowSubTab : undefined} />
      {drawer}
    </div>
  );
}
