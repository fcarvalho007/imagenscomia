// Pure helpers shared by the legacy access-link flow and the payment functions.
// No Deno / network APIs here so the same code can be unit tested with Vitest.

export type LegacyDestination =
  | "upgrade"
  | "upgrade-video"
  | "upgrade-gravacao"
  | "recursos"
  | "recursos-video"
  | "recursos-masterclass"
  | "live-video";

export interface DestinationSpec {
  /** Path on the public site. */
  path: string;
  /** Registration row the token must belong to. */
  webinar: "imagens" | "video";
  /** Short human label used in the email body (pt-PT). */
  label: string;
}

/** Fixed allow-list. Anything outside it is rejected before any lookup. */
export const LEGACY_DESTINATIONS: Record<LegacyDestination, DestinationSpec> = {
  "upgrade": { path: "/upgrade", webinar: "imagens", label: "a página de upgrade" },
  "upgrade-video": { path: "/upgrade-video", webinar: "video", label: "a página de upgrade do vídeo" },
  "upgrade-gravacao": { path: "/upgrade-gravacao", webinar: "imagens", label: "a página do pack de gravação" },
  "recursos": { path: "/recursos", webinar: "imagens", label: "os recursos do webinar de imagens" },
  "recursos-video": { path: "/recursos-video", webinar: "video", label: "os recursos do webinar de vídeo" },
  "recursos-masterclass": { path: "/recursos-masterclass", webinar: "video", label: "os recursos da masterclass" },
  "live-video": { path: "/live-video", webinar: "video", label: "a sessão ao vivo de vídeo" },
};

export function resolveDestination(value: unknown): DestinationSpec | null {
  if (typeof value !== "string") return null;
  // An own-property check keeps inherited keys such as "constructor" or
  // "toString" from resolving to a truthy prototype member.
  if (!Object.prototype.hasOwnProperty.call(LEGACY_DESTINATIONS, value)) return null;
  return LEGACY_DESTINATIONS[value as LegacyDestination] ?? null;
}

/** Escapes text before it is interpolated into an HTML email body. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Proof of possession: only an exact, non-trivial token match authorises access
 * to an existing registration. An email or an id never does.
 */
export function ownsRegistration(providedToken: unknown, storedToken: string | null | undefined): boolean {
  if (typeof providedToken !== "string" || !storedToken) return false;
  const provided = providedToken.trim();
  if (provided.length < 20) return false;
  return provided === storedToken.trim();
}

/** Lower-cases and trims; returns null when the value is not a plausible address. */
export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length < 5 || email.length > 320) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
  return email;
}

/** Builds the access link. Tokens must never be logged, only placed in the email. */
export function buildAccessUrl(origin: string, spec: DestinationSpec, token: string): string {
  const base = origin.replace(/\/+$/, "");
  return `${base}${spec.path}?t=${encodeURIComponent(token)}`;
}

/** Redacts a token so accidental logging cannot leak it. */
export function redactToken(token: string | null | undefined): string {
  if (!token) return "none";
  return `len:${token.length}`;
}

// ---------------------------------------------------------------------------
// Payment helpers
// ---------------------------------------------------------------------------

/** Webinar implied by a plan key. Prevents cross-webinar fallbacks. */
export function webinarForPlan(plan: string): "imagens" | "video" {
  return plan.startsWith("video-") ? "video" : "imagens";
}

export interface ReusableLinkInput {
  paid_at: string | null;
  plan_selected: string | null;
  last_payment_link: string | null;
  eupago_ref: string | null;
  payment_link_created_at: string | null;
}

/**
 * A recent payment link may only be reused for the exact same plan and while the
 * order is still unpaid. Any plan or amount change must create a new order.
 */
export function canReusePaymentLink(
  reg: ReusableLinkInput,
  plan: string,
  now: number,
  windowMs = 60 * 60 * 1000,
): boolean {
  if (!reg || reg.paid_at) return false;
  if (!reg.last_payment_link || !reg.eupago_ref) return false;
  if (reg.plan_selected !== plan) return false;
  if (!reg.payment_link_created_at) return false;
  const created = Date.parse(reg.payment_link_created_at);
  if (Number.isNaN(created)) return false;
  return created > now - windowMs;
}

/**
 * Paid entitlements are never downgraded or swapped by a later checkout attempt:
 * the stored plan only changes while the registration is still unpaid.
 */
export function nextStoredPlan(currentPlan: string | null, paidAt: string | null, requestedPlan: string): string | null {
  if (paidAt) return currentPlan;
  return requestedPlan;
}
