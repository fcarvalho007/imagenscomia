import { verifySignature } from '../course-eupago-webhook/verify.ts';
export type PaymentData = {
  transactionStatus: string; reference: string; amount: string;
  identifier: string; paymentMethod: string; transactionID: string;
};
export class CallbackError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
async function sameSecret(a: string, b: string) {
  if (!a || !b) return false;
  const encoder = new TextEncoder();
  const [left, right] = await Promise.all([a,b].map(value => crypto.subtle.digest('SHA-256', encoder.encode(value))));
  const x = new Uint8Array(left), y = new Uint8Array(right);
  let difference = 0;
  for (let n = 0; n < x.length; n++) difference |= x[n] ^ y[n];
  return difference === 0;
}
// Eupago's documented v1 GET includes chave_api; v2 POST uses X-Signature.
// Never persist/log the incoming key or accept an unverified payment notification.
export async function readVerifiedCallback(req: Request, env: (key: string) => string | undefined): Promise<PaymentData | null> {
  let payment: PaymentData;
  if (req.method === 'GET') {
    const expected = env('EUPAGO_API_KEY');
    if (!expected) throw new CallbackError(503, 'Callback not configured');
    const params = new URL(req.url).searchParams;
    if (!(await sameSecret(params.get('chave_api') || '', expected))) throw new CallbackError(401, 'Invalid callback');
    payment = { transactionStatus: 'Success', reference: params.get('referencia') || '', amount: params.get('valor') || '', identifier: params.get('identificador') || '', paymentMethod: params.get('mp') || '', transactionID: params.get('transacao') || '' };
  } else if (req.method === 'POST') {
    const expected = env('EUPAGO_WEBHOOK_KEY');
    if (!expected) throw new CallbackError(503, 'Signed callback not configured');
    if (Number(req.headers.get('content-length') || 0) > 20000) throw new CallbackError(413, 'Callback too large');
    const raw = await req.text();
    if (raw.length > 20000) throw new CallbackError(413, 'Callback too large');
    if (!(await verifySignature(raw, req.headers.get('x-signature') || '', expected))) throw new CallbackError(401, 'Invalid callback');
    let data;
    try { data = JSON.parse(raw); } catch { throw new CallbackError(400, 'Invalid callback'); }
    const t = data?.transactions;
    if (!t || typeof t.status !== 'string') throw new CallbackError(400, 'Invalid callback');
    // Legacy workflow handles payment confirmations only; do not convert other states to Paid.
    if (t.status !== 'Paid') return null;
    if (t.amount?.currency !== 'EUR') throw new CallbackError(400, 'Invalid callback');
    payment = { transactionStatus: 'Success', reference: String(t.reference ?? ''), amount: String(t.amount?.value ?? ''), identifier: t.identifier, paymentMethod: String(t.method ?? ''), transactionID: String(t.trid ?? '') };
  } else {
    throw new CallbackError(405, 'Method not allowed');
  }
  const amount = Number(payment.amount);
  if (!Number.isFinite(amount) || amount <= 0 || Math.abs(amount * 100 - Math.round(amount * 100)) > .000001 || !/^\d+$/.test(payment.transactionID) || typeof payment.identifier !== 'string' || !payment.identifier.trim() || payment.identifier.length > 200) throw new CallbackError(400, 'Invalid callback');
  return payment;
}
