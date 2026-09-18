import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkout,
  safePaymentUrl,
} from "../../../supabase/functions/course-wordpress-ingest/payment";
const body = {
  request_id: "ff000000-0000-4000-8000-000000000001",
  edition: "online-2026",
  name: "QA Test",
  email: "qa@example.invalid",
  privacy_acknowledged: true,
  terms_acknowledged: true,
  expected_amount: 48831,
};
let update: ReturnType<typeof vi.fn>,
  rpc: ReturnType<typeof vi.fn>,
  fetchMock: ReturnType<typeof vi.fn>,
  db: any;
beforeEach(() => {
  const env: Record<string, string> = {
    COURSE_PAYMENTS_ENABLED: "true",
    COURSE_EUPAGO_API_KEY: "fake-sandbox-key",
    COURSE_PUBLIC_URL: "https://course.example.invalid/",
    COURSE_EUPAGO_WEBHOOK_KEY: "fake-signing-key",
    SUPABASE_URL: "https://qa.example.invalid",
  };
  vi.stubGlobal("Deno", { env: { get: (k: string) => env[k] } });
  const query = {
    eq: () => query,
    then: (resolve: any) => Promise.resolve({ error: null }).then(resolve),
  };
  update = vi.fn(() => query);
  rpc = vi.fn(async () => ({
    data: {
      state: "claimed",
      id: "aa000000-0000-4000-8000-000000000001",
      amount_cents: 48831,
    },
    error: null,
  }));
  db = { rpc, from: () => ({ update }) };
  fetchMock = vi.fn(async () => ({
    ok: true,
    json: async () => ({
      transactionStatus: "Success",
      url: "https://sandbox.eupago.pt/api/extern/paybylink/form/test",
      transactionID: "sandbox-order",
    }),
  }));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());
describe("Course payment creation", () => {
  it("uses server amount and sandbox; disables customer notifications", async () => {
    const result = await checkout(db, body);
    expect(result.state).toBe("ready");
    const [url, options] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toContain("sandbox.eupago.pt");
    const payload = JSON.parse(options.body as string);
    expect(payload.payment.amount.value).toBe(488.31);
    expect(payload.payment.identifier).toMatch(/^FCIA-/);
    expect(payload.customer.notify).toBe(false);
  });
  it("reuses pending orders without calling the gateway again", async () => {
    rpc.mockResolvedValue({
      data: { state: "ready", payment_url: "https://sandbox.eupago.pt/test" },
      error: null,
    });
    await checkout(db, body);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("requires review after an uncertain provider timeout", async () => {
    fetchMock.mockRejectedValue(new Error("timeout"));
    expect((await checkout(db, body)).state).toBe("review");
    expect(update).toHaveBeenCalledWith({ state: "review" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("rejects unknown redirect domains and does not return them to the browser", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        transactionStatus: "Success",
        url: "https://eupago.pt.attacker.invalid/pay",
        transactionID: "qa",
      }),
    });
    expect((await checkout(db, body)).state).toBe("review");
    expect(safePaymentUrl("https://clientes.eupago.pt@attacker.invalid")).toBe(
      false,
    );
  });
  it("requires enablement before creating an order", async () => {
    vi.stubGlobal("Deno", { env: { get: () => undefined } });
    await expect(checkout(db, body)).rejects.toThrow("Payments disabled");
    expect(rpc).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
