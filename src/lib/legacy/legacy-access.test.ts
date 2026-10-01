import { describe, expect, it, vi } from "vitest";
import {
  handleAccessLink,
  renderAccessEmail,
  GENERIC_MESSAGE,
  type AccessLinkDeps,
  type AccessLinkRegistration,
} from "../../../supabase/functions/legacy-access-link/handler.ts";
import {
  LEGACY_DESTINATIONS,
  canReusePaymentLink,
  escapeHtml,
  nextStoredPlan,
  normalizeEmail,
  ownsRegistration,
  resolveDestination,
  webinarForPlan,
} from "../../../supabase/functions/_shared/legacy/access.ts";

const TOKEN = "a".repeat(32);

function registration(overrides: Partial<AccessLinkRegistration> = {}): AccessLinkRegistration {
  return {
    id: "reg-1",
    email: "pessoa@exemplo.pt",
    first_name: "Ana",
    edit_token: TOKEN,
    ...overrides,
  };
}

function deps(overrides: Partial<AccessLinkDeps> = {}) {
  const sendEmail = vi.fn(async () => true);
  const claim = vi.fn(async () => true);
  const findRegistration = vi.fn(async () => registration());
  const log = vi.fn();
  return {
    sendEmail,
    claim,
    findRegistration,
    log,
    origin: "https://imagenscomia.com",
    ...overrides,
  } as AccessLinkDeps & {
    sendEmail: ReturnType<typeof vi.fn>;
    claim: ReturnType<typeof vi.fn>;
    findRegistration: ReturnType<typeof vi.fn>;
    log: ReturnType<typeof vi.fn>;
  };
}

describe("legacy-access-link", () => {
  it("answers with the same generic message whether or not the email exists", async () => {
    const known = deps();
    const unknown = deps({ findRegistration: vi.fn(async () => null) as AccessLinkDeps["findRegistration"] });

    const a = await handleAccessLink({ email: "pessoa@exemplo.pt", destination: "recursos" }, known);
    const b = await handleAccessLink({ email: "ninguem@exemplo.pt", destination: "recursos" }, unknown);

    expect(a).toEqual(b);
    expect(a.status).toBe(200);
    expect(JSON.parse(a.body)).toEqual({ ok: true, message: GENERIC_MESSAGE });
    expect(a.body).not.toContain(TOKEN);
  });

  it("never leaks the token or registration data in the response", async () => {
    const d = deps();
    const res = await handleAccessLink({ email: "pessoa@exemplo.pt", destination: "upgrade" }, d);
    expect(res.body).not.toContain("pessoa@exemplo.pt");
    expect(res.body).not.toContain("Ana");
    expect(res.body).not.toContain(TOKEN);
  });

  it("rejects destinations outside the allow-list without any lookup", async () => {
    for (const destination of ["dashboard", "/recursos", "", "recursos ", 42, null]) {
      const d = deps();
      const res = await handleAccessLink({ email: "pessoa@exemplo.pt", destination }, d);
      expect(res.status).toBe(400);
      expect(d.findRegistration).not.toHaveBeenCalled();
      expect(d.sendEmail).not.toHaveBeenCalled();
    }
  });

  it("rejects prototype keys instead of resolving inherited members", async () => {
    for (const destination of ["constructor", "toString", "__proto__", "hasOwnProperty"]) {
      expect(resolveDestination(destination)).toBeNull();
      const d = deps();
      const res = await handleAccessLink({ email: "pessoa@exemplo.pt", destination }, d);
      expect(res.status).toBe(400);
      expect(d.findRegistration).not.toHaveBeenCalled();
    }
  });

  it("sends only to the address stored on the registration, with the token in the URL", async () => {
    const d = deps({ findRegistration: vi.fn(async () => registration({ email: "dono@exemplo.pt" })) as AccessLinkDeps["findRegistration"] });
    await handleAccessLink({ email: "outro@exemplo.pt", destination: "recursos-video" }, d);
    const [to, , html] = d.sendEmail.mock.calls[0];
    expect(to).toBe("dono@exemplo.pt");
    expect(html).toContain(`https://imagenscomia.com/recursos-video?t=${TOKEN}`);
  });

  it("stays silent and sends nothing when the throttle denies the claim", async () => {
    const d = deps({ claim: vi.fn(async () => false) as AccessLinkDeps["claim"] });
    const res = await handleAccessLink({ email: "pessoa@exemplo.pt", destination: "recursos" }, d);
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ok: true, message: GENERIC_MESSAGE });
    expect(d.sendEmail).not.toHaveBeenCalled();
  });

  it("does not retry and stays generic when the provider fails ambiguously", async () => {
    const d = deps({ sendEmail: vi.fn(async () => false) as AccessLinkDeps["sendEmail"] });
    const res = await handleAccessLink({ email: "pessoa@exemplo.pt", destination: "recursos" }, d);
    expect(d.sendEmail).toHaveBeenCalledTimes(1);
    expect(d.claim).toHaveBeenCalledTimes(1);
    expect(JSON.parse(res.body)).toEqual({ ok: true, message: GENERIC_MESSAGE });
  });

  it("keeps the token out of every log line", async () => {
    const d = deps({ sendEmail: vi.fn(async () => false) as AccessLinkDeps["sendEmail"] });
    await handleAccessLink({ email: "pessoa@exemplo.pt", destination: "recursos" }, d);
    for (const [line] of d.log.mock.calls) {
      expect(line).not.toContain(TOKEN);
      expect(line).not.toContain("?t=");
    }
  });

  it("escapes the first name and the link in the email body", () => {
    const html = renderAccessEmail(
      '<img src=x onerror="alert(1)">',
      LEGACY_DESTINATIONS["recursos"],
      'https://imagenscomia.com/recursos?t=ab"c',
    );
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x");
    expect(html).not.toContain('t=ab"c');
    expect(html).toContain("&quot;");
  });

  it("normalises emails and rejects implausible values", () => {
    expect(normalizeEmail("  Pessoa@Exemplo.PT ")).toBe("pessoa@exemplo.pt");
    for (const bad of ["", "a@b", "sem-arroba.pt", 12, null, undefined]) {
      expect(normalizeEmail(bad)).toBeNull();
    }
  });
});

