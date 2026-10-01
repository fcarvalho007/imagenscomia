import {describe,it,expect} from 'vitest';
import {courseInsights} from './insights';
import type {Inscrito} from '@/pages/crm/mockData';
const now=Date.parse('2026-09-19T10:00:00Z');
const item=(overrides:Partial<Inscrito>={})=>({id:'r',timestamp:'2026-09-18T23:30:00Z',sources_text:'google',payment_status:'paid',valor:611.31,course:{status:'confirmed',paymentState:'paid'},...overrides} as Inscrito);
describe('course business metrics',()=>{
 it('uses Lisbon calendar days, actual paid state and cohort attribution',()=>{
 const result=courseInsights([item(),item({payment_status:'unavailable',sources_text:null,valor:611.31})],'7',now);
 expect(result.dates).toEqual([{date:'2026-09-19',requests:2,paid:1}]);
 expect(result.sources.find(x=>x.source==='google')?.revenue).toBe(611.31);
 expect(result.sources.find(x=>x.source==='Origem não atribuída')?.paid).toBe(0);
 });
 it('excludes future and older records without manufacturing missing visits',()=>{
 expect(courseInsights([item({timestamp:'2026-08-01'}),item({timestamp:'2026-09-20'})],'7',now).sources).toEqual([]);
 });
 it('keeps paused/cancelled contacts out of actionable follow-ups',()=>{
 const due={next_followup_at:'2026-09-18T09:00:00Z'};
 expect(courseInsights([item(due),item({...due,do_not_contact:true}),item({...due,course:{status:'cancelled'} as any})],'all',now).priorities).toHaveLength(1);
 });
});
