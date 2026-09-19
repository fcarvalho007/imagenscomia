/**
 * Gross prices (VAT included) actually charged by the payment function for each
 * legacy plan. Kept in sync with supabase/functions/create-payment PRODUCTS so
 * analytics never reports an invented value.
 */
export const LEGACY_PLAN_GROSS_PRICE: Record<string, number> = {
  premium: 33.21,
  masterclass: 82.41,
  bundle: 131.61,
  gravacao: 33.21,
  "gravacao-masterclass": 91.02,
  "video-premium": 33.21,
  "video-masterclass": 82.41,
  "video-bundle": 131.61,
};

export function planGrossPrice(plan: string | null | undefined): number | null {
  if (!plan) return null;
  return LEGACY_PLAN_GROSS_PRICE[plan] ?? null;
}

type Fbq = (event: string, name: string, params?: Record<string, unknown>) => void;

function fbqSafe(): Fbq | null {
  const fn = (window as unknown as { fbq?: Fbq }).fbq;
  return typeof fn === "function" ? fn : null;
}

/** Fired when a checkout starts. Never means a sale happened. */
export function trackInitiateCheckout(plan: string, value: number | null): void {
  const fn = fbqSafe();
  if (!fn) return;
  try {
    fn("track", "InitiateCheckout", {
      value: value ?? 0,
      currency: "EUR",
      content_name: plan,
    });
  } catch {
    /* analytics must never break checkout */
  }
}

/**
 * Purchase is only allowed after the server has confirmed the payment.
 * De-duplicated per transaction so reloads and polling never double count.
 */
export function trackPurchaseOnce(transactionKey: string, plan: string, value: number | null): void {
  if (!transactionKey || !value) return;
  const key = `fbq_purchase_${transactionKey}`;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
  } catch {
    /* storage unavailable: fall through and fire at most once per page load */
  }
  const fn = fbqSafe();
  if (!fn) return;
  try {
    fn("track", "Purchase", { value, currency: "EUR", content_name: plan });
  } catch {
    /* ignore */
  }
}
