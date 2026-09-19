export const COURSE_SITE = "https://fredericocarvalho.pt";
const API = `${COURSE_SITE}/wp-json/fcia/v1`;
export type CheckoutConfig = { enabled: boolean; nonce: string; privacyUrl: string; termsUrl: string };
export type Quote = { net_cents: number; amount_cents: number; vat_percent: number; currency: "EUR" };

async function request(path: string, init: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${API}/${path}`, { ...init, credentials: "omit", cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new Error("Não foi possível confirmar o pedido. Tente novamente ou contacte o suporte.");
    return await response.json();
  } finally { clearTimeout(timer); }
}
export async function loadCheckoutConfig(): Promise<CheckoutConfig> {
  const data = await request("checkout-config", { method: "GET" });
  if (typeof data.nonce !== "string" || typeof data.enabled !== "boolean") throw new Error("Configuração indisponível.");
  for (const key of ["privacyUrl", "termsUrl"]) {
    if (data[key] && (new URL(data[key]).origin !== COURSE_SITE)) throw new Error("Documento indisponível.");
  }
  return data;
}
export async function checkoutRequest(config: CheckoutConfig, kind: "quote" | "checkout" | "status" | "billing", body: unknown) {
  const data = await request(kind, { method: "POST", headers: { "Content-Type": "application/json", "X-WP-Nonce": config.nonce }, body: JSON.stringify(body) });
  if (data.accepted !== true) throw new Error("Receção não confirmada. Contacte o suporte antes de repetir o pagamento.");
  return data;
}
export function validQuote(value: unknown): value is Quote {
  const q = value as Quote;
  return !!q && q.currency === "EUR" && Number.isInteger(q.net_cents) && q.net_cents > 0 && Number.isInteger(q.amount_cents) && q.amount_cents === Math.round(q.net_cents * (100 + q.vat_percent) / 100) && q.vat_percent === 23;
}
export function paymentDestination(value: unknown): string {
  const url = new URL(String(value));
  if (url.protocol !== "https:" || url.username || url.password || !["clientes.eupago.pt", "sandbox.eupago.pt"].includes(url.hostname)) throw new Error("Destino de pagamento inválido.");
  return url.href;
}
