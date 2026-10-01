import { afterEach, describe, expect, it, vi } from "vitest";
import { checkoutRequest, loadCheckoutConfig, paymentDestination, validQuote } from "./checkout-client";

afterEach(() => vi.unstubAllGlobals());
describe("live checkout boundaries", () => {
  it("uses only the fixed WordPress bridge, with no credentials or secrets", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ accepted: true, state: "review" })));
    vi.stubGlobal("fetch", fetch);
    await checkoutRequest({ enabled: true, nonce: "public-csrf-nonce", privacyUrl: "", termsUrl: "" }, "checkout", { edition: "porto-2026" });
    expect(fetch.mock.calls[0][0]).toBe("https://fredericocarvalho.pt/wp-json/fcia/v1/checkout");
    expect(fetch.mock.calls[0][1]).toMatchObject({ credentials: "omit", cache: "no-store", method: "POST" });
    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty("Authorization");
  });
  it("rejects unconfirmed responses and HTTP failures", async () => {
    const fetch=vi.fn().mockResolvedValueOnce(new Response('{"accepted":false}')).mockResolvedValueOnce(new Response('',{status:503}));
    vi.stubGlobal("fetch", fetch);
    const config={enabled:true,nonce:"n",privacyUrl:"",termsUrl:""};
    await expect(checkoutRequest(config,"status",{})).rejects.toThrow();
    await expect(checkoutRequest(config,"checkout",{})).rejects.toThrow();
  });
  it("honours disabled configuration without querying prices or creating orders",async()=>{
    const fetch=vi.fn().mockResolvedValue(new Response('{"enabled":false,"nonce":"n","privacyUrl":"","termsUrl":""}'));
    vi.stubGlobal("fetch",fetch); expect((await loadCheckoutConfig()).enabled).toBe(false); expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("rejects foreign policy URLs",async()=>{
    vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response('{"enabled":true,"nonce":"n","privacyUrl":"https://untrusted.example/","termsUrl":""}')));
    await expect(loadCheckoutConfig()).rejects.toThrow();
  });
  it.each(["http://clientes.eupago.pt/a", "https://clientes.eupago.pt.evil.example/a", "javascript:alert(1)", "https://name:secret@clientes.eupago.pt/a"])("rejects payment redirect %s",value=>expect(()=>paymentDestination(value)).toThrow());
  it("accepts only HTTPS provider destinations",()=>{expect(paymentDestination("https://clientes.eupago.pt/pay")).toBe("https://clientes.eupago.pt/pay");expect(paymentDestination("https://sandbox.eupago.pt/pay")).toBe("https://sandbox.eupago.pt/pay");});
  it.each([49700,39700,59700])("validates server quote %i without accepting simulated add-ons",net=>{
    const q={net_cents:net,amount_cents:Math.round(net*1.23),vat_percent:23,currency:"EUR"};
    expect(validQuote(q)).toBe(true);expect(validQuote({...q,amount_cents:q.amount_cents+8241})).toBe(false);
  });
});
