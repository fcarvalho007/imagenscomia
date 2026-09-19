import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { resolveCourseAdmin } from "../_shared/course/admin.ts";
import { normalizeFormat, personalize, renderCourseBody, wrapCourseEmail } from "../_shared/course/richtext.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
// The SMS test target is fixed in code. No caller can choose a destination.
const OWNER_TEST_MOBILE = "351915015508";
const env = (key: string) => Deno.env.get(key);

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "POST required" });

  const db = createClient(env("SUPABASE_URL")!, env("SUPABASE_SERVICE_ROLE_KEY")!);
  const admin = await resolveCourseAdmin(req, db);
  if (!admin) return json(401, { error: "Unauthorized" });

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "Invalid body" });
  }
  const channel = payload?.channel === "sms" ? "sms" : payload?.channel === "email" ? "email" : null;
  const requestId = String(payload?.request_id || "");
  if (!channel || !UUID.test(requestId)) return json(400, { error: "Invalid request" });

  const format = normalizeFormat(payload?.format);
  const body = String(payload?.body ?? "");
  const subject = String(payload?.subject ?? "").trim();
  if (channel === "email") {
    if (subject.length < 2 || subject.length > 160 || /[\r\n]/.test(subject)) return json(400, { error: "Assunto inválido" });
    if (body.trim().length < 2 || body.length > 20000) return json(400, { error: "Mensagem inválida" });
    if (!admin.emailVerified) return json(400, { error: "email_not_verified" });
  } else {
    if (body.length < 1 || body.length > 160 || /[^\x20-\x7e]|[\[\]{}^~|\\]/.test(body))
      return json(400, { error: "SMS: até 160 caracteres básicos, sem acentos nem emojis" });
  }

  // Atomic claim: throttle, idempotency and the separate test log all live in one statement.
  const { data: claim, error: claimError } = await db.rpc("claim_course_test_send", {
    actor: admin.id,
    request_uuid: requestId,
    test_channel: channel,
    target_hint: channel === "email" ? admin.email : OWNER_TEST_MOBILE,
  });
  if (claimError) return json(503, { error: "Serviço indisponível" });
  if (claim?.state !== "claimed") return json(claim?.state === "throttled" ? 429 : 200, claim);

  const finish = async (outcome: string, reason?: string, externalId?: string) => {
    await db.rpc("finish_course_test_send", {
      test_uuid: claim.id,
      outcome,
      reason: reason || null,
      external_id: externalId || null,
    });
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    if (channel === "email") {
      const key = env("RESEND_API_KEY"), from = env("COURSE_EMAIL_FROM"), reply = env("COURSE_EMAIL_REPLY_TO");
      if (!key || !from || !reply) {
        await finish("blocked", "email_configuration_missing");
        return json(200, { state: "blocked", reason: "email_configuration_missing" });
      }
      const rendered = renderCourseBody(body, format);
      const html = wrapCourseEmail(
        subject,
        personalize(rendered.html, admin.email.split("@")[0], true),
        "Mensagem de teste do CRM. Nenhum participante foi contactado.",
      );
      const text = personalize(rendered.text, admin.email.split("@")[0], false);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        signal: controller.signal,
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `course-test/${claim.id}` },
        body: JSON.stringify({ from, reply_to: reply, to: [admin.email], subject: `[TESTE] ${subject}`, html, text }),
      });
      if (!res.ok) {
        await finish("review", `resend_${res.status}`);
        return json(200, { state: "review", reason: `resend_${res.status}` });
      }
      const data = await res.json();
      if (typeof data.id !== "string") {
        await finish("review", "resend_missing_id");
        return json(200, { state: "review", reason: "resend_missing_id" });
      }
      await finish("sent", undefined, data.id);
      return json(200, { state: "sent", target: admin.email });
    }

    const credentials = env("SMSONLINE_API_KEY"), from = env("COURSE_SMS_FROM");
    if (!credentials || !from || !/^[A-Za-z0-9]{1,11}$/.test(from)) {
      await finish("blocked", "sms_configuration_missing");
      return json(200, { state: "blocked", reason: "sms_configuration_missing" });
    }
    const res = await fetch("https://login.smsonline.pt/Api/rest/message", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials.includes(":") ? btoa(credentials) : credentials}`,
      },
      body: JSON.stringify({ to: [OWNER_TEST_MOBILE], text: body, from, coding: "gsm" }),
    });
    if (!res.ok) {
      await finish("review", `sms_http_${res.status}`);
      return json(200, { state: "review", reason: `sms_http_${res.status}` });
    }
    const data = await res.json();
    const id = data?.id || data?.messageId;
    if (!id || !["string", "number"].includes(typeof id)) {
      await finish("review", "sms_response_requires_verification");
      return json(200, { state: "review", reason: "sms_response_requires_verification" });
    }
    await finish("sent", undefined, String(id));
    return json(200, { state: "sent", target: OWNER_TEST_MOBILE });
  } catch {
    // Ambiguous outcome: never retried automatically, never resent with a new key.
    await finish("review", "delivery_uncertain");
    return json(200, { state: "review", reason: "delivery_uncertain" });
  } finally {
    clearTimeout(timer);
  }
});
