import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { uuid } from "./contract.ts";
export function normalizeBilling(input: Record<string, unknown>) {
  const result: Record<string, string> = {};
  for (const k of ["name", "tax_id", "address", "postal_code", "city"]) {
    if (typeof input[k] !== "string") throw new Error("Invalid billing");
    result[k] = (input[k] as string).trim();
    if (result[k].length > 180) throw new Error("Invalid billing");
  }
  if (
    result.name.length < 2 ||
    result.address.length < 5 ||
    result.city.length < 2 ||
    !/^\d{4}-\d{3}$/.test(result.postal_code) ||
    !/^\d{9}$/.test(result.tax_id)
  )
    throw new Error("Invalid billing");
  // Portuguese tax-id checksum. Foreign billing is reviewed by support, never silently exempted.
  const digits = [...result.tax_id].map(Number);
  const sum = digits.slice(0, 8).reduce((s, n, i) => s + n * (9 - i), 0);
  const check = 11 - (sum % 11);
  if (digits[8] !== (check >= 10 ? 0 : check))
    throw new Error("Invalid tax ID");
  if (input.country !== "Portugal")
    throw new Error("Contact support for foreign billing");
  return { ...result, country: "Portugal" };
}
export async function saveBilling(
  db: SupabaseClient,
  data: Record<string, unknown>,
) {
  if (
    !uuid(data.request_id) ||
    !data.billing ||
    typeof data.billing !== "object"
  )
    throw new Error("Invalid request");
  const { error } = await db.rpc("save_course_billing", {
    request_token: data.request_id,
    details: normalizeBilling(data.billing as Record<string, unknown>),
  });
  if (error) throw new Error("Billing unavailable");
  return { accepted: true };
}
