import { useMemo, useState, useEffect, useCallback } from "react";
import { Users, Euro, TrendingUp, BarChart2, CheckCircle, MessageCircle, RefreshCw, Trophy, BookOpen, Check, ArrowDown, AlertTriangle, Mail, AlertCircle, RefreshCcw, Youtube, Eye, Clock, TrendingUp as Peak, ThumbsUp, UserPlus, Send } from "lucide-react";
import type { Inscrito } from "@/pages/crm/mockData";
import { genderEmoji } from "@/lib/genderDetection";
import { supabase } from "@/integrations/supabase/client";
import { useWebinarContext } from "@/contexts/WebinarContext";
import { WEBINAR_CONFIG, WEBINAR_DASHBOARD_CONFIG, VIDEO_WEBINAR_DATE, type WebinarContext as WebinarCtxType } from "@/config/webinarConfig";
import { useWebinarSettings, type WebinarSettings } from "@/hooks/useWebinarSettings";
import WebinarBadge from "./WebinarBadge";



type Period = "7d" | "14d" | "30d" | "all";

/* ── Dashboard config helpers ── */
function getDashboardConfig(ctx: WebinarCtxType) {
  if (ctx === "video") return WEBINAR_DASHBOARD_CONFIG.video;
  if (ctx === "consolidado") return {
    visitors: WEBINAR_DASHBOARD_CONFIG.imagens.visitors + WEBINAR_DASHBOARD_CONFIG.video.visitors,
    cutoffDate: WEBINAR_DASHBOARD_CONFIG.imagens.cutoffDate,
    liveResults: WEBINAR_DASHBOARD_CONFIG.imagens.liveResults,
  };
  return WEBINAR_DASHBOARD_CONFIG.imagens;
}

