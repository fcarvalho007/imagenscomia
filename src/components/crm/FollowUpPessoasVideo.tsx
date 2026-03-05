import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, MessageSquare, Filter, X, Mail } from "lucide-react";
import { getTemplateLabel } from "./templateLabels";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Inscrito } from "@/pages/crm/mockData";

interface EmailLog {
  id: string;
  email_key: string;
  recipient_email: string;
  status: string;
  sent_at: string | null;
  error_message: string | null;
}

interface Props {
  inscritos: Inscrito[];
  onSelectInscrito: (i: Inscrito) => void;
}

type VideoFilter = "todos" | "gratuitos" | "compraram" | "sem_emails" | "perdidos";

const DOT_COLORS: Record<string, string> = {
  video_confirmation: "#10B981",
  video_reminder_48h: "#3B82F6",
  video_reminder_24h: "#3B82F6",
  video_reminder_1h: "#3B82F6",
  video_followup_prewebinar: "#F59E0B",
  video_payment_premium: "#8B5CF6",
  video_payment_masterclass: "#8B5CF6",
  video_postwebinar: "#F97316",
  video_postwebinar_day1: "#F97316",
  video_postwebinar_day3: "#F97316",
  video_postwebinar_closing: "#EF4444",
};

function getDotColor(emailKey: string): string {
  return DOT_COLORS[emailKey] || "#94A3B8";
}

function getPlanBadge(plan: string | null) {
  if (!plan || plan === "free" || plan === "video-free")
    return { label: "gratuito", bg: "#DCFCE7", color: "#166534" };
  if (plan.includes("premium"))
    return { label: "premium", bg: "#DBEAFE", color: "#1E40AF" };
  if (plan.includes("masterclass"))
    return { label: "masterclass", bg: "#EDE9FE", color: "#6D28D9" };
  if (plan.includes("bundle"))
    return { label: "bundle", bg: "#EDE9FE", color: "#6D28D9" };
  return { label: plan, bg: "#F1F5F9", color: "#64748B" };
}

function fmtDateTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// GAP 2 — Hardcoded schedule dates
const WEBINAR_DATE = new Date("2026-03-05T10:00:00Z");
const POSTWEBINAR_DAY1 = new Date("2026-03-06T13:00:00Z");
const POSTWEBINAR_DAY3 = new Date("2026-03-08T10:00:00Z");
const CLOSING_DATE = new Date("2026-03-10T10:00:00Z");

const MONTHS_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
function fmtDatePt(d: Date): string {
  return `${d.getDate()} ${MONTHS_PT[d.getMonth()]} · ${String(d.getHours()).padStart(2,"0")}h${String(d.getMinutes()).padStart(2,"0")}`;
}

function subHours(date: Date, hours: number): Date {
  return new Date(date.getTime() - hours * 3600000);
}

interface NextScheduledResult {
  label: string;
  date: Date | null;
  isLost?: boolean;
  isComplete?: boolean;
}

function getNextScheduled(sentKeys: Set<string>, lostAt: string | null): NextScheduledResult {
  if (lostAt) return { label: "Fecho enviado", date: null, isLost: true };
  const now = new Date();
  if (!sentKeys.has("video_confirmation"))
    return { label: "Confirmação imediata", date: null };
  if (!sentKeys.has("video_reminder_48h") && now < WEBINAR_DATE)
    return { label: "Lembrete 48h", date: subHours(WEBINAR_DATE, 48) };
  if (!sentKeys.has("video_reminder_24h") && now < WEBINAR_DATE)
    return { label: "Lembrete 24h", date: subHours(WEBINAR_DATE, 24) };
  if (!sentKeys.has("video_reminder_1h") && now < WEBINAR_DATE)
    return { label: "Lembrete 1h", date: subHours(WEBINAR_DATE, 1) };
  if (!sentKeys.has("video_postwebinar_day1") && now < POSTWEBINAR_DAY1)
    return { label: "Email pós-webinar Dia 1", date: POSTWEBINAR_DAY1 };
  if (!sentKeys.has("video_postwebinar_day3") && now < POSTWEBINAR_DAY3)
    return { label: "Email pós-webinar Dia 3", date: POSTWEBINAR_DAY3 };
  if (!sentKeys.has("video_postwebinar_closing") && now < CLOSING_DATE)
    return { label: "Email de fecho", date: CLOSING_DATE };
  return { label: "Ciclo completo", date: null, isComplete: true };
}

