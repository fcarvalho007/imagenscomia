import { describe, it, expect, vi } from "vitest";
import { renderCourseEmail } from "../../../supabase/functions/_shared/course/emails";
import { sendCourseEmail } from "../../../supabase/functions/course-operations/email";
import { issueCourseInvoice } from "../../../supabase/functions/course-operations/invoice";
import { normalizeBilling } from "../../../supabase/functions/course-wordpress-ingest/billing";
import { authorizedAdmin } from "../../../supabase/functions/_shared/admin-auth";
const c = {
  name: "Ana <script>",
  edition: "online-2026",
  label: "Online",
  schedule: "2, 4, 9 e 11 dezembro",
  before_url: "https://example.com/before",
  after_url: "https://example.com/after",
  join_url: "https://example.com/join",
  resources_url: "https://example.com/resources",
  recordings_url: "https://example.com/recordings",
  portal_url: "https://example.com/portal",
};
const ctx = () => ({
  job: { id: "job1", lease: "lease1", template: "confirmation" },
  registration: {
    id: "r1",
    name: "Ana",
    email: "ana@example.invalid",
    request_id: "abc",
    edition: "online-2026",
  },
  edition: { id: "online-2026", label: "Online", operations: c },
  payment: {
    id: "p1",
    state: "paid",
    amount_cents: 48831,
    net_cents: 39700,
    vat_percent: 23,
  },
  invoice: {
    state: "ready",
    billing: {
      name: "Ana",
      tax_id: "123456789",
      address: "Rua exemplo",
      postal_code: "1000-001",
      city: "Lisboa",
      country: "Portugal",
    },
  },
});
const env = (k: string) =>
  ({
    RESEND_API_KEY: "test",
    COURSE_EMAIL_FROM: "Curso <curso@example.com>",
    COURSE_EMAIL_REPLY_TO: "suporte@example.com",
    COURSE_PUBLIC_URL: "https://example.com/curso",
    COURSE_INVOICEEXPRESS_ACCOUNT: "test-account",
    INVOICEEXPRESS_API_KEY: "test",
    COURSE_INVOICEEXPRESS_TAX_NAME: "IVA23",
  })[k];
function db() {
  const update = vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) }));
  return {
    rpc: vi.fn(async (name) => ({
      data: name === "prepare_course_job" ? true : null,
      error: null,
    })),
    from: vi.fn(() => ({
      update,
      select: () => {
        const query={eq:()=>query,single:async()=>({data:{state:"paid"}}),maybeSingle:async()=>({data:null,error:null})};return query;
      },
    })),
    update,
  };
}
describe("course operations", () => {
  it.each([
    "confirmation",
    "individual_before",
    "practical_information",
    "resources",
    "individual_after",
  ])("renders complete %s email without placeholder tokens", (key) => {
    const m = renderCourseEmail(key, c);
    expect(m.html).toContain('lang="pt"');
    expect(m.text).not.toMatch(/undefined|\{\{/);
    expect(m.html).not.toContain("<script>");
  });
  it("blocks missing links and unsafe schemes", () => {
    expect(() =>
      renderCourseEmail("individual_before", { ...c, before_url: "" }),
    ).toThrow();
    expect(() =>
      renderCourseEmail("individual_before", {
        ...c,
        before_url: "javascript:alert(1)",
      }),
    ).toThrow();
  });
  it("validates Portuguese billing and drops extra fields", () => {
    expect(
      normalizeBilling({
        name: "Ana",
        tax_id: "123456789",
        address: "Rua teste",
        postal_code: "1000-001",
        city: "Lisboa",
        country: "Portugal",
        amount: 1,
      }),
    ).not.toHaveProperty("amount");
    expect(() =>
      normalizeBilling({
        name: "Ana",
        tax_id: "123456780",
        address: "Rua teste",
        postal_code: "1000-001",
        city: "Lisboa",
        country: "Portugal",
      }),
    ).toThrow();
  });
  it("sends frozen payload and persists provider acceptance", async () => {
    const d = db(),
      fetcher = vi.fn(
        async (_url: unknown, _options: RequestInit) =>
          new Response(JSON.stringify({ id: "mail-1" })),
      );
    await sendCourseEmail(d, ctx(), env, fetcher as typeof fetch);
    expect(JSON.parse(fetcher.mock.calls[0][1].body as string)).toHaveProperty(
      "text",
    );
    expect(fetcher.mock.calls[0][1].headers["Idempotency-Key"]).toBe(
      "course/job1",
    );
    expect(d.rpc).toHaveBeenCalledWith(
      "finish_course_job",
      expect.objectContaining({ outcome: "sent", external_id: "mail-1" }),
    );
  });
  it("retries an uncertain email with same identity, without provider fallback", async () => {
    const d = db(),
      fetcher = vi.fn(async () => {
        throw new Error("timeout");
      });
    await sendCourseEmail(d, ctx(), env, fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(d.rpc).toHaveBeenCalledWith(
      "finish_course_job",
      expect.objectContaining({ outcome: "queued" }),
    );
  });
  it("does not retry outside provider idempotency window", async () => {
    const d = db(),
      fetcher = vi.fn();
    const context = ctx();
    Object.assign(context.job, {
      first_attempt_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    });
    await sendCourseEmail(d, context, env, fetcher);
    expect(fetcher).not.toHaveBeenCalled();
    expect(d.rpc).toHaveBeenCalledWith(
      "finish_course_job",
      expect.objectContaining({ outcome: "review" }),
    );
  });
  it("blocks emails missing actual edition links before marking attempted", async () => {
    const d = db(),
      context = ctx(),
      fetcher = vi.fn();
    context.job.template = "resources";
    context.edition.operations = { ...c, resources_url: "" };
    await sendCourseEmail(d, context, env, fetcher);
    expect(fetcher).not.toHaveBeenCalled();
    expect(d.rpc).not.toHaveBeenCalledWith(
      "prepare_course_job",
      expect.anything(),
    );
  });
  it("does not create invoices until the actual tax is verified", async () => {
    const d = db(),
      fetcher = vi.fn(
        async () =>
          new Response(
            JSON.stringify({ taxes: [{ name: "IVA23", value: 6 }] }),
          ),
      );
    await issueCourseInvoice(d, ctx(), env, fetcher as typeof fetch);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(d.rpc).toHaveBeenCalledWith(
      "finish_course_job",
      expect.objectContaining({ outcome: "blocked" }),
    );
  });
  it("an ambiguous fiscal creation requires review, never an automatic new invoice", async () => {
    const d = db(),
      fetcher = vi
        .fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({ taxes: [{ name: "IVA23", value: 23 }] }),
          ),
        )
        .mockRejectedValueOnce(new Error("timeout"));
    await issueCourseInvoice(d, ctx(), env, fetcher);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(d.rpc).toHaveBeenCalledWith(
      "finish_course_job",
      expect.objectContaining({ outcome: "review" }),
    );
  });
  it("rejects arbitrary Bearer and aal1 admin tokens", async () => {
    const d = {
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "user" } } })),
      },
      rpc: vi.fn(async () => ({ data: true })),
    };
    expect(
      await authorizedAdmin(
        new Request("https://example.com", {
          headers: { Authorization: "Bearer fake" },
        }),
        d,
        "secret",
      ),
    ).toBe(false);
    const token = "a." + btoa(JSON.stringify({ aal: "aal1" })) + ".s";
    expect(
      await authorizedAdmin(
        new Request("https://example.com", {
          headers: { Authorization: "Bearer " + token },
        }),
        d,
        "secret",
      ),
    ).toBe(false);
    expect(d.rpc).not.toHaveBeenCalled();
  });
});

