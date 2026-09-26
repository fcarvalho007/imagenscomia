export async function verifySignature(
  raw: string,
  signature: string,
  key: string,
): Promise<boolean> {
  try {
    const bytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
    if (bytes.length !== 32) return false;
    const encoder = new TextEncoder();
    const secret = await crypto.subtle.importKey(
      "raw",
      encoder.encode(key),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    return crypto.subtle.verify("HMAC", secret, bytes, encoder.encode(raw));
  } catch {
    return false;
  }
}
export function parsePayment(body: unknown) {
  const t = (body as { transactions?: Record<string, unknown> })?.transactions;
  if (
    !t ||
    typeof t.identifier !== "string" ||
    !/^FCIA-[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      t.identifier,
    )
  )
    return null;
  if (!["Paid", "Refund", "Expired", "Cancel"].includes(String(t.status)))
    return null;
  const amount = t.amount as { value?: unknown; currency?: unknown };
  const value = Number(amount?.value);
  if (
    !Number.isFinite(value) ||
    value <= 0 ||
    Math.abs(value * 100 - Math.round(value * 100)) > 0.000001 ||
    amount?.currency !== "EUR" ||
    !/^\d+$/.test(String(t.trid))
  )
    throw new Error("Invalid payment");
  return {
    payment_uuid: t.identifier.slice(5),
    transaction_id: String(t.trid),
    paid_cents: Math.round(value * 100),
    payment_currency: "EUR",
    payment_state: t.status,
  };
}
