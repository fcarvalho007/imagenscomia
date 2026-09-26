export const EDITIONS = ["lisboa-2026", "porto-2026", "online-2026"] as const;
export const EVENTS = [
  "page_view",
  "quiz_started",
  "quiz_completed",
  "pricing_viewed",
  "edition_selected",
  "registration_started",
] as const;
export const uuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
export function normalizeRequest(body: Record<string, unknown>) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (
    !uuid(body.request_id) ||
    !EDITIONS.includes(body.edition as (typeof EDITIONS)[number]) ||
    name.length < 2 ||
    name.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    phone.length > 30 ||
    body.privacy_acknowledged !== true ||
    body.terms_acknowledged !== true
  )
    throw new Error("Invalid registration");
  const source =
    body.attribution && typeof body.attribution === "object"
      ? (body.attribution as Record<string, unknown>)
      : {};
  const attribution: Record<string, string> = {};
  if (uuid(body.session_id))
    for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
      // Campaign slugs only. Do not collect URLs, free text, email addresses or click IDs.
      if (
        typeof source[key] === "string" &&
        /^[a-zA-Z0-9_-]{1,100}$/.test(source[key] as string)
      )
        attribution[key] = source[key] as string;
    }
  return {
    request_id: body.request_id,
    edition: body.edition,
    name,
    email,
    phone,
    sms_consent: body.sms_consent === true && /^(?:\+351|00351)?9[1236]\d{7}$/.test(phone.replace(/\s/g, "")),
    marketing_consent: body.marketing_consent === true,
    privacy_version: "curso-ia-v1",
    session_id: uuid(body.session_id) ? body.session_id : null,
    attribution,
  };
}
export function normalizeEvent(body: Record<string, unknown>) {
  if (
    !uuid(body.id) ||
    !uuid(body.session_id) ||
    !EVENTS.includes(body.name as (typeof EVENTS)[number])
  )
    throw new Error("Invalid event");
  return {
    id: body.id,
    session_id: body.session_id,
    name: body.name,
    edition: typeof body.edition === "string" && /^(lisboa|porto|online)-[a-z0-9-]{4,60}$/.test(body.edition)
      ? body.edition
      : null,
  };
}
