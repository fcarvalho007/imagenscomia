// Client-side access layer for the LEGACY funnel (webinars Imagens e Vídeo).
//
// Rules enforced here:
// - every read/write of a participant's own record goes through a narrow RPC
//   that requires the existing edit_token; an email or an ID never authorises;
// - the browser only persists a token that arrived with the registration
//   response or with an emailed link, scoped per webinar area;
// - no RPC ever returns the token, so nothing can be re-derived from a lookup.
import { supabase } from "@/integrations/supabase/client";

/** Storage scope: keeps the areas isolated from each other. */
export type LegacyScope =
  | "imagens"
  | "video"
  | "upgrade"
  | "upgrade-video"
  | "upgrade-gravacao"
  | "recursos"
  | "recursos-video"
  | "recursos-masterclass"
  | "live-video";

export type LegacyDestination =
  | "upgrade"
  | "upgrade-video"
  | "upgrade-gravacao"
  | "recursos"
  | "recursos-video"
  | "recursos-masterclass"
  | "live-video";

const MIN_TOKEN_LENGTH = 20;
const storageKey = (scope: LegacyScope) => `legacy_token_${scope}`;

export function isPlausibleToken(token: string | null | undefined): token is string {
  return typeof token === "string" && token.trim().length >= MIN_TOKEN_LENGTH;
}

export function storeToken(scope: LegacyScope, token: string | null | undefined): void {
  if (!isPlausibleToken(token)) return;
  try {
    sessionStorage.setItem(storageKey(scope), token.trim());
  } catch {
    /* storage unavailable — the token simply is not persisted */
  }
}

export function readToken(scope: LegacyScope): string | null {
  try {
    const stored = sessionStorage.getItem(storageKey(scope));
    return isPlausibleToken(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function clearToken(scope: LegacyScope): void {
  try {
    sessionStorage.removeItem(storageKey(scope));
  } catch {
    /* ignore */
  }
}

/**
 * Token for a scope: the one in the URL (?t=) wins and is persisted;
 * otherwise falls back to a token already stored for the same scope.
 */
export function resolveToken(scope: LegacyScope, urlToken?: string | null): string | null {
  if (isPlausibleToken(urlToken)) {
    storeToken(scope, urlToken);
    return urlToken.trim();
  }
  return readToken(scope);
}

// ---------------------------------------------------------------------------
// Narrow RPCs (created by the legacy RLS lockdown migration)
// ---------------------------------------------------------------------------
// The generated Supabase types do not know about these functions yet, so the
// casts are confined to this module.
type RpcName =
  | "legacy_reg_lookup"
  | "legacy_reg_session"
  | "legacy_reg_save_step"
  | "legacy_recursos_access"
  | "legacy_reg_attendance"
  | "legacy_invoice_get";

async function callRpc<T>(fn: RpcName, args: Record<string, unknown>): Promise<T | null> {
  const client = supabase as unknown as {
    rpc: (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
  };
  const { data, error } = await client.rpc(fn, args);
  if (error) throw error;
  return (data ?? null) as T | null;
}

export interface LegacyRegistration {
  id: string;
  webinar: string;
  email: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  whatsapp: string | null;
  role: string | null;
  team_size: string | null;
  sources: string | null;
  duvida: string | null;
  referral_code: string | null;
  step_reached: number | null;
  plan_selected: string | null;
  paid: boolean;
  premium: boolean;
  attended: boolean;
}

export interface LegacySession {
  id: string;
  webinar: string;
  name: string | null;
  first_name: string | null;
  role: string | null;
  team_size: string | null;
  step_reached: number | null;
  plan_selected: string | null;
  paid: boolean;
  premium: boolean;
  attended: boolean;
}

export interface LegacyResourcesAccess {
  found: boolean;
  access: boolean;
  name: string | null;
  plan: string | null;
}

export interface LegacyInvoicePrefill {
  invoice_name: string | null;
  invoice_vat: string | null;
  invoice_address: string | null;
  invoice_zip: string | null;
  invoice_city: string | null;
  invoice_email: string | null;
}

export const legacyRegLookup = (token: string) =>
  callRpc<LegacyRegistration>("legacy_reg_lookup", { p_token: token });

export const legacyRegSession = (token: string, webinar?: string | null) =>
  callRpc<LegacySession>("legacy_reg_session", { p_token: token, p_webinar: webinar ?? null });

export const legacyRegSaveStep = (
  token: string,
  webinar: string | null,
  step: number | null,
  patch: Record<string, unknown> = {},
) =>
  callRpc<boolean>("legacy_reg_save_step", {
    p_token: token,
    p_webinar: webinar,
    p_step: step,
    p_patch: patch,
  });

export const legacyRecursosAccess = (token: string, webinar?: string | null) =>
  callRpc<LegacyResourcesAccess>("legacy_recursos_access", {
    p_token: token,
    p_webinar: webinar ?? null,
  });

export const legacyRegAttendance = (token: string, webinar: string) =>
  callRpc<{ found: boolean; attended: boolean }>("legacy_reg_attendance", {
    p_token: token,
    p_webinar: webinar,
  });

export const legacyInvoiceGet = (token: string) =>
  callRpc<LegacyInvoicePrefill>("legacy_invoice_get", { p_token: token });

/**
 * Asks the server to email the access link to the address on the registration.
 * The response is deliberately uniform: it never reveals whether the email
 * exists, nor any data, nor the token.
 */
export async function requestAccessLink(email: string, destination: LegacyDestination): Promise<void> {
  await supabase.functions.invoke("legacy-access-link", {
    body: { email: email.trim().toLowerCase(), destination },
  });
}

export const ACCESS_LINK_GENERIC_MESSAGE =
  "Se existir uma inscrição com esse email, foi enviada uma ligação de acesso. Verifica também o spam.";
