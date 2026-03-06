export const TEMPLATE_LABELS: Record<string, string> = {
  // Followup automático
  followup_stage_0: "Email de follow-up — Etapa inicial",
  followup_stage_1: "Email de follow-up — 2ª tentativa",
  followup_stage_2: "Email de follow-up — Última chamada",
  followup_backlog_checkin: "Email de check-in (reactivação)",
  followup_backlog_weak: "Email de follow-up fraco (sem clique)",
  followup_final_before_event: "Email — última oportunidade antes do webinar",
  // Lembretes e manuais
  reminder_manual: "Lembrete manual",
  // Pagamento
  manual_payment_link_sent: "Link de pagamento enviado (manual)",
  payment_confirmed_customer: "Email de confirmação de pagamento",
  payment_link_regenerated: "Link de pagamento regenerado",
  payment_failed: "Falha de pagamento",
  // Eventos EuPago
  eupago_paid: "Pagamento EuPago confirmado",
  eupago_pending: "Pagamento EuPago pendente",
  // Acções CRM
  crm_step_changed: "Alteração de etapa (CRM)",
  crm_note_saved: "Nota guardada (CRM)",
  crm_archived: "Inscrito arquivado",
  // Upsell
  masterclass_upsell_premium: "Convite Masterclass (Premium)",
  // Premium / Oferta
  crm_premium_granted: "Acesso Premium concedido (Oferta)",
  // Voucher
  voucher_redeemed: "Voucher aplicado (Acesso gratuito)",
  // Resolve / Link
  resolve_attempt: "Tentativa de resolver pagamento",
  link_created: "Link de pagamento gerado",
  // Confirmação vídeo
  video_confirmation: "Email de confirmação enviado",
  // Follow-up pré-webinar
  video_followup_prewebinar: "Follow-up pré-webinar — upgrade",
  // Fatura
  invoice_notification: "Email de notificação de fatura",
  // E-goi sync
  egoi_sync: "Sincronizado com E-goi",
  egoi_tag: "Tag E-goi aplicada",
  // Confirmação de compra video
  video_payment_premium: "Confirmação de compra — Premium Pass",
  video_payment_masterclass: "Confirmação de compra — Masterclass",
  // Pós-webinar sequência
  video_postwebinar_day1: "Email pós-webinar — Dia 1",
  video_postwebinar_day3: "Email pós-webinar — Dia 3",
  video_postwebinar_closing: "Email de fecho — última oportunidade",
  sms_recursos_post: "SMS Recursos — Clientes pagos",
  video_recursos_premium: "Recursos — Premium Pass",
  video_recursos_masterclass: "Recursos — Masterclass",
  video_recursos_bundle: "Recursos — Bundle",
  video_group_payment_summary: "Confirmação grupo — resumo para comprador",
};

export function getTemplateLabel(key: string): string {
  if (TEMPLATE_LABELS[key]) return TEMPLATE_LABELS[key];
  const humanised = key.replace(/_/g, " ");
  return humanised.charAt(0).toUpperCase() + humanised.slice(1);
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
