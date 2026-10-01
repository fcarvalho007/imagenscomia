import { describe, expect, it, vi } from "vitest";
import { sendCourseEmail } from "../../../supabase/functions/course-operations/email";
import { renderCourseEmail } from "../../../supabase/functions/_shared/course/emails";

const env = (k: string) =>
  ({
    RESEND_API_KEY: "test",
    COURSE_EMAIL_FROM: "Curso <curso@example.com>",
    COURSE_EMAIL_REPLY_TO: "info@example.com",
    COURSE_PUBLIC_URL: "https://example.com/curso",
  })[k];

function db(campaign: Record<string, unknown>) {
  return {
    rpc: vi.fn(async (name: string) => ({ data: name === "prepare_course_job" ? true : null, error: null })),
    from: vi.fn(() => ({
      select: () => {
        const query = {
          eq: () => query,
          single: async () => ({ data: campaign, error: null }),
          maybeSingle: async () => ({ data: null, error: null }),
        };
        return query;
      },
    })),
  };
}

const ctx = (campaignId: string | null) => ({
  job: { id: "job1", lease: "lease1", template: campaignId ? `manual_${campaignId}` : "confirmation", campaign_id: campaignId },
  registration: { id: "r1", name: "Ana Maria", email: "ana@example.invalid", request_id: "abc", edition: "online-2026" },
  edition: { id: "online-2026", label: "Online", operations: {} },
});

async function capture(campaign: Record<string, unknown>) {
  let sent: any = null;
  const fetchMock = vi.fn(async (_url: string, init: any) => {
    sent = JSON.parse(init.body);
    return { ok: true, status: 200, json: async () => ({ id: "resend-1" }) } as any;
  });
  await sendCourseEmail(db(campaign), ctx("11111111-1111-4111-8111-111111111111"), env, fetchMock as any);
  return sent;
}

describe("manual campaign delivery", () => {
  it("sanitises a formatted campaign body and personalises the first name", async () => {
    const sent = await capture({
      subject: "Novidades",
      body: '<p>Olá, {{nome}}.</p><script>alert(1)</script><p><a href="https://exemplo.pt">link</a></p>',
      edition: "online-2026",
      channel: "email",
      format: "html",
    });
    expect(sent.html).toContain("Olá, Ana.");
    expect(sent.html).not.toContain("<script");
    expect(sent.html).toContain('rel="noopener noreferrer"');
    expect(sent.text).toContain("Olá, Ana.");
  });

  it("never interprets a legacy plain-text campaign as markup", async () => {
    const sent = await capture({
      subject: "Aviso",
      body: "Olá <b>tudo bem</b>?",
      edition: "online-2026",
      channel: "email",
      format: "text",
    });
    expect(sent.html).toContain("&lt;b&gt;tudo bem&lt;/b&gt;");
    expect(sent.html).not.toContain("<b>tudo bem</b>");
  });

  it("keeps stored templates safe in both formats", () => {
    const context = {
      name: "Ana",
      edition: "online-2026",
      label: "Online",
      schedule: "2 e 4 de dezembro",
      before_url: "https://example.com/before",
      after_url: "https://example.com/after",
      join_url: "https://example.com/join",
      resources_url: "https://example.com/resources",
      recordings_url: "https://example.com/recordings",
      portal_url: "https://example.com/portal",
    };
    const html = renderCourseEmail("confirmation", context, {
      subject: "Assunto",
      body: '<p onclick="x()">Olá, {{nome}}</p><img src=x onerror=alert(1)>',
      format: "html",
    });
    expect(html.html).toContain("<p>Olá, Ana</p>");
    expect(html.html).not.toContain("onclick");
    expect(html.html).not.toContain("<img");

    const text = renderCourseEmail("confirmation", context, {
      subject: "Assunto",
      body: "Linha com <b>marcação</b> antiga",
      format: "text",
    });
    expect(text.html).toContain("&lt;b&gt;marcação&lt;/b&gt;");
  });
});
