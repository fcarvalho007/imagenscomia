import { validateCommerce } from "./commerce.ts";
// Called exclusively after the existing HMAC verification. No writes or PII responses.
export async function checkWooCommerce(db: any, input: Record<string, unknown>) {
  const expected: Record<string,number> = {"lisboa-2026":98080,"porto-2026":98080,"online-2026":98082};
  const {data,error} = await db.from("course_editions").select("id,wp_product_id").in("id",Object.keys(expected));
  if (error) throw new Error("Catalog unavailable");
  const mappings = Object.entries(expected).map(([edition,product_id]) => ({edition,product_id,ready:data?.some((e:any)=>e.id===edition && Number(e.wp_product_id)===product_id)===true}));
  if (input.order) {
    const p=validateCommerce("woocommerce_order", input.order as Record<string,unknown>);
    if (!mappings.some(m=>m.edition===p.edition && m.product_id===p.product_id && m.ready)) throw new Error("Edition mismatch");
  }
  return {accepted:true,protocol:2,writes:false,ready:mappings.every(m=>m.ready),mappings,validation:input.order ? "schema_and_mapping_only" : "catalog_only"};
}
