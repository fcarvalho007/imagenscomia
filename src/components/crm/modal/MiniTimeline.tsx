import type { Inscrito } from "@/pages/crm/mockData";

interface MiniTimelineProps {
  inscrito: Inscrito;
  messageLogs: any[];
  paymentEvents: any[];
}

function fmtShort(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

interface TimelineEvent {
  date: string;
  icon: string;
  label: string;
  color: string;
}

export default function MiniTimeline({ inscrito, messageLogs, paymentEvents }: MiniTimelineProps) {
  const events: TimelineEvent[] = [];

  // Registration
  events.push({
    date: inscrito.timestamp,
    icon: "📝",
    label: "Inscrito",
    color: "#3b82f6",
  });

  // Upgrade click
  if (inscrito.upgrade_clicked_at) {
    events.push({
      date: inscrito.upgrade_clicked_at,
      icon: "🔼",
      label: "Clicou upgrade",
      color: "#d97706",
    });
  }

  // Emails sent (deduplicate by template_key, only count sent)
  const sentTemplates = new Set<string>();
  const sentLogs = (messageLogs || [])
    .filter((l: any) => (l.status === "sent" || l.status === "delivered") && l.channel === "email")
    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  for (const log of sentLogs) {
    if (!sentTemplates.has(log.template_key)) {
      sentTemplates.add(log.template_key);
      events.push({
        date: log.created_at,
        icon: "📧",
        label: formatTemplateKey(log.template_key),
        color: "#6366f1",
      });
    }
  }

  // SMS sent
  const smsLogs = (messageLogs || [])
    .filter((l: any) => l.channel === "sms" && (l.status === "sent" || l.status === "delivered"))
    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const smsTemplates = new Set<string>();
  for (const log of smsLogs) {
    if (!smsTemplates.has(log.template_key)) {
      smsTemplates.add(log.template_key);
      events.push({
        date: log.created_at,
        icon: "📱",
        label: formatTemplateKey(log.template_key),
        color: "#f59e0b",
      });
    }
  }

  // Payment
  if (inscrito.paid_at) {
    events.push({
      date: inscrito.paid_at,
      icon: "💰",
      label: `Pagou €${inscrito.valor}`,
      color: "#16a34a",
    });
  }

  // Premium granted
  if (inscrito.premium_granted_at) {
    events.push({
      date: inscrito.premium_granted_at,
      icon: "⭐",
      label: "Premium concedido",
      color: "#d97706",
    });
  }

  // Lost
  if (inscrito.lost_at) {
    events.push({
      date: inscrito.lost_at,
      icon: "❌",
      label: "Marcado como perdido",
      color: "#ef4444",
    });
  }

  // Sort chronologically
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (events.length <= 1) return null;

  return (
    <div className="rounded-xl p-3.5 mb-4" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
      <p className="text-[11px] font-bold uppercase tracking-[1.5px] mb-2.5" style={{ color: "#888" }}>
        Percurso do Lead
      </p>
      <div className="flex items-start gap-0 overflow-x-auto pb-1">
        {events.map((evt, idx) => (
          <div key={idx} className="flex items-start shrink-0">
            {/* Event dot + label */}
            <div className="flex flex-col items-center" style={{ minWidth: 64 }}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[13px]"
                style={{ background: `${evt.color}15`, border: `2px solid ${evt.color}30` }}
              >
                {evt.icon}
              </div>
              <p className="text-[10px] font-medium mt-1 text-center leading-tight max-w-[70px]" style={{ color: evt.color }}>
                {evt.label}
              </p>
              <p className="text-[9px] mt-0.5" style={{ color: "#aaa" }}>
                {fmtShort(evt.date)}
              </p>
            </div>
            {/* Connector line */}
            {idx < events.length - 1 && (
              <div className="flex items-center mt-3 px-0.5">
                <div className="w-4 h-px" style={{ background: "#cbd5e1" }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTemplateKey(key: string): string {
  const MAP: Record<string, string> = {
    confirmation: "Confirmação",
    reminder_24h: "Lembrete 24h",
    reminder_1h: "Lembrete 1h",
    postwebinar: "Pós-webinar",
    postwebinar_day1: "Dia 1",
    postwebinar_day3: "Dia 3",
    postwebinar_closing: "Fecho",
    followup_backlog_checkin: "Follow-up",
    reminder_manual: "Lembrete manual",
    payment_link: "Link pagamento",
    video_confirmation: "Confirmação",
    video_reminder_48h: "Lembrete 48h",
    video_reminder_24h: "Lembrete 24h",
    video_reminder_1h: "Lembrete 1h",
    video_postwebinar: "Pós-webinar",
    video_postwebinar_day1: "Dia 1",
    video_postwebinar_day3: "Dia 3",
    video_postwebinar_closing: "Fecho",
    video_masterclass_thankyou: "MC Obrigado",
    video_masterclass_day1: "MC Dia 1",
    video_masterclass_day3: "MC Dia 3",
    video_recursos_access: "Recursos",
    crm_premium_granted: "Premium",
    sms_followup_day1: "SMS Dia 1",
  };
  return MAP[key] || key.replace(/_/g, " ").replace(/^video /, "");
}
