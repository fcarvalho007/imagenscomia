import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { normalizeRequest, uuid } from "../_shared/course/contract.ts";
export function safePaymentUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      ["clientes.eupago.pt", "sandbox.eupago.pt"].includes(u.hostname)
    );
  } catch {
    return false;
  }
}
export async function checkout(
  db: SupabaseClient,
  body: Record<string, unknown>,
) {
  const value = normalizeRequest(body);
  if (Deno.env.get("COURSE_PAYMENTS_ENABLED") !== "true")
    throw new Error("Payments disabled");
  const apiKey = Deno.env.get("COURSE_EUPAGO_API_KEY"),
    publicUrl = Deno.env.get("COURSE_PUBLIC_URL");
  const environment = Deno.env.get("COURSE_PAYMENT_ENV") || "sandbox";
  if (
    !apiKey ||
    !publicUrl ||
    !publicUrl.startsWith("https://") ||
    !Deno.env.get("COURSE_EUPAGO_WEBHOOK_KEY")
  )
    throw new Error("Missing payment configuration");
  const { data: claim, error } = await db.rpc("claim_course_payment", {
    payload: value,
    expected_amount: Number.isInteger(body.expected_amount)
      ? body.expected_amount
      : null,
  });
  if (error) throw new Error("Unable to create order");
  if (claim.state !== "claimed") return { accepted: true, ...claim };
  const host =
    environment === "production" ? "clientes.eupago.pt" : "sandbox.eupago.pt";
  const returned = new URL(publicUrl);
  returned.searchParams.set("fcia_payment", "return");
  // Only this order identifier is sent to the provider. Never match a payment by name/plan/email.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`https://${host}/api/v1.02/paybylink/create`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `ApiKey ${apiKey}`,
      },
      body: JSON.stringify({
        payment: {
          amount: { value: claim.amount_cents / 100, currency: "EUR" },
          identifier: `FCIA-${claim.id}`,
          successUrl: returned.href,
          failUrl: returned.href,
          backUrl: returned.href,
          lang: "PT",
          methods: ["CC", "MBWAY", "MB"],
          callbackUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/course-eupago-webhook`,
        },
        customer: { notify: false, email: value.email },
      }),
    });
    const data = await response.json();
    const url =
      data.url || data.redirectUrl || data.paymentLink || data.payment_url;
    const transaction = data.transactionID || data.transaction_id || data.id;
    if (
      !response.ok ||
      data.transactionStatus !== "Success" ||
      !safePaymentUrl(url) ||
      !transaction
    )
      throw new Error("Provider response requires review");
    // A fast webhook may already have confirmed the payment. Do not overwrite a paid state.
    const { error: save } = await db
      .from("course_payments")
      .update({
        payment_url: url,
        provider_transaction: String(transaction),
        state: "ready",
      })
      .eq("id", claim.id)
      .eq("state", "creating");
    if (save) throw new Error("Payment persistence requires review");
    return {
      accepted: true,
      state: "ready",
      payment_url: url,
      amount_cents: claim.amount_cents,
    };
  } catch {
    // A timeout may have created a real payment. Never retry creating blindly.
    await db
      .from("course_payments")
      .update({ state: "review" })
      .eq("id", claim.id)
      .eq("state", "creating");
    return { accepted: true, state: "review" };
  } finally {
    clearTimeout(timeout);
  }
}
export async function paymentStatus(db: SupabaseClient, requestId: unknown) {
  if (!uuid(requestId)) throw new Error("Invalid request");
  const { data: reg, error } = await db
    .from("course_registrations")
    .select("id")
    .eq("request_id", requestId)
    .maybeSingle();
  if (error) throw new Error("Status unavailable");
  if (!reg) return { accepted: true, state: "pending" };
  const { data: payment, error: paymentError } = await db
    .from("course_payments")
    .select("state,amount_cents")
    .eq("registration_id", reg.id)
    .maybeSingle();
  if (paymentError) throw new Error("Status unavailable");
  return {
    accepted: true,
    state: payment?.state || "pending",
    amount_cents: payment?.amount_cents || null,
  };
}
