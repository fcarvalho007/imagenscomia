import type {Inscrito} from '@/pages/crm/mockData';
/** Business metrics use registrations, not consent-dependent page views. */
export function courseInsights(items:Inscrito[],period:string,now=Date.now()) {
 const since=period==='all'?-Infinity:now-Number(period)*86400000;
 const cohort=items.filter(i=>Date.parse(i.timestamp)>=since && Date.parse(i.timestamp)<=now);
 const sources=new Map<string,{source:string;requests:number;paid:number;revenue:number}>();
 const dates=new Map<string,{date:string;requests:number;paid:number}>();
 for(const i of cohort) {
  const source=i.sources_text?.trim()||'Origem não atribuída';
  const row=sources.get(source)||{source,requests:0,paid:0,revenue:0};
  row.requests++;
  if(i.payment_status==='paid'){row.paid++;row.revenue+=i.valor;}
  sources.set(source,row);
  const date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Lisbon',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(i.timestamp));
  const d=dates.get(date)||{date,requests:0,paid:0};d.requests++;if(i.payment_status==='paid')d.paid++;dates.set(date,d);
 }
 const priorities=items.filter(i=>!i.do_not_contact && i.course?.status!=='cancelled' && ((i.next_followup_at && Date.parse(i.next_followup_at)<=now) || i.course?.paymentState==='review' || i.course?.invoiceState==='review'))
 .sort((a,b)=>(a.next_followup_at?Date.parse(a.next_followup_at):Infinity)-(b.next_followup_at?Date.parse(b.next_followup_at):Infinity));
 return {sources:[...sources.values()].sort((a,b)=>b.requests-a.requests),dates:[...dates.values()].sort((a,b)=>a.date.localeCompare(b.date)),priorities};
}
