import { useMemo, useState } from "react";
import { Users, Euro, TrendingUp, BarChart2, CheckCircle, MessageCircle, RefreshCw } from "lucide-react";
import type { Inscrito } from "@/pages/crm/mockData";
import { genderEmoji } from "@/lib/genderDetection";

interface DashboardViewProps {
  inscritos: Inscrito[];
  onSelectInscrito: (i: Inscrito) => void;
  onRefresh?: () => Promise<void>;
}

const PLAN_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  free: { bg: "hsl(var(--surface))", color: "hsl(var(--ink-400))", label: "Gratuito" },
  premium: { bg: "hsl(var(--blue-50))", color: "hsl(var(--blue-600))", label: "Premium €15" },
  masterclass: { bg: "rgba(124,58,237,0.1)", color: "#7C3AED", label: "MC €57,81" },
  bundle: { bg: "hsl(var(--green-50))", color: "hsl(var(--green-600))", label: "Bundle €72,81" },
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
  const stats = useMemo(() => {
    const active = inscritos.filter((i) => i.status === "activo");
    const total = active.length;
    const receita = active.reduce((s, i) => s + i.valor, 0);
    const pagantes = active.filter((i) => i.plan !== "free");
    const conversao = total ? (pagantes.length / total) * 100 : 0;
    const ticket = pagantes.length ? receita / pagantes.length : 0;

    // Funnel (using real step_reached from DB)
    const step1 = active.length;
    const step2 = active.filter((i) => i.step_reached >= 2).length;
    const step3 = active.filter((i) => i.step_reached >= 3).length;
    const step4 = active.filter((i) => i.step_reached >= 4).length;
    const step5 = active.filter((i) => i.step_reached >= 5).length;

    // Sources
    const srcMap: Record<string, number> = {};
    active.forEach((i) => i.source.forEach((s) => {
      if (s === "SKIPPED") return;
      const key = abbreviateSource(s);
      srcMap[key] = (srcMap[key] || 0) + 1;
    }));
    const sources = Object.entries(srcMap).sort((a, b) => b[1] - a[1]);
    const maxSrc = sources[0]?.[1] || 1;

    // Plans
    const planCounts: Record<string, number> = { free: 0, premium: 0, masterclass: 0, bundle: 0 };
    active.forEach((i) => { planCounts[i.plan]++; });

    // Duvidas
    const comDuvida = active.filter((i) => i.duvida !== "" && i.duvida !== "SKIPPED");

    const nPremium = planCounts.premium;
    const nMC = planCounts.masterclass;
    const nBundle = planCounts.bundle;

    // Gender
    const genderCounts = { M: 0, F: 0, U: 0 };
    active.forEach((i) => { genderCounts[i.gender]++; });

    return { total, receita, conversao, ticket, step1, step2, step3, step4, step5, sources, maxSrc, planCounts, comDuvida, nPremium, nMC, nBundle, genderCounts };
  }, [inscritos]);

  const now = new Date();
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} · ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

  const funnelSteps = [
    { label: "Submeteu inscrição", value: stats.step1, color: "hsl(var(--blue-600))" },
    { label: "Chegou ao Passo 1 (Origem)", value: stats.step2, color: "hsl(var(--blue-600))" },
    { label: "Completou Passo 2 (Dúvida)", value: stats.step3, color: "#0891B2" },
    { label: "Viu oferta Premium (Passo 3)", value: stats.step4, color: "hsl(var(--amber-500))" },
    { label: "Flow completo (Passo 5)", value: stats.step5, color: "hsl(var(--green-600))" },
  ];

  const taxaGlobal = stats.total ? ((stats.total - stats.planCounts.free) / stats.total) * 100 : 0;

  return (
    <div className="p-7 max-sm:p-4 bg-off-white min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-[22px] text-ink-900">Dashboard</h1>
          <p className="text-sm text-ink-500">Visão geral do webinar em tempo real</p>
        </div>
        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={async () => { setRefreshing(true); await onRefresh(); setRefreshing(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium bg-surface text-ink-600 hover:bg-ink-100 transition-colors"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Atualizar
            </button>
          )}
          <p className="text-[13px] text-ink-400 mt-1">{dateStr}</p>
        </div>
      </div>

      {/* Funnel */}
      <div className="bg-white border border-border rounded-xl p-6 mb-5">
        <h2 className="font-heading font-bold text-[15px] text-ink-900">Funil de Inscrição</h2>
        <p className="text-[13px] text-ink-400 mb-5">Da landing page ao pagamento</p>
        <div className="space-y-3">
          {funnelSteps.map((step, idx) => {
            const pct = stats.step1 ? (step.value / stats.step1) * 100 : 0;
            return (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-[12px] text-ink-500 w-[200px] max-sm:w-[140px] shrink-0 truncate">
                  {idx + 1}. {step.label}
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: step.color }}
                  />
                </div>
                <span className="text-[13px] font-heading font-bold text-ink-700 w-16 text-right shrink-0">
                  {step.value} <span className="text-ink-400 font-normal text-[11px]">({pct.toFixed(0)}%)</span>
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-right mt-4">
          <span className="text-[13px] text-ink-400">Taxa modal → pagamento: </span>
          <span className="font-heading font-bold text-2xl text-blue-600">{taxaGlobal.toFixed(1)}%</span>
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 max-md:grid-cols-2 gap-3.5 mb-5">
        {[
          { icon: Users, iconColor: "hsl(var(--blue-600))", value: String(stats.total), label: "Inscritos", sub: "Desde 8 Fev" },
          { icon: Euro, iconColor: "hsl(var(--green-600))", value: `€${stats.receita.toFixed(2)}`, label: "Receita", sub: `${stats.nPremium} Premium · ${stats.planCounts.masterclass} MC · ${stats.planCounts.bundle} Bundle` },
          { icon: TrendingUp, iconColor: "hsl(var(--amber-500))", value: `${stats.conversao.toFixed(1)}%`, label: "Conversão para pago", sub: "inscritos que pagaram algo" },
          { icon: BarChart2, iconColor: "#7C3AED", value: `€${stats.ticket.toFixed(2)}`, label: "Ticket médio", sub: "entre quem pagou" },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white border border-border rounded-xl p-5">
            <kpi.icon size={20} style={{ color: kpi.iconColor }} />
            <p className="font-heading font-extrabold text-[32px] text-ink-900 mt-2 leading-none">{kpi.value}</p>
            <p className="text-[13px] text-ink-500 mt-1">{kpi.label}</p>
            <p className="text-[11px] text-ink-400">{kpi.sub}</p>
          </div>
        ))}
      </div>

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
          <p className="text-xs text-ink-400 mb-4">Breakdown dos inscritos</p>
          {(["free", "premium", "masterclass", "bundle"] as const).map((plan) => {
            const info = PLAN_BADGE[plan];
            const count = stats.planCounts[plan];
            const pct = stats.total ? ((count / stats.total) * 100).toFixed(0) : "0";
            const barColors: Record<string, string> = {
              free: "hsl(var(--ink-300))",
              premium: "hsl(var(--blue-600))",
              masterclass: "#7C3AED",
              bundle: "hsl(var(--green-600))",
            };
            return (
              <div key={plan} className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: barColors[plan] }} />
                  <span className="text-[13px] font-medium" style={{ color: info.color }}>{info.label}</span>
                  <span className="ml-auto font-heading font-bold text-[13px] text-ink-500">{count}</span>
                  <span className="text-xs text-ink-400">{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Number(pct)}%`, background: barColors[plan] }}
                  />
                </div>
              </div>
            );
          })}
          <div className="border-t border-border mt-4 pt-3 text-right">
            <span className="font-heading font-bold text-[15px] text-ink-900">
              Total Receita: €{stats.receita.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

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

      {/* Duvidas */}
      <div className="bg-white border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-sm text-ink-900">Dúvidas dos Inscritos</h3>
            <p className="text-xs text-ink-400">Respostas ao Passo 2 do flow de inscrição</p>
          </div>
          <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
            {stats.comDuvida.length} inscritos responderam
          </span>
        </div>
        <div className="max-h-[280px] overflow-y-auto space-y-0">
          {stats.comDuvida.map((i) => {
            const badge = PLAN_BADGE[i.plan];
            return (
              <div
                key={i.id}
                className="py-3 border-b border-border last:border-0 cursor-pointer hover:bg-off-white px-2 -mx-2 rounded"
                onClick={() => onSelectInscrito(i)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-ink-900">{genderEmoji(i.gender)} {i.nome}</span>
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="text-[13px] text-ink-700 mt-1 leading-relaxed">{i.duvida}</p>
                <p className="text-[11px] text-ink-400 mt-1">{formatDate(i.timestamp)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Para Fazer Hoje */}
      <ParaFazerHoje inscritos={inscritos} onSelectInscrito={onSelectInscrito} />
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