describe("proof of possession", () => {
  it("refuses access without a token, with a short token or with another token", () => {
    expect(ownsRegistration(undefined, TOKEN)).toBe(false);
    expect(ownsRegistration("", TOKEN)).toBe(false);
    expect(ownsRegistration("curto", TOKEN)).toBe(false);
    expect(ownsRegistration("b".repeat(32), TOKEN)).toBe(false);
    expect(ownsRegistration(TOKEN, null)).toBe(false);
    expect(ownsRegistration(TOKEN, TOKEN)).toBe(true);
  });

  it("binds each plan to a single webinar, with no cross-webinar fallback", () => {
    expect(webinarForPlan("premium")).toBe("imagens");
    expect(webinarForPlan("gravacao-masterclass")).toBe("imagens");
    expect(webinarForPlan("video-premium")).toBe("video");
    expect(webinarForPlan("video-bundle")).toBe("video");
    // A token issued for the video registration cannot pay an "imagens" plan:
    // the lookup filters by the webinar implied by the plan.
    expect(webinarForPlan("bundle")).not.toBe(webinarForPlan("video-bundle"));
  });
});

describe("payment link reuse and paid entitlements", () => {
  const base = {
    paid_at: null as string | null,
    plan_selected: "premium" as string | null,
    last_payment_link: "https://pay.example/1",
    eupago_ref: "REF1",
    payment_link_created_at: new Date().toISOString(),
  };
  const now = Date.now();

  it("reuses a recent link only for the very same plan", () => {
    expect(canReusePaymentLink(base, "premium", now)).toBe(true);
    expect(canReusePaymentLink(base, "bundle", now)).toBe(false);
    expect(canReusePaymentLink(base, "video-premium", now)).toBe(false);
  });

  it("does not reuse expired, incomplete or already paid orders", () => {
    expect(canReusePaymentLink({ ...base, payment_link_created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString() }, "premium", now)).toBe(false);
    expect(canReusePaymentLink({ ...base, last_payment_link: null }, "premium", now)).toBe(false);
    expect(canReusePaymentLink({ ...base, eupago_ref: null }, "premium", now)).toBe(false);
    expect(canReusePaymentLink({ ...base, payment_link_created_at: "not-a-date" }, "premium", now)).toBe(false);
    expect(canReusePaymentLink({ ...base, paid_at: new Date().toISOString() }, "premium", now)).toBe(false);
  });

  it("never downgrades or swaps a plan that is already paid", () => {
    expect(nextStoredPlan("bundle", "2026-09-01T10:00:00Z", "premium")).toBe("bundle");
    expect(nextStoredPlan("bundle", "2026-09-01T10:00:00Z", "video-bundle")).toBe("bundle");
    expect(nextStoredPlan("premium", null, "bundle")).toBe("bundle");
  });

  it("escapes HTML entities", () => {
    expect(escapeHtml(`<a href="x">&'`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&#39;");
  });
});
