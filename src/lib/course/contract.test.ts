import { describe, it, expect } from "vitest";
import { normalizeRequest, normalizeEvent } from "./contract";
import {
  parsePayment,
  verifySignature,
} from "../../../supabase/functions/course-eupago-webhook/verify";
import { webcrypto, createHmac } from "node:crypto";
const id = "ff000000-0000-4000-8000-000000000001";
const request = {
  request_id: id,
  edition: "lisboa-2026",
  name: "  Teste QA  ",
  email: " QA@EXAMPLE.COM ",
  privacy_acknowledged: true,
  terms_acknowledged: true,
};
describe("Course boundaries", () => {
  it("normalizes contact and keeps marketing opt-in separate", () => {
    expect(normalizeRequest(request)).toMatchObject({
      name: "Teste QA",
      email: "qa@example.com",
      marketing_consent: false,
      session_id: null,
      attribution: {},
    });
  });
  it.each([
    { ...request, terms_acknowledged: false },
    { ...request, privacy_acknowledged: false },
    { ...request, edition: "video" },
    { ...request, email: "invalid" },
    { ...request, request_id: "x" },
    { ...request, name: "x" },
  ])("rejects invalid registration", (r) =>
    expect(() => normalizeRequest(r)).toThrow(),
  );
  it("drops unconsented attribution and unknown fields", () => {
    expect(
      normalizeRequest({
        ...request,
        attribution: { utm_source: "google" },
        amount: 1,
      }),
    ).not.toHaveProperty("amount");
    expect(
      normalizeRequest({ ...request, attribution: { utm_source: "google" } })
        .attribution,
    ).toEqual({});
  });
  it("only stores campaign slugs, never PII or full URLs", () => {
    expect(
      normalizeRequest({
        ...request,
        session_id: id,
        attribution: {
          utm_source: "google",
          utm_campaign: "person@example.com",
          utm_medium: "https://example.com",
        },
      }).attribution,
    ).toEqual({ utm_source: "google" });
  });
  it("does not trust browser-side purchases or submitted counts", () => {
    for (const name of [
      "purchase",
      "registration_submitted",
      "payment_confirmed",
    ])
      expect(() => normalizeEvent({ id, session_id: id, name })).toThrow();
  });
  it("drops personal data from events", () => {
    expect(
      normalizeEvent({
        id,
        session_id: id,
        name: "page_view",
        email: "test@example.com",
      }),
    ).toEqual({ id, session_id: id, name: "page_view", edition: null });
  });
});
describe("Eupago confirmation", () => {
  const payload = {
    transactions: {
      identifier: "FCIA-" + id,
      status: "Paid",
      trid: 123,
      amount: { value: 611.31, currency: "EUR" },
    },
  };
  it("extracts exact order and integer cents", () =>
    expect(parsePayment(payload)).toMatchObject({
      payment_uuid: id,
      paid_cents: 61131,
      transaction_id: "123",
    }));
  it("does not match old webinar orders", () =>
    expect(
      parsePayment({
        transactions: { ...payload.transactions, identifier: "ORD-ANY-PK" },
      }),
    ).toBeNull());
  it("rejects another currency and fractional cents", () => {
    for (const amount of [
      { value: 611.31, currency: "USD" },
      { value: 611.311, currency: "EUR" },
    ])
      expect(() =>
        parsePayment({ transactions: { ...payload.transactions, amount } }),
      ).toThrow();
  });
  it("validates the signature and rejects tampering", async () => {
    const original = globalThis.crypto;
    Object.defineProperty(globalThis, "crypto", {
      value: webcrypto,
      configurable: true,
    });
    try {
      const raw = JSON.stringify(payload),
        key = "test-only-not-a-production-secret",
        signature = createHmac("sha256", key).update(raw).digest("base64");
      expect(await verifySignature(raw, signature, key)).toBe(true);
      expect(await verifySignature(raw + " ", signature, key)).toBe(false);
      expect(await verifySignature(raw, signature, "wrong")).toBe(false);
      expect(await verifySignature(raw, "invalid", key)).toBe(false);
    } finally {
      Object.defineProperty(globalThis, "crypto", {
        value: original,
        configurable: true,
      });
    }
  });
});
