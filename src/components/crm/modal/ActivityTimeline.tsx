import { useState, useMemo } from "react";
import { Mail, CreditCard, AlertTriangle, Copy, Check, ChevronDown, Loader2, XCircle } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { getTemplateLabel, fmtTimeAgo } from "../templateLabels";
import type { Inscrito } from "@/pages/crm/mockData";

function fmtDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

type FilterType = "all" | "emails" | "payments" | "errors" | "manual";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "Tudo" },
  { key: "emails", label: "Emails" },
  { key: "payments", label: "Pagamentos" },
  { key: "errors", label: "Erros" },
  { key: "manual", label: "Manual" },
];

interface TimelineItem {
  id: string;
  type: "email" | "payment";
  date: string;
  title: string;
  status?: string;
  provider?: string;
  providerId?: string;
  error?: string | null;
  payload?: any;
  isLegacy?: boolean;
  isManual?: boolean;
  eupago_ref?: string;
  event_type?: string;
  paymentUrl?: string | null;
  templateKey?: string;
}

interface ActivityTimelineProps {
  messageLogs: any[];
  paymentEvents: any[];
  loading: boolean;
  inscrito: Inscrito;
}

const STATUS_STYLES: Record<string, { className: string }> = {
  queued: { className: "bg-muted text-muted-foreground" },
  sent: { className: "bg-green-50 text-green-700" },
  delivered: { className: "bg-green-50 text-green-700" },
  failed: { className: "bg-red-50 text-red-700" },
};

const STATUS_LABELS: Record<string, string> = {
  pending: "A aguardar",
  sent: "Enviado",
  delivered: "Enviado",
  failed: "Falhou",
  resolved: "Resolvido",
  created: "Criado",
  processing: "A processar",
  processed: "Processado",
  queued: "Em fila",
};

