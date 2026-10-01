/** Offer published on WordPress replaced the LP1 → quiz → LP2 sequence at this instant. */
export const COURSE_CUTOFF_ISO = "2026-10-01T15:11:25Z";
export const COURSE_CUTOFF_LABEL = "01/10/2026 16:11:25 (hora de Lisboa)";
export const COURSE_LANDING = "https://fredericocarvalho.pt/curso-de-inteligencia-artificial/";
export const COURSE_CHECKOUT = "https://fredericocarvalho.pt/checkout/curso-inteligencia-artificial-marketing/";
export const WP_ADMIN = "https://fredericocarvalho.pt/wp-admin/admin.php";
export const HISTORY_FILTER = "__history__";

export type CatalogEdition = { id: string; label: string; modality: string; archived: boolean };

export const activeEditions = (c: CatalogEdition[]) => c.filter(e => !e.archived);
export const archivedEditions = (c: CatalogEdition[]) => c.filter(e => e.archived);

/** WordPress accepts only the modality as fcia_edition; never the full edition id. Archived editions get no link. */
export function checkoutUrl(e: CatalogEdition): string | null {
  if (e.archived || !["online", "lisboa", "porto"].includes(e.modality)) return null;
  return `${COURSE_CHECKOUT}?fcia_edition=${encodeURIComponent(e.modality)}`;
}

/** Edition ids to query for a sidebar selection: "" = active only, HISTORY_FILTER = everything. */
export function editionScope(selection: string, c: CatalogEdition[]): string[] | null {
  if (selection === HISTORY_FILTER) return null;
  if (selection) return [selection];
  return activeEditions(c).map(e => e.id);
}

type FunnelRow = { created_at: string; commerce_source?: string; wp_order_id?: number | null; course_payments: { state: string } | null };
/** Current-system funnel: only WooCommerce-synced orders after the cutoff, deduplicated by order. */
export function currentFunnel(rows: FunnelRow[], since?: number) {
  const start = Math.max(Date.parse(COURSE_CUTOFF_ISO), since ?? 0);
  const orders = new Map<string, boolean>();
  for (const r of rows) {
    if (r.commerce_source !== "woocommerce" || !r.wp_order_id || Date.parse(r.created_at) < start) continue;
    const key = String(r.wp_order_id);
    orders.set(key, (orders.get(key) ?? false) || r.course_payments?.state === "paid");
  }
  return { orders: orders.size, paid: [...orders.values()].filter(Boolean).length };
}
