import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { describe, expect, it, vi } from "vitest";
import { authorizedDelivery } from "../../../supabase/functions/_shared/delivery-auth";
import { sendCourseSMS } from "../../../supabase/functions/course-operations/sms";
import { renderCourseSMS } from "../../../supabase/functions/_shared/course/sms";
import { courseDiagnostics } from "../../../supabase/functions/course-wordpress-ingest/diagnostics";
const script=readFileSync(process.cwd()+'/wordpress/fc-curso-ia/assets/integration.js','utf8');
const tick=()=>new Promise(r=>setTimeout(r,0));
async function tracking(consent=false){
 const dom=new JSDOM('<body><form id="qualifier"><input></form><section id="edicoes"></section></body>',{url:'https://example.com/?utm_source=qa',runScripts:'outside-only'});
 const w=dom.window;let n=0;
 Object.defineProperty(w.crypto,'randomUUID',{value:()=>`10000000-0000-4000-8000-${String(++n).padStart(12,'0')}`});
 w.FCIA_INTEGRATION={tracking:true,eventUrl:'/event'};
 if(consent)w.localStorage.setItem('fcia-metrics-consent','allow');
 const fetch=vi.fn(async(_url: string, _options: {body:string})=>({ok:true,json:async()=>({accepted:true})}));w.fetch=fetch;
 w.eval(script);await tick();return {dom,w,fetch};
}
describe('WordPress tracking regressions',()=>{
 it('records a registration start per edition, not only the first selected edition',async()=>{
  const {dom,w,fetch}=await tracking(true);
  for(const label of ['Porto','Online','Online'])w.document.dispatchEvent(new w.CustomEvent('fc:checkout',{detail:{label}}));
  await tick();const events=fetch.mock.calls.map(c=>JSON.parse(c[1].body)).filter(e=>e.name==='registration_started');
  expect(events.map(e=>e.edition)).toEqual(['porto-2026','online-2026']);dom.window.close();
 });
 it('does not consume a quiz listener before metrics consent',async()=>{
  const {dom,w,fetch}=await tracking();
  w.document.querySelector('#qualifier').dispatchEvent(new w.Event('change',{bubbles:true}));expect(fetch).not.toHaveBeenCalled();
  w.document.querySelector('[data-metrics="allow"]').click();
  w.document.querySelector('#qualifier').dispatchEvent(new w.Event('change',{bubbles:true}));await tick();
  expect(fetch.mock.calls.map(c=>JSON.parse(c[1].body).name)).toContain('quiz_started');
  w.document.querySelector('[data-metrics="deny"]').click();expect(w.sessionStorage.getItem('fcia-campaign')).toBeNull();dom.window.close();
 });
});
describe('delivery authorization',()=>{
 const db={auth:{getUser:vi.fn(async()=>({error:true}))}};
 it.each(['public-anon','prefix-service-suffix',''])('rejects public or fabricated authorization %s',async(token)=>{
  expect(await authorizedDelivery(new Request('https://example.com',{headers:{authorization:`Bearer ${token}`,'x-crm-admin-email':'fredericodigital@gmail.com'}}),db,k=>({SUPABASE_SERVICE_ROLE_KEY:'service'})[k])).toBe(false);
 });
 it('accepts only exact service or configured cron credentials',async()=>{
  expect(await authorizedDelivery(new Request('https://example.com',{headers:{authorization:'Bearer service'}}),db,k=>({SUPABASE_SERVICE_ROLE_KEY:'service'})[k])).toBe(true);
  expect(await authorizedDelivery(new Request('https://example.com',{headers:{'x-cron-secret':'cron'}}),db,k=>({CRON_SECRET:'cron'})[k])).toBe(true);
 });
});
describe('SMS: single segment and no blind retry',()=>{
 const env=k=>({SMSONLINE_API_KEY:'qa:qa',COURSE_SMS_FROM:'CURSOIA'})[k];
 const ctx=()=>({job:{id:'j',lease:'l',attempts:0,template:'practical_sms'},registration:{edition:'porto-2026',phone:'912345678',sms_consent:true}});
 const db=()=>({rpc:vi.fn(async name=>({data:name==='prepare_course_job',error:null}))});
 it.each(['lisboa-2026','porto-2026','online-2026'])('keeps both SMS templates within one segment for %s',edition=>{
  for(const t of ['practical_sms','after_sms'])expect(renderCourseSMS(t,edition).length).toBeLessThanOrEqual(160);
 });
 it('blocks missing consent without contacting the provider',async()=>{
  const c=ctx();c.registration.sms_consent=false;const send=vi.fn();await sendCourseSMS(db(),c,env,send);expect(send).not.toHaveBeenCalled();
 });
 it('sends uncertain delivery to manual review without retry',async()=>{
  const d=db(),send=vi.fn(async()=>{throw new Error('timeout')});await sendCourseSMS(d,ctx(),env,send);
  expect(d.rpc).toHaveBeenCalledWith('finish_course_job',expect.objectContaining({outcome:'review',reason:'sms_delivery_uncertain'}));expect(send).toHaveBeenCalledTimes(1);
  const c=ctx();c.job.attempts=1;await sendCourseSMS(d,c,env,send);expect(send).toHaveBeenCalledTimes(1);
 });
});
it('diagnostics quote all three editions without writes or provider requests',async()=>{
 const rows=['lisboa','porto','online'].map(id=>({id,label:id,early_until:'2099-01-01',early_net_cents:id==='online'?39700:49700,net_cents:59700,vat_percent:23,sales_enabled:false}));
 const db={from:vi.fn(()=>({select:()=>({order:async()=>({data:rows})})}))};
 const out=await courseDiagnostics(db,()=>undefined);expect(out.mode).toBe('read_only');expect(out.editions.map(e=>e.amount_cents)).toEqual([61131,61131,48831]);expect(out.checks.payment_enabled).toBe(false);
});