export default function ActivityTimeline({ messageLogs, paymentEvents, loading, inscrito }: ActivityTimelineProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [onlyFailures, setOnlyFailures] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Merge into unified timeline
  const items = useMemo<TimelineItem[]>(() => {
  const MANUAL_KEYS = [
      "reminder_manual",
      "followup_backlog_checkin",
      "manual_payment_link_sent",
      "crm_step_changed",
      "crm_note_saved",
      "payment_link_regenerated",
      "crm_archived",
      "crm_premium_granted",
      "voucher_redeemed",
    ];

    const PAYMENT_KEYS = ["payment", "paid", "eupago", "resolve"];

    const emailItems: TimelineItem[] = messageLogs.map((log) => ({
      id: log.id,
      type: "email" as const,
      date: log.created_at,
      title: getTemplateLabel(log.template_key),
      status: log.status,
      provider: log.provider === "internal" ? "Internal" : "Resend",
      providerId: log.provider_message_id,
      error: log.error,
      isLegacy: log.provider === "internal",
      isManual: MANUAL_KEYS.includes(log.template_key),
      paymentUrl: log.payment_url || null,
      templateKey: log.template_key,
    }));

    const paymentItems: TimelineItem[] = paymentEvents.map((evt) => ({
      id: evt.id,
      type: "payment" as const,
      date: evt.received_at,
      title: evt.event_type,
      eupago_ref: evt.eupago_ref,
      event_type: evt.event_type,
      payload: evt.payload,
      status: evt.processed_at ? "processed" : "pending",
    }));

    // Inject synthetic "lost" event
    const lostItems: TimelineItem[] = [];
    if (inscrito.lost_at) {
      lostItems.push({
        id: "lost-event",
        type: "payment" as const,
        date: inscrito.lost_at,
        title: "Lead marcado como perdido",
        status: "resolved",
        event_type: "lost",
        isManual: true,
      });
    }

    let all = [...emailItems, ...paymentItems, ...lostItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Apply filters
    if (filter === "emails") all = all.filter((i) => i.type === "email");
    else if (filter === "payments") all = all.filter((i) =>
      i.type === "payment" ||
      PAYMENT_KEYS.some((k) => (i.event_type || "").toLowerCase().includes(k))
    );
    else if (filter === "errors") all = all.filter((i) => i.status === "failed" || !!i.error);
    else if (filter === "manual") all = all.filter((i) => i.isManual);

    if (onlyFailures) all = all.filter((i) => i.status === "failed" || i.error);

    return all;
  }, [messageLogs, paymentEvents, filter, onlyFailures]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-[13px] py-4">
        <Loader2 size={14} className="animate-spin" /> A carregar logs...
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-heading font-bold text-[14px] text-foreground mb-3">Actividade</h3>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="flex items-center gap-1.5 ml-2">
          <Switch
            checked={onlyFailures}
            onCheckedChange={setOnlyFailures}
            className="scale-75"
            aria-label="Mostrar só falhas"
          />
          <span className="text-[11px] text-muted-foreground">Só falhas</span>
        </div>
      </div>

      {/* Timeline */}
      {items.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-[13px] text-muted-foreground">Ainda sem actividade registada.</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            Os envios de email, eventos de pagamento e acções manuais serão listados aqui.
          </p>
        </div>
      ) : (
        <div className="relative pl-5">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px border-l-2 border-dashed border-border" />

          <div className="space-y-1">
            {items.map((item) => {
              const isLostEvent = item.id === "lost-event";
              const Icon = isLostEvent
                ? XCircle
                : item.type === "email"
                  ? (item.status === "failed" || item.error ? AlertTriangle : Mail)
                  : CreditCard;
              const iconColor = isLostEvent
                ? "text-red-500"
                : item.status === "failed" || item.error
                  ? "text-red-500"
                  : item.type === "email"
                    ? "text-primary"
                    : "text-amber-600";

              return (
                <div key={item.id} className="relative">
                  {/* Dot */}
                  <div className={`absolute -left-5 top-2.5 w-3 h-3 rounded-full border-2 border-background flex items-center justify-center ${
                    isLostEvent ? "bg-red-500" : item.status === "failed" ? "bg-red-500" : item.type === "payment" ? "bg-amber-500" : "bg-primary"
                  }`} />

                  <div className={`rounded-lg border border-border bg-card px-3 py-2 ${item.isLegacy ? "opacity-55" : ""}`}>
                    {/* Title */}
                    <div className="flex items-start gap-1.5 mb-1">
                      <Icon size={13} className={`mt-0.5 shrink-0 ${iconColor}`} />
                      <span className="text-[13px] font-semibold text-foreground">{item.title}</span>
                      {item.templateKey?.includes("backlog") && (
                        <span title="Inscrito que não interagiu com o link de pagamento há mais de 36h" style={{ cursor: "help" }} className="text-[11px]">ℹ️</span>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-1">
                      {item.status && (
                        <span className={`font-medium px-1.5 py-0.5 rounded-full text-[10px] ${(STATUS_STYLES[item.status] || STATUS_STYLES.queued).className}`}>
                          {STATUS_LABELS[item.status] || item.status}
                        </span>
                      )}
                      {item.provider && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                            item.isLegacy ? "bg-muted text-muted-foreground" : "bg-blue-50 text-blue-700"
                          }`}
                          title={item.provider === "Resend" ? "Plataforma de envio de emails (sistema automático)" : undefined}
                        >
                          {item.provider}
                        </span>
                      )}
                      <span className="text-muted-foreground">{fmtTimeAgo(item.date)}</span>
                      {item.isLegacy && <span className="text-muted-foreground text-[10px]" title="Log interno antigo">⚠ legado</span>}
                      {item.eupago_ref && (
                        <span className="text-muted-foreground">Ref: {item.eupago_ref}</span>
                      )}
                    </div>

                    {/* Provider message ID */}
                    {item.providerId && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                        <span className="truncate max-w-[180px] font-mono" title={item.providerId}>{item.providerId.slice(0, 24)}…</span>
                        <button
                          onClick={() => copyToClipboard(item.providerId!, item.id)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          aria-label="Copiar ID do provider"
                        >
                          {copiedId === item.id ? <Check size={10} /> : <Copy size={10} />}
                        </button>
                        {copiedId === item.id && <span className="text-primary">Copiado!</span>}
                      </div>
                    )}

                    {/* Stable payment URL */}
                    {item.paymentUrl && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                        <span className="truncate max-w-[200px] font-mono" title={item.paymentUrl}>{item.paymentUrl}</span>
                        <button
                          onClick={() => copyToClipboard(item.paymentUrl!, `url-${item.id}`)}
                          className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                          aria-label="Copiar link de pagamento"
                        >
                          {copiedId === `url-${item.id}` ? <Check size={10} /> : <Copy size={10} />}
                        </button>
                      </div>
                    )}

                    {/* Error / Payload collapsible */}
                    {(item.error || item.payload) && (
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer">
                          <ChevronDown size={10} />
                          Ver detalhes
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <pre className={`text-[10px] rounded p-2 mt-1 overflow-x-auto max-h-[120px] border ${
                            item.error ? "text-destructive bg-destructive/5 border-destructive/20" : "text-foreground bg-muted border-border"
                          }`}>
                            {item.error || JSON.stringify(item.payload, null, 2)}
                          </pre>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
