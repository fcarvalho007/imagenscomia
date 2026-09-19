import {describe,it,expect} from 'vitest';
import {courseToInscrito, type CourseRow} from './crmAdapter';
export const example:CourseRow={id:'course-only',name:'Participante de teste',email:'teste@example.invalid',phone:'',edition:'lisboa-2026',status:'confirmed',notes:'Nota',next_followup_at:null,created_at:'2026-09-01T10:00:00Z',marketing_consent:false,before_session:'pending',after_session:'pending',attribution:{},course_editions:{starts_at:'2026-10-29T09:00:00Z',ends_at:'2026-10-30T17:30:00Z'},course_payments:{state:'paid',amount_cents:61131,paid_at:'2026-09-01T10:00:00Z'},course_invoices:null,course_tasks:[]};
describe('Course adapter for original CRM views',()=>{
 it('preserves the domain and exact gross amount without relabelling as a webinar plan',()=>{
  const i=courseToInscrito(example);
  expect(i.plan).toBe('course');expect(i.webinar).toBe('curso-ia');expect(i.valor).toBe(611.31);expect(i.payment_status).toBe('paid');expect(i.course.edition).toBe('lisboa-2026');
 });
 it.each(['refunded','review','cancelled','expired'])('does not count %s as paid or pending revenue',state=>{
  const i=courseToInscrito({...example,course_payments:{...example.course_payments!,state}});
  expect(i.paid_at).toBeNull();expect(i.paid_amount).toBeNull();expect(['paid','awaiting_payment','selected']).not.toContain(i.payment_status);expect(i.course.paymentState).toBe(state);
 });
 it('uses edition dates, not the historical webinar cutoff, for event phases',()=>{
  expect(courseToInscrito(example,Date.parse('2026-10-28')).course.phase).toBe('before');
  expect(courseToInscrito(example,Date.parse('2026-10-30')).course.phase).toBe('during');
  expect(courseToInscrito(example,Date.parse('2026-11-01')).course.phase).toBe('after');
 });
});
