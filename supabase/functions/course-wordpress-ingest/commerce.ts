// Only called after the existing WordPress HMAC has been verified.
export function validateCommerce(kind: string, p: Record<string, unknown>): Record<string,unknown> {
  const integer = (k: string, min = 1) => Number.isSafeInteger(p[k]) && Number(p[k]) >= min;
  const str = (k: string, min: number, max: number) => typeof p[k] === 'string' && (p[k] as string).length >= min && (p[k] as string).length <= max;
  const edition = (k: string) => typeof p[k] === 'string' && /^(lisboa|porto|online)-[a-z0-9-]{4,60}$/.test(p[k] as string);
  const date = (k: string) => typeof p[k] === 'string' && Number.isFinite(Date.parse(p[k] as string));
  if (!integer('revision')) throw new Error('Invalid revision');
  if (kind === 'wordpress_edition') {
    if (!edition('id') || !str('label',2,140) || !integer('product_id') || !integer('capacity') || Number(p.capacity)>10000 || !integer('net_cents') || !integer('early_net_cents') || Number(p.early_net_cents)>Number(p.net_cents) || !['lisboa','porto','online'].includes(String(p.modality)) || !String(p.id).startsWith(String(p.modality)+'-') || !['draft','open','sold_out','closed'].includes(String(p.availability)) || !date('starts_at') || !date('ends_at') || Date.parse(String(p.ends_at))<=Date.parse(String(p.starts_at)) || (p.early_until!=null && (!date('early_until') || Date.parse(String(p.early_until))>=Date.parse(String(p.starts_at))))) throw new Error('Invalid edition');
    if (!p.operations || typeof p.operations !== 'object' || Array.isArray(p.operations)) throw new Error('Invalid operations');
    const operations=Object.fromEntries(Object.entries(p.operations as Record<string,unknown>).filter(([k,v])=>['schedule','venue','location','date_label','modality'].includes(k)&&typeof v==='string'&&v.length<=500));
    return {...p,operations};
  }
  if (kind !== 'woocommerce_order' || p.site !== 'https://fredericocarvalho.pt' || !integer('order_id') || !integer('product_id') || !edition('edition') || !integer('amount_cents') || !integer('net_cents',0) || Number(p.net_cents)>Number(p.amount_cents) || p.currency!=='EUR' || !str('name',2,120) || !str('email',3,254) || !/^[^ @]+@[^ @]+\.[^ @]+$/.test(String(p.email)) || !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(String(p.request_id)) || typeof p.paid!=='boolean' || !['pending','on-hold','processing','completed','cancelled','failed','refunded','partial_refund'].includes(String(p.state))) throw new Error('Invalid order');
  if (p.session_id!=null && !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(String(p.session_id))) throw new Error('Invalid session');
  if (p.paid_at!=null && !date('paid_at')) throw new Error('Invalid paid date');
  return {...p,phone:typeof p.phone==='string'?p.phone.slice(0,30):'',sms_consent:p.sms_consent===true,marketing_consent:p.marketing_consent===true,attribution:p.session_id?Object.fromEntries(Object.entries((p.attribution||{}) as Record<string,unknown>).filter(([k,v])=>['utm_source','utm_medium','utm_campaign'].includes(k)&&typeof v==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(v))):{}};
}
