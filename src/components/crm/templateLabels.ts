export const TEMPLATE_LABELS: Record<string, string> = {
  followup_stage_0: "Etapa 0 — Confirmação de acesso",
  followup_stage_1: "Etapa 1 — Reforço (6h)",
  followup_stage_2: "Etapa 2 — Última chamada (24h)",
  followup_backlog_checkin: "Backlog — Check-in",
  followup_backlog_weak: "Backlog — Sinal fraco",
  followup_final_before_event: "Final — Antes do webinar",
  reminder_manual: "Lembrete manual",
};

export function getTemplateLabel(key: string): string {
  return TEMPLATE_LABELS[key] || key;
}

export function fmtTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return "agora";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

export interface LastEmailInfo {
  template_key: string;
  status: string;
  provider_message_id: string | null;
  created_at: string;
  provider: string;
}
