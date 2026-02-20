export type Nota = {
  id: string;
  texto: string;
  timestamp: string;
};

export type Inscrito = {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  timestamp: string;
  step_reached: 1 | 2 | 3 | 4 | 5;
  source: string[];
  source_outro: string;
  duvida: string;
  plan: "free" | "premium" | "masterclass" | "bundle";
  valor: number;
  paid_at: string | null;
  eupago_ref: string | null;
  notas: Nota[];
  status: "activo" | "arquivado" | "perdido";
  follow_up: boolean;
  gender: "M" | "F" | "U";
  plan_selected: string | null;
  sources_text: string | null;
  duvida_text: string | null;
  upgrade_clicked_at: string | null;
  primeiro_nome: string;
  resto_nome: string;
  payment_status: "paid" | "awaiting_payment" | "selected" | "free";
  last_payment_link: string | null;
  payment_link_created_at: string | null;
  followup_stage: number;
  last_followup_at: string | null;
  next_followup_at: string | null;
  do_not_contact: boolean;
  last_payment_link_sent_at: string | null;
  registration_source: "webinar" | "gravacao";
  invoice_sent: boolean;
  premium_granted_at: string | null;
  premium_granted_by: string | null;
  webinar: "imagens" | "video";
};

export const MOCK_DATA: Inscrito[] = [];
