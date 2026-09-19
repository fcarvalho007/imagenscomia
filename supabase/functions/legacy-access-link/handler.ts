// Access-link recovery for the legacy funnel.
//
// The caller supplies only an email. The response is always the same generic
// message, so the endpoint never reveals whether an address is registered,
// never returns data and never returns the token. The link is sent exclusively
// to the address stored on the registration itself.
import {
  buildAccessUrl,
  normalizeEmail,
  resolveDestination,
  type DestinationSpec,
} from "../_shared/legacy/access.ts";

export interface AccessLinkRegistration {
  id: string;
  email: string;
  first_name: string | null;
  edit_token: string | null;
}

export interface AccessLinkDeps {
  /** Looks the registration up by email + webinar using the service role. */
  findRegistration: (email: string, webinar: string) => Promise<AccessLinkRegistration | null>;
  /** Atomic server-side rate limit: 1 per 10 min, max 3 per 24 h, per registration. */
  claim: (registrationId: string, destination: string) => Promise<boolean>;
  /** Delivers the email. Returns false on provider failure. */
  sendEmail: (to: string, subject: string, html: string) => Promise<boolean>;
  origin: string;
  log?: (message: string) => void;
}

export const GENERIC_MESSAGE =
  "Se existir uma inscrição com esse email, foi enviada uma ligação de acesso.";

const genericBody = JSON.stringify({ ok: true, message: GENERIC_MESSAGE });

export function renderAccessEmail(firstName: string | null, spec: DestinationSpec, url: string): string {
  const greeting = firstName && firstName.trim() ? `Olá ${firstName.trim()},` : "Olá,";
  return `<!doctype html>
<html lang="pt-PT"><body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;padding:32px;">
      <tr><td>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${greeting}</p>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">
          Aqui está a tua ligação pessoal para aceder a ${spec.label}. É válida apenas para a tua inscrição — não a partilhes.
        </p>
        <p style="margin:0 0 24px;">
          <a href="${url}" style="display:inline-block;background:#1e40af;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:14px 28px;border-radius:10px;">Abrir a minha página</a>
        </p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
          Se não pediste esta ligação, podes ignorar este email.
        </p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

export async function handleAccessLink(
  payload: unknown,
  deps: AccessLinkDeps,
): Promise<{ status: number; body: string }> {
  const input = (payload ?? {}) as Record<string, unknown>;
  const email = normalizeEmail(input.email);
  const spec = resolveDestination(input.destination);

  // Malformed input is the only case that is not answered generically, and even
  // then nothing about the account is disclosed.
  if (!email || !spec) {
    return { status: 400, body: JSON.stringify({ error: "Pedido inválido." }) };
  }

  const reg = await deps.findRegistration(email, spec.webinar);
  if (!reg || !reg.edit_token || reg.edit_token.trim().length < 20) {
    return { status: 200, body: genericBody };
  }

  const allowed = await deps.claim(reg.id, input.destination as string);
  if (!allowed) {
    // Rate limited: same generic answer, no retry hint, no ambiguity to probe.
    deps.log?.(`access-link throttled for registration ${reg.id}`);
    return { status: 200, body: genericBody };
  }

  const url = buildAccessUrl(deps.origin, spec, reg.edit_token.trim());
  const sent = await deps.sendEmail(
    reg.email,
    "A tua ligação de acesso",
    renderAccessEmail(reg.first_name, spec, url),
  );
  // Never log the URL or the token.
  deps.log?.(`access-link ${sent ? "sent" : "failed"} for registration ${reg.id}`);

  return { status: 200, body: genericBody };
}
