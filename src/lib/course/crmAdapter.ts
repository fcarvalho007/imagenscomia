import type { Inscrito } from '@/pages/crm/mockData';
import { editionNames, states } from './editions';
export type CourseTask = { id: string; task_key: string; stage: string; due_at: string; state: string };
export type CourseRow = {
  id: string; name: string; email: string; phone: string; edition: string; status: string; notes: string;
  next_followup_at: string | null; created_at: string; marketing_consent: boolean;
  commerce_source?: string; wp_order_id?: number; do_not_contact?: boolean; sms_consent?: boolean;
  before_session: string; after_session: string; attribution: Record<string,string>;
  course_editions?: {starts_at: string; ends_at: string} | null;
  course_payments: {state: string; amount_cents: number; paid_at: string | null} | null;
  course_invoices: {state: string; document_id: string | null} | null;
  course_tasks: CourseTask[];
};
export type CourseMetrics = { sessions: number; quiz_completed: number; pricing_sessions: number; registration_sessions: number; requests: number; confirmed: number; followups_due: number; revenue_cents: number; tasks_due: number };
export const coursePaymentLabel = (state: string) => ({paid:'Pago', pending:'Pendente', ready:'A aguardar pagamento', creating:'A preparar pagamento', awaiting_payment:'A aguardar pagamento', refunded:'Reembolsado', review:'Em verificação', expired:'Expirado', cancelled:'Cancelado', none:'Sem pagamento iniciado'}[state] || 'Em processamento');
export const courseInvoiceLabel = (state: string) => ({woocommerce:'Gerida no WordPress',issued:'Emitida', sent:'Emitida', review:'Em verificação', failed:'Falha de emissão', pending:'Por emitir', awaiting_data:'Aguarda dados fiscais',ready:'Pronta para emitir',none:'Por emitir'}[state] || 'Em processamento');
/** Presentation adapter only. Course IDs must only reach course RPCs, never webinar write endpoints. */
export function courseToInscrito(r: CourseRow, now = Date.now()): Inscrito {
  const payment = r.course_payments;
  const paid = payment?.state === 'paid';
  const terminal = ['refunded','cancelled','expired','review'].includes(payment?.state || '') || r.status === 'cancelled';
  const phase = r.course_editions && now >= Date.parse(r.course_editions.ends_at) ? 'after' : r.course_editions && now >= Date.parse(r.course_editions.starts_at) ? 'during' : 'before';
  return {
    id:r.id, nome:r.name, email:r.email, whatsapp:r.phone || '', timestamp:r.created_at,
    plan:'course', webinar:'curso-ia', valor:(payment?.amount_cents || 0)/100,
    paid_at:paid ? payment.paid_at : null, payment_status:paid?'paid':terminal?'unavailable':payment?'awaiting_payment':'selected',
    course:{edition:r.edition,editionLabel:editionNames[r.edition] || r.edition,status:r.status,statusLabel:states[r.status] || r.status,paymentState:payment?.state || 'none',invoiceState:r.commerce_source==='woocommerce'?'woocommerce':r.course_invoices?.state || 'none',phase,beforeSession:r.before_session,afterSession:r.after_session},
    step_reached:1, source:[],source_outro:'',duvida:'',eupago_ref:null,
    notas:r.notes ? [{id:r.id,texto:r.notes,timestamp:r.created_at}]:[],status:'activo',follow_up:!!r.next_followup_at,
    gender:'U',plan_selected:terminal?null:'course',sources_text:r.attribution?.utm_source || null,duvida_text:null,
    upgrade_clicked_at:null,primeiro_nome:r.name.split(' ')[0],resto_nome:r.name.split(' ').slice(1).join(' '),
    last_payment_link:null,payment_link_created_at:null,followup_stage:0,last_followup_at:null,next_followup_at:r.next_followup_at,
    do_not_contact:!!r.do_not_contact,last_payment_link_sent_at:null,registration_source:'webinar',invoice_sent:r.course_invoices?.state === 'issued',
    premium_granted_at:null,premium_granted_by:null,role:null,team_size:null,lost_at:r.status==='cancelled'?r.created_at:null,lost_reason:null,
    group_payment_ref:null,invoice_document_id:r.course_invoices?.document_id || null,paid_amount:paid ? payment.amount_cents/100 : null,
  };
}
