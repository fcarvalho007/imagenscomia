import { describe, it, expect } from 'vitest';
import { readVerifiedCallback } from '../../../supabase/functions/eupago-webhook/verify';
const env = (key: string) => ({ EUPAGO_API_KEY: 'test-api-key', EUPAGO_WEBHOOK_KEY: 'test-webhook-key' })[key];
const callback = (key: string) => new Request(`https://example.invalid/callback?chave_api=${key}&valor=33.21&transacao=12345&identificador=ORDER-test&referencia=123&mp=CC:PT`);
async function signed(data: unknown) {
  const raw = JSON.stringify(data), encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode('test-webhook-key'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(raw)))));
  return new Request('https://example.invalid', { method: 'POST', headers: { 'x-signature': signature }, body: raw });
}
const transaction = { status: 'Paid', reference: 123, identifier: 'ORDER-test', method: 'CreditCard', trid: 12345, amount: { currency: 'EUR', value: 33.21 } };
describe('legacy Eupago callback authenticity — no provider calls', () => {
  it.each(['', 'incorrect', 'prefix-test-api-key-suffix'])('rejects invalid classic key %s', async key => {
    await expect(readVerifiedCallback(callback(key), env)).rejects.toMatchObject({ status: 401 });
  });
  it('accepts authenticated classic callback and strips credentials', async () => {
    const result = await readVerifiedCallback(callback('test-api-key'), env);
    expect(result).toMatchObject({ transactionStatus: 'Success', amount: '33.21', paymentMethod: 'CC:PT' });
    expect(JSON.stringify(result)).not.toContain('test-api-key');
  });
  it('rejects unsigned JSON before processing payment data', async () => {
    await expect(readVerifiedCallback(new Request('https://example.invalid', { method: 'POST', body: JSON.stringify({ transactions: transaction }) }), env)).rejects.toMatchObject({ status: 401 });
  });
  it('accepts signed v2 payment data', async () => {
    expect(await readVerifiedCallback(await signed({ transactions: transaction }), env)).toMatchObject({ amount: '33.21', transactionID: '12345' });
  });
  it('does not mistake refunds for paid', async () => {
    expect(await readVerifiedCallback(await signed({ transactions: { ...transaction, status: 'Refund' } }), env)).toBeNull();
  });
  it('rejects the wrong currency even with a valid signature', async () => {
    await expect(readVerifiedCallback(await signed({ transactions: { ...transaction, amount: { currency: 'USD', value: 33.21 } } }), env)).rejects.toMatchObject({ status: 400 });
  });
  it('rejects missing server configuration', async () => {
    await expect(readVerifiedCallback(callback('test-api-key'), () => undefined)).rejects.toMatchObject({ status: 503 });
  });
});