it('template edits preserve safe links, greeting and escaped body in actual renderer',()=>{
 const mail=renderCourseEmail('individual_before',c,{subject:'A sua sessão',body:'Texto <script>alert(1)</script> com duas linhas.\n\nEscolha o horário.'});
 expect(mail.html).not.toContain('<script>');
 expect(mail.html).toContain('https://example.com/before');
 expect(mail.text).toContain('Olá, Ana.');
 expect(()=>renderCourseEmail('confirmation',c,{subject:'Injected\r\nHeader',body:'Conteúdo válido'})).toThrow();
});

it('manual campaign delivery resolves recipients from registration and escapes content',async()=>{
 const database=db();const context={...ctx(),job:{...ctx().job,campaign_id:'campaign1'}};
 database.from.mockImplementation(()=>({select:()=>({eq:()=>({single:async()=>({data:{edition:'online-2026',channel:'email',subject:'Nota do curso',body:'<script>test</script>'}})})})}) as any);
 const send=vi.fn<typeof fetch>(async()=>new Response(JSON.stringify({id:'provider-test-id'}),{status:200}));
 await sendCourseEmail(database,context,env,send as any);
 expect(send).toHaveBeenCalledTimes(1);
 const body=JSON.parse(send.mock.calls[0][1].body as string);
 expect(body.to).toEqual(['ana@example.invalid']);
 expect(body.html).not.toContain('<script>');
 expect(body).not.toHaveProperty('body');
 expect(database.rpc).toHaveBeenCalledWith('prepare_course_job',expect.objectContaining({job_id:'job1'}));
});

it('never delivers a campaign belonging to another edition',async()=>{
 const database=db();const context={...ctx(),job:{...ctx().job,campaign_id:'campaign1'}};
 database.from.mockImplementation(()=>({select:()=>({eq:()=>({single:async()=>({data:{edition:'porto-2026',channel:'email',subject:'Nota',body:'Texto'}})})})}) as any);
 const send=vi.fn();await sendCourseEmail(database,context,env,send);
 expect(send).not.toHaveBeenCalled();
 expect(database.rpc).toHaveBeenCalledWith('finish_course_job',expect.objectContaining({outcome:'blocked'}));
});