export default function FollowUpPessoasVideo({ inscritos, onSelectInscrito }: Props) {
  const [filter, setFilter] = useState<VideoFilter>("todos");
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("email_send_logs")
      .select("id, email_key, recipient_email, status, sent_at, error_message")
      .eq("webinar", "video")
      .order("sent_at", { ascending: true })
      .then(({ data }) => {
        if (data) setEmailLogs(data as EmailLog[]);
        setLoading(false);
      });
  }, []);

  const logsByEmail = useMemo(() => {
    const map: Record<string, EmailLog[]> = {};
    for (const log of emailLogs) {
      const key = log.recipient_email.toLowerCase();
      if (!map[key]) map[key] = [];
      map[key].push(log);
    }
    return map;
  }, [emailLogs]);

  const emailsWithZeroLogs = useMemo(() => {
    const allEmails = new Set(emailLogs.map(l => l.recipient_email.toLowerCase()));
    return new Set(inscritos.filter(i => !allEmails.has(i.email.toLowerCase())).map(i => i.id));
  }, [inscritos, emailLogs]);

  const isFree = (plan: string | null) => !plan || plan === "free" || plan === "video-free";

  const filtered = useMemo(() => {
    let list = inscritos;
    switch (filter) {
      case "gratuitos":
        list = list.filter(i => isFree(i.plan_selected));
        break;
      case "compraram":
        list = list.filter(i => !!i.paid_at);
        break;
      case "sem_emails":
        list = list.filter(i => emailsWithZeroLogs.has(i.id));
        break;
      case "perdidos":
        list = list.filter(i => !!i.lost_at);
        break;
    }
    return list;
  }, [inscritos, filter, emailsWithZeroLogs]);

  const FILTERS: { key: VideoFilter; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "gratuitos", label: "Só gratuitos" },
    { key: "compraram", label: "Compraram" },
    { key: "sem_emails", label: "Sem emails" },
    { key: "perdidos", label: "Perdidos" },
  ];

  if (inscritos.length === 0) {
    return (
      <div className="bg-white border border-border rounded-xl p-12 text-center">
        <Mail size={36} className="mx-auto mb-3" style={{ color: "#94A3B8" }} />
        <p className="text-[14px] font-medium" style={{ color: "#0F172A" }}>Ainda sem inscritos no Webinar Vídeo.</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={14} style={{ color: "#64748B" }} />
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-2.5 py-1 rounded-full text-[12px] font-medium transition-colors"
              style={{
                background: filter === f.key ? "#2563EB" : "#F1F5F9",
                color: filter === f.key ? "#fff" : "#64748B",
              }}
            >
              {f.label}
            </button>
          ))}
          {filter !== "todos" && (
            <button onClick={() => setFilter("todos")} className="flex items-center gap-1 text-[12px] font-medium" style={{ color: "#EF4444" }}>
              <X size={12} /> Limpar
            </button>
          )}
        </div>

        <p className="text-[13px] font-medium" style={{ color: "#64748B" }}>
          {filtered.length} pessoa{filtered.length !== 1 ? "s" : ""}
          {filter !== "todos" && <span style={{ color: "#94A3B8" }}> (filtrado de {inscritos.length})</span>}
        </p>

        {loading ? (
          <div className="text-center py-8 text-[13px]" style={{ color: "#94A3B8" }}>A carregar histórico de emails…</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block rounded-xl border overflow-hidden" style={{ background: "#fff", borderColor: "rgba(0,0,0,0.06)" }}>
              <table className="w-full text-left">
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5" style={{ color: "#64748B" }}>Nome</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5" style={{ color: "#64748B" }}>Emails Recebidos</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5" style={{ color: "#64748B" }}>Último Envio</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 hidden md:table-cell" style={{ color: "#64748B" }}>Próximo Agendado</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-center" style={{ color: "#64748B" }}>Acções</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(i => {
                    const logs = logsByEmail[i.email.toLowerCase()] || [];
                    const sentKeys = new Set(logs.filter(l => l.status === "sent").map(l => l.email_key));
                    const planBadge = getPlanBadge(i.plan_selected);
                    const next = getNextScheduled(sentKeys, i.lost_at);

                    // GAP 3 — only status='sent'
                    const sentLogs = logs.filter(l => l.status === "sent" && l.sent_at);
                    const lastSent = sentLogs.length > 0
                      ? sentLogs.sort((a, b) => new Date(b.sent_at!).getTime() - new Date(a.sent_at!).getTime())[0]
                      : null;

                    // GAP 1 — max 8 dots
                    const visibleDots = logs.slice(0, 8);
                    const overflowCount = Math.max(0, logs.length - 8);

                    return (
                      <tr key={i.id} className="border-t" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
                        {/* Nome */}
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-[13px] font-medium" style={{ color: "#0F172A" }}>{i.nome}</p>
                              <p className="text-[11px]" style={{ color: "#94A3B8" }}>{i.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: planBadge.bg, color: planBadge.color }}>
                              {planBadge.label}
                            </span>
                            {i.lost_at && (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "#FEE2E2", color: "#991B1B" }}>
                                perdido
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Email dots — GAP 1 */}
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            {logs.length === 0 ? (
                              <span className="text-[11px] italic" style={{ color: "#94A3B8" }}>nenhum</span>
                            ) : (
                              <>
                                {visibleDots.map(log => (
                                  <Tooltip key={log.id}>
                                    <TooltipTrigger asChild>
                                      <span
                                        className="inline-flex items-center justify-center cursor-default"
                                        style={{ width: 14, height: 14, fontSize: 10 }}
                                      >
                                        {log.status === "failed" ? (
                                          <span style={{ color: "#EF4444", fontWeight: 700, fontSize: 11 }}>✕</span>
                                        ) : (
                                          <span style={{
                                            display: "inline-block",
                                            width: 8,
                                            height: 8,
                                            borderRadius: "50%",
                                            background: getDotColor(log.email_key),
                                          }} />
                                        )}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs max-w-[220px]">
                                      <p className="font-semibold">{getTemplateLabel(log.email_key)}</p>
                                      <p>{fmtDateTime(log.sent_at)}</p>
                                      <p style={{ color: log.status === "failed" ? "#EF4444" : "#10B981" }}>
                                        {log.status === "sent" ? "Enviado" : log.status === "failed" ? "Falha" : log.status}
                                      </p>
                                      {log.error_message && <p className="text-[10px]" style={{ color: "#EF4444" }}>{log.error_message}</p>}
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                                {overflowCount > 0 && (
                                  <span style={{ background: "#f3f4f6", color: "#6b7280", fontSize: 10, fontWeight: 500, borderRadius: 20, padding: "1px 6px", marginLeft: 4 }}>
                                    +{overflowCount}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </td>

                        {/* Último Envio — GAP 3 */}
                        <td className="px-4 py-2.5">
                          {lastSent ? (
                            <>
                              <p className="text-[12px]" style={{ color: "#0F172A" }}>{fmtDateTime(lastSent.sent_at)}</p>
                              <p className="text-[11px]" style={{ color: "#94A3B8" }}>{getTemplateLabel(lastSent.email_key)}</p>
                            </>
                          ) : (
                            <p className="text-[12px]" style={{ color: "#94A3B8" }}>—</p>
                          )}
                        </td>

                        {/* Próximo Agendado — GAP 2 + GAP 4 */}
                        <td className="px-4 py-2.5 hidden md:table-cell">
                          <span
                            className="text-[12px] font-medium"
                            style={{
                              color: next.isLost ? "#EF4444"
                                : next.isComplete ? "#94A3B8"
                                : "#0F172A",
                              fontStyle: next.isComplete ? "italic" : "normal",
                            }}
                          >
                            {next.label}
                          </span>
                          {next.date && (
                            <p className="text-[11px]" style={{ color: "#94A3B8" }}>{fmtDatePt(next.date)}</p>
                          )}
                        </td>

                        {/* Acções */}
                        <td className="px-4 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => onSelectInscrito(i)} className="p-1 rounded hover:bg-blue-50 transition-colors" title="Abrir ficha">
                              <User size={14} style={{ color: "#2563EB" }} />
                            </button>
                            {i.whatsapp && (
                              <a href={`https://wa.me/${i.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="p-1 rounded hover:bg-green-50 transition-colors" title="WhatsApp">
                                <MessageSquare size={14} style={{ color: "#10B981" }} />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[13px]" style={{ color: "#94A3B8" }}>
                        Nenhuma pessoa encontrada com os filtros actuais.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {filtered.map(i => {
                const logs = logsByEmail[i.email.toLowerCase()] || [];
                const sentKeys = new Set(logs.filter(l => l.status === "sent").map(l => l.email_key));
                const planBadge = getPlanBadge(i.plan_selected);
                const next = getNextScheduled(sentKeys, i.lost_at);

                const sentLogs = logs.filter(l => l.status === "sent" && l.sent_at);
                const lastSent = sentLogs.length > 0
                  ? sentLogs.sort((a, b) => new Date(b.sent_at!).getTime() - new Date(a.sent_at!).getTime())[0]
                  : null;

                const mobileDots = logs.slice(0, 8);
                const mobileOverflow = Math.max(0, logs.length - 8);

                return (
                  <div key={i.id} className="rounded-xl border p-3" style={{ background: "#fff", borderColor: "rgba(0,0,0,0.06)" }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: "#0F172A" }}>{i.nome}</p>
                        <p className="text-[11px]" style={{ color: "#94A3B8" }}>{i.email}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: planBadge.bg, color: planBadge.color }}>
                            {planBadge.label}
                          </span>
                          {i.lost_at && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "#FEE2E2", color: "#991B1B" }}>
                              perdido
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className="text-[11px]"
                        style={{ color: next.isLost ? "#EF4444" : "#94A3B8", fontStyle: next.isComplete ? "italic" : "normal" }}
                      >
                        {next.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap mb-2">
                      {mobileDots.map(log => (
                        <span key={log.id} style={{
                          display: "inline-block",
                          width: log.status === "failed" ? "auto" : 8,
                          height: 8,
                          borderRadius: log.status === "failed" ? 0 : "50%",
                          background: log.status === "failed" ? "transparent" : getDotColor(log.email_key),
                          color: "#EF4444",
                          fontSize: 10,
                          fontWeight: 700,
                        }}>
                          {log.status === "failed" ? "✕" : ""}
                        </span>
                      ))}
                      {mobileOverflow > 0 && (
                        <span style={{ background: "#f3f4f6", color: "#6b7280", fontSize: 10, fontWeight: 500, borderRadius: 20, padding: "1px 6px", marginLeft: 4 }}>
                          +{mobileOverflow}
                        </span>
                      )}
                      {logs.length === 0 && <span className="text-[11px] italic" style={{ color: "#94A3B8" }}>nenhum email</span>}
                    </div>
                    {lastSent && (
                      <p className="text-[11px] mb-2" style={{ color: "#64748B" }}>
                        Último: {getTemplateLabel(lastSent.email_key)} — {fmtDateTime(lastSent.sent_at)}
                      </p>
                    )}
                    <div className="flex items-center gap-1">
                      <button onClick={() => onSelectInscrito(i)} className="px-2 py-1 rounded text-[11px] font-medium" style={{ background: "#EFF6FF", color: "#2563EB" }}>
                        Ficha
                      </button>
                      {i.whatsapp && (
                        <a href={`https://wa.me/${i.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="px-2 py-1 rounded text-[11px] font-medium" style={{ background: "#DCFCE7", color: "#166534" }}>
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-center py-8 text-[13px]" style={{ color: "#94A3B8" }}>Nenhuma pessoa encontrada.</p>
              )}
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
