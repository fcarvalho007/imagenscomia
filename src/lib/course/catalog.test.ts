import { describe, it, expect } from "vitest";
import { checkoutUrl, editionScope, currentFunnel, activeEditions, HISTORY_FILTER, COURSE_CUTOFF_ISO } from "./catalog";

const cat = [
  { id: "online-2026-11-03", label: "Online", modality: "online", archived: false },
  { id: "lisboa-2026-11-19", label: "Lisboa", modality: "lisboa", archived: false },
  { id: "porto-2026", label: "Porto", modality: "porto", archived: true },
];
const row = (o: object) => ({ created_at: "2026-10-02T10:00:00Z", commerce_source: "woocommerce", wp_order_id: 1, course_payments: null, ...o });

describe("course catalogue", () => {
  it("uses the modality, not the edition id, in checkout links", () => {
    expect(checkoutUrl(cat[0])).toBe("https://fredericocarvalho.pt/checkout/curso-inteligencia-artificial-marketing/?fcia_edition=online");
    expect(checkoutUrl(cat[1])).toMatch(/fcia_edition=lisboa$/);
  });
  it("never links an archived edition", () => expect(checkoutUrl(cat[2])).toBeNull());
  it("shows only active editions by default and everything in history", () => {
    expect(activeEditions(cat).map(e => e.id)).toEqual(["online-2026-11-03", "lisboa-2026-11-19"]);
    expect(editionScope("", cat)).toEqual(["online-2026-11-03", "lisboa-2026-11-19"]);
    expect(editionScope(HISTORY_FILTER, cat)).toBeNull();
    expect(editionScope("porto-2026", cat)).toEqual(["porto-2026"]);
  });
  it("starts at the cutoff (16:11:24 Lisbon is excluded, 16:11:25 included)", () => {
    const r = currentFunnel([row({ created_at: "2026-10-01T15:11:24Z", wp_order_id: 1 }), row({ created_at: COURSE_CUTOFF_ISO, wp_order_id: 2 })]);
    expect(r.orders).toBe(1);
  });
  it("deduplicates by order and ignores non-WooCommerce records", () => {
    const r = currentFunnel([row({ wp_order_id: 7 }), row({ wp_order_id: 7, course_payments: { state: "paid" } }), row({ commerce_source: "app", wp_order_id: 8 })]);
    expect(r).toEqual({ orders: 1, paid: 1 });
  });
});
