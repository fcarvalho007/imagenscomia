import {describe,it,expect} from 'vitest';
import {validateCommerce} from '../../../supabase/functions/course-wordpress-ingest/commerce';
const e={id:'porto-2027-new',modality:'porto',revision:1,product_id:10,label:'Porto · presencial',capacity:16,net_cents:59700,early_net_cents:49700,availability:'draft',starts_at:'2027-11-01T09:00:00Z',ends_at:'2027-11-02T17:30:00Z',early_until:null,operations:{venue:'Porto',secret:'discard'}};
describe('WordPress authenticated commerce contract',()=>{
 it('accepts new editions and excludes unexpected operation properties',()=>{expect(validateCommerce('wordpress_edition',e).operations).toEqual({venue:'Porto'});});
 it.each([{revision:null},{product_id:0},{modality:'online'},{ends_at:e.starts_at},{early_net_cents:99900},{availability:'arbitrary'}])('rejects invalid edition data %j',patch=>expect(()=>validateCommerce('wordpress_edition',{...e,...patch})).toThrow());
 const order={site:'https://fredericocarvalho.pt',order_id:1,product_id:10,request_id:'aa000000-0000-4000-8000-000000000001',edition:e.id,revision:1,state:'pending',paid:false,amount_cents:61131,net_cents:49700,currency:'EUR',name:'Teste local',email:'test@example.com',session_id:null,attribution:{utm_source:'not-consented'}};
 it('does not forward attribution without analytics consent/session',()=>expect(validateCommerce('woocommerce_order',order).attribution).toEqual({}));
 it.each([{site:'https://other.example'},{amount_cents:0},{paid:'true'},{currency:'USD'},{request_id:'bad'},{net_cents:999999}])('rejects invalid order data %j',patch=>expect(()=>validateCommerce('woocommerce_order',{...order,...patch})).toThrow());
});