function getPeriodStart(period: Period): Date | null {
  if (period === "all") return null;
  const days = period === "7d" ? 7 : period === "14d" ? 14 : 30;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

const IMAGENS_DUVIDAS = [
  "Não sei descrever o estilo visual que quero",
  "Os resultados ficam sempre genéricos, sem identidade",
  "Não percebo que ferramenta usar (ChatGPT, Google, outros...)",
  "Quero criar imagens para a minha marca mas não sei por onde começar",
  "Tenho dificuldade em editar ou refinar as imagens geradas",
];

const VIDEO_DUVIDAS = [
  "Como criar videos curtos sem filmar",
  "Que ferramentas de IA usar para video",
  "Como integrar video na estrategia de marketing",
];

function getPredefinedDuvidas(ctx: WebinarCtxType) {
  if (ctx === "video") return VIDEO_DUVIDAS;
  if (ctx === "consolidado") return [...IMAGENS_DUVIDAS, ...VIDEO_DUVIDAS];
  return IMAGENS_DUVIDAS;
}

function parseDuvidaParts(duvida: string, ctx: WebinarCtxType): string[] {
  const predefined = getPredefinedDuvidas(ctx);
  const parts: string[] = [];
  let remaining = duvida;
  predefined.forEach((pd) => {
    if (remaining.includes(pd)) {
      parts.push(pd);
      remaining = remaining.replace(pd, "");
    }
  });
  remaining = remaining.replace(/^[,\s]+|[,\s]+$/g, "").replace(/,\s*,/g, ",").trim();
  if (remaining && remaining !== "SKIPPED") {
    parts.push(remaining);
  }
  return parts.length > 0 ? parts : [duvida];
}

interface DashboardViewProps {
  inscritos: Inscrito[];
  onSelectInscrito: (i: Inscrito) => void;
  onRefresh?: () => Promise<void>;
}

const PLAN_BADGE_MAP_IMAGENS: Record<string, { bg: string; color: string; label: string }> = {
  free: { bg: "hsl(var(--surface))", color: "hsl(var(--ink-400))", label: "Gratuito" },
  premium: { bg: "hsl(var(--blue-50))", color: "hsl(var(--blue-600))", label: "Premium €18,45" },
  masterclass: { bg: "rgba(124,58,237,0.1)", color: "#7C3AED", label: "MC €57,81" },
  bundle: { bg: "hsl(var(--green-50))", color: "hsl(var(--green-600))", label: "Bundle €76,26" },
};
const PLAN_BADGE_MAP_VIDEO: Record<string, { bg: string; color: string; label: string }> = {
  free: { bg: "hsl(var(--surface))", color: "hsl(var(--ink-400))", label: "Gratuito" },
  premium: { bg: "hsl(var(--blue-50))", color: "hsl(var(--blue-600))", label: "Sessão Prática €33,21" },
  masterclass: { bg: "rgba(124,58,237,0.1)", color: "#7C3AED", label: "MC €82,41" },
  bundle: { bg: "hsl(var(--green-50))", color: "hsl(var(--green-600))", label: "Bundle €131,61" },
  gravacao: { bg: "rgba(245,158,11,0.1)", color: "#D97706", label: "Gravação €33,21" },
  "gravacao-masterclass": { bg: "rgba(124,58,237,0.15)", color: "#7C3AED", label: "Grav+MC €115,62" },
};
const DEFAULT_BADGE = { bg: "hsl(var(--surface))", color: "hsl(var(--ink-400))", label: "Desconhecido" };
const getPlanBadge = (plan: string, webinar: string) => {
  const map = webinar === "video" ? PLAN_BADGE_MAP_VIDEO : PLAN_BADGE_MAP_IMAGENS;
  return map[plan] || DEFAULT_BADGE;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${months[d.getMonth()]} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function abbreviateSource(s: string) {
  if (s.startsWith("Instagram")) return "Instagram";
  if (s.startsWith("Podcast")) return "Podcast RFM";
  if (s.includes("Email")) return "Email/Newsletter";
  if (s.includes("WhatsApp")) return "WhatsApp";
  return s;
}

export default function DashboardView({ inscritos, onSelectInscrito, onRefresh }: DashboardViewProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>("all");
  const { webinarContext } = useWebinarContext();
  const [videoVisitors, setVideoVisitors] = useState(0);

  useEffect(() => {
    supabase.from("analytics_cache").select("value").eq("key", "landing_visitors_video").maybeSingle()
      .then(({ data }) => { if (data) setVideoVisitors(data.value); });
  }, []);

  const dashConfig = useMemo(() => {
    const base = getDashboardConfig(webinarContext);
    if (webinarContext === "video") return { ...base, visitors: videoVisitors };
    if (webinarContext === "consolidado") return { ...base, visitors: WEBINAR_DASHBOARD_CONFIG.imagens.visitors + videoVisitors };
    return base;
  }, [webinarContext, videoVisitors]);

  // Email counts (24h + 7 days) — split by provider
  const [resendSent24h, setResendSent24h] = useState(0);
  const [resendSent7d, setResendSent7d] = useState(0);
  const [emailFailed24h, setEmailFailed24h] = useState(0);
  const [emailFailed7d, setEmailFailed7d] = useState(0);

  useEffect(() => {
    const cutoff = dashConfig.cutoffDate;
    const inscritoIds = inscritos.map((i) => i.id);
    if (inscritoIds.length === 0) { setResendSent24h(0); setResendSent7d(0); setEmailFailed24h(0); setEmailFailed7d(0); return; }
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const buildQuery = (base: ReturnType<typeof supabase.from>) => {
      let q = base;
      if (cutoff) q = q.lte("created_at", cutoff.toISOString());
      return q.in("registration_id", inscritoIds);
    };

    Promise.all([
      buildQuery(supabase.from("message_logs").select("id", { count: "exact", head: true }).eq("provider", "resend").eq("status", "sent").not("provider_message_id", "is", null).gte("created_at", oneDayAgo)),
      buildQuery(supabase.from("message_logs").select("id", { count: "exact", head: true }).eq("provider", "resend").eq("status", "sent").not("provider_message_id", "is", null).gte("created_at", sevenDaysAgo)),
      buildQuery(supabase.from("message_logs").select("id", { count: "exact", head: true }).eq("status", "failed").gte("created_at", oneDayAgo)),
      buildQuery(supabase.from("message_logs").select("id", { count: "exact", head: true }).eq("status", "failed").gte("created_at", sevenDaysAgo)),
    ]).then(([resend24, resend7d, failed24, failed7d]) => {
      setResendSent24h(resend24.count || 0);
      setResendSent7d(resend7d.count || 0);
      setEmailFailed24h(failed24.count || 0);
      setEmailFailed7d(failed7d.count || 0);
    });
  }, [dashConfig.cutoffDate, inscritos]);

  // Period-filtered inscritos + cutoff date
  const filteredInscritos = useMemo(() => {
    const cutoff = dashConfig.cutoffDate;
    const active = inscritos.filter((i) => i.status === "activo" && (cutoff ? new Date(i.timestamp) <= cutoff : true));
    const periodStart = getPeriodStart(period);
    if (!periodStart) return active;
    return active.filter((i) => new Date(i.timestamp) >= periodStart);
  }, [inscritos, period, dashConfig.cutoffDate]);

  // Split counts for consolidado KPIs
  const webinarSplit = useMemo(() => {
    if (webinarContext !== "consolidado") return null;
    const img = filteredInscritos.filter((i) => !i.webinar || i.webinar === "imagens");
    const vid = filteredInscritos.filter((i) => i.webinar === "video");
    const imgPaid = img.filter((i) => i.paid_at !== null);
    const vidPaid = vid.filter((i) => i.paid_at !== null);
    return {
      imgCount: img.length, vidCount: vid.length,
      imgReceita: imgPaid.reduce((s, i) => s + i.valor, 0),
      vidReceita: vidPaid.reduce((s, i) => s + i.valor, 0),
      imgPaid: imgPaid.length, vidPaid: vidPaid.length,
    };
  }, [filteredInscritos, webinarContext]);

  const stats = useMemo(() => {
    const active = filteredInscritos;
    const total = active.length;
    const pagantes = active.filter((i) => i.paid_at !== null);
    const receita = pagantes.reduce((s, i) => s + i.valor, 0);
    const conversao = total ? (pagantes.length / total) * 100 : 0;
    const ticket = pagantes.length ? receita / pagantes.length : 0;
    const pendentes = active.filter((i) => i.payment_status === "awaiting_payment" || i.payment_status === "selected");
    const pipelineValor = pendentes.reduce((s, i) => s + i.valor, 0);
    const seleccionaram = active.filter((i) => i.payment_status === "selected");
    const aguardamPgto = active.filter((i) => i.payment_status === "awaiting_payment");

    const step1 = active.length;
    const step1q = active.filter((i) => (i.step_reached || 0) >= 1).length;
    const step2 = active.filter((i) => (i.step_reached || 0) >= 2).length;
    const step3 = active.filter((i) => (i.step_reached || 0) >= 3).length;
    const step4 = active.filter((i) => (i.step_reached || 0) >= 4).length;
    const step5 = active.filter((i) => (i.step_reached || 0) >= 5).length;
    const clickedToPay = active.filter((i) => i.upgrade_clicked_at !== null).length;
    const paidConfirmed = active.filter((i) => i.paid_at !== null).length;

    const srcMap: Record<string, number> = {};
    active.forEach((i) => i.source.forEach((s) => {
      if (s === "SKIPPED") return;
      const key = abbreviateSource(s);
      srcMap[key] = (srcMap[key] || 0) + 1;
    }));
    const sources = Object.entries(srcMap).sort((a, b) => b[1] - a[1]);
    const maxSrc = sources[0]?.[1] || 1;

    const planCounts: Record<string, number> = { free: 0, premium: 0, masterclass: 0, bundle: 0 };
    active.forEach((i) => { planCounts[i.plan]++; });
    const pendingCounts: Record<string, number> = { premium: 0, masterclass: 0, bundle: 0 };
    active.forEach((i) => { if (i.payment_status === "awaiting_payment" || i.payment_status === "selected") pendingCounts[i.plan]++; });
    const paidCounts: Record<string, number> = { premium: 0, masterclass: 0, bundle: 0, free: 0 };
    pagantes.forEach((i) => { paidCounts[i.plan] = (paidCounts[i.plan] || 0) + 1; });

    const comDuvida = active.filter((i) => i.duvida !== "" && i.duvida !== "SKIPPED");

    const nPremiumPaid = paidCounts.premium;
    const nMCPaid = paidCounts.masterclass;
    const nBundlePaid = paidCounts.bundle;

    const genderCounts = { M: 0, F: 0, U: 0 };
    active.forEach((i) => { genderCounts[i.gender]++; });

    const PREDEFINED_DIFFICULTIES = getPredefinedDuvidas(webinarContext);
    const diffCounts: Record<string, number> = {};
    PREDEFINED_DIFFICULTIES.forEach((d) => { diffCounts[d] = 0; });
    let outroCount = 0;
    comDuvida.forEach((i) => {
      let remaining = i.duvida;
      PREDEFINED_DIFFICULTIES.forEach((pd) => {
        if (remaining.includes(pd)) {
          diffCounts[pd]++;
          remaining = remaining.replace(pd, "");
        }
      });
      remaining = remaining.replace(/^[,\s]+|[,\s]+$/g, "").replace(/,\s*,/g, ",").trim();
      if (remaining.includes("Outro:")) {
        outroCount++;
      }
    });
    const diffLabels: Record<string, string> = {
      "Não sei descrever o estilo visual que quero": "Descrever estilo visual",
      "Os resultados ficam sempre genéricos, sem identidade": "Resultados genéricos",
      "Não percebo que ferramenta usar (ChatGPT, Google, outros...)": "Ferramenta certa",
      "Quero criar imagens para a minha marca mas não sei por onde começar": "Começar do zero",
      "Tenho dificuldade em editar ou refinar as imagens geradas": "Editar / refinar",
      "Como criar videos curtos sem filmar": "Vídeos sem filmar",
      "Que ferramentas de IA usar para video": "Ferramentas de IA",
      "Como integrar video na estrategia de marketing": "Estratégia de marketing",
    };
    const difficulties = [
      ...PREDEFINED_DIFFICULTIES.map((d) => ({ label: diffLabels[d] || d, count: diffCounts[d] })),
      { label: "Outro (texto livre)", count: outroCount },
    ].sort((a, b) => b.count - a.count);
    const maxDiff = difficulties[0]?.count || 1;

    const ctxIsVideo = webinarContext === "video";
    const funnelValues = ctxIsVideo ? [step1, step1q, step2, step3, step4, step5, clickedToPay, paidConfirmed] : [step1, step2, step3, step4, step5, clickedToPay, paidConfirmed];
    const dropOffs = funnelValues.slice(0, -1).map((v, i) => ({
      lost: v - funnelValues[i + 1],
      pct: v ? ((v - funnelValues[i + 1]) / v) * 100 : 0,
    }));
    const maxDropIdx = dropOffs.reduce((mi, d, i) => (d.lost > dropOffs[mi].lost ? i : mi), 0);

    const pendingOver6h = active.filter((i) => {
      if (i.payment_status !== "awaiting_payment" && i.payment_status !== "selected") return false;
      const ref = i.upgrade_clicked_at || i.timestamp;
      return (Date.now() - new Date(ref).getTime()) / 3600000 >= 6;
    });

    return { total, receita, conversao, ticket, step1, step1q, step2, step3, step4, step5, clickedToPay, paidConfirmed, sources, maxSrc, planCounts, pendingCounts, paidCounts, comDuvida, nPremiumPaid, nMCPaid, nBundlePaid, genderCounts, difficulties, maxDiff, dropOffs, maxDropIdx, pendingOver6h, pendentes, pipelineValor, seleccionaram, aguardamPgto };
  }, [filteredInscritos, webinarContext]);

  const now = new Date();
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} · ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

  const isVideo = webinarContext === "video";
  const isConsolidado = webinarContext === "consolidado";

  const funnelSteps = isVideo ? [
    { label: "Submeteu inscrição",                    value: stats.step1,          color: "hsl(var(--blue-600))",  note: null,                           sublabel: null,                       separator: false, isConversion: false },
    { label: "Chegou ao Passo 1 — Qualificação",     value: stats.step2,          color: "hsl(var(--blue-600))",  note: null,                           sublabel: null,                       separator: false, isConversion: false },
    { label: "Viu oferta Masterclass (Passo 2)",     value: stats.step3,          color: "#7C3AED",               note: null,                           sublabel: "Viu a oferta de €47+IVA",  separator: true,  isConversion: true  },
    { label: "Viu oferta Gravação (Passo 3)",        value: stats.step4,          color: "hsl(var(--amber-500))", note: null,                           sublabel: "Viu a oferta de €15+IVA",  separator: false, isConversion: true  },
    { label: "Chegou ao Passo 4 — Dúvida",           value: stats.step5,          color: "#0891B2",               note: null,                           sublabel: null,                       separator: false, isConversion: false },
    { label: "Clicou para pagar",                     value: stats.clickedToPay,   color: "hsl(var(--amber-500))", note: "preenche dados de faturação",   sublabel: null,                       separator: false, isConversion: true  },
    { label: "Pagamento confirmado",                  value: stats.paidConfirmed,  color: "hsl(var(--green-600))", note: null,                           sublabel: "Receita confirmada",       separator: false, isConversion: true  },
  ] : isConsolidado ? [
    { label: "Submeteu inscrição",               value: stats.step1,          color: "hsl(var(--blue-600))",  note: null,                           sublabel: null,                    separator: false, isConversion: false },
    { label: "Chegou ao Passo 1",                value: stats.step2,          color: "hsl(var(--blue-600))",  note: null,                           sublabel: "Origem / Qualificação", separator: false, isConversion: false },
    { label: "Chegou ao Passo 2",                value: stats.step3,          color: "#0891B2",               note: null,                           sublabel: "Dúvida / Masterclass",  separator: false, isConversion: false },
    { label: "Chegou ao Passo 3",                value: stats.step4,          color: "hsl(var(--amber-500))", note: null,                           sublabel: "Premium / Gravação",    separator: true,  isConversion: true  },
    { label: "Chegou ao Passo 4",                value: stats.step5,          color: "#7C3AED",               note: null,                           sublabel: "Masterclass / Dúvida",  separator: false, isConversion: true  },
    { label: "Clicou para pagar",                value: stats.clickedToPay,   color: "hsl(var(--amber-500))", note: "preenche dados de faturação",   sublabel: null,                    separator: false, isConversion: true  },
    { label: "Pagamento confirmado",             value: stats.paidConfirmed,  color: "hsl(var(--green-600))", note: null,                           sublabel: "Receita confirmada",    separator: false, isConversion: true  },
  ] : [
    { label: "Submeteu inscrição",               value: stats.step1,          color: "hsl(var(--blue-600))",  note: null,                           sublabel: null,                    separator: false, isConversion: false },
    { label: "Chegou ao Passo 1 — Origem",       value: stats.step2,          color: "hsl(var(--blue-600))",  note: null,                           sublabel: null,                    separator: false, isConversion: false },
    { label: "Chegou ao Passo 2 — Dúvida",       value: stats.step3,          color: "#0891B2",               note: null,                           sublabel: null,                    separator: false, isConversion: false },
    { label: "Viu oferta Premium (Passo 3)",     value: stats.step4,          color: "hsl(var(--amber-500))", note: null,                           sublabel: "Viu a oferta de €15",   separator: true,  isConversion: true  },
    { label: "Viu oferta Masterclass (Passo 4)", value: stats.step5,          color: "#7C3AED",               note: null,                           sublabel: "Viu a oferta de €57,81",separator: false, isConversion: true  },
    { label: "Clicou para pagar",                value: stats.clickedToPay,   color: "hsl(var(--amber-500))", note: "preenche dados de faturação",   sublabel: null,                    separator: false, isConversion: true  },
    { label: "Pagamento confirmado",             value: stats.paidConfirmed,  color: "hsl(var(--green-600))", note: null,                           sublabel: "Receita confirmada",    separator: false, isConversion: true  },
  ];

  const visitantes = dashConfig.visitors;
  const visitorDropLost = visitantes - stats.step1;
  const visitorDropPct = visitantes ? (visitorDropLost / visitantes) * 100 : 0;
  const registrationCTR = visitantes ? (stats.step1 / visitantes) * 100 : 0;
  const landingToPayPct = visitantes ? (stats.paidConfirmed / visitantes) * 100 : 0;

  return (
    <div className="p-7 max-sm:p-4 bg-off-white min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-bold text-[22px] text-ink-900">Dashboard</h1>
          <p className="text-sm text-ink-500">Visão geral do webinar em tempo real</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-surface rounded-lg p-0.5">
            {(["7d","14d","30d","all"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${period === p ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-700"}`}
              >
                {p === "7d" ? "7 dias" : p === "14d" ? "14 dias" : p === "30d" ? "30 dias" : "Desde início"}
              </button>
            ))}
          </div>
          {/* Cutoff badge */}
          {dashConfig.cutoffDate && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-ink-100 text-ink-500 border border-ink-200">
              Dados até: 20 Fev 2026
            </span>
          )}
          {onRefresh && (
            <button
              onClick={async () => { setRefreshing(true); await onRefresh(); setRefreshing(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium bg-surface text-ink-600 hover:bg-ink-100 transition-colors"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Atualizar
            </button>
          )}
          <p className="text-[13px] text-ink-400">{dateStr}</p>
        </div>
      </div>
      {period !== "all" && (
        <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-[12px] text-blue-700">
          A filtrar por <strong>últimos {period === "7d" ? "7" : period === "14d" ? "14" : "30"} dias</strong> · Visitantes mostram total acumulado (desde 8 Fev)
        </div>
      )}

      {/* Funnel */}
      <div className="bg-white border border-border rounded-xl p-6 mb-5">
        <h2 className="font-heading font-bold text-[15px] text-ink-900">Funil de Inscrição</h2>
        <p className="text-[13px] text-ink-400 mb-5">Da landing page ao pagamento</p>
        <div className="space-y-1">
          {/* Step 0: Visitors — fixed value */}
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-ink-500 w-[200px] max-sm:w-[140px] shrink-0 truncate">
                0. Visitaram a landing page
              </span>
              <div className="flex-1 h-2.5 rounded-full bg-surface overflow-hidden">
                <div className="h-full rounded-full bg-ink-300" style={{ width: "100%" }} />
              </div>
              <div className="flex items-center gap-1.5 w-28 justify-end shrink-0">
                <span className="text-[13px] font-heading font-bold text-ink-700">{visitantes.toLocaleString("pt-PT")}</span>
                <span className="text-ink-400 font-normal text-[11px]">(100%)</span>
              </div>
            </div>
            {/* Fixed value badge */}
            <div className="flex items-center gap-2 ml-[200px] max-sm:ml-[140px] pl-1 mt-0.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "hsl(var(--surface))", color: "hsl(var(--ink-500))", border: "1px solid hsl(var(--ink-200))" }}>
                {webinarContext === "imagens" ? "Total desde início · valor fixo (sem API analytics)" : "Total desde início"}
              </span>
            </div>
            {visitorDropLost > 0 && (
              <div className="flex items-center gap-1.5 ml-[200px] max-sm:ml-[140px] pl-1 py-1 text-red-500 font-semibold">
                <ArrowDown size={10} />
                <span className="text-[11px]">
                  −{visitorDropLost} visitantes ({visitorDropPct.toFixed(1)}% não inscreveram) · CTR registo: {registrationCTR.toFixed(1)}%
                </span>
                <AlertTriangle size={10} className="text-red-500" />
              </div>
            )}
          </div>
          {/* Remaining funnel steps */}
          {funnelSteps.map((step, idx) => {
            const base = visitantes;
            const pct = base ? (step.value / base) * 100 : 0;
            const drop = idx < stats.dropOffs.length ? stats.dropOffs[idx] : null;
            const isMaxDrop = idx === stats.maxDropIdx && drop && drop.lost > 0;
            const isLast = idx === funnelSteps.length - 1;
            const barH = step.isConversion ? (isLast ? "h-3.5" : "h-3") : "h-2.5";
            const valueSize = step.isConversion ? "text-[15px]" : "text-[13px]";
            return (
              <div key={idx}>
                {step.separator && (
                  <div className="flex items-center gap-2 my-4">
                    <div className="flex-1 h-px" style={{ background: "hsl(var(--amber-500) / 0.35)" }} />
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                      style={{
                        color: "hsl(var(--amber-500))",
                        background: "hsl(var(--amber-500) / 0.08)",
                        border: "1px solid hsl(var(--amber-500) / 0.25)",
                      }}
                    >
                      Intenção de compra
                    </span>
                    <div className="flex-1 h-px" style={{ background: "hsl(var(--amber-500) / 0.35)" }} />
                  </div>
                )}
                <div
                  className="rounded-lg py-0.5"
                  style={
                    step.isConversion
                      ? {
                          background: "hsl(var(--amber-500) / 0.03)",
                          borderLeft: "2px solid hsl(var(--amber-500) / 0.2)",
                          paddingLeft: "8px",
                          marginLeft: "2px",
                        }
                      : {}
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-[200px] max-sm:w-[140px] shrink-0">
                      <span className="text-[12px] text-ink-500 truncate block">{idx + 1}. {step.label}</span>
                      {step.sublabel && (
                        <span className="text-[11px] text-ink-400 block">{step.sublabel}</span>
                      )}
                    </div>
                    <div className={`flex-1 ${barH} rounded-full bg-surface overflow-hidden`}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: step.color }}
                      />
                    </div>
                    <span className={`${valueSize} font-heading font-bold text-ink-700 w-28 text-right shrink-0`}>
                      {step.value}{" "}
                      <span className="text-ink-400 font-normal text-[11px]">
                        {isLast ? (
                          <>
                            ({pct.toFixed(1)}% dos inscritos
                            <span style={{ color: "hsl(var(--amber-500))" }}>
                              {" "}· {landingToPayPct.toFixed(1)}% dos visitantes
                            </span>
                            )
                          </>
                        ) : (
                          <>({pct.toFixed(1)}%)</>
                        )}
                      </span>
                    </span>
                  </div>
                  {step.note && (
                    <p className="text-[10px] text-ink-400 ml-[200px] max-sm:ml-[140px] pl-1 -mt-0.5">· {step.note} ·</p>
                  )}
                  {drop && drop.lost > 0 && (
                    <div className={`flex items-center gap-1.5 ml-[200px] max-sm:ml-[140px] pl-1 py-1 ${isMaxDrop ? "font-semibold" : "text-ink-400"}`}
                      style={isMaxDrop ? { color: "hsl(var(--destructive))" } : {}}>
                      <ArrowDown size={10} />
                      <span className="text-[11px]">
                        −{drop.lost} pessoa{drop.lost !== 1 ? "s" : ""} ({drop.pct.toFixed(0)}% drop)
                      </span>
                      {isMaxDrop && <AlertTriangle size={10} />}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 max-md:grid-cols-2 gap-3.5 mb-5">
        {[
          { icon: Users, iconColor: "hsl(var(--blue-600))", value: String(stats.total), label: "Inscritos activos", sub: period === "all" ? "Desde 8 Fev 2026" : `Últimos ${period === "7d" ? "7" : period === "14d" ? "14" : "30"} dias` },
          { icon: Euro, iconColor: "hsl(var(--green-600))", value: `€${stats.receita.toFixed(2)}`, label: "Receita Confirmada", sub: `${stats.nPremiumPaid} Premium · ${stats.nMCPaid} MC · ${stats.nBundlePaid} Bundle pagos` },
          { icon: BarChart2, iconColor: "#7C3AED", value: `€${stats.ticket.toFixed(2)}`, label: "Ticket médio", sub: "entre quem pagou" },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white border border-border rounded-xl p-5">
            <kpi.icon size={20} style={{ color: kpi.iconColor }} />
            <p className="font-heading font-extrabold text-[32px] text-ink-900 mt-2 leading-none">{kpi.value}</p>
            <p className="text-[13px] text-ink-500 mt-1">{kpi.label}</p>
            <p className="text-[11px] text-ink-400">{kpi.sub}</p>
            {webinarSplit && (
              <p className="text-[11px] mt-1" style={{ color: "#888" }}>
                {idx === 0 && `${webinarSplit.imgCount} imagens + ${webinarSplit.vidCount} vídeo`}
                {idx === 1 && `€${webinarSplit.imgReceita.toFixed(0)} imagens + €${webinarSplit.vidReceita.toFixed(0)} vídeo`}
                {idx === 2 && `${webinarSplit.imgPaid} img + ${webinarSplit.vidPaid} vid pagantes`}
              </p>
            )}
          </div>
        ))}
        {/* Conversion KPI */}
        <div className="bg-white border border-border rounded-xl p-5">
          <TrendingUp size={20} style={{ color: "hsl(var(--amber-500))" }} />
          <p className="font-heading font-extrabold text-[32px] text-ink-900 mt-2 leading-none">{stats.conversao.toFixed(1)}%</p>
          <p className="text-[13px] text-ink-500 mt-1">Taxa Inscritos → Pago</p>
          <p className="text-[11px] text-ink-400 mt-0.5">{stats.paidConfirmed} de {stats.total} inscritos activos pagaram</p>
          {visitantes > 0 && (
            <>
              <div className="border-t border-dashed border-border my-3" />
              <p className="font-heading font-bold text-[20px] leading-none" style={{ color: "hsl(var(--amber-500))" }}>{landingToPayPct.toFixed(1)}%</p>
              <p className="text-[12px] text-ink-500 mt-0.5">Landing page → Pago</p>
              <p className="text-[11px] text-ink-400">{stats.paidConfirmed} de {visitantes.toLocaleString("pt-PT")} visitantes</p>
            </>
          )}
        </div>
      </div>


      {/* Early Bird vs Regular */}
      <EarlyBirdWidget inscritos={filteredInscritos} webinarContext={webinarContext} />

      {/* Comparação entre Webinars (consolidado only) */}
      {webinarContext === "consolidado" && <WebinarComparisonWidget inscritos={filteredInscritos} />}

      {/* Resultados Live */}
      {dashConfig.liveResults && (
        <div className="bg-white border border-border rounded-xl p-5 mb-5">
          <div className="flex items-center gap-2.5 mb-4">
            <Youtube size={20} className="text-red-600" />
            <div>
              <h3 className="font-heading font-bold text-[14px] text-ink-900">Resultados Live · {dashConfig.liveResults.date}</h3>
              <p className="text-[12px] text-ink-400">Métricas do YouTube Live</p>
            </div>
          </div>
          <div className="grid grid-cols-5 max-md:grid-cols-3 max-sm:grid-cols-2 gap-4">
            {[
              { label: "Visualizações", value: String(dashConfig.liveResults.views), icon: Eye },
              { label: "Duração média", value: dashConfig.liveResults.avgDuration, icon: Clock },
              { label: "Pico de viewers", value: String(dashConfig.liveResults.peakViewers), icon: TrendingUp },
              { label: "Gostos", value: String(dashConfig.liveResults.likes), icon: ThumbsUp },
              { label: "Novos subscritores", value: `+${dashConfig.liveResults.newSubs}`, icon: UserPlus },
            ].map((m, idx) => (
              <div key={idx} className="bg-surface/60 rounded-lg px-4 py-3 text-center">
                <m.icon size={16} className="text-ink-400 mx-auto mb-1.5" />
                <p className="font-heading font-extrabold text-[22px] text-ink-900 leading-none">{m.value}</p>
                <p className="text-[11px] text-ink-500 mt-1">{m.label}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-ink-400 mt-3 text-right">Fonte: YouTube Live Studio · {dashConfig.liveResults.date} 2026</p>
        </div>
      )}

      {/* Email Follow-up Status */}
      <div className="bg-white border border-border rounded-xl p-5 mb-5">
        <div className="flex items-center gap-2.5 mb-4">
          <Mail size={18} className="text-blue-600" />
          <div>
            <h3 className="font-heading font-bold text-[14px] text-ink-900">Emails de Follow-up Resend</h3>
            <p className="text-[12px] text-ink-400">Estado operacional do sistema de emails</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            {emailFailed24h === 0 ? (
              <span className="flex items-center gap-1 text-[12px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                <CheckCircle size={12} /> A funcionar normalmente
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[12px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                <AlertCircle size={12} /> {emailFailed24h} falha{emailFailed24h !== 1 ? "s" : ""} nas últimas 24h
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface/60 rounded-lg px-4 py-3">
            <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wide mb-1.5">Últimas 24h</p>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-600">Enviados</span>
              <span className="font-heading font-bold text-[18px] text-ink-900">{resendSent24h}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[13px] text-ink-600">Falhas</span>
              <span className={`font-heading font-bold text-[18px] ${emailFailed24h > 0 ? "text-red-600" : "text-ink-400"}`}>{emailFailed24h}</span>
            </div>
          </div>
          <div className="bg-surface/60 rounded-lg px-4 py-3">
            <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wide mb-1.5">Últimos 7 dias</p>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-600">Enviados</span>
              <span className="font-heading font-bold text-[18px] text-ink-900">{resendSent7d}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[13px] text-ink-600">Falhas</span>
              <span className={`font-heading font-bold text-[18px] ${emailFailed7d > 0 ? "text-amber-600" : "text-ink-400"}`}>{emailFailed7d}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline + Pending >6h — 2 columns */}
      {(stats.pendentes.length > 0 || stats.pendingOver6h.length > 0) && (
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4 mb-5">
          {stats.pendentes.length > 0 && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Euro size={18} className="text-amber-600" />
                <h3 className="font-heading font-bold text-[14px] text-amber-900">Pipeline Pendente</h3>
              </div>
              <p className="font-heading font-extrabold text-[28px] text-amber-800 leading-none">€{stats.pipelineValor.toFixed(2)}</p>
              <p className="text-[12px] text-amber-700 mt-1">
                {stats.pendentes.length} inscrito{stats.pendentes.length !== 1 ? "s" : ""} por converter
              </p>
              <div className="mt-3 space-y-2">
                {stats.seleccionaram.length > 0 && (
                  <div className="flex items-start gap-2 p-2.5 bg-orange-50/80 border border-orange-200 rounded-lg">
                    <span className="text-[14px] mt-0.5">🟠</span>
                    <div>
                      <p className="text-[12px] font-semibold text-orange-700">{stats.seleccionaram.length} seleccionaram produto</p>
                      <p className="text-[11px] text-orange-600/70">Confirmaram no modal mas não avançaram para pagamento</p>
                    </div>
                  </div>
                )}
                {stats.aguardamPgto.length > 0 && (
                  <div className="flex items-start gap-2 p-2.5 bg-red-50/80 border border-red-200 rounded-lg">
                    <span className="text-[14px] mt-0.5">🔴</span>
                    <div>
                      <p className="text-[12px] font-semibold text-red-700">{stats.aguardamPgto.length} aguardam pagamento</p>
                      <p className="text-[11px] text-red-600/70">Referência EuPago gerada — contactar</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-3 text-[12px] text-amber-700 flex-wrap">
                {stats.pendingCounts.premium > 0 && <span>{stats.pendingCounts.premium} Premium</span>}
                {stats.pendingCounts.masterclass > 0 && <span>{stats.pendingCounts.masterclass} MC</span>}
                {stats.pendingCounts.bundle > 0 && <span>{stats.pendingCounts.bundle} Bundle</span>}
              </div>
            </div>
          )}

          {stats.pendingOver6h.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-amber-600" />
                <h3 className="font-heading font-bold text-[14px] text-amber-900">Pendentes há +6h</h3>
                <span className="ml-auto text-[12px] font-medium px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                  {stats.pendingOver6h.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {stats.pendingOver6h.slice(0, 5).map((i) => {
                  const badge = getPlanBadge(i.plan, i.webinar);
                  const ref = i.upgrade_clicked_at || i.timestamp;
                  const hours = Math.round((Date.now() - new Date(ref).getTime()) / 3600000);
                  const timeText = hours >= 24 ? `${Math.floor(hours / 24)}d+` : `${hours}h`;
                  return (
                    <div
                      key={i.id}
                      className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-50/50 transition-colors"
                      onClick={() => onSelectInscrito(i)}
                    >
                      <span className="text-[13px] font-semibold text-ink-800 flex-1 truncate">{genderEmoji(i.gender)} {i.nome}</span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0" style={{ background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                      <span className="text-[11px] font-semibold shrink-0" style={{ color: hours >= 24 ? "#DC2626" : "#D97706" }}>
                        Há {timeText}
                      </span>
                    </div>
                  );
                })}
                {stats.pendingOver6h.length > 5 && (
                  <p className="text-[12px] text-amber-600 font-medium text-center pt-1">
                    +{stats.pendingOver6h.length - 5} mais
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Two columns */}
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4 mb-5">
        {/* Sources */}
        <div className="bg-white border border-border rounded-xl p-5">
          <h3 className="font-heading font-bold text-sm text-ink-900">Fontes de Origem</h3>
          <p className="text-xs text-ink-400 mb-4">Canal que trouxe cada inscrito</p>
          <div className="space-y-2">
            {stats.sources.map(([name, count]) => (
              <div key={name}>
                <div className="flex justify-between mb-1">
                  <span className="text-[13px] font-medium text-ink-700">{name}</span>
                  <span className="font-heading font-bold text-[13px] text-blue-600">{count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${(count / stats.maxSrc) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="bg-white border border-border rounded-xl p-5">
          <h3 className="font-heading font-bold text-sm text-ink-900">Distribuição por Plano</h3>
          <p className="text-xs text-ink-400 mb-4">Inscritos · Pagos · Pendentes</p>
          {(["premium", "masterclass", "bundle", "free"] as const).map((plan) => {
            const total = stats.planCounts[plan] || 0;
            const paid = stats.paidCounts[plan] || 0;
            const pending = stats.pendingCounts[plan] || 0;
            const free = total - paid - pending;
            const badge = getPlanBadge(plan, "video");
            const pct = stats.total ? ((total / stats.total) * 100).toFixed(0) : "0";
            return (
              <div key={plan} className="mb-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    {badge.label}
                  </span>
                  <span className="ml-auto font-heading font-bold text-[14px] text-ink-700">{total}</span>
                  <span className="text-[11px] text-ink-400">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${stats.total ? (total / stats.total) * 100 : 0}%`,
                      background: badge.color,
                      opacity: 0.7,
                    }}
                  />
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                  {paid > 0 && (
                    <span className="flex items-center gap-1 text-green-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                      {paid} pago{paid !== 1 ? "s" : ""}
                    </span>
                  )}
                  {pending > 0 && (
                    <span className="flex items-center gap-1 text-amber-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      {pending} pendente{pending !== 1 ? "s" : ""}
                    </span>
                  )}
                  {free > 0 && plan !== "free" && (
                    <span className="flex items-center gap-1 text-ink-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-ink-300 shrink-0" />
                      {free} sem pgto
                    </span>
                  )}
                  {plan === "free" && (
                    <span className="text-ink-400">inscrições gratuitas</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Perfil dos Inscritos — Role + Team Size */}
      {(() => {
        const withRole = filteredInscritos.filter((i) => i.role);
        const withTeam = filteredInscritos.filter((i) => i.team_size);
        const hasEnough = withRole.length >= 5;
        const roleCounts: Record<string, number> = {};
        withRole.forEach((i) => { roleCounts[i.role!] = (roleCounts[i.role!] || 0) + 1; });
        const teamCounts: Record<string, number> = {};
        withTeam.forEach((i) => { teamCounts[i.team_size!] = (teamCounts[i.team_size!] || 0) + 1; });
        const roleSorted = Object.entries(roleCounts).sort((a, b) => b[1] - a[1]);
        const teamSorted = Object.entries(teamCounts).sort((a, b) => b[1] - a[1]);
        const maxRole = roleSorted[0]?.[1] || 1;
        const maxTeam = teamSorted[0]?.[1] || 1;
        return (
          <div className="bg-white border border-border rounded-xl p-5 mb-5">
            <h3 className="font-heading font-bold text-sm text-ink-900">Perfil dos Inscritos</h3>
            <p className="text-xs text-ink-400 mb-4">Função e tamanho de equipa</p>
            {!hasEnough ? (
              <p className="text-sm text-ink-400 italic">Dados disponíveis após mais inscrições</p>
            ) : (
              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6">
                <div>
                  <p className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider mb-3">Função</p>
                  <div className="space-y-2">
                    {roleSorted.map(([name, count]) => (
                      <div key={name}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[12px] font-medium text-ink-700 truncate max-w-[180px]" title={name}>{name}</span>
                          <span className="font-heading font-bold text-[12px] text-blue-600 shrink-0 ml-2">{count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-surface">
                          <div className="h-full rounded-full bg-blue-600" style={{ width: `${(count / maxRole) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider mb-3">Equipa</p>
                  <div className="space-y-2">
                    {teamSorted.map(([name, count]) => (
                      <div key={name}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[12px] font-medium text-ink-700">{name}</span>
                          <span className="font-heading font-bold text-[12px] text-blue-600 shrink-0 ml-2">{count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-surface">
                          <div className="h-full rounded-full bg-blue-600" style={{ width: `${(count / maxTeam) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Gender Stats */}
      <div className="bg-white border border-border rounded-xl p-5 mb-5">
        <h3 className="font-heading font-bold text-sm text-ink-900">Género (estimativa por nome)</h3>
        <p className="text-xs text-ink-400 mb-4">Baseado no primeiro nome português</p>
        {([
          { key: "M" as const, emoji: "🔵", label: "Masculino", color: "hsl(var(--blue-600))" },
          { key: "F" as const, emoji: "🌸", label: "Feminino", color: "#E11D9F" },
          { key: "U" as const, emoji: "⚪", label: "Indefinido", color: "hsl(var(--ink-400))" },
        ] as const).map((g) => {
          const count = stats.genderCounts[g.key];
          const pct = stats.total ? ((count / stats.total) * 100).toFixed(0) : "0";
          return (
            <div key={g.key} className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[14px]">{g.emoji}</span>
                <span className="text-[13px] font-medium text-ink-700">{g.label}</span>
                <span className="ml-auto font-heading font-bold text-[13px] text-ink-500">{count}</span>
                <span className="text-xs text-ink-400">{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Number(pct)}%`, background: g.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Difficulties Chart */}
      <div className="bg-white border border-border rounded-xl p-5 mb-5">
        <h3 className="font-heading font-bold text-sm text-ink-900">Dificuldades Mais Comuns</h3>
        <p className="text-xs text-ink-400 mb-4">Opções seleccionadas no {isVideo ? "Passo 4" : "Passo 2"} (escolha múltipla)</p>
        <div className="space-y-3">
          {stats.difficulties.map((d) => {
            const pct = stats.maxDiff ? (d.count / stats.maxDiff) * 100 : 0;
            const totalResp = stats.comDuvida.length || 1;
            const pctTotal = ((d.count / totalResp) * 100).toFixed(0);
            return (
              <div key={d.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-[13px] font-medium text-ink-700">{d.label}</span>
                  <span className="text-[13px] font-heading font-bold text-ink-600">
                    {d.count} <span className="text-ink-400 font-normal text-[11px]">({pctTotal}%)</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: d.label === "Outro (texto livre)" ? "hsl(var(--amber-500))" : "hsl(var(--blue-600))" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Duvidas */}
      <div className="bg-white border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-sm text-ink-900">Dúvidas dos Inscritos</h3>
            <p className="text-xs text-ink-400">Respostas ao {isVideo ? "Passo 4" : "Passo 2"} do flow de inscrição</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              ✍️ {stats.comDuvida.filter(i => i.duvida.includes("Outro:")).length} personalizadas
            </span>
            <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
              {stats.comDuvida.length} respostas
            </span>
          </div>
        </div>
        <div className="max-h-[340px] overflow-y-auto space-y-2">
          {[...stats.comDuvida]
            .sort((a, b) => {
              const aCustom = a.duvida.includes("Outro:");
              const bCustom = b.duvida.includes("Outro:");
              if (aCustom && !bCustom) return -1;
              if (!aCustom && bCustom) return 1;
              return 0;
            })
            .map((i) => {
              const badge = getPlanBadge(i.plan, i.webinar);
              const isCustom = i.duvida.includes("Outro:");
              return (
                <div
                  key={i.id}
                  className={`py-3 px-3 rounded-lg cursor-pointer transition-colors ${
                    isCustom
                      ? "bg-amber-50 border border-amber-200 hover:bg-amber-100/60"
                      : "bg-muted/30 border border-border hover:bg-muted/50"
                  }`}
                  onClick={() => onSelectInscrito(i)}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {isCustom && (
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">✍️</span>
                    )}
                    <span className="text-[14px] font-semibold text-ink-900">{genderEmoji(i.gender)} {i.nome}</span>
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                    {isCustom && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                        💡 Insight Estratégico
                      </span>
                    )}
                  </div>
                  {isCustom ? (
                    <div className="mt-2">
                      {(() => {
                        const outroIdx = i.duvida.indexOf("Outro:");
                        const predefinidas = i.duvida.substring(0, outroIdx).replace(/,\s*$/, "").trim();
                        const customText = i.duvida.substring(outroIdx + 6).trim();
                        return (
                          <>
                            {predefinidas && (
                              <p className="text-[12px] text-ink-400 leading-relaxed">{predefinidas}</p>
                            )}
                            <div className="mt-1.5 border-l-[3px] border-amber-400 pl-2.5 py-1 bg-amber-100/50 rounded-r">
                              <p className="text-[13px] font-semibold text-amber-900 leading-relaxed">
                                „{customText}"
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="mt-1.5 space-y-1">
                      {parseDuvidaParts(i.duvida, webinarContext).map((part, idx) => (
                        <p key={idx} className="text-[13px] text-ink-600 leading-relaxed">• {part}</p>
                      ))}
                    </div>
                  )}
                  <p className="text-[11px] text-ink-400 mt-1.5">{formatDate(i.timestamp)}</p>
                </div>
              );
            })}
        </div>
      </div>

      {/* Leaderboard de Convites */}
      <LeaderboardConvites />

      {/* Acções Manuais — Video only, after webinar */}
      {webinarContext === "video" && VIDEO_WEBINAR_DATE.getTime() < Date.now() && (
        <PostWebinarAction />
      )}

      {/* Para Fazer Hoje */}
      <ParaFazerHoje inscritos={inscritos} onSelectInscrito={onSelectInscrito} />
    </div>
  );
}

/* ── Post-Webinar Manual Action ── */
function PostWebinarAction() {
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-video-postwebinar", {
        body: { manual: true },
      });
      if (error) throw error;
      const result = data as { sent?: number; errors?: number };
      alert(`✅ Email pós-webinar enviado com sucesso — ${result.sent || 0} enviados, ${result.errors || 0} erros`);
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao enviar — tenta novamente");
    } finally {
      setSending(false);
      setConfirming(false);
    }
  };

  return (
    <div className="bg-white border border-border rounded-xl p-5 mb-5">
      <h3 className="font-heading font-bold text-[14px] text-ink-900 mb-1">Acções Manuais</h3>
      <p className="text-[12px] text-ink-400 mb-4">Envios manuais para inscritos do Vídeo IA</p>

      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-[14px] text-ink-800 flex items-center gap-2">
              <Mail size={16} className="text-green-600" /> Email Pós-Webinar
            </p>
            <p className="text-[12px] text-ink-400 mt-0.5">Envia o email pós-webinar a todos os inscritos confirmados no Vídeo IA</p>
          </div>
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold border-2 transition-colors"
              style={{ borderColor: "#16a34a", color: "#16a34a" }}
            >
              <Send size={14} /> Enviar email pós-webinar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-ink-500">Tens a certeza?</span>
              <button
                onClick={handleSend}
                disabled={sending}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors"
                style={{ background: "#16a34a" }}
              >
                {sending ? "A enviar…" : "Sim, enviar agora"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="px-3 py-2 rounded-lg text-[13px] font-medium text-ink-500 bg-surface hover:bg-ink-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Early Bird vs Regular Widget ── */
function EarlyBirdWidget({ inscritos, webinarContext }: { inscritos: Inscrito[]; webinarContext: WebinarCtxType }) {
  const data = useMemo(() => {
    const pagantes = inscritos.filter((i) => i.paid_at && i.plan !== "free");
    const premiumEarly = pagantes.filter((i) => (i.plan === "premium" || i.plan === "bundle") && i.valor <= 15.01).length;
    const premiumRegular = pagantes.filter((i) => (i.plan === "premium" || i.plan === "bundle") && i.valor > 15.01 && i.valor <= 27.01).length;
    const mcEarly = pagantes.filter((i) => (i.plan === "masterclass" || i.plan === "bundle") && i.valor >= 47 && i.valor <= 58).length;
    const mcRegular = pagantes.filter((i) => (i.plan === "masterclass" || i.plan === "bundle") && i.valor > 76).length;
    return { premiumEarly, premiumRegular, mcEarly, mcRegular, total: pagantes.length };
  }, [inscritos]);

  if (data.total === 0) return null;

  return (
    <div className="bg-white border border-border rounded-xl p-5 mb-5">
      <h3 className="font-heading font-bold text-[14px] text-ink-900 mb-1">Early Bird vs Preço Regular</h3>
      <p className="text-[12px] text-ink-400 mb-4">Distribuição de compras por preço</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface/60 rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wide mb-2">Premium Pass</p>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-ink-600">€15 <span className="text-[10px] text-ink-400">(early bird)</span></span>
            <span className="font-heading font-bold text-[18px]" style={{ color: "#2563EB" }}>{data.premiumEarly}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[13px] text-ink-600">€27 <span className="text-[10px] text-ink-400">(regular)</span></span>
            <span className="font-heading font-bold text-[18px] text-ink-500">{data.premiumRegular}</span>
          </div>
        </div>
        <div className="bg-surface/60 rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wide mb-2">Masterclass</p>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-ink-600">€47 <span className="text-[10px] text-ink-400">(early bird)</span></span>
            <span className="font-heading font-bold text-[18px]" style={{ color: "#7C3AED" }}>{data.mcEarly}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[13px] text-ink-600">€97 <span className="text-[10px] text-ink-400">(regular)</span></span>
            <span className="font-heading font-bold text-[18px] text-ink-500">{data.mcRegular}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Comparação entre Webinars (consolidado only) ── */
function WebinarComparisonWidget({ inscritos }: { inscritos: Inscrito[] }) {
  const metrics = useMemo(() => {
    const calc = (items: Inscrito[]) => {
      const active = items.filter((i) => i.status === "activo");
      const pagantes = active.filter((i) => i.paid_at !== null);
      const receita = pagantes.reduce((s, i) => s + i.valor, 0);
      const srcMap: Record<string, number> = {};
      active.forEach((i) => i.source.forEach((s) => {
        if (s !== "SKIPPED") { const k = s.startsWith("Instagram") ? "Instagram" : s; srcMap[k] = (srcMap[k] || 0) + 1; }
      }));
      const topSource = Object.entries(srcMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
      return {
        total: active.length,
        receita,
        taxa: active.length ? ((pagantes.length / active.length) * 100).toFixed(1) : "0",
        ticket: pagantes.length ? (receita / pagantes.length).toFixed(2) : "0",
        topSource,
        hasPaid: pagantes.length > 0,
      };
    };
    const img = calc(inscritos.filter((i) => !i.webinar || i.webinar === "imagens"));
    const vid = calc(inscritos.filter((i) => i.webinar === "video"));
    return { img, vid };
  }, [inscritos]);

  const renderCard = (title: string, emoji: string, color: string, m: typeof metrics.img, hasData: boolean) => (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span>{emoji}</span>
        <h4 className="font-heading font-bold text-[14px]" style={{ color }}>{title}</h4>
      </div>
      {hasData ? (
        <div className="space-y-2">
          <div className="flex justify-between"><span className="text-[13px] text-ink-600">Inscritos</span><span className="font-heading font-bold text-ink-900">{m.total}</span></div>
          <div className="flex justify-between"><span className="text-[13px] text-ink-600">Receita confirmada</span><span className="font-heading font-bold text-ink-900">€{m.receita.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-[13px] text-ink-600">Taxa free→pago</span><span className="font-heading font-bold text-ink-900">{m.taxa}%</span></div>
          <div className="flex justify-between"><span className="text-[13px] text-ink-600">Ticket médio</span><span className="font-heading font-bold text-ink-900">€{m.ticket}</span></div>
          <div className="flex justify-between"><span className="text-[13px] text-ink-600">Top canal</span><span className="text-[13px] font-medium text-ink-700">{m.topSource}</span></div>
        </div>
      ) : (
        <div className="py-6 text-center">
          <p className="text-ink-400 text-[13px]">—</p>
          <p className="text-[12px] text-ink-400 mt-1">Disponível após inscrições</p>
        </div>
      )}
    </div>
  );

  const deltaLine = metrics.vid.total > 0
    ? `Δ Inscritos: ${metrics.img.total > 0 ? ((metrics.vid.total - metrics.img.total) / metrics.img.total * 100).toFixed(0) : "—"}% vs Imagens · Δ Receita: €${(metrics.vid.receita - metrics.img.receita).toFixed(0)}`
    : "Webinar a 2 de Março — dados disponíveis após lançamento";

  return (
    <div className="mb-5">
      <h3 className="font-heading font-bold text-[15px] text-ink-900 mb-3">Comparação entre Webinars</h3>
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
        {renderCard("Imagens IA · 18 Fev", "📷", "#1e40af", metrics.img, metrics.img.total > 0)}
        {renderCard("Vídeo IA · 2 Mar", "🎬", "#16a34a", metrics.vid, metrics.vid.total > 0)}
      </div>
      <p className="text-[12px] text-ink-400 mt-3 text-center italic">{deltaLine}</p>
    </div>
  );
}


interface LeaderboardEntry {
  name: string;
  count: number;
  referralCode: string;
}

const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

function LeaderboardConvites() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const { data: res } = await supabase.functions.invoke("get-leaderboard");
        if (Array.isArray(res)) setData(res);
      } catch (e) {
        console.error("Leaderboard error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const habilitados = data.filter((d) => d.count >= 2).length;

  return (
    <div className="bg-white border border-border rounded-xl p-5 mt-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          <h3 className="font-heading font-bold text-sm text-ink-900">Leaderboard de Convites</h3>
        </div>
        {habilitados > 0 && (
          <span className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700">
            <BookOpen size={12} />
            {habilitados} habilitado{habilitados !== 1 ? "s" : ""} ao livro
          </span>
        )}
      </div>
      <p className="text-xs text-ink-400 mb-4">Quem convidou 2+ amigos ganha o livro "Guia Essencial SEO"</p>

      {loading ? (
        <p className="text-[13px] text-ink-400 py-6 text-center">A carregar...</p>
      ) : data.length === 0 ? (
        <p className="text-[13px] text-ink-400 py-6 text-center">Ainda sem convites registados.</p>
      ) : (
        <div className="space-y-0">
          {data.map((entry, idx) => {
            const eligible = entry.count >= 2;
            return (
              <div
                key={entry.referralCode}
                className={`flex items-center gap-3 py-2.5 px-2 -mx-2 rounded ${idx < data.length - 1 ? "border-b border-border" : ""} ${eligible ? "bg-green-50/50" : ""}`}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold" style={{
                  background: idx < 3 ? MEDAL_COLORS[idx] : "hsl(var(--surface))",
                  color: idx < 3 ? "#fff" : "hsl(var(--ink-500))",
                }}>
                  {idx + 1}
                </div>
                <span className="flex-1 text-[14px] font-semibold text-ink-800">{entry.name}</span>
                <span className="font-heading font-bold text-[14px] text-ink-700">{entry.count} <span className="text-[11px] font-normal text-ink-400">convite{entry.count !== 1 ? "s" : ""}</span></span>
                {eligible && (
                  <span className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-white" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── "Para Fazer Hoje" block ── */

const GRADIENTS_TODO = [
  "linear-gradient(135deg,#1e3a5f,#3b82f6)",
  "linear-gradient(135deg,#064e3b,#10b981)",
  "linear-gradient(135deg,#7c2d12,#f97316)",
  "linear-gradient(135deg,#1e1b4b,#7c3aed)",
  "linear-gradient(135deg,#0c4a6e,#0284c7)",
  "linear-gradient(135deg,#134e4a,#0d9488)",
];

const PLAN_BADGE_TODO: Record<string, { bg: string; color: string; label: string }> = {
  free: { bg: "hsl(var(--surface))", color: "hsl(var(--ink-400))", label: "Gratuito" },
  premium: { bg: "hsl(var(--blue-50))", color: "hsl(var(--blue-600))", label: "Premium" },
  masterclass: { bg: "rgba(124,58,237,0.1)", color: "#7C3AED", label: "MC" },
  bundle: { bg: "hsl(var(--green-50))", color: "hsl(var(--green-600))", label: "Bundle" },
};

function getInitialsTodo(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function ParaFazerHoje({ inscritos, onSelectInscrito }: { inscritos: Inscrito[]; onSelectInscrito: (i: Inscrito) => void }) {
  const followUps = useMemo(
    () => inscritos.filter((i) => i.follow_up && i.status === "activo"),
    [inscritos]
  );
  const shown = followUps.slice(0, 5);
  const remaining = followUps.length - 5;

  return (
    <div className="bg-white border border-border rounded-xl p-5 mt-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold text-[14px] text-ink-800">Para Fazer Hoje</h3>
        {followUps.length > 0 && (
          <span className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
            {followUps.length} em follow-up
          </span>
        )}
      </div>

      {followUps.length === 0 ? (
        <div className="flex flex-col items-center py-8">
          <CheckCircle size={24} className="text-green-400" />
          <p className="text-[14px] text-ink-400 mt-2">Sem pendências. Tudo em ordem.</p>
        </div>
      ) : (
        <>
          {shown.map((i, idx) => {
            const badge = PLAN_BADGE_TODO[i.plan];
            const gradIdx = parseInt(i.id, 10) % GRADIENTS_TODO.length;
            return (
              <div
                key={i.id}
                className={`flex items-center gap-3 py-3 cursor-pointer hover:bg-off-white -mx-2 px-2 rounded ${idx < shown.length - 1 ? "border-b border-border" : ""}`}
                onClick={() => onSelectInscrito(i)}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-heading font-bold text-[11px]"
                  style={{ background: GRADIENTS_TODO[gradIdx] }}
                >
                  {getInitialsTodo(i.nome)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px] text-ink-800">{genderEmoji(i.gender)} {i.nome}</p>
                  <p className="text-[12px] text-ink-400 truncate">{i.email}</p>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0" style={{ background: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://wa.me/${i.whatsapp.replace(/\D/g, "")}`, "_blank");
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium shrink-0 transition-colors"
                  style={{ background: "rgba(37,211,102,0.10)", color: "#25D366" }}
                >
                  <MessageCircle size={12} /> WhatsApp
                </button>
              </div>
            );
          })}
          {remaining > 0 && (
            <p className="text-[13px] text-blue-600 font-medium mt-3 cursor-pointer hover:underline text-center">
              Ver mais {remaining} →
            </p>
          )}
        </>
      )}
    </div>
  );
}
